export type ContentType = 'slide' | 'reels';
export type SourceType = 'provided' | 'researched' | 'youtube';
export type ApprovalStatus = 'not_requested' | 'pending' | 'approved' | 'hold';

export type ProjectStatus =
  | 'draft'
  | 'planning'
  | 'awaiting_plan_approval'
  | 'plan_approved'
  | 'writing'
  | 'designing'
  | 'qa'
  | 'source_registered'
  | 'probed'
  | 'awaiting_highlight_approval'
  | 'highlight_approved'
  | 'downloading_section'
  | 'rendering'
  | 'done';

export type ReelStatus =
  | 'source_registered'
  | 'probed'
  | 'awaiting_highlight_approval'
  | 'highlight_approved'
  | 'downloading_section'
  | 'rendering'
  | 'done';

export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export type ProjectApproval = {
  status: ApprovalStatus;
  approver?: string | null;
  approvedAt?: string | null;
  reason?: string | null;
  candidateIndex?: number | null;
};

export type ApprovalSnapshot = {
  slidePlan: ProjectApproval;
  reelsHighlight: ProjectApproval;
};

export type ProjectPaths = {
  root: string;
  researchBrief?: string | null;
  slidePlan?: string | null;
  carouselDraft?: string | null;
  handoffBrief?: string | null;
  carouselJson?: string | null;
  rendersDir?: string | null;
};

export type ProjectSummary = {
  id: string;
  title: string;
  contentType: ContentType;
  sourceType: SourceType;
  status: ProjectStatus;
  owner: string;
  updatedAt: string;
  fileCount: number;
  path: string;
  approvals: ApprovalSnapshot;
  paths: ProjectPaths;
};

export type ProjectExcerpt = {
  label: string;
  path: string;
  content: string;
};

export type ProjectRenderAsset = {
  path: string;
  name: string;
  kind: 'image';
};

export type ProjectDetails = ProjectSummary & {
  excerpts: ProjectExcerpt[];
  renderAssets: ProjectRenderAsset[];
};

export type ProjectCreatePayload = {
  title: string;
  contentType: ContentType;
  sourceType: SourceType;
  owner: string;
};

export type ProjectUpdatePayload = Partial<Pick<ProjectSummary, 'title' | 'status' | 'owner' | 'sourceType'>>;

export type WorkspaceSummary = {
  rootPath: string;
  projectRoot: string;
  reelsRoot: string;
  templateRoot: string;
  projectCount: number;
  reelJobCount: number;
  lastUpdatedAt: string;
};

export type ReelCandidate = {
  index: number;
  title: string;
  start: number;
  end: number;
  highlighted?: boolean;
};

export type ReelJobSummary = {
  jobId: string;
  title: string;
  status: ReelStatus;
  mode: string;
  candidateCount: number;
  selectedCandidateIndex: number | null;
  approvedCandidateIndex: number | null;
  updatedAt: string;
  path: string;
  outputPath: string | null;
};

export type ReelJobDetails = ReelJobSummary & {
  topCandidates: ReelCandidate[];
  allCandidates: ReelCandidate[];
  sourceUrl: string | null;
  manifestPath: string;
  highlightPath: string | null;
  renderedOutputPath: string | null;
};

export type ReelProbePayload = {
  jobId: string;
  url: string;
};

export type ApproveHighlightPayload = {
  jobId: string;
  candidateIndex: number;
  approver: string;
};

export type SlidePlanPayload = {
  markdown: string;
};

export type FileMovePayload = {
  from: string;
  to: string;
};

export type FileWritePayload = {
  path: string;
  content: string;
};

export type CommandResponse = {
  ok: boolean;
  message: string;
  path?: string | null;
};

export type CommandId =
  | 'reels.openStudio'
  | 'reels.renderShort'
  | 'workspace.openProjects'
  | 'workspace.openReels';

// ─── Agent / Skill 타입 ──────────────────────────────────────────────────────

export type AgentSkillName =
  | 'content_researcher'
  | 'content_planner'
  | 'content_editor'
  | 'slide_designer';

export type AgentRunPayload = {
  skillName: AgentSkillName;
  projectId: string;
  instruction?: string;
};

export type AgentRunResult = {
  ok: boolean;
  message: string;
  outputPath?: string;
};

export type AgentLogEntry = {
  skillName: AgentSkillName;
  projectId: string;
  line: string;
};

export type AgentInstallCheck = {
  installed: boolean;
  version?: string;
};

export type OpsApi = {
  system: {
    getWorkspace: () => Promise<WorkspaceSummary>;
    openPath: (targetPath: string) => Promise<CommandResponse>;
    runCommand: (commandId: CommandId, payload?: Record<string, unknown>) => Promise<CommandResponse>;
    resolveMediaUrl: (targetPath: string) => Promise<string>;
  };
  projects: {
    list: () => Promise<ProjectSummary[]>;
    get: (projectId: string) => Promise<ProjectDetails>;
    create: (payload: ProjectCreatePayload) => Promise<ProjectDetails>;
    updateMeta: (projectId: string, payload: ProjectUpdatePayload) => Promise<ProjectDetails>;
  };
  approvals: {
    get: (projectId: string) => Promise<ApprovalSnapshot>;
    update: (projectId: string, payload: Partial<ApprovalSnapshot>) => Promise<ApprovalSnapshot>;
  };
  reels: {
    listJobs: () => Promise<ReelJobSummary[]>;
    getJob: (jobId: string) => Promise<ReelJobDetails>;
    probeYoutube: (jobId: string, url: string) => Promise<ReelJobDetails>;
    rankHighlights: (jobId: string) => Promise<ReelJobDetails>;
    approveHighlight: (jobId: string, candidateIndex: number, approver: string) => Promise<ReelJobDetails>;
    downloadApprovedHighlight: (jobId: string) => Promise<ReelJobDetails>;
    renderShort: (jobId: string) => Promise<ReelJobDetails>;
    openStudio: () => Promise<CommandResponse>;
  };
  slides: {
    createPlan: (projectId: string, payload: SlidePlanPayload) => Promise<ProjectDetails>;
    markAwaitingApproval: (projectId: string) => Promise<ProjectDetails>;
    approvePlan: (projectId: string, approver: string) => Promise<ProjectDetails>;
    holdPlan: (projectId: string, reason: string) => Promise<ProjectDetails>;
    renderProject: (projectId: string) => Promise<ProjectDetails>;
  };
  files: {
    readText: (targetPath: string) => Promise<string>;
    writeText: (payload: FileWritePayload) => Promise<CommandResponse>;
    move: (payload: FileMovePayload) => Promise<CommandResponse>;
  };
  agent: {
    runSkill: (payload: AgentRunPayload) => Promise<AgentRunResult>;
    checkInstall: () => Promise<AgentInstallCheck>;
    /** renderer가 'agent:log' 이벤트를 수신하려면 이 함수로 리스너 등록 */
    onLog: (callback: (entry: AgentLogEntry) => void) => void;
    /** 리스너 해제 */
    offLog: (callback: (entry: AgentLogEntry) => void) => void;
  };
};
