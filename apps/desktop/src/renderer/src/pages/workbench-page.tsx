import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { getProjectStageDefinitions, getSourceStageDefinitions } from '@shared/stages';
import { DocumentWorkbench } from '@renderer/components/shared/document-workbench';
import { EmptyState } from '@renderer/components/shared/empty-state';
import { SourceApprovalCard } from '@renderer/components/shared/source-approval-card';
import { ValidationBadge } from '@renderer/components/shared/validation-badge';
import { Badge } from '@renderer/components/ui/badge';
import { Button } from '@renderer/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card';
import { ScrollArea } from '@renderer/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs';
import { Textarea } from '@renderer/components/ui/textarea';
import { useContentOS } from '@renderer/hooks/use-content-os';
import {
  buildStageRequest,
  findEntity,
  statusToValidationState,
  timeAgo,
  translateCategory,
  translateEntityType,
  translateRunStatus,
  translateWorkflowState,
} from '@renderer/lib/workspace';

export function WorkbenchPage({
  contentOS,
}: {
  contentOS: ReturnType<typeof useContentOS>;
}): React.JSX.Element {
  const { entityType, entityId } = useParams();
  const navigate = useNavigate();

  const entity = useMemo(() => {
    if (!entityType || !entityId || !contentOS.snapshot) {
      return null;
    }
    return findEntity(contentOS.snapshot, entityType as 'source' | 'project', entityId);
  }, [contentOS.snapshot, entityId, entityType]);

  const stages = useMemo(() => {
    if (!entity) {
      return [];
    }

    return entity.type === 'source'
      ? getSourceStageDefinitions(entity)
      : getProjectStageDefinitions(entity);
  }, [entity]);

  const [selectedStageId, setSelectedStageId] = useState('');
  const [selectedDocumentKey, setSelectedDocumentKey] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    setSelectedStageId(stages[0]?.stageId ?? '');
  }, [stages, entity?.id]);

  useEffect(() => {
    setSelectedDocumentKey(entity?.documents[0]?.key ?? '');
  }, [entity?.id, entity?.documents]);

  if (!entity) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>항목을 찾을 수 없습니다</CardTitle>
          <CardDescription>목록에서 다시 선택하거나 이전 화면으로 돌아가 주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            이전 화면
          </Button>
        </CardContent>
      </Card>
    );
  }

  const selectedStage = stages.find((stage) => stage.stageId === selectedStageId) ?? stages[0];
  const selectedDocument = entity.documents.find((document) => document.key === selectedDocumentKey) ?? entity.documents[0];
  const latestRun = contentOS.runs.find(
    (run) =>
      run.request.entityType === entity.type &&
      run.request.entityId === entity.id &&
      run.request.stage === selectedStage?.stageId,
  );
  const providerReady = selectedStage?.category !== 'codex'
    || Boolean(contentOS.providerStatus?.canRun ?? contentOS.providerStatus?.connected);
  const runBlockedReason = !selectedStage
    ? '단계를 먼저 선택해 주세요.'
    : selectedStage.stageId === 'source-approve'
      ? '후보 승인 단계는 가운데 승인 패널에서 저장합니다.'
      : !selectedStage.canRun
        ? '현재 단계 조건이 아직 충족되지 않았습니다.'
        : !providerReady
          ? 'Codex 로그인이 확인되면 AI 실행 버튼이 활성화됩니다.'
          : null;
  const actionLabel = selectedStage?.category === 'manual'
    ? '수동 단계 실행'
    : selectedStage?.category === 'command'
      ? '명령 실행'
      : 'AI 실행';
  const guidanceText = runBlockedReason
    ?? (selectedStage?.category === 'codex'
      ? '메모를 남기고 임시 워크스페이스에서 초안을 생성한 뒤 diff를 검토합니다.'
      : selectedStage?.category === 'command'
        ? '로컬 명령을 실행해 렌더나 스폰 같은 보조 작업을 처리합니다.'
        : '수동으로 승인하거나 워크플로우 상태를 이동하는 단계입니다.');
  const translatedEntityType = translateEntityType(entity.type);
  const translatedStatus = translateWorkflowState(entity.statusOrStage, entity.type);

  const runStage = async () => {
    if (!selectedStage) {
      return;
    }

    try {
      if (selectedStage.stageId === 'source-approve') {
        toast.message('후보 저장은 가운데 승인 패널에서 진행해 주세요.');
        return;
      }

      if (selectedStage.stageId === 'approve-slide-plan' && entity.type === 'project') {
        await contentOS.approveSlidePlan(entity.id);
        toast.success('슬라이드 플랜을 승인하고 에디터 문서를 준비했습니다.');
        return;
      }

      if (selectedStage.stageId === 'spawn-approved' && entity.type === 'source') {
        await contentOS.spawnApproved(entity.id);
        toast.success('승인된 후보로 프로젝트를 생성했습니다.');
        return;
      }

      const request = buildStageRequest(entity, selectedStage, note);
      await contentOS.runStage(request);
      toast.success(`${selectedStage.label} 실행을 마쳤습니다.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  };

  const applyLatestRun = async () => {
    if (!latestRun) {
      return;
    }

    try {
      await contentOS.applyDiff(latestRun.runId);
      toast.success('검토한 변경사항을 워크스페이스에 반영했습니다.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  };

  const discardLatestRun = async () => {
    if (!latestRun) {
      return;
    }

    try {
      await contentOS.discardRun(latestRun.runId);
      toast.message('이번 실행 결과를 폐기했습니다.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  };

  const routeBack = async () => {
    if (!selectedStage?.routeBackStage || entity.type !== 'project') {
      return;
    }

    try {
      await contentOS.setProjectStage(entity.id, selectedStage.routeBackStage);
      toast.success(`프로젝트를 ${translateWorkflowState(selectedStage.routeBackStage, 'project')} 단계로 되돌렸습니다.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <div className="grid h-full gap-5 xl:grid-cols-[290px_minmax(0,1.15fr)_390px]">
      <Card className="min-h-0 overflow-hidden">
        <CardHeader className="border-b border-chrome-100 pb-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="neutral">{translatedEntityType}</Badge>
                <Badge variant="accent">{translatedStatus}</Badge>
              </div>
              <CardTitle className="text-2xl">{entity.title}</CardTitle>
              <CardDescription className="mt-2">{entity.id}</CardDescription>
            </div>
            <ValidationBadge state={entity.validationState} />
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-chrome-600">
            <span className="rounded-lg border border-chrome-200 bg-chrome-50 px-3 py-1.5">{entity.brand}</span>
            {entity.type === 'project' && entity.derivedFrom ? (
              <span className="rounded-lg border border-chrome-200 bg-chrome-50 px-3 py-1.5">
                {entity.derivedFrom.sourceId} / {entity.derivedFrom.candidateId}
              </span>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="min-h-0 p-0">
          <ScrollArea className="h-[calc(100vh-21rem)]">
            <div className="space-y-2 p-4">
              {stages.map((stage) => (
                <button
                  key={stage.stageId}
                  type="button"
                  onClick={() => setSelectedStageId(stage.stageId)}
                  className={
                    selectedStage?.stageId === stage.stageId
                      ? 'w-full rounded-2xl border border-chrome-900 bg-chrome-900 p-4 text-left text-white shadow-sm'
                      : 'w-full rounded-2xl border border-chrome-200 bg-chrome-50/70 p-4 text-left transition-colors hover:bg-chrome-100'
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{stage.label}</p>
                      <p
                        className={
                          selectedStage?.stageId === stage.stageId
                            ? 'mt-2 text-sm leading-6 text-white/75'
                            : 'mt-2 text-sm leading-6 text-chrome-600'
                        }
                      >
                        {stage.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Badge
                        variant={stage.category === 'codex' ? 'accent' : stage.category === 'manual' ? 'warning' : 'neutral'}
                      >
                        {translateCategory(stage.category)}
                      </Badge>
                      <span
                        className={
                          selectedStage?.stageId === stage.stageId
                            ? 'text-[11px] text-white/70'
                            : `text-[11px] ${stage.canRun ? 'text-emerald-600' : 'text-chrome-400'}`
                        }
                      >
                        {stage.canRun ? '실행 가능' : '대기'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="min-h-0 space-y-5">
        {entity.type === 'source' ? (
          <SourceApprovalCard source={entity} onSave={contentOS.updateSourceApproval} />
        ) : null}
        <Card className="min-h-0">
          <CardHeader className="border-b border-chrome-100 pb-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>문서 검수</CardTitle>
                <CardDescription>
                  구조화된 보기와 원문 편집을 오가며 현재 문서를 검토합니다.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {entity.documents.map((document) => (
                  <Button
                    key={document.key}
                    variant={selectedDocument?.key === document.key ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => setSelectedDocumentKey(document.key)}
                  >
                    {document.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="min-h-0 pt-5">
            {selectedDocument ? (
              <DocumentWorkbench
                document={selectedDocument}
                onOpenPath={contentOS.openPath}
                onSave={contentOS.saveFile}
                onRead={contentOS.readFile}
              />
            ) : (
              <EmptyState label="선택된 문서가 없습니다" detail="검토할 문서를 먼저 선택해 주세요." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="min-h-0 space-y-5">
        <Card>
          <CardHeader className="border-b border-chrome-100 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedStage ? (
                    <Badge variant={selectedStage.category === 'codex' ? 'accent' : selectedStage.category === 'manual' ? 'warning' : 'neutral'}>
                      {translateCategory(selectedStage.category)}
                    </Badge>
                  ) : null}
                  {selectedStage?.nextStage ? (
                    <Badge variant="neutral">
                      다음 단계 · {translateWorkflowState(selectedStage.nextStage, entity.type)}
                    </Badge>
                  ) : null}
                </div>
                <CardTitle>{selectedStage?.label ?? '단계'}</CardTitle>
                <CardDescription className="mt-2">
                  {selectedStage?.description ?? '선택된 단계가 없습니다.'}
                </CardDescription>
              </div>
              {selectedStage ? (
                <Badge variant={selectedStage.canRun && providerReady ? 'success' : 'warning'}>
                  {selectedStage.canRun && providerReady ? '실행 가능' : '대기'}
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            {selectedStage?.category === 'codex' ? (
              <div className="space-y-3 rounded-2xl border border-chrome-200 bg-chrome-50/70 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-chrome-500">운영 메모</p>
                <Textarea
                  placeholder="이번 실행에서 강조할 지시사항을 짧게 남겨주세요."
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
            ) : null}
            <div className="rounded-2xl border border-chrome-200 bg-chrome-50/70 p-4">
              <p className="text-sm font-medium text-ink">실행 안내</p>
              <p className="mt-2 text-sm leading-6 text-chrome-600">{guidanceText}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => void runStage()} disabled={Boolean(runBlockedReason)}>
                  {actionLabel}
                </Button>
                {selectedStage?.routeBackStage && entity.type === 'project' ? (
                  <Button variant="secondary" onClick={() => void routeBack()}>
                    이전 단계로 되돌리기
                  </Button>
                ) : null}
              </div>
            </div>
            {selectedStage ? (
              <div className="grid gap-3 rounded-2xl border border-chrome-200 bg-chrome-50/70 p-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-chrome-500">필수 입력</p>
                  <ul className="mt-3 space-y-2 text-sm text-chrome-700">
                    {selectedStage.requiredInputs.length === 0 ? (
                      <li>없음</li>
                    ) : (
                      selectedStage.requiredInputs.map((input) => <li key={input}>{input}</li>)
                    )}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-chrome-500">허용 출력</p>
                  <ul className="mt-3 space-y-2 text-sm text-chrome-700">
                    {selectedStage.allowedOutputs.length === 0 ? (
                      <li>없음</li>
                    ) : (
                      selectedStage.allowedOutputs.map((output) => <li key={output}>{output}</li>)
                    )}
                  </ul>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="min-h-0">
          <CardHeader className="border-b border-chrome-100 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>실행 결과</CardTitle>
                <CardDescription className="mt-2">
                  {latestRun
                    ? `${translateRunStatus(latestRun.status)} · ${timeAgo(latestRun.createdAt)}`
                    : '아직 이 단계의 실행 기록이 없습니다.'}
                </CardDescription>
              </div>
              {latestRun ? <ValidationBadge state={statusToValidationState(latestRun.status)} /> : null}
            </div>
            {latestRun ? (
              <div className="flex flex-wrap gap-2">
                <Badge variant="neutral">{`${latestRun.touchedFiles.length}개 변경 파일`}</Badge>
                {latestRun.validation ? (
                  <Badge variant={latestRun.validation.ok ? 'success' : 'danger'}>
                    {latestRun.validation.ok ? '검증 통과' : '검증 필요'}
                  </Badge>
                ) : null}
              </div>
            ) : null}
          </CardHeader>
          <CardContent className="min-h-0 space-y-4 pt-5">
            {!latestRun ? (
              <EmptyState
                label="아직 실행 결과가 없습니다"
                detail="이 단계를 실행하면 로그, diff, 산출물이 여기에 표시됩니다."
              />
            ) : (
              <>
                <Tabs defaultValue="logs">
                  <TabsList>
                    <TabsTrigger value="logs">로그</TabsTrigger>
                    <TabsTrigger value="diff">Diff</TabsTrigger>
                    <TabsTrigger value="artifacts">산출물</TabsTrigger>
                  </TabsList>
                  <TabsContent value="logs">
                    <ScrollArea className="h-[240px] rounded-2xl border border-chrome-200 bg-ink p-4 text-panel">
                      <div className="space-y-3 pr-3">
                        {latestRun.logs.map((log) => (
                          <div key={log.id}>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-chrome-200">
                              {translateLogType(log.type)}
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-sm text-white/85">{log.message}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="diff">
                    <ScrollArea className="h-[240px] rounded-2xl border border-chrome-200 bg-ink p-4">
                      <pre className="whitespace-pre-wrap text-xs text-white/85">
                        {latestRun.diff || '텍스트 diff가 생성되지 않았습니다.'}
                      </pre>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="artifacts">
                    <ScrollArea className="h-[240px] rounded-2xl border border-chrome-200 bg-chrome-50/70 p-4">
                      <div className="space-y-3 pr-3">
                        {latestRun.artifacts.length === 0 ? (
                          <EmptyState
                            label="산출물이 없습니다"
                            detail="렌더 이미지나 바이너리 결과가 생성되면 이곳에서 확인할 수 있습니다."
                          />
                        ) : (
                          latestRun.artifacts.map((artifact) => (
                            <div key={artifact.relativePath} className="rounded-2xl border border-chrome-200 bg-white p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-ink">{artifact.relativePath}</p>
                                  <p className="mt-1 text-sm text-chrome-600">{translateArtifactKind(artifact.kind)}</p>
                                </div>
                                <Button size="sm" variant="secondary" onClick={() => void contentOS.openPath(artifact.absolutePath)}>
                                  열기
                                </Button>
                              </div>
                              {artifact.kind === 'image' ? (
                                <img
                                  src={`file:///${artifact.absolutePath.replace(/\\/g, '/')}`}
                                  alt={artifact.relativePath}
                                  className="mt-3 w-full rounded-xl border border-chrome-200 bg-chrome-50 object-cover"
                                />
                              ) : null}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
                {latestRun.status === 'completed' ? (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="accent" onClick={() => void applyLatestRun()}>
                      승인 후 반영
                    </Button>
                    <Button variant="danger" onClick={() => void discardLatestRun()}>
                      실행 폐기
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>

        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate(-1)}>
          이전 화면
        </Button>
      </div>
    </div>
  );
}

function translateLogType(value: 'system' | 'agent' | 'command' | 'error'): string {
  switch (value) {
    case 'system':
      return '시스템';
    case 'agent':
      return '에이전트';
    case 'command':
      return '명령';
    case 'error':
      return '오류';
  }
}

function translateArtifactKind(value: 'image' | 'text' | 'file'): string {
  switch (value) {
    case 'image':
      return '이미지';
    case 'text':
      return '텍스트';
    case 'file':
      return '파일';
  }
}
