import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { SourceEntity } from '@shared/types';
import { Button } from '@renderer/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card';

export function SourceApprovalCard({
  source,
  onSave,
}: {
  source: SourceEntity;
  onSave: (payload: {
    sourceId: string;
    mainCandidateId: string | null;
    standaloneCandidateIds: string[];
    approvedCandidateIds: string[];
    spawnMode: 'plan_approved' | 'research_first';
    status: 'approved' | 'analyzed' | 'spawned';
  }) => Promise<void>;
}): React.JSX.Element {
  const [mainCandidateId, setMainCandidateId] = useState<string | null>(source.mainCandidateId);
  const [standaloneCandidateIds, setStandaloneCandidateIds] = useState<string[]>(source.standaloneCandidateIds);
  const [approvedCandidateIds, setApprovedCandidateIds] = useState<string[]>(source.approvedCandidateIds);
  const [spawnMode, setSpawnMode] = useState<'plan_approved' | 'research_first'>(
    source.spawnMode === 'research_first' ? 'research_first' : 'plan_approved',
  );

  useEffect(() => {
    setMainCandidateId(source.mainCandidateId);
    setStandaloneCandidateIds(source.standaloneCandidateIds);
    setApprovedCandidateIds(source.approvedCandidateIds);
    setSpawnMode(source.spawnMode === 'research_first' ? 'research_first' : 'plan_approved');
  }, [source]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>후보 승인</CardTitle>
        <CardDescription>메인 카드, 단독 후속 카드, 즉시 생성할 후보를 직접 선택합니다.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-chrome-200 bg-chrome-50/60 p-4">
            <p className="text-sm font-medium text-ink">메인 후보</p>
            <div className="mt-3 space-y-2">
              {source.candidates.map((candidate) => (
                <label key={candidate.candidateId} className="flex items-start gap-3 rounded-xl border border-chrome-200 bg-white p-3">
                  <input
                    type="radio"
                    name={`mainCandidate-${source.id}`}
                    checked={mainCandidateId === candidate.candidateId}
                    onChange={() => setMainCandidateId(candidate.candidateId)}
                    className="mt-1"
                  />
                  <span className="min-w-0">
                    <span className="block font-medium text-ink">{candidate.workingTitle ?? candidate.candidateId}</span>
                    <span className="mt-1 block text-sm leading-6 text-chrome-600">{candidate.contentAngle}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-chrome-200 bg-chrome-50/60 p-4">
            <p className="text-sm font-medium text-ink">후속 후보와 생성 큐</p>
            <div className="mt-3 space-y-3">
              {source.candidates.map((candidate) => (
                <div key={candidate.candidateId} className="rounded-xl border border-chrome-200 bg-white p-3">
                  <p className="font-medium text-ink">{candidate.workingTitle ?? candidate.candidateId}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-chrome-600">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={standaloneCandidateIds.includes(candidate.candidateId)}
                        onChange={(event) => {
                          setStandaloneCandidateIds((current) =>
                            event.target.checked
                              ? [...new Set([...current, candidate.candidateId])]
                              : current.filter((item) => item !== candidate.candidateId),
                          );
                        }}
                      />
                      단독 포스트
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={approvedCandidateIds.includes(candidate.candidateId)}
                        onChange={(event) => {
                          setApprovedCandidateIds((current) =>
                            event.target.checked
                              ? [...new Set([...current, candidate.candidateId])]
                              : current.filter((item) => item !== candidate.candidateId),
                          );
                        }}
                      />
                      지금 생성
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant={spawnMode === 'plan_approved' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSpawnMode('plan_approved')}
              >
                기획 승인 상태로 생성
              </Button>
              <Button
                variant={spawnMode === 'research_first' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSpawnMode('research_first')}
              >
                리서치부터 시작
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="accent"
            onClick={() =>
              void onSave({
                sourceId: source.id,
                mainCandidateId,
                standaloneCandidateIds,
                approvedCandidateIds,
                spawnMode,
                status: approvedCandidateIds.length > 0 ? 'approved' : 'analyzed',
              })
                .then(() => {
                  toast.success('승인 내용을 저장했습니다.');
                })
                .catch((error) => {
                  toast.error(error instanceof Error ? error.message : String(error));
                })
            }
          >
            승인 저장
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
