import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { app, shell } from 'electron';
import type {
  ApprovalSnapshot,
  CommandResponse,
  ContentType,
  ProjectApproval,
  ProjectCreatePayload,
  ProjectDetails,
  ProjectExcerpt,
  ProjectPaths,
  ProjectRenderAsset,
  ProjectStatus,
  ProjectSummary,
  ProjectUpdatePayload,
  ReelCandidate,
  ReelJobDetails,
  ReelJobSummary,
  ReelStatus,
  SourceType,
  WorkspaceSummary,
} from '../../src/lib/contracts.js';

const DEFAULT_OWNER = 'dasarom4';

const defaultApproval = (): ProjectApproval => ({
  status: 'not_requested',
  approver: null,
  approvedAt: null,
  reason: null,
  candidateIndex: null,
});

export const defaultApprovals = (): ApprovalSnapshot => ({
  slidePlan: defaultApproval(),
  reelsHighlight: defaultApproval(),
});

export const slugify = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
};

export const toPosix = (value: string) => value.replace(/\\/g, '/');

export const getWorkspaceRoot = () => {
  return process.env.YFC_WORKSPACE_ROOT
    ? path.resolve(process.env.YFC_WORKSPACE_ROOT)
    : path.resolve(app.getAppPath(), '..', '..');
};

export const getWorkspacePaths = () => {
  const rootPath = getWorkspaceRoot();

  return {
    rootPath,
    projectRoot: path.join(rootPath, 'projects'),
    reelsRoot: path.join(rootPath, '.agent', 'skills', 'remotion_pd', 'reels_renderer', 'jobs'),
    reelsRendererRoot: path.join(rootPath, '.agent', 'skills', 'remotion_pd', 'reels_renderer'),
    templatesRoot: path.join(rootPath, 'templates'),
    slideRendererRoot: path.join(rootPath, '.agent', 'skills', 'slide_designer', 'slide_renderer'),
  };
};

export const ensureWorkspacePath = (targetPath: string) => {
  const workspaceRoot = getWorkspaceRoot();
  const resolved = path.resolve(path.isAbsolute(targetPath) ? targetPath : path.join(workspaceRoot, targetPath));

  if (!resolved.startsWith(workspaceRoot)) {
    throw new Error(`Path escapes workspace: ${targetPath}`);
  }

  return resolved;
};

export const fileExists = async (targetPath: string) => {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
};

export const readJson = async <T>(targetPath: string, fallback?: T) => {
  try {
    const raw = await fs.readFile(targetPath, 'utf8');
    return JSON.parse(raw) as T;
  } catch (error) {
    if (fallback !== undefined) {
      return fallback;
    }

    throw error;
  }
};

export const writeJson = async (targetPath: string, value: unknown) => {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, JSON.stringify(value, null, 2), 'utf8');
};

export const writeTextFile = async (targetPath: string, content: string) => {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, content, 'utf8');
};

export const readTextFile = async (targetPath: string) => {
  return fs.readFile(targetPath, 'utf8');
};

export const listDirectories = async (targetPath: string) => {
  if (!(await fileExists(targetPath))) {
    return [];
  }

  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
};

const countDirectEntries = async (targetPath: string) => {
  if (!(await fileExists(targetPath))) {
    return 0;
  }

  const entries = await fs.readdir(targetPath);
  return entries.length;
};

const safeExcerpt = async (targetPath: string, label: string): Promise<ProjectExcerpt | null> => {
  if (!(await fileExists(targetPath))) {
    return null;
  }

  const content = await fs.readFile(targetPath, 'utf8');
  return {
    label,
    path: targetPath,
    content: content.slice(0, 960).trim(),
  };
};

const listRenderAssets = async (projectId: string): Promise<ProjectRenderAsset[]> => {
  const rendersDir = path.join(getWorkspacePaths().projectRoot, projectId, 'renders');

  if (!(await fileExists(rendersDir))) {
    return [];
  }

  const entries = await fs.readdir(rendersDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && /\.(png|jpg|jpeg|webp)$/i.test(entry.name))
    .map((entry) => ({
      name: entry.name,
      path: path.join(rendersDir, entry.name),
      kind: 'image' as const,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
};

const inferContentType = (meta: Partial<ProjectSummary>, paths: ProjectPaths): ContentType => {
  if (meta.contentType === 'slide' || meta.contentType === 'reels') {
    return meta.contentType;
  }

  if (paths.carouselJson) {
    return 'slide';
  }

  return 'reels';
};

const inferSourceType = (meta: Partial<ProjectSummary>): SourceType => {
  if (meta.sourceType === 'provided' || meta.sourceType === 'researched' || meta.sourceType === 'youtube') {
    return meta.sourceType;
  }

  return 'provided';
};

const inferProjectStatus = async (
  meta: Partial<ProjectSummary>,
  approvals: ApprovalSnapshot,
  paths: ProjectPaths,
  contentType: ContentType,
): Promise<ProjectStatus> => {
  if (meta.status) {
    return meta.status;
  }

  if (contentType === 'slide') {
    if (approvals.slidePlan.status === 'approved') {
      return paths.carouselJson ? 'designing' : 'plan_approved';
    }

    if (approvals.slidePlan.status === 'pending') {
      return 'awaiting_plan_approval';
    }

    return paths.slidePlan ? 'planning' : 'draft';
  }

  if (approvals.reelsHighlight.status === 'approved') {
    return 'highlight_approved';
  }

  if (approvals.reelsHighlight.status === 'pending') {
    return 'awaiting_highlight_approval';
  }

  if (await fileExists(path.join(paths.root, 'render-short.props.json'))) {
    return 'probed';
  }

  return 'source_registered';
};

export const getProjectPaths = async (projectId: string): Promise<ProjectPaths> => {
  const { projectRoot } = getWorkspacePaths();
  const root = path.join(projectRoot, projectId);
  const researchBrief = path.join(root, 'research_brief.md');
  const slidePlan = path.join(root, 'slide_plan.md');
  const carouselDraft = path.join(root, 'carousel_draft.md');
  const handoffBrief = path.join(root, 'handoff_brief.md');
  const carouselJson = path.join(root, 'carousel.json');
  const rendersDir = path.join(root, 'renders');

  return {
    root,
    researchBrief: (await fileExists(researchBrief)) ? researchBrief : null,
    slidePlan: (await fileExists(slidePlan)) ? slidePlan : null,
    carouselDraft: (await fileExists(carouselDraft)) ? carouselDraft : null,
    handoffBrief: (await fileExists(handoffBrief)) ? handoffBrief : null,
    carouselJson: (await fileExists(carouselJson)) ? carouselJson : null,
    rendersDir: (await fileExists(rendersDir)) ? rendersDir : null,
  };
};

export const getApprovalsPath = (projectId: string) => {
  const { projectRoot } = getWorkspacePaths();
  return path.join(projectRoot, projectId, 'approvals.json');
};

export const readApprovals = async (projectId: string) => {
  const approvalsPath = getApprovalsPath(projectId);
  const merged = {
    ...defaultApprovals(),
    ...(await readJson<Partial<ApprovalSnapshot>>(approvalsPath, {})),
  };

  return {
    slidePlan: {
      ...defaultApproval(),
      ...merged.slidePlan,
    },
    reelsHighlight: {
      ...defaultApproval(),
      ...merged.reelsHighlight,
    },
  } satisfies ApprovalSnapshot;
};

export const writeApprovals = async (projectId: string, approvals: ApprovalSnapshot) => {
  await writeJson(getApprovalsPath(projectId), approvals);
};

export const getProjectMetaPath = (projectId: string) => {
  const { projectRoot } = getWorkspacePaths();
  return path.join(projectRoot, projectId, 'project.json');
};

export const readProjectMeta = async (projectId: string) => {
  return readJson<Partial<ProjectSummary>>(getProjectMetaPath(projectId), {});
};

export const writeProjectMeta = async (projectId: string, meta: Partial<ProjectSummary>) => {
  await writeJson(getProjectMetaPath(projectId), meta);
};

export const readProjectSummary = async (projectId: string): Promise<ProjectSummary> => {
  const paths = await getProjectPaths(projectId);
  const meta = await readProjectMeta(projectId);
  const approvals = await readApprovals(projectId);
  const contentType = inferContentType(meta, paths);
  const sourceType = inferSourceType(meta);
  const status = await inferProjectStatus(meta, approvals, paths, contentType);
  const stat = await fs.stat(paths.root);

  return {
    id: projectId,
    title: meta.title ?? projectId.replace(/[-_]+/g, ' '),
    contentType,
    sourceType,
    status,
    owner: meta.owner ?? DEFAULT_OWNER,
    updatedAt: meta.updatedAt ?? stat.mtime.toISOString(),
    fileCount: await countDirectEntries(paths.root),
    path: paths.root,
    approvals,
    paths,
  };
};

export const readProjectDetails = async (projectId: string): Promise<ProjectDetails> => {
  const summary = await readProjectSummary(projectId);
  const excerpts = (
    await Promise.all([
      summary.paths.researchBrief ? safeExcerpt(summary.paths.researchBrief, '리서치 브리프') : null,
      summary.paths.slidePlan ? safeExcerpt(summary.paths.slidePlan, '슬라이드 플랜') : null,
      summary.paths.carouselDraft ? safeExcerpt(summary.paths.carouselDraft, '캐러셀 드래프트') : null,
      summary.paths.handoffBrief ? safeExcerpt(summary.paths.handoffBrief, '핸드오프 브리프') : null,
      summary.paths.carouselJson ? safeExcerpt(summary.paths.carouselJson, 'carousel.json') : null,
    ])
  ).filter(Boolean);
  const renderAssets = await listRenderAssets(projectId);

  return {
    ...summary,
    excerpts: excerpts as ProjectExcerpt[],
    renderAssets,
  } as ProjectDetails;
};

export const createProjectShell = async (payload: ProjectCreatePayload) => {
  const { projectRoot } = getWorkspacePaths();
  const projectId = slugify(payload.title) || `project-${Date.now()}`;
  const root = path.join(projectRoot, projectId);

  await fs.mkdir(path.join(root, 'assets'), { recursive: true });
  await fs.mkdir(path.join(root, 'renders'), { recursive: true });

  const status: ProjectStatus = payload.contentType === 'slide' ? 'planning' : 'source_registered';
  const now = new Date().toISOString();

  await writeProjectMeta(projectId, {
    id: projectId,
    title: payload.title,
    contentType: payload.contentType,
    sourceType: payload.sourceType,
    status,
    owner: payload.owner,
    updatedAt: now,
  });
  await writeApprovals(projectId, defaultApprovals());

  return readProjectDetails(projectId);
};

export const updateProjectMeta = async (projectId: string, payload: ProjectUpdatePayload) => {
  const current = await readProjectMeta(projectId);
  await writeProjectMeta(projectId, {
    ...current,
    ...payload,
    id: projectId,
    updatedAt: new Date().toISOString(),
  });

  return readProjectDetails(projectId);
};

const getOutputPath = (jobId: string) => {
  const { reelsRendererRoot } = getWorkspacePaths();
  const output = path.join(reelsRendererRoot, 'out', `${jobId}-short.mp4`);
  return output;
};

const inferReelStatus = async (manifest: Record<string, any>, outputPath: string): Promise<ReelStatus> => {
  if (await fileExists(outputPath)) {
    return 'done';
  }

  if (manifest.approvedHighlight?.candidateIndex !== undefined && manifest.approvedHighlight?.candidateIndex !== null) {
    if (manifest.selectedHighlight?.outputFile) {
      return 'rendering';
    }

    return 'highlight_approved';
  }

  if (manifest.highlightCandidateReport || manifest.mode === 'probe') {
    return 'awaiting_highlight_approval';
  }

  if (manifest.outputs?.short || manifest.shortCandidates?.length) {
    return 'probed';
  }

  return 'source_registered';
};

const buildCandidates = (manifest: Record<string, any>, topOnly: boolean) => {
  const shortCandidates = Array.isArray(manifest.shortCandidates) ? manifest.shortCandidates : [];
  const topIndexes = new Set<number>(
    Array.isArray(manifest.highlightCandidateReport?.topCandidateIndexes)
      ? manifest.highlightCandidateReport.topCandidateIndexes
      : [],
  );

  return shortCandidates
    .filter((candidate: Record<string, any>) => !topOnly || topIndexes.has(candidate.index))
    .map((candidate: Record<string, any>) => ({
      index: candidate.index,
      title: candidate.title ?? `Candidate ${candidate.index}`,
      start: Number(candidate.start ?? 0),
      end: Number(candidate.end ?? 0),
      highlighted: topIndexes.has(candidate.index),
    })) as ReelCandidate[];
};

export const readReelJob = async (jobId: string): Promise<ReelJobDetails> => {
  const { reelsRoot } = getWorkspacePaths();
  const jobRoot = path.join(reelsRoot, jobId);
  const manifestPath = path.join(jobRoot, 'manifest.json');
  const manifest = await readJson<Record<string, any>>(manifestPath);
  const stat = await fs.stat(manifestPath);
  const outputPath = getOutputPath(jobId);
  const reelStatus = await inferReelStatus(manifest, outputPath);
  const highlightFileName =
    typeof manifest.selectedHighlight?.outputFile === 'string' ? manifest.selectedHighlight.outputFile : null;
  const highlightPath = highlightFileName ? path.join(jobRoot, highlightFileName) : null;
  const existingHighlightPath = highlightPath && (await fileExists(highlightPath)) ? highlightPath : null;
  const existingOutputPath = (await fileExists(outputPath)) ? outputPath : null;

  return {
    jobId,
    title: manifest.selectedHighlight?.title ?? manifest.source?.title ?? jobId,
    status: reelStatus,
    mode: manifest.mode ?? 'source_registered',
    candidateCount: Array.isArray(manifest.shortCandidates) ? manifest.shortCandidates.length : 0,
    selectedCandidateIndex: manifest.selectedHighlight?.candidateIndex ?? null,
    approvedCandidateIndex: manifest.approvedHighlight?.candidateIndex ?? null,
    updatedAt: stat.mtime.toISOString(),
    path: jobRoot,
    outputPath: existingOutputPath,
    topCandidates: buildCandidates(manifest, true),
    allCandidates: buildCandidates(manifest, false),
    sourceUrl: manifest.source?.url ?? null,
    manifestPath,
    highlightPath: existingHighlightPath,
    renderedOutputPath: existingOutputPath,
  };
};

export const upsertProjectFromReel = async (job: ReelJobDetails, overrides?: Partial<ProjectSummary>) => {
  const { projectRoot } = getWorkspacePaths();
  const root = path.join(projectRoot, job.jobId);
  await fs.mkdir(path.join(root, 'renders'), { recursive: true });
  await fs.mkdir(path.join(root, 'assets'), { recursive: true });

  const approvals = await readApprovals(job.jobId);
  await writeProjectMeta(job.jobId, {
    ...(await readProjectMeta(job.jobId)),
    id: job.jobId,
    title: overrides?.title ?? job.title,
    contentType: 'reels',
    sourceType: 'youtube',
    status: overrides?.status ?? job.status,
    owner: overrides?.owner ?? DEFAULT_OWNER,
    updatedAt: new Date().toISOString(),
  });
  await writeApprovals(job.jobId, approvals);

  return readProjectDetails(job.jobId);
};

export const listProjects = async (): Promise<ProjectSummary[]> => {
  const { projectRoot } = getWorkspacePaths();
  const projectIds = await listDirectories(projectRoot);
  const projects = await Promise.all(projectIds.map((projectId) => readProjectSummary(projectId)));
  return projects.sort((left: ProjectSummary, right: ProjectSummary) => right.updatedAt.localeCompare(left.updatedAt));
};

export const listReelJobs = async (): Promise<ReelJobSummary[]> => {
  const { reelsRoot } = getWorkspacePaths();
  const jobIds = await listDirectories(reelsRoot);
  const jobs = await Promise.all(jobIds.map((jobId) => readReelJob(jobId)));
  return jobs.sort((left: ReelJobSummary, right: ReelJobSummary) => right.updatedAt.localeCompare(left.updatedAt));
};

export const getWorkspaceSummary = async (): Promise<WorkspaceSummary> => {
  const paths = getWorkspacePaths();
  const [projects, reels] = await Promise.all([listProjects(), listReelJobs()]);

  return {
    rootPath: paths.rootPath,
    projectRoot: paths.projectRoot,
    reelsRoot: paths.reelsRoot,
    templateRoot: paths.templatesRoot,
    projectCount: projects.length,
    reelJobCount: reels.length,
    lastUpdatedAt: new Date().toISOString(),
  };
};

export const runProcess = async (
  command: string,
  args: string[],
  cwd: string,
  options?: { detached?: boolean; env?: NodeJS.ProcessEnv },
) => {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: options?.detached ? 'ignore' : 'inherit',
      detached: options?.detached ?? false,
      windowsHide: true,
      env: options?.env,
      shell: false,
    });

    child.on('error', reject);

    if (options?.detached) {
      child.unref();
      resolve();
      return;
    }

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${command} exited with code ${code}`));
        return;
      }

      resolve();
    });
  });
};

export const runNodeScript = async (cwd: string, scriptName: string, args: string[]) => {
  await runProcess(process.execPath, [scriptName, ...args], cwd, {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
    },
  });
};

export const launchStudio = async () => {
  const { reelsRendererRoot } = getWorkspacePaths();
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  await runProcess(npmCommand, ['run', 'studio'], reelsRendererRoot, {
    detached: true,
    env: {
      ...process.env,
      BROWSER: 'none',
    },
  });

  return {
    ok: true,
    message: 'Remotion Studio launching in the renderer workspace.',
    path: reelsRendererRoot,
  } satisfies CommandResponse;
};

export const openWorkspacePath = async (targetPath: string) => {
  const resolved = ensureWorkspacePath(targetPath);
  const message = await shell.openPath(resolved);

  if (message) {
    throw new Error(message);
  }

  return {
    ok: true,
    message: 'Path opened.',
    path: resolved,
  } satisfies CommandResponse;
};

export const resolveWorkspaceMediaUrl = (targetPath: string) => {
  const resolved = ensureWorkspacePath(targetPath);
  return pathToFileURL(resolved).href;
};
