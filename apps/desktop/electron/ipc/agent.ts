/**
 * agent.ts — Codex CLI / AI Agent subprocess IPC handlers
 *
 * Electron Main → spawns `codex` CLI → AI reads SKILL.md + writes output files
 * Renderer는 'agent:log' 이벤트로 실시간 로그를 받습니다.
 */
import { ipcMain, BrowserWindow } from 'electron';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getWorkspaceRoot, getWorkspacePaths, writeTextFile } from './helpers.js';

// ─── 타입 ───────────────────────────────────────────────────────────────────

export type AgentSkillName =
    | 'content_researcher'
    | 'content_planner'
    | 'content_editor'
    | 'slide_designer';

export type AgentRunPayload = {
    skillName: AgentSkillName;
    projectId: string;
    /** Codex에게 전달할 추가 지시 (없으면 스킬 기본 지시만 사용) */
    instruction?: string;
};

export type AgentRunResult = {
    ok: boolean;
    message: string;
    /** 스킬이 생성한 주 출력 파일 경로 (optional) */
    outputPath?: string;
};

// ─── 스킬별 설정 ─────────────────────────────────────────────────────────────

type SkillConfig = {
    /** SKILL.md 경로 (workspace root 기준 상대경로) */
    skillPath: string;
    /** 스킬 실행 후 생성될 출력 파일명 */
    outputFileName: string;
    /** Codex에게 넘길 기본 태스크 설명 */
    defaultTask: (projectId: string, projectPath: string) => string;
};

const SKILL_CONFIGS: Record<AgentSkillName, SkillConfig> = {
    content_researcher: {
        skillPath: '.agent/skills/content_researcher/SKILL.md',
        outputFileName: 'research_brief.md',
        defaultTask: (projectId) =>
            `프로젝트 ID "${projectId}"에 대한 Research Brief를 작성하세요. ` +
            `SKILL.md의 산출물 포맷에 맞춰 research_brief.md 파일을 현재 디렉토리에 저장하세요.`,
    },
    content_planner: {
        skillPath: '.agent/skills/content_planner/SKILL.md',
        outputFileName: 'slide_plan.md',
        defaultTask: (projectId, projectPath) =>
            `프로젝트 "${projectId}"의 research_brief.md를 읽고 ` +
            `SKILL.md 지침에 따라 slide_plan.md를 "${projectPath}" 디렉토리에 저장하세요.`,
    },
    content_editor: {
        skillPath: '.agent/skills/content_editor/SKILL.md',
        outputFileName: 'carousel_draft.md',
        defaultTask: (projectId, projectPath) =>
            `프로젝트 "${projectId}"의 slide_plan.md를 읽고 ` +
            `SKILL.md 지침에 따라 carousel_draft.md를 "${projectPath}" 디렉토리에 저장하세요.`,
    },
    slide_designer: {
        skillPath: '.agent/skills/slide_designer/SKILL.md',
        outputFileName: 'carousel.json',
        defaultTask: (projectId, projectPath) =>
            `프로젝트 "${projectId}"의 carousel_draft.md와 handoff_brief.md를 읽고 ` +
            `SKILL.md 지침에 따라 carousel.json을 "${projectPath}" 디렉토리에 저장하세요.`,
    },
};

// ─── SKILL.md 읽기 ────────────────────────────────────────────────────────────

const readSkillMd = async (skillPath: string): Promise<string> => {
    const workspaceRoot = getWorkspaceRoot();
    const fullPath = path.join(workspaceRoot, skillPath);
    return fs.readFile(fullPath, 'utf8');
};

// ─── Codex CLI 실행 ────────────────────────────────────────────────────────────

/**
 * codex를 subprocess로 실행합니다.
 *
 * OPENAI_API_KEY 환경변수를 사용합니다 (.env 또는 시스템 환경변수).
 * --full-auto 플래그로 비대화형 모드 실행.
 */
const runCodex = (
    prompt: string,
    cwd: string,
    onLog: (line: string) => void,
): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Windows에서 codex는 .cmd 확장자로 설치됨
        const codexCmd = process.platform === 'win32' ? 'codex.cmd' : 'codex';

        const child = spawn(
            codexCmd,
            [
                '--full-auto',     // 비대화형 자동 모드
                '--quiet',         // 불필요한 UI 출력 제거
                prompt,
            ],
            {
                cwd,
                env: {
                    ...process.env,
                    // .env 파일의 키가 이미 process.env에 로드되어 있어야 함
                    // (dotenv로 main.ts에서 로드 — Phase 2에서 추가)
                },
                windowsHide: true,
                shell: false,
            },
        );

        child.stdout?.on('data', (data: Buffer) => {
            const text = data.toString();
            text.split('\n').filter(Boolean).forEach(onLog);
        });

        child.stderr?.on('data', (data: Buffer) => {
            const text = data.toString();
            text.split('\n').filter(Boolean).forEach((line) => onLog(`[err] ${line}`));
        });

        child.on('error', (err) => {
            // codex를 못 찾으면 친절한 에러 메시지
            if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
                reject(new Error(
                    'codex CLI를 찾을 수 없습니다.\n' +
                    '터미널에서: npm install -g @openai/codex\n' +
                    '그 다음 OPENAI_API_KEY 환경변수를 설정하세요.',
                ));
            } else {
                reject(err);
            }
        });

        child.on('close', (code) => {
            if (code !== 0 && code !== null) {
                reject(new Error(`codex exited with code ${code}`));
            } else {
                resolve();
            }
        });
    });
};

// ─── IPC 핸들러 ──────────────────────────────────────────────────────────────

export const registerAgentHandlers = () => {
    /**
     * 스킬 실행:
     * 1. SKILL.md 읽기
     * 2. 프롬프트 조립 (SKILL.md + task instruction)
     * 3. Codex CLI subprocess 실행
     * 4. 실시간 stdout → 'agent:log' IPC → renderer
     */
    ipcMain.handle(
        'agent:runSkill',
        async (event, payload: AgentRunPayload): Promise<AgentRunResult> => {
            const { skillName, projectId, instruction } = payload;
            const config = SKILL_CONFIGS[skillName];

            if (!config) {
                throw new Error(`Unknown skill: ${skillName}`);
            }

            const { projectRoot } = getWorkspacePaths();
            const projectPath = path.join(projectRoot, projectId);

            // 프로젝트 폴더가 없으면 에러
            try {
                await fs.access(projectPath);
            } catch {
                throw new Error(`프로젝트 폴더를 찾을 수 없습니다: ${projectPath}`);
            }

            // SKILL.md 읽기
            const skillMd = await readSkillMd(config.skillPath);

            // 프롬프트 조립: SKILL.md 내용 + 태스크 지시
            const task = instruction ?? config.defaultTask(projectId, projectPath);
            const fullPrompt =
                `다음은 당신의 역할과 행동 지침입니다:\n\n${skillMd}\n\n---\n\n태스크:\n${task}`;

            // renderer에 로그 전송하는 헬퍼
            const win = BrowserWindow.fromWebContents(event.sender);
            const sendLog = (line: string) => {
                if (win && !win.isDestroyed()) {
                    win.webContents.send('agent:log', { skillName, projectId, line });
                }
            };

            sendLog(`[${skillName}] 스킬 실행 시작...`);
            sendLog(`[${skillName}] 작업 폴더: ${projectPath}`);

            // Codex 실행 (프로젝트 폴더를 cwd로)
            await runCodex(fullPrompt, projectPath, sendLog);

            const outputPath = path.join(projectPath, config.outputFileName);
            const outputExists = await fs.access(outputPath).then(() => true).catch(() => false);

            sendLog(
                outputExists
                    ? `[${skillName}] ✓ ${config.outputFileName} 생성 완료`
                    : `[${skillName}] ⚠ 출력 파일을 찾을 수 없습니다`,
            );

            return {
                ok: true,
                message: `${skillName} 완료`,
                outputPath: outputExists ? outputPath : undefined,
            };
        },
    );

    /** 설치 확인: codex가 PATH에 있는지 확인 */
    ipcMain.handle('agent:checkInstall', async (): Promise<{ installed: boolean; version?: string }> => {
        return new Promise((resolve) => {
            const codexCmd = process.platform === 'win32' ? 'codex.cmd' : 'codex';
            const child = spawn(codexCmd, ['--version'], { shell: false, windowsHide: true });
            let output = '';

            child.stdout?.on('data', (d: Buffer) => { output += d.toString(); });
            child.on('error', () => resolve({ installed: false }));
            child.on('close', (code) => {
                resolve({ installed: code === 0, version: output.trim() });
            });
        });
    });
};
