import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { ProjectEntity, SourceEntity } from '@shared/types';
import { ValidationBadge } from '@renderer/components/shared/validation-badge';
import { Badge } from '@renderer/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card';
import { ScrollArea } from '@renderer/components/ui/scroll-area';
import { translateWorkflowState } from '@renderer/lib/workspace';

type Entity = SourceEntity | ProjectEntity;

export function EntityBoardPage({
  title,
  description,
  entities,
  groupByKey,
}: {
  title: string;
  description: string;
  entities: Entity[];
  groupByKey: 'status' | 'stage';
}): React.JSX.Element {
  const grouped = new Map<string, Entity[]>();

  for (const entity of entities) {
    const key = groupByKey === 'status' && entity.type === 'source' ? entity.status : entity.statusOrStage;
    const bucket = grouped.get(key) ?? [];
    bucket.push(entity);
    grouped.set(key, bucket);
  }

  return (
    <section className="flex h-full flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-chrome-500">보드 보기</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-ink">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-chrome-600">{description}</p>
      </div>

      <div className="grid min-h-0 flex-1 grid-flow-col gap-4 overflow-x-auto pb-2">
        {Array.from(grouped.entries()).map(([status, items]) => (
          <Card key={status} className="flex min-h-0 w-[320px] flex-col bg-chrome-50/70">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-lg">{translateWorkflowState(status, groupByKey === 'status' ? 'source' : 'project')}</CardTitle>
                <Badge variant="neutral">{items.length}</Badge>
              </div>
              <CardDescription>{`${items.length}개 항목`}</CardDescription>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 pt-0">
              <ScrollArea className="h-full pr-3">
                <div className="space-y-3">
                  {items.map((entity) => (
                    <Link key={`${entity.type}-${entity.id}`} to={`/workbench/${entity.type}/${entity.id}`}>
                      <div className="rounded-xl border border-chrome-200 bg-white p-4 transition hover:border-chrome-300 hover:shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">{entity.title}</p>
                            <p className="mt-2 text-xs text-chrome-500">{entity.brand}</p>
                          </div>
                          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-chrome-400" />
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm text-chrome-600">
                          <span className="truncate">{entity.id}</span>
                          <ValidationBadge state={entity.validationState} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
