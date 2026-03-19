import type { DesktopAppState, StageRunResult } from '@shared/types';
import { Badge } from '@renderer/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card';
import { ScrollArea } from '@renderer/components/ui/scroll-area';
import {
  mergeRunSummaries,
  timeAgo,
  translateEntityType,
  translateRunStatus,
  translateWorkflowState,
} from '@renderer/lib/workspace';

export function LogsPage({
  appState,
  runs,
}: {
  appState: DesktopAppState | null;
  runs: StageRunResult[];
}): React.JSX.Element {
  const merged = mergeRunSummaries(appState?.runs ?? [], runs);

  return (
    <Card className="min-h-0">
      <CardHeader>
        <CardTitle>실행 로그</CardTitle>
        <CardDescription>최근 수행한 실행 이력과 현재 메모리에 남아 있는 상태를 함께 보여줍니다.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-0">
        <ScrollArea className="h-[calc(100vh-260px)] pr-3">
          <div className="space-y-3">
            {merged.map((run) => (
              <div key={run.runId} className="rounded-xl border border-chrome-200 bg-chrome-50/60 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-ink">
                      {translateEntityType(run.entityType)} · {run.entityId}
                    </p>
                    <p className="mt-1 text-sm text-chrome-600">{translateWorkflowState(run.stage)}</p>
                  </div>
                  <Badge variant={run.status === 'applied' ? 'success' : run.status === 'failed' ? 'danger' : 'neutral'}>
                    {translateRunStatus(run.status)}
                  </Badge>
                </div>
                <p className="mt-3 text-xs text-chrome-500">{timeAgo(run.createdAt)}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
