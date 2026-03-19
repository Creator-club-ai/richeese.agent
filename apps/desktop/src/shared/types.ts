export type EntityType = 'source' | 'project';
export type ValidationState = 'valid' | 'warning' | 'invalid' | 'unknown';
export type RunStatus =
  | 'idle'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'applied'
  | 'discarded';

export interface ValidationIssue {
  severity: 'error' | 'warning';
  scope: 'source' | 'project' | 'global';
  entityId?: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  checkedAt: string;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface MarkdownSection {
  heading: string;
  level: number;
  content: string;
}

export interface PlanningCandidate {
  heading: string;
  candidateId: string;
  workingTitle?: string;
  packaging?: string;
  reviewStatus?: string;
  slideCount?: string;
  contentAngle?: string;
  whyItDeservesAPost?: string;
  recommendedPriority?: string;
  sections: Record<string, string>;
}

export interface WorkspaceFileEntry {
  id: string;
  name: string;
  absolutePath: string;
  relativePath: string;
  size: number;
  lastModifiedAt: string;
}

export interface WorkspaceDocument {
  key: string;
  label: string;
  absolutePath: string;
  relativePath: string;
  exists: boolean;
  preview: string;
}

export interface WorkspaceEntityBase {
  type: EntityType;
  id: string;
  title: string;
  brand: string;
  statusOrStage: string;
  paths: Record<string, string>;
  validationState: ValidationState;
  lastModifiedAt: string;
}

export interface SourceEntity extends WorkspaceEntityBase {
  type: 'source';
  sourceType: string;
  status: string;
  planningPath?: string;
  candidateIds: string[];
  approvedCandidateIds: string[];
  standaloneCandidateIds: string[];
  mainCandidateId: string | null;
  spawnMode: string | null;
  candidates: PlanningCandidate[];
  documents: WorkspaceDocument[];
}

export interface ProjectEntity extends WorkspaceEntityBase {
  type: 'project';
  stage: string;
  requiresResearchBrief: boolean;
  qaStatus: string;
  approvalStatus: string;
  derivedFrom?: {
    sourceId: string;
    candidateId: string;
  } | null;
  documents: WorkspaceDocument[];
}

export interface WorkspaceCatalog {
  brands: WorkspaceFileEntry[];
  templates: WorkspaceFileEntry[];
  skills: WorkspaceFileEntry[];
}

export interface WorkspaceSnapshot {
  workspacePath: string;
  sources: SourceEntity[];
  projects: ProjectEntity[];
  catalog: WorkspaceCatalog;
  validation: ValidationResult;
  generatedAt: string;
}

export interface StageDefinition {
  stageId: string;
  label: string;
  description: string;
  category: 'codex' | 'command' | 'manual';
  requiredInputs: string[];
  allowedOutputs: string[];
  canRun: boolean;
  canApprove: boolean;
  nextStage: string | null;
  routeBackStage: string | null;
  skillPath?: string;
}

export interface StageRunRequest {
  entityType: EntityType;
  entityId: string;
  stage: string;
  userNote?: string;
  skillPath?: string;
  allowedOutputs: string[];
  cwd: string;
}

export interface RunLogEntry {
  id: string;
  type: 'system' | 'agent' | 'command' | 'error';
  message: string;
  timestamp: string;
}

export interface RunArtifact {
  relativePath: string;
  absolutePath: string;
  kind: 'image' | 'text' | 'file';
}

export interface StageRunResult {
  runId: string;
  status: RunStatus;
  request: StageRunRequest;
  logs: RunLogEntry[];
  diff: string;
  touchedFiles: string[];
  validation: ValidationResult | null;
  artifacts: RunArtifact[];
  lastMessage?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface ProviderStatus {
  provider: 'codex-openai';
  connected: boolean;
  accountLabel?: string;
  canRun: boolean;
  lastCheckedAt: string;
  error?: string;
}

export interface SourceApprovalPayload {
  sourceId: string;
  mainCandidateId: string | null;
  standaloneCandidateIds: string[];
  approvedCandidateIds: string[];
  spawnMode: 'plan_approved' | 'research_first';
  status: 'approved' | 'analyzed' | 'spawned';
}

export interface FilePayload {
  absolutePath: string;
  content: string;
}

export interface PersistedRunSummary {
  runId: string;
  entityType: EntityType;
  entityId: string;
  stage: string;
  status: RunStatus;
  createdAt: string;
  completedAt?: string;
}

export interface DesktopAppState {
  recentWorkspacePath: string | null;
  panelState: Record<string, unknown>;
  runs: PersistedRunSummary[];
}
