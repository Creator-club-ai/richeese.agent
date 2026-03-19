import { EventEmitter } from 'node:events';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

import chokidar, { type FSWatcher } from 'chokidar';

import { parsePlanningCandidates, previewText } from '@shared/parsers';
import type {
  FilePayload,
  ProjectEntity,
  SourceApprovalPayload,
  SourceEntity,
  ValidationIssue,
  ValidationResult,
  ValidationState,
  WorkspaceCatalog,
  WorkspaceDocument,
  WorkspaceEntityBase,
  WorkspaceFileEntry,
  WorkspaceSnapshot,
} from '@shared/types';

import { AppStateStore } from './app-state';

export class WorkspaceService extends EventEmitter {
  private workspacePath: string;
  private snapshot: WorkspaceSnapshot | null = null;
  private watcher: FSWatcher | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor(
    initialWorkspacePath: string,
    private readonly appStateStore: AppStateStore,
  ) {
    super();
    this.workspacePath = initialWorkspacePath;
  }

  getWorkspacePath(): string {
    return this.workspacePath;
  }

  async initialize(): Promise<WorkspaceSnapshot> {
    const snapshot = await this.refresh();
    this.startWatching();
    return snapshot;
  }

  async setWorkspacePath(workspacePath: string): Promise<WorkspaceSnapshot> {
    this.workspacePath = workspacePath;
    this.appStateStore.setRecentWorkspacePath(workspacePath);
    this.stopWatching();
    const snapshot = await this.refresh();
    this.startWatching();
    return snapshot;
  }

  getSnapshot(): WorkspaceSnapshot | null {
    return this.snapshot;
  }

  async refresh(): Promise<WorkspaceSnapshot> {
    const snapshot = await scanWorkspace(this.workspacePath);
    this.snapshot = snapshot;
    this.emit('snapshot', snapshot);
    return snapshot;
  }

  async readTextFile(absolutePath: string): Promise<string> {
    this.assertInsideWorkspace(absolutePath);
    return readFile(absolutePath, 'utf8');
  }

  async saveTextFile(payload: FilePayload): Promise<void> {
    this.assertInsideWorkspace(payload.absolutePath);
    mkdirSync(path.dirname(payload.absolutePath), { recursive: true });
    writeFileSync(payload.absolutePath, payload.content, 'utf8');
    await this.refresh();
  }

  async updateSourceApproval(payload: SourceApprovalPayload): Promise<WorkspaceSnapshot> {
    const sourcePath = path.join(this.workspacePath, 'sources', payload.sourceId, 'source.json');
    this.assertInsideWorkspace(sourcePath);
    const source = JSON.parse(readFileSync(sourcePath, 'utf8'));

    source.analysis = source.analysis ?? {};
    source.generation = source.generation ?? {};
    source.analysis.mainCandidateId = payload.mainCandidateId;
    source.analysis.standaloneCandidateIds = payload.standaloneCandidateIds;
    source.analysis.approvedCandidateIds = payload.approvedCandidateIds;
    source.generation.spawnMode = payload.spawnMode;
    source.status = payload.status;

    writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`, 'utf8');
    return this.refresh();
  }

  async approveSlidePlan(projectId: string): Promise<WorkspaceSnapshot> {
    const projectDir = path.join(this.workspacePath, 'projects', projectId);
    const projectPath = path.join(projectDir, 'project.json');
    const project = JSON.parse(readFileSync(projectPath, 'utf8'));
    const approvedAt = new Date().toISOString();

    project.workflow = project.workflow ?? {};
    project.workflow.stage = 'plan_approved';
    project.workflow.approvals = project.workflow.approvals ?? {};
    project.workflow.approvals.slidePlan = {
      status: 'approved',
      approvedAt,
    };

    const approvalsPath = project.paths?.approvals
      ? path.join(projectDir, project.paths.approvals)
      : path.join(projectDir, 'approvals.json');

    writeFileSync(projectPath, `${JSON.stringify(project, null, 2)}\n`, 'utf8');
    writeFileSync(
      approvalsPath,
      `${JSON.stringify(project.workflow.approvals ?? {}, null, 2)}\n`,
      'utf8',
    );

    ensureDocument(
      path.join(projectDir, project.paths?.carouselDraft ?? 'carousel_draft.md'),
      buildSeedCarouselDraft(project),
    );
    ensureDocument(
      path.join(projectDir, project.paths?.handoffBrief ?? 'handoff_brief.md'),
      buildSeedHandoff(project),
    );

    return this.refresh();
  }

  async setProjectStage(projectId: string, stage: string): Promise<WorkspaceSnapshot> {
    const projectPath = path.join(this.workspacePath, 'projects', projectId, 'project.json');
    const project = JSON.parse(readFileSync(projectPath, 'utf8'));
    project.workflow = project.workflow ?? {};
    project.workflow.stage = stage;
    writeFileSync(projectPath, `${JSON.stringify(project, null, 2)}\n`, 'utf8');
    return this.refresh();
  }

  async spawnApproved(sourceId: string): Promise<WorkspaceSnapshot> {
    await runNodeScript(this.workspacePath, ['scripts/project-ops.js', 'spawn-approved', sourceId]);
    return this.refresh();
  }

  async runValidation(): Promise<ValidationResult> {
    return runValidation(this.workspacePath);
  }

  onSnapshot(listener: (snapshot: WorkspaceSnapshot) => void): void {
    this.on('snapshot', listener);
  }

  destroy(): void {
    this.stopWatching();
  }

  private startWatching(): void {
    this.watcher = chokidar.watch(
      [
        path.join(this.workspacePath, 'sources'),
        path.join(this.workspacePath, 'projects'),
        path.join(this.workspacePath, 'brands'),
        path.join(this.workspacePath, 'templates'),
        path.join(this.workspacePath, '.agent', 'skills'),
      ],
      {
        ignoreInitial: true,
      },
    );

    this.watcher.on('all', () => {
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
      }
      this.refreshTimer = setTimeout(() => {
        void this.refresh();
      }, 250);
    });
  }

  private stopWatching(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    if (this.watcher) {
      void this.watcher.close();
      this.watcher = null;
    }
  }

  private assertInsideWorkspace(absolutePath: string): void {
    const relative = path.relative(this.workspacePath, absolutePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error(`Path is outside workspace: ${absolutePath}`);
    }
  }
}

export async function scanWorkspace(workspacePath: string): Promise<WorkspaceSnapshot> {
  const validation = await runValidation(workspacePath);
  const [sources, projects, catalog] = await Promise.all([
    loadSources(workspacePath, validation),
    loadProjects(workspacePath, validation),
    loadCatalog(workspacePath),
  ]);

  return {
    workspacePath,
    sources,
    projects,
    catalog,
    validation,
    generatedAt: new Date().toISOString(),
  };
}

export async function runValidation(workspacePath: string): Promise<ValidationResult> {
  const output = await runNodeScript(workspacePath, ['scripts/project-ops.js', 'validate'], true);
  const lines = `${output.stdout}\n${output.stderr}`
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const issues: ValidationIssue[] = [];

  for (const line of lines) {
    const match = line.match(/^\[(source|project):([^\]]+)\]\s+(.*)$/);
    if (match) {
      issues.push({
        severity: line.includes('warning') ? 'warning' : 'error',
        scope: match[1] as 'source' | 'project',
        entityId: match[2],
        message: match[3],
      });
      continue;
    }

    if (/warning/i.test(line)) {
      issues.push({
        severity: 'warning',
        scope: 'global',
        message: line,
      });
    }
  }

  return {
    ok: issues.every((issue) => issue.severity !== 'error'),
    checkedAt: new Date().toISOString(),
    errors: issues.filter((issue) => issue.severity === 'error'),
    warnings: issues.filter((issue) => issue.severity === 'warning'),
  };
}

export function summarizeValidationState(
  entity: WorkspaceEntityBase,
  validation: ValidationResult,
): ValidationState {
  const issues = [...validation.errors, ...validation.warnings].filter(
    (issue) => issue.entityId === entity.id && issue.scope === entity.type,
  );

  if (issues.some((issue) => issue.severity === 'error')) {
    return 'invalid';
  }

  if (issues.some((issue) => issue.severity === 'warning')) {
    return 'warning';
  }

  return validation.ok ? 'valid' : 'unknown';
}

async function loadSources(workspacePath: string, validation: ValidationResult): Promise<SourceEntity[]> {
  const sourcesDir = path.join(workspacePath, 'sources');
  const directories = await listDirectories(sourcesDir);
  const results: SourceEntity[] = [];

  for (const id of directories) {
    const sourceDir = path.join(sourcesDir, id);
    const sourcePath = path.join(sourceDir, 'source.json');
    if (!existsSync(sourcePath)) {
      continue;
    }

    const source = JSON.parse(await readFile(sourcePath, 'utf8'));
    const planningPath = path.join(sourceDir, 'planning.md');
    const planningText = existsSync(planningPath) ? await readFile(planningPath, 'utf8') : '';
    const planningCandidates = planningText ? parsePlanningCandidates(planningText) : [];
    const documents = await buildDocuments(sourceDir, [
      ['source', '소스 정보', 'source.json'],
      ['planning', '기획안', 'planning.md'],
    ]);

    const entity: SourceEntity = {
      type: 'source',
      id,
      title: source.title || source.topic || source.url || id,
      brand: source.brand || 'unknown',
      statusOrStage: source.status || 'unknown',
      sourceType: source.sourceType || 'unknown',
      status: source.status || 'unknown',
      planningPath: existsSync(planningPath) ? planningPath : undefined,
      candidateIds: toStringArray(source.analysis?.candidateIds),
      approvedCandidateIds: toStringArray(source.analysis?.approvedCandidateIds),
      standaloneCandidateIds: toStringArray(source.analysis?.standaloneCandidateIds),
      mainCandidateId: typeof source.analysis?.mainCandidateId === 'string' ? source.analysis.mainCandidateId : null,
      spawnMode: typeof source.generation?.spawnMode === 'string' ? source.generation.spawnMode : null,
      candidates: planningCandidates,
      documents,
      paths: {
        source: 'source.json',
        planning: 'planning.md',
      },
      validationState: 'unknown',
      lastModifiedAt: maxDocumentTime(documents),
    };

    entity.validationState = summarizeValidationState(entity, validation);
    results.push(entity);
  }

  return results.sort((left, right) => right.lastModifiedAt.localeCompare(left.lastModifiedAt));
}

async function loadProjects(workspacePath: string, validation: ValidationResult): Promise<ProjectEntity[]> {
  const projectsDir = path.join(workspacePath, 'projects');
  const directories = (await listDirectories(projectsDir)).filter((entry) => entry !== 'archive');
  const results: ProjectEntity[] = [];

  for (const id of directories) {
    const projectDir = path.join(projectsDir, id);
    const projectPath = path.join(projectDir, 'project.json');
    if (!existsSync(projectPath)) {
      continue;
    }

    const project = JSON.parse(await readFile(projectPath, 'utf8'));
    const documents = await buildDocuments(projectDir, [
      ['project', '프로젝트 정보', 'project.json'],
      ['researchBrief', '리서치 브리프', project.paths?.researchBrief ?? 'research_brief.md'],
      ['slidePlan', '슬라이드 플랜', project.paths?.slidePlan ?? 'slide_plan.md'],
      ['carouselDraft', '원고 초안', project.paths?.carouselDraft ?? 'carousel_draft.md'],
      ['handoffBrief', '디자인 브리프', project.paths?.handoffBrief ?? 'handoff_brief.md'],
      ['carouselJson', '캐러셀 JSON', project.paths?.carouselJson ?? 'carousel.json'],
      ['qaReport', 'QA 리포트', project.paths?.qaReport ?? 'qa_report.md'],
    ]);

    const entity: ProjectEntity = {
      type: 'project',
      id,
      title: project.title || id,
      brand: project.brand || 'unknown',
      statusOrStage: project.workflow?.stage || 'unknown',
      stage: project.workflow?.stage || 'unknown',
      requiresResearchBrief: Boolean(project.workflow?.requiresResearchBrief),
      qaStatus: project.workflow?.quality?.qaStatus || 'not_started',
      approvalStatus: project.workflow?.approvals?.slidePlan?.status || 'pending',
      derivedFrom: project.derivedFrom ?? null,
      documents,
      paths: project.paths ?? {},
      validationState: 'unknown',
      lastModifiedAt: maxDocumentTime(documents),
    };

    entity.validationState = summarizeValidationState(entity, validation);
    results.push(entity);
  }

  return results.sort((left, right) => right.lastModifiedAt.localeCompare(left.lastModifiedAt));
}

async function loadCatalog(workspacePath: string): Promise<WorkspaceCatalog> {
  const [brands, templates, skills] = await Promise.all([
    collectCatalogFiles(path.join(workspacePath, 'brands')),
    collectCatalogFiles(path.join(workspacePath, 'templates')),
    collectCatalogFiles(path.join(workspacePath, '.agent', 'skills')),
  ]);

  return { brands, templates, skills };
}

async function collectCatalogFiles(rootDir: string): Promise<WorkspaceFileEntry[]> {
  if (!existsSync(rootDir)) {
    return [];
  }

  const files = await walkFiles(rootDir);
  return files
    .filter((absolutePath) => /\.(md|json|txt)$/i.test(absolutePath))
    .map((absolutePath) => {
      const stats = statSync(absolutePath);
      return {
        id: path.relative(rootDir, absolutePath),
        name: path.basename(absolutePath),
        absolutePath,
        relativePath: path.relative(rootDir, absolutePath),
        size: stats.size,
        lastModifiedAt: stats.mtime.toISOString(),
      };
    })
    .sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

async function buildDocuments(
  baseDir: string,
  entries: Array<[key: string, label: string, relativePath: string]>,
): Promise<WorkspaceDocument[]> {
  const documents: WorkspaceDocument[] = [];

  for (const [key, label, relativePath] of entries) {
    const absolutePath = path.join(baseDir, relativePath);
    const exists = existsSync(absolutePath);
    const preview = exists ? previewText(await readFile(absolutePath, 'utf8')) : '';

    documents.push({
      key,
      label,
      absolutePath,
      relativePath,
      exists,
      preview,
    });
  }

  return documents;
}

async function listDirectories(directory: string): Promise<string[]> {
  if (!existsSync(directory)) {
    return [];
  }

  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function walkFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(absolutePath)));
      continue;
    }

    files.push(absolutePath);
  }

  return files;
}

function maxDocumentTime(documents: WorkspaceDocument[]): string {
  const values = documents
    .filter((document) => document.exists)
    .map((document) => statSync(document.absolutePath).mtime.toISOString());

  return values.sort().at(-1) ?? new Date(0).toISOString();
}

function ensureDocument(absolutePath: string, content: string): void {
  if (existsSync(absolutePath)) {
    return;
  }

  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, `${content.trimEnd()}\n`, 'utf8');
}

function buildSeedCarouselDraft(project: Record<string, unknown>): string {
  const title = String(project.title ?? 'Untitled Project');
  const brand = String(project.brand ?? 'unknown');

  return [
    `# Carousel Draft - ${title}`,
    '',
    '## Meta',
    `- brand: ${brand}`,
    `- projectId: ${String(project.id ?? '')}`,
    '',
    '## Status',
    '- seedMode: skeleton-only',
    '- owner: content_editor',
    '- sourceOfTruth: slide_plan.md',
    '',
    '## Copy Worksheet',
    '- Fill this document from the approved slide plan.',
    '',
    '## Editor Checklist',
    '- turn each approved slide into final production copy',
    '- keep slide count and message hierarchy aligned with slide_plan.md',
    '- finalize this file before design begins',
  ].join('\n');
}

function buildSeedHandoff(project: Record<string, unknown>): string {
  const title = String(project.title ?? 'Untitled Project');
  const brand = String(project.brand ?? 'unknown');

  return [
    `# Designer Handoff - ${title}`,
    '',
    '## Meta',
    `- brand: ${brand}`,
    `- projectId: ${String(project.id ?? '')}`,
    '',
    '## Status',
    '- seedMode: skeleton-only',
    '- owner: content_editor',
    '',
    '## Required Inputs',
    '- read `slide_plan.md` first',
    '- read finalized `carousel_draft.md` second',
    '',
    '## Designer Notes',
    '- add asset paths, crop notes, and layout risks here during handoff',
  ].join('\n');
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

async function runNodeScript(
  workspacePath: string,
  args: string[],
  allowNonZero = false,
): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: workspacePath,
      shell: false,
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
        reject(new Error(stderr || stdout || `Process exited with code ${exitCode}`));
        return;
      }

      resolve({ stdout, stderr, exitCode });
    });
  });
}
