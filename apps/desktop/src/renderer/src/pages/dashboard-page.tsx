import {
  Eye,
  FilePenLine,
  ShieldCheck,
} from 'lucide-react';

import type {
  PersistedRunSummary,
  ProviderStatus,
  WorkspaceSnapshot,
} from '@shared/types';
import { EmptyState } from '@renderer/components/shared/empty-state';
import { Badge } from '@renderer/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card';
import {
  groupEntities,
  timeAgo,
  translateEntityType,
  translateRunStatus,
  translateWorkflowState,
} from '@renderer/lib/workspace';

export function DashboardPage({
  snapshot,
  providerStatus,
  runs,
}: {
  snapshot: WorkspaceSnapshot;
  providerStatus: ProviderStatus | null;
  runs: PersistedRunSummary[];
}): React.JSX.Element {
  const stageCounts = groupEntities(snapshot.projects, 'stage');
  const sourceCounts = groupEntities(snapshot.sources, 'status');

  return (
    <div className="grid h-full grid-cols-[1.1fr_0.9fr] gap-6">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard title="소스" value={String(snapshot.sources.length)} note="검토 대기 인테이크" />
          <MetricCard title="프로젝트" value={String(snapshot.projects.length)} note="수동 단계 파이프라인" />
          <MetricCard
            title="검증 상태"
            value={snapshot.validation.ok ? '정상' : `${snapshot.validation.errors.length}개 오류`}
            note={`${snapshot.validation.warnings.length}개 경고`}
            tone={snapshot.validation.ok ? 'success' : 'danger'}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>운영 현황</CardTitle>
            <CardDescription>현재 어느 단계에 작업이 몰려 있는지 빠르게 확인합니다.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <StatusCluster title="소스 상태" data={sourceCounts} entityType="source" />
            <StatusCluster title="프로젝트 단계" data={stageCounts} entityType="project" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>검수 중심 흐름</CardTitle>
            <CardDescription>
              AI는 초안만 만들고, 실제 적용 여부는 항상 직접 검수한 뒤 결정합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <WorkflowCard
              icon={FilePenLine}
              title="격리된 초안 생성"
              description="Codex 실행은 실제 워크스페이스가 아니라 임시 복사본에서 이뤄집니다."
            />
            <WorkflowCard
              icon={Eye}
              title="diff와 원문 동시 검토"
              description="구조화된 보기와 raw 편집 화면을 함께 확인할 수 있습니다."
            />
            <WorkflowCard
              icon={ShieldCheck}
              title="승인 후 반영"
              description="실행 중간에 원본이 바뀌면 적용을 막아 안전하게 다시 검토합니다."
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>연결 상태</CardTitle>
              <Badge variant={providerStatus?.connected ? 'success' : 'warning'}>
                {providerStatus?.connected ? '준비됨' : '로그인 필요'}
              </Badge>
            </div>
            <CardDescription>
              {providerStatus?.connected
                ? 'Codex 기반 단계 실행이 가능합니다.'
                : '플래닝, 에디터, 디자이너, QA 실행 전에 로그인을 확인해 주세요.'}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 실행</CardTitle>
            <CardDescription>가장 최근에 수행한 단계와 상태를 보여줍니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {runs.length === 0 ? (
              <EmptyState label="아직 실행 기록이 없습니다" detail="첫 단계 실행 후 최근 기록이 여기에 표시됩니다." />
            ) : (
              runs.slice(0, 8).map((run) => (
                <div key={run.runId} className="rounded-xl border border-chrome-200 bg-chrome-50/60 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink">
                        {translateEntityType(run.entityType)} · {run.entityId}
                      </p>
                      <p className="mt-1 text-sm text-chrome-600">
                        {translateWorkflowState(run.stage)}
                      </p>
                    </div>
                    <Badge variant={run.status === 'failed' ? 'danger' : run.status === 'applied' ? 'success' : 'neutral'}>
                      {translateRunStatus(run.status)}
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs text-chrome-500">{timeAgo(run.createdAt)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  note,
  tone = 'neutral',
}: {
  title: string;
  value: string;
  note: string;
  tone?: 'neutral' | 'success' | 'danger';
}): React.JSX.Element {
  return (
    <Card className={tone === 'success' ? 'border-emerald-200 bg-emerald-50/60' : tone === 'danger' ? 'border-red-200 bg-red-50/60' : undefined}>
      <CardHeader className="pb-3">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-4xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-chrome-600">{note}</p>
      </CardContent>
    </Card>
  );
}

function StatusCluster({
  title,
  data,
  entityType,
}: {
  title: string;
  data: Array<{ key: string; count: number }>;
  entityType: 'source' | 'project';
}): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-chrome-200 bg-chrome-50/60 p-5">
      <p className="text-sm font-medium text-ink">{title}</p>
      <div className="mt-4 space-y-3">
        {data.map((entry) => (
          <div key={entry.key} className="flex items-center justify-between gap-4">
            <span className="text-sm text-chrome-600">{translateWorkflowState(entry.key, entityType)}</span>
            <Badge variant="neutral">{entry.count}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkflowCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-chrome-200 bg-chrome-50/60 p-5">
      <div className="inline-flex rounded-xl border border-chrome-200 bg-white p-2">
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-chrome-600">{description}</p>
    </div>
  );
}
