import { EventEmitter } from 'node:events';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import {
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
} from 'node:fs/promises';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';

import { createTwoFilesPatch } from 'diff';

import type {
  PersistedRunSummary,
  ProviderStatus,
  RunArtifact,
  RunLogEntry,
  StageRunRequest,
  StageRunResult,
} from '@shared/types';

import { AppStateStore } from './app-state';
import { runValidation, WorkspaceService } from './workspace';

interface ActiveRun {
  result: StageRunResult;
  workspacePath: string;
  tempWorkspacePath: string;
  baselineSnapshot: Map<string, string>;
  process?: ChildProcessWithoutNullStreams;
}

interface ResolvedCommand {
  command: string;
  baseArgs: string[];
}

const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.pdf',
]);

export class RuntimeService extends EventEmitter {
  private readonly activeRuns = new Map<string, ActiveRun>();
  private resolvedCodexCommand: ResolvedCommand | null = null;

  constructor(
    private readonly userDataPath: string,
    private readonly appStateStore: AppStateStore,
    private readonly workspaceService: WorkspaceService,
  ) {
    super();
  }

  async getStatus(): Promise<ProviderStatus> {
    try {
      const codex = await this.getCodexCommand();
      const result = await runProcess(
        codex.command,
        [...codex.baseArgs, 'login', 'status'],
        this.workspaceService.getWorkspacePath(),
        true,
      );
      const parsedStatus = parseProviderStatusOutput(result.stdout, result.stderr);

      return {
        provider: 'codex-openai',
        connected: parsedStatus.connected,
        accountLabel: parsedStatus.accountLabel,
        canRun: parsedStatus.connected,
        lastCheckedAt: new Date().toISOString(),
        error: parsedStatus.connected ? undefined : parsedStatus.message || 'Codex login status unavailable',
      };
    } catch (error) {
      return {
        provider: 'codex-openai',
        connected: false,
        canRun: false,
        lastCheckedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async connect(): Promise<ProviderStatus> {
    const codex = await this.getCodexCommand();

    if (process.platform === 'win32') {
      spawn(
        'cmd.exe',
        ['/d', '/k', buildWindowsCommandLine(codex, ['login', '--device-auth'])],
        {
          detached: true,
          stdio: 'ignore',
          windowsHide: false,
        },
      ).unref();
    } else if (process.platform === 'darwin') {
      spawn('open', ['-a', 'Terminal', 'codex', 'login', '--device-auth'], {
        detached: true,
        stdio: 'ignore',
      }).unref();
    } else {
      spawn('x-terminal-emulator', ['-e', 'codex', 'login', '--device-auth'], {
        detached: true,
        stdio: 'ignore',
      }).unref();
    }

    return {
      provider: 'codex-openai',
      connected: false,
      canRun: false,
      lastCheckedAt: new Date().toISOString(),
      error: 'Device login launched in an external terminal. Refresh status after completing sign-in.',
    };
  }

  async runStage(request: StageRunRequest): Promise<StageRunResult> {
    const runId = randomUUID();
    const workspacePath = this.workspaceService.getWorkspacePath();
    const tempWorkspacePath = path.join(this.userDataPath, 'content-os-runs', runId, 'workspace');
    const createdAt = new Date().toISOString();
    const baselineSnapshot = await snapshotAllowedOutputs(workspacePath, request.cwd, request.allowedOutputs);

    await copyWorkspace(workspacePath, tempWorkspacePath);

    const activeRun: ActiveRun = {
      workspacePath,
      tempWorkspacePath,
      baselineSnapshot,
      result: {
        runId,
        status: 'running',
        request,
        logs: [
          createLog('system', `Prepared temp workspace at ${tempWorkspacePath}`),
        ],
        diff: '',
        touchedFiles: [],
        validation: null,
        artifacts: [],
        createdAt,
      },
    };

    this.activeRuns.set(runId, activeRun);
    this.persistSummary(activeRun.result);
    this.emitUpdate(activeRun.result);

    try {
      if (request.stage === 'render-preview') {
        await this.executeRenderPreview(activeRun);
      } else {
        await this.executeCodexRun(activeRun);
      }

      const comparison = await compareAllowedOutputs(
        workspacePath,
        tempWorkspacePath,
        request.cwd,
        request.allowedOutputs,
      );

      activeRun.result.diff = comparison.diff;
      activeRun.result.touchedFiles = comparison.touchedFiles;
      activeRun.result.artifacts = comparison.artifacts;
      activeRun.result.validation = await runValidation(tempWorkspacePath);
      activeRun.result.status = 'completed';
      activeRun.result.completedAt = new Date().toISOString();
      activeRun.result.logs.push(
        createLog(
          'system',
          `Run finished with ${comparison.touchedFiles.length} changed file(s) and ${comparison.artifacts.length} artifact(s).`,
        ),
      );
    } catch (error) {
      activeRun.result.status = 'failed';
      activeRun.result.error = error instanceof Error ? error.message : String(error);
      activeRun.result.completedAt = new Date().toISOString();
      activeRun.result.logs.push(createLog('error', activeRun.result.error));
    }

    this.persistSummary(activeRun.result);
    this.emitUpdate(activeRun.result);
    return activeRun.result;
  }

  async cancelRun(runId: string): Promise<StageRunResult> {
    const run = this.activeRuns.get(runId);
    if (!run) {
      throw new Error(`Run not found: ${runId}`);
    }

    run.process?.kill();
    run.result.status = 'cancelled';
    run.result.completedAt = new Date().toISOString();
    run.result.logs.push(createLog('system', 'Run cancelled by operator.'));
    this.persistSummary(run.result);
    this.emitUpdate(run.result);
    return run.result;
  }

  async applyDiff(runId: string): Promise<StageRunResult> {
    const run = this.activeRuns.get(runId);
    if (!run) {
      throw new Error(`Run not found: ${runId}`);
    }

    if (run.result.status !== 'completed') {
      throw new Error('Only completed runs can be applied.');
    }

    const currentSnapshot = await snapshotAllowedOutputs(
      run.workspacePath,
      run.result.request.cwd,
      run.result.request.allowedOutputs,
    );

    if (!snapshotEquals(currentSnapshot, run.baselineSnapshot)) {
      throw new Error('Workspace changed since this run started. Reload or rerun before applying.');
    }

    await copyAllowedOutputs(
      run.tempWorkspacePath,
      run.workspacePath,
      run.result.request.cwd,
      run.result.request.allowedOutputs,
    );
    await applyStageTransition(run.workspacePath, run.result.request);

    run.result.status = 'applied';
    run.result.completedAt = new Date().toISOString();
    run.result.logs.push(createLog('system', 'Approved and applied to the workspace.'));
    this.persistSummary(run.result);
    this.emitUpdate(run.result);
    await this.workspaceService.refresh();
    return run.result;
  }

  async discardRun(runId: string): Promise<StageRunResult> {
    const run = this.activeRuns.get(runId);
    if (!run) {
      throw new Error(`Run not found: ${runId}`);
    }

    run.process?.kill();
    await rm(path.join(this.userDataPath, 'content-os-runs', runId), {
      recursive: true,
      force: true,
    });
    run.result.status = 'discarded';
    run.result.completedAt = new Date().toISOString();
    run.result.logs.push(createLog('system', 'Run discarded and temp workspace removed.'));
    this.persistSummary(run.result);
    this.emitUpdate(run.result);
    return run.result;
  }

  onRunUpdate(listener: (result: StageRunResult) => void): void {
    this.on('run-update', listener);
  }

  private async executeCodexRun(run: ActiveRun): Promise<void> {
    const prompt = buildStagePrompt(run.result.request);
    const codex = await this.getCodexCommand();
    run.result.logs.push(createLog('system', 'Launching Codex exec in temp workspace.'));
    this.emitUpdate(run.result);

    const child = spawn(
      codex.command,
      [
        ...codex.baseArgs,
        'exec',
        '--json',
        '--ephemeral',
        '--skip-git-repo-check',
        '--color',
        'never',
        '-C',
        run.tempWorkspacePath,
        '-s',
        'workspace-write',
        '-',
      ],
      {
        cwd: run.tempWorkspacePath,
        shell: shouldUseShellForCommand(codex.command),
        windowsHide: true,
      },
    );

    run.process = child;
    let stdoutBuffer = '';

    child.stdin.write(prompt);
    child.stdin.end();

    child.stdout.on('data', (chunk) => {
      stdoutBuffer += chunk.toString();
      const parts = stdoutBuffer.split(/\r?\n/);
      stdoutBuffer = parts.pop() ?? '';

      for (const line of parts) {
        if (!line.trim()) {
          continue;
        }

        try {
          const event = JSON.parse(line) as Record<string, unknown>;
          consumeCodexEvent(run.result, event);
        } catch {
          run.result.logs.push(createLog('system', line));
        }
        this.emitUpdate(run.result);
      }
    });

    child.stderr.on('data', (chunk) => {
      run.result.logs.push(createLog('error', chunk.toString().trim()));
      this.emitUpdate(run.result);
    });

    await new Promise<void>((resolve, reject) => {
      child.on('error', reject);
      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Codex exec exited with code ${code}`));
          return;
        }
        resolve();
      });
    });
  }

  private async executeRenderPreview(run: ActiveRun): Promise<void> {
    run.result.logs.push(createLog('system', 'Rendering preview from carousel.json.'));
    this.emitUpdate(run.result);

    const dataPath = path.join(run.result.request.cwd, 'carousel.json');
    const outputPath = path.join(run.result.request.cwd, 'renders', 'current');
    const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

    const result = await runProcess(
      npmCommand,
      ['run', 'render:preview', '--', '--data', dataPath, '--output', outputPath],
      run.tempWorkspacePath,
      false,
    );

    if (result.stdout.trim()) {
      run.result.logs.push(createLog('command', result.stdout.trim()));
    }
    if (result.stderr.trim()) {
      run.result.logs.push(createLog('error', result.stderr.trim()));
    }
    this.emitUpdate(run.result);
  }

  private emitUpdate(result: StageRunResult): void {
    this.emit('run-update', { ...result, logs: [...result.logs], artifacts: [...result.artifacts] });
  }

  private persistSummary(result: StageRunResult): void {
    const summary: PersistedRunSummary = {
      runId: result.runId,
      entityType: result.request.entityType,
      entityId: result.request.entityId,
      stage: result.request.stage,
      status: result.status,
      createdAt: result.createdAt,
      completedAt: result.completedAt,
    };
    this.appStateStore.upsertRunSummary(summary);
  }

  private async getCodexCommand(): Promise<ResolvedCommand> {
    if (!this.resolvedCodexCommand) {
      this.resolvedCodexCommand = await resolveCodexCommand();
    }

    return this.resolvedCodexCommand;
  }
}

export function snapshotEquals(
  left: Map<string, string>,
  right: Map<string, string>,
): boolean {
  if (left.size !== right.size) {
    return false;
  }

  for (const [key, value] of left) {
    if (right.get(key) !== value) {
      return false;
    }
  }

  return true;
}

export async function snapshotAllowedOutputs(
  workspaceRoot: string,
  cwdRelative: string,
  allowedOutputs: string[],
): Promise<Map<string, string>> {
  const snapshot = new Map<string, string>();
  const entityRoot = path.join(workspaceRoot, cwdRelative);

  for (const output of allowedOutputs) {
    const absoluteOutput = path.join(entityRoot, output);
    if (!existsSync(absoluteOutput)) {
      continue;
    }

    const stats = await stat(absoluteOutput);
    if (stats.isDirectory()) {
      const files = await walkFiles(absoluteOutput);
      for (const file of files) {
        snapshot.set(
          normalizePath(path.relative(workspaceRoot, file)),
          await hashFile(file),
        );
      }
      continue;
    }

    snapshot.set(
      normalizePath(path.relative(workspaceRoot, absoluteOutput)),
      await hashFile(absoluteOutput),
    );
  }

  return snapshot;
}

async function compareAllowedOutputs(
  originalRoot: string,
  tempRoot: string,
  cwdRelative: string,
  allowedOutputs: string[],
): Promise<{ diff: string; touchedFiles: string[]; artifacts: RunArtifact[] }> {
  const originalSnapshot = await snapshotAllowedOutputs(originalRoot, cwdRelative, allowedOutputs);
  const tempSnapshot = await snapshotAllowedOutputs(tempRoot, cwdRelative, allowedOutputs);
  const keys = new Set([...originalSnapshot.keys(), ...tempSnapshot.keys()]);
  const patches: string[] = [];
  const touchedFiles: string[] = [];
  const artifacts: RunArtifact[] = [];

  for (const key of keys) {
    if (originalSnapshot.get(key) === tempSnapshot.get(key)) {
      continue;
    }

    touchedFiles.push(key);
    const originalFile = path.join(originalRoot, key);
    const tempFile = path.join(tempRoot, key);

    if (isBinaryFile(key)) {
      artifacts.push({
        relativePath: key,
        absolutePath: tempFile,
        kind: /\.(png|jpg|jpeg|gif|webp)$/i.test(key) ? 'image' : 'file',
      });
      continue;
    }

    const originalText = existsSync(originalFile) ? await readFile(originalFile, 'utf8') : '';
    const tempText = existsSync(tempFile) ? await readFile(tempFile, 'utf8') : '';
    patches.push(
      createTwoFilesPatch(
        key,
        key,
        originalText,
        tempText,
        'workspace',
        'candidate',
      ),
    );
  }

  return {
    diff: patches.join('\n'),
    touchedFiles,
    artifacts,
  };
}

async function copyAllowedOutputs(
  fromWorkspaceRoot: string,
  toWorkspaceRoot: string,
  cwdRelative: string,
  allowedOutputs: string[],
): Promise<void> {
  const entityFromRoot = path.join(fromWorkspaceRoot, cwdRelative);
  const entityToRoot = path.join(toWorkspaceRoot, cwdRelative);

  for (const output of allowedOutputs) {
    const fromPath = path.join(entityFromRoot, output);
    const toPath = path.join(entityToRoot, output);

    if (!existsSync(fromPath)) {
      await rm(toPath, { recursive: true, force: true });
      continue;
    }

    await rm(toPath, { recursive: true, force: true });
    await mkdir(path.dirname(toPath), { recursive: true });
    await cp(fromPath, toPath, { recursive: true });
  }
}

async function applyStageTransition(
  workspaceRoot: string,
  request: StageRunRequest,
): Promise<void> {
  if (request.entityType === 'source' && request.stage === 'source-planning') {
    const sourcePath = path.join(workspaceRoot, request.cwd, 'source.json');
    if (existsSync(sourcePath)) {
      const source = JSON.parse(readFileSync(sourcePath, 'utf8'));
      if (!['approved', 'spawned'].includes(source.status)) {
        source.status = 'analyzed';
        writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`, 'utf8');
      }
    }
    return;
  }

  if (request.entityType !== 'project') {
    return;
  }

  const projectPath = path.join(workspaceRoot, request.cwd, 'project.json');
  if (!existsSync(projectPath)) {
    return;
  }

  const project = JSON.parse(readFileSync(projectPath, 'utf8'));
  project.workflow = project.workflow ?? {};

  switch (request.stage) {
    case 'research':
      project.workflow.stage = 'planning';
      break;
    case 'plan':
      project.workflow.stage = 'awaiting_plan_approval';
      break;
    case 'edit':
      project.workflow.stage = 'designing';
      break;
    case 'design':
      project.workflow.stage = 'designing';
      break;
    case 'render-preview':
      project.workflow.stage = 'qa';
      break;
    default:
      break;
  }

  writeFileSync(projectPath, `${JSON.stringify(project, null, 2)}\n`, 'utf8');

  const approvalsPath = project.paths?.approvals
    ? path.join(workspaceRoot, request.cwd, project.paths.approvals)
    : null;
  if (approvalsPath && existsSync(projectPath)) {
    mkdirSync(path.dirname(approvalsPath), { recursive: true });
    writeFileSync(
      approvalsPath,
      `${JSON.stringify(project.workflow.approvals ?? {}, null, 2)}\n`,
      'utf8',
    );
  }
}

function buildStagePrompt(request: StageRunRequest): string {
  const outputs = request.allowedOutputs.map((file) => `- ${path.posix.join(request.cwd.replace(/\\/g, '/'), file.replace(/\\/g, '/'))}`).join('\n');
  const note = request.userNote?.trim() ? `User note: ${request.userNote.trim()}\n` : '';

  return [
    'You are running inside a temporary workspace copy for a Content OS desktop app.',
    'Follow the local workspace instructions and the stage skill file.',
    note,
    `Entity: ${request.entityType}:${request.entityId}`,
    `Stage: ${request.stage}`,
    `Skill file: ${request.skillPath ?? 'none provided'}`,
    `Working entity directory: ${request.cwd.replace(/\\/g, '/')}`,
    'Allowed outputs:',
    outputs || '- none',
    '',
    'Requirements:',
    '- Read the relevant project/source files and the referenced skill before changing anything.',
    '- Edit only the allowed output files.',
    '- Keep the existing JSON/markdown contracts valid for this repository.',
    '- Do not rename files or introduce new output paths beyond the allowed list.',
    '- If the request cannot be completed safely, explain the blocker in the final message instead of editing unrelated files.',
    '',
    'Complete the stage task now.',
    '',
  ].join('\n');
}

function consumeCodexEvent(result: StageRunResult, event: Record<string, unknown>): void {
  const type = typeof event.type === 'string' ? event.type : 'unknown';

  if (type === 'error' && typeof event.message === 'string') {
    result.logs.push(createLog('error', event.message));
    return;
  }

  if (type === 'item.completed' || type === 'item.started') {
    const item = event.item as Record<string, unknown> | undefined;
    if (!item) {
      return;
    }

    if (item.type === 'agent_message' && typeof item.text === 'string') {
      result.lastMessage = item.text;
      result.logs.push(createLog('agent', item.text));
      return;
    }

    if (item.type === 'command_execution') {
      const command = typeof item.command === 'string' ? item.command : 'command';
      const output = typeof item.aggregated_output === 'string' ? item.aggregated_output.trim() : '';
      result.logs.push(createLog('command', output ? `${command}\n${output}` : command));
      return;
    }

    if (item.type === 'error' && typeof item.message === 'string') {
      result.logs.push(createLog('error', item.message));
    }
  }
}

async function copyWorkspace(from: string, to: string): Promise<void> {
  await rm(to, { recursive: true, force: true });
  await mkdir(path.dirname(to), { recursive: true });
  await cp(from, to, {
    recursive: true,
    filter: (source) => {
      const normalized = normalizePath(source);
      return !(
        normalized.includes('/.git') ||
        normalized.includes('/node_modules') ||
        normalized.includes('/apps/desktop/dist') ||
        normalized.includes('/apps/desktop/out')
      );
    },
  });
}

async function walkFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(absolutePath)));
    } else {
      files.push(absolutePath);
    }
  }

  return files;
}

async function hashFile(absolutePath: string): Promise<string> {
  const buffer = await readFile(absolutePath);
  return createHash('sha256').update(buffer).digest('hex');
}

function isBinaryFile(filePath: string): boolean {
  return BINARY_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

function createLog(type: RunLogEntry['type'], message: string): RunLogEntry {
  return {
    id: randomUUID(),
    type,
    message,
    timestamp: new Date().toISOString(),
  };
}

async function runProcess(
  command: string,
  args: string[],
  cwd: string,
  allowNonZero: boolean,
): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      shell: shouldUseShellForCommand(command),
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (exitCode) => {
      if (exitCode !== 0 && !allowNonZero) {
        reject(new Error(stderr || stdout || `${command} exited with code ${exitCode}`));
        return;
      }

      resolve({ stdout, stderr, exitCode });
    });
  });
}

export function shouldUseShellForCommand(command: string, platform = process.platform): boolean {
  if (platform !== 'win32') {
    return false;
  }

  const extension = path.extname(command).toLowerCase();
  return extension === '.cmd' || extension === '.bat';
}

export function parseProviderStatusOutput(
  stdout: string,
  stderr: string,
): { connected: boolean; accountLabel?: string; message?: string } {
  const combined = stripAnsi(`${stdout}\n${stderr}`).trim();
  const accountMatch = combined.match(/Logged in using\s+(.+)/i);

  if (accountMatch) {
    return {
      connected: true,
      accountLabel: accountMatch[1].trim(),
      message: combined,
    };
  }

  if (/Logged in\b/i.test(combined)) {
    return {
      connected: true,
      message: combined,
    };
  }

  return {
    connected: false,
    message: combined,
  };
}

function stripAnsi(value: string): string {
  return value.replace(/\u001B\[[0-9;]*m/g, '');
}

async function resolveCodexCommand(): Promise<ResolvedCommand> {
  if (process.platform === 'win32') {
    const candidates: string[] = [];
    const appData = process.env.APPDATA;
    if (appData) {
      candidates.push(
        path.join(appData, 'npm', 'codex.cmd'),
        path.join(appData, 'npm', 'codex.ps1'),
        path.join(appData, 'npm', 'codex.exe'),
        path.join(appData, 'npm', 'codex'),
      );
    }

    const whereResults = await Promise.all([
      runProcess('where.exe', ['codex.cmd'], process.cwd(), true),
      runProcess('where.exe', ['codex.exe'], process.cwd(), true),
      runProcess('where.exe', ['codex.ps1'], process.cwd(), true),
      runProcess('where.exe', ['codex'], process.cwd(), true),
    ]);

    for (const result of whereResults) {
      const matches = result.stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      candidates.push(...matches);
    }

    for (const candidate of candidates) {
      if (!candidate || !existsSync(candidate)) {
        continue;
      }

      const extension = path.extname(candidate).toLowerCase();
      if (extension === '.ps1') {
        return {
          command: 'powershell.exe',
          baseArgs: ['-ExecutionPolicy', 'Bypass', '-File', candidate],
        };
      }

      return {
        command: candidate,
        baseArgs: [],
      };
    }

    throw new Error('Codex CLI was not found. Install it or add it to PATH. Expected codex.cmd under %APPDATA%\\npm.');
  }

  return {
    command: 'codex',
    baseArgs: [],
  };
}

function buildWindowsCommandLine(spec: ResolvedCommand, args: string[]): string {
  return [spec.command, ...spec.baseArgs, ...args].map(quoteWindowsArg).join(' ');
}

function quoteWindowsArg(value: string): string {
  if (!/[\s"]/g.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '\\"')}"`;
}
