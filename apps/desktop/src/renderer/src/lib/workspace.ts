import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

import type {
  PersistedRunSummary,
  ProjectEntity,
  SourceEntity,
  StageDefinition,
  StageRunResult,
  WorkspaceSnapshot,
} from '@shared/types';

export type Entity = SourceEntity | ProjectEntity;

const SOURCE_STATUS_LABELS: Record<string, string> = {
  ingested: '수집됨',
  analyzed: '기획 완료',
  approved: '승인됨',
  spawned: '프로젝트 생성됨',
};

const PROJECT_STAGE_LABELS: Record<string, string> = {
  draft: '초안',
  researching: '리서치 중',
  planning: '기획 중',
  awaiting_plan_approval: '기획 승인 대기',
  plan_approved: '기획 승인 완료',
  writing: '원고 작성',
  designing: '디자인',
  qa: 'QA',
  done: '완료',
  sample: '샘플',
};

const ACTION_STAGE_LABELS: Record<string, string> = {
  'source-planning': '기획 생성',
  'source-approve': '후보 승인',
  'spawn-approved': '프로젝트 생성',
  research: '리서치',
  plan: '플래닝',
  'approve-slide-plan': '기획 승인',
  edit: '에디터',
  design: '디자인',
  'render-preview': '미리보기 렌더',
  qa: 'QA',
};

const RUN_STATUS_LABELS: Record<string, string> = {
  idle: '대기',
  running: '실행 중',
  completed: '검토 대기',
  failed: '실패',
  cancelled: '취소됨',
  applied: '적용 완료',
  discarded: '폐기됨',
};

export function findEntity(
  snapshot: WorkspaceSnapshot,
  entityType: 'source' | 'project',
  entityId: string,
): Entity | null {
  return entityType === 'source'
    ? snapshot.sources.find((source) => source.id === entityId) ?? null
    : snapshot.projects.find((project) => project.id === entityId) ?? null;
}

export function resolveAllowedOutputs(entity: Entity, stageId: string): string[] {
  if (entity.type === 'source') {
    return ['source.json', 'planning.md'];
  }

  switch (stageId) {
    case 'research':
      return [entity.paths.researchBrief ?? 'research_brief.md'];
    case 'plan':
      return [entity.paths.slidePlan ?? 'slide_plan.md'];
    case 'edit':
      return [
        entity.paths.carouselDraft ?? 'carousel_draft.md',
        entity.paths.handoffBrief ?? 'handoff_brief.md',
      ];
    case 'design':
      return [entity.paths.carouselJson ?? 'carousel.json'];
    case 'render-preview':
      return [entity.paths.renderDir ?? 'renders/current'];
    case 'qa':
      return [entity.paths.qaReport ?? 'qa_report.md', 'project.json'];
    default:
      return [];
  }
}

export function buildStageRequest(entity: Entity, stage: StageDefinition, note: string) {
  return {
    entityType: entity.type,
    entityId: entity.id,
    stage: stage.stageId,
    userNote: note,
    skillPath: stage.skillPath,
    allowedOutputs: resolveAllowedOutputs(entity, stage.stageId),
    cwd: entity.type === 'source' ? `sources/${entity.id}` : `projects/${entity.id}`,
  } as const;
}

export function mergeRunSummaries(
  summaries: PersistedRunSummary[],
  runs: StageRunResult[],
): PersistedRunSummary[] {
  const map = new Map<string, PersistedRunSummary>();
  for (const summary of summaries) {
    map.set(summary.runId, summary);
  }
  for (const run of runs) {
    map.set(run.runId, {
      runId: run.runId,
      entityType: run.request.entityType,
      entityId: run.request.entityId,
      stage: run.request.stage,
      status: run.status,
      createdAt: run.createdAt,
      completedAt: run.completedAt,
    });
  }
  return Array.from(map.values()).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function timeAgo(value: string): string {
  return formatDistanceToNow(new Date(value), { addSuffix: true, locale: ko });
}

export function resolvePageTitle(pathname: string): string {
  if (pathname.startsWith('/intakes')) {
    return '인테이크 보드';
  }
  if (pathname.startsWith('/projects')) {
    return '프로젝트 보드';
  }
  if (pathname.startsWith('/catalog')) {
    return '워크스페이스 자료';
  }
  if (pathname.startsWith('/settings')) {
    return '설정';
  }
  if (pathname.startsWith('/logs')) {
    return '실행 로그';
  }
  if (pathname.startsWith('/workbench')) {
    return '단계 워크벤치';
  }
  return '대시보드';
}

export function groupEntities<T extends { statusOrStage: string; status?: string; stage?: string }>(
  entities: T[],
  key: 'status' | 'stage',
): Array<{ key: string; count: number }> {
  const counts = new Map<string, number>();
  for (const entity of entities) {
    const value = key === 'status' ? entity.status ?? entity.statusOrStage : entity.stage ?? entity.statusOrStage;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([entryKey, count]) => ({ key: entryKey, count }));
}

export function statusToValidationState(status: string): 'valid' | 'warning' | 'invalid' | 'unknown' {
  if (status === 'applied' || status === 'completed') {
    return 'valid';
  }
  if (status === 'failed' || status === 'cancelled') {
    return 'invalid';
  }
  if (status === 'running') {
    return 'warning';
  }
  return 'unknown';
}

export function translateValidationState(state: string): string {
  switch (state) {
    case 'valid':
      return '정상';
    case 'warning':
      return '주의';
    case 'invalid':
      return '오류';
    default:
      return '미확인';
  }
}

export function translateWorkflowState(value: string, entityType?: 'source' | 'project'): string {
  if (ACTION_STAGE_LABELS[value]) {
    return ACTION_STAGE_LABELS[value];
  }
  if (entityType === 'source') {
    return SOURCE_STATUS_LABELS[value] ?? value;
  }
  if (entityType === 'project') {
    return PROJECT_STAGE_LABELS[value] ?? value;
  }
  return SOURCE_STATUS_LABELS[value] ?? PROJECT_STAGE_LABELS[value] ?? ACTION_STAGE_LABELS[value] ?? value;
}

export function translateRunStatus(value: string): string {
  return RUN_STATUS_LABELS[value] ?? value;
}

export function translateEntityType(value: string): string {
  return value === 'source' ? '소스' : value === 'project' ? '프로젝트' : value;
}

export function translateCategory(value: string): string {
  return value === 'codex' ? 'AI 실행' : value === 'manual' ? '수동' : value === 'command' ? '명령' : value;
}

export function translateCatalogKey(value: string | undefined): string {
  if (value === 'brands') {
    return '브랜드';
  }
  if (value === 'templates') {
    return '템플릿';
  }
  if (value === 'skills') {
    return '스킬';
  }
  return '자료';
}

export function safePrettyJson(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}
