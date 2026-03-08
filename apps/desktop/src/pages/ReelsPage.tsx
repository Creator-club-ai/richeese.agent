import { startTransition, useDeferredValue, useEffect, useState } from 'react';
import { InstagramReelPreview } from '../components/InstagramReelPreview';
import { ReelJobCard } from '../components/ReelJobCard';
import { StatusPill } from '../components/StatusPill';
import { formatModeLabel, formatSeconds, formatStatusLabel, formatTimestamp, statusTone } from '../lib/format';
import { buildReelPreviewModel, buildReelStepViewModels, type ReelStepId } from '../lib/viewModels';
import { useAppStore } from '../store/useAppStore';

type StepTabProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

const StepTab = ({ label, selected, onClick }: StepTabProps) => (
  <button
    className={selected ? 'notion-btn notion-btn-primary' : 'notion-btn notion-btn-secondary'}
    onClick={onClick}
    style={{ height: 26, fontSize: 12 }}
  >
    {label}
  </button>
);

export const ReelsPage = () => {
  const {
    reels,
    selectedReel,
    selectedReelId,
    isBusy,
    selectReel,
    probeYoutube,
    rankHighlights,
    approveHighlight,
    downloadApprovedHighlight,
    renderShort,
    openStudio,
    openPath,
    resolveMediaUrl,
  } = useAppStore();

  const [search, setSearch] = useState('');
  const [probeJobId, setProbeJobId] = useState('founder-advice-drop');
  const [probeUrl, setProbeUrl] = useState('https://www.youtube.com/watch?v=Rni7Fz7208c');
  const [approver, setApprover] = useState('dasarom4');
  const [candidateIndex, setCandidateIndex] = useState('0');
  const [activeStep, setActiveStep] = useState<ReelStepId>('source');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const filteredReels = reels.filter((reel) => {
    if (!deferredSearch) return true;
    return `${reel.title} ${reel.jobId} ${reel.status}`.toLowerCase().includes(deferredSearch);
  });

  const stepModels = buildReelStepViewModels(selectedReel);
  const activeStepModel = stepModels.find((step) => step.id === activeStep) ?? stepModels[0];
  const previewModel = buildReelPreviewModel({ reel: selectedReel, videoUrl: previewUrl });

  useEffect(() => {
    if (!selectedReel && filteredReels[0]) {
      void selectReel(filteredReels[0].jobId);
    }
  }, [filteredReels, selectedReel, selectReel]);

  useEffect(() => {
    if (selectedReel?.approvedCandidateIndex !== null && selectedReel?.approvedCandidateIndex !== undefined) {
      setCandidateIndex(String(selectedReel.approvedCandidateIndex));
      return;
    }
    if (selectedReel?.topCandidates[0]) {
      setCandidateIndex(String(selectedReel.topCandidates[0].index));
    }
  }, [selectedReel]);

  useEffect(() => {
    if (!selectedReel) {
      setPreviewUrl('');
      return;
    }
    const mediaPath = selectedReel.highlightPath ?? selectedReel.renderedOutputPath;
    if (!mediaPath) {
      setPreviewUrl('');
      return;
    }
    void resolveMediaUrl(mediaPath).then(setPreviewUrl).catch(() => setPreviewUrl(''));
  }, [selectedReel, resolveMediaUrl]);

  const handleApproveCandidate = async () => {
    if (!selectedReel) return;
    const numericIndex = Number(candidateIndex);
    if (Number.isNaN(numericIndex)) {
      setValidationMessage('승인할 후보 번호가 올바르지 않습니다.');
      return;
    }
    await approveHighlight(selectedReel.jobId, numericIndex, approver.trim() || 'dasarom4');
    setValidationMessage(null);
    setActiveStep('clip');
  };

  const handleRender = async () => {
    if (!selectedReel) return;
    if (!selectedReel.highlightPath) {
      setValidationMessage('최종 렌더는 승인 클립 다운로드 후에만 실행할 수 있습니다.');
      return;
    }
    await renderShort(selectedReel.jobId);
    setValidationMessage(null);
  };

  const candidatePool =
    selectedReel && selectedReel.topCandidates.length > 0 ? selectedReel.topCandidates : selectedReel?.allCandidates.slice(0, 6) ?? [];

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: '280px minmax(0, 1fr) 420px',
        gap: 0,
        height: '100%',
      }}
    >
      {/* ─── Left panel ─── */}
      <div
        style={{
          borderRight: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Probe form */}
        <div style={{ padding: '16px 12px', borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>새 릴스</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input value={probeJobId} onChange={(e) => setProbeJobId(e.target.value)} placeholder="Job ID" style={{ fontSize: 12 }} />
            <input value={probeUrl} onChange={(e) => setProbeUrl(e.target.value)} placeholder="YouTube URL" style={{ fontSize: 12 }} />
            <button
              className="notion-btn notion-btn-primary"
              style={{ width: '100%' }}
              onClick={() => void probeYoutube(probeJobId, probeUrl)}
              disabled={isBusy || !probeJobId.trim() || !probeUrl.trim()}
            >
              분석 시작
            </button>
          </div>
        </div>

        {/* Reel list header */}
        <div style={{ padding: '12px 12px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>작업목록</div>
            <div style={{ marginTop: 2, fontSize: 11, color: 'var(--text-tertiary)' }}>{`${filteredReels.length}개 Job`}</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '0 12px 8px' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제목, Job ID 검색"
            style={{ fontSize: 12 }}
          />
        </div>

        {/* Reel cards */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 4px' }}>
          {filteredReels.map((reel) => (
            <ReelJobCard
              key={reel.jobId}
              reel={reel}
              selected={selectedReelId === reel.jobId}
              onSelect={() =>
                startTransition(() => {
                  void selectReel(reel.jobId);
                })
              }
            />
          ))}
        </div>
      </div>

      {/* ─── Center panel ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedReel ? (
          <>
            {/* Page header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div className="notion-label">릴스 작업</div>
                  <h1 className="notion-page-title" style={{ marginTop: 8 }}>{selectedReel.title}</h1>
                  <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-tertiary)' }}>
                    {`${formatModeLabel(selectedReel.mode)} · ${formatTimestamp(selectedReel.updatedAt)}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  <StatusPill label={formatStatusLabel(selectedReel.status)} tone={statusTone(selectedReel.status)} />
                  <button className="notion-btn notion-btn-secondary" onClick={() => void openPath(selectedReel.path)}>
                    폴더
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 16, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {stepModels.map((step) => (
                  <StepTab key={step.id} label={step.title} selected={activeStep === step.id} onClick={() => setActiveStep(step.id)} />
                ))}
              </div>
            </div>

            {/* Validation */}
            {validationMessage ? (
              <div
                className="animate-fade-in"
                style={{
                  margin: '12px 24px 0',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--warning-soft)',
                  borderLeft: '3px solid var(--warning)',
                  fontSize: 13,
                  color: 'var(--warning)',
                }}
              >
                {validationMessage}
              </div>
            ) : null}

            {/* Step content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                <div>
                  <div className="notion-label" style={{ color: 'var(--accent)' }}>{activeStepModel.title}</div>
                  <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-secondary)' }}>{activeStepModel.description}</div>
                </div>
                <StatusPill label={activeStepModel.statusLabel} tone={activeStepModel.tone} />
              </div>

              {/* Source step */}
              {activeStep === 'source' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="notion-surface" style={{ padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{selectedReel.title}</div>
                    <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-tertiary)' }}>{selectedReel.jobId}</div>
                    {selectedReel.sourceUrl ? (
                      <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)', wordBreak: 'break-all', lineHeight: 1.5 }}>
                        {selectedReel.sourceUrl}
                      </div>
                    ) : null}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="notion-btn notion-btn-secondary" onClick={() => void rankHighlights(selectedReel.jobId)} disabled={isBusy}>
                      후보 정렬
                    </button>
                    <button className="notion-btn notion-btn-secondary" onClick={() => setActiveStep('review')}>
                      후보 검토
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Review step */}
              {activeStep === 'review' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input value={candidateIndex} onChange={(e) => setCandidateIndex(e.target.value)} placeholder="후보 번호" style={{ width: 100 }} />
                    <input value={approver} onChange={(e) => setApprover(e.target.value)} placeholder="승인자" style={{ width: 140 }} />
                    <button className="notion-btn notion-btn-secondary" onClick={() => void rankHighlights(selectedReel.jobId)} disabled={isBusy}>
                      다시 정렬
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {candidatePool.map((candidate) => (
                      <button
                        key={candidate.index}
                        onClick={() => setCandidateIndex(String(candidate.index))}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid',
                          borderColor: String(candidate.index) === candidateIndex ? 'var(--accent)' : 'var(--border-default)',
                          background: String(candidate.index) === candidateIndex ? 'var(--accent-soft)' : 'var(--bg-secondary)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                          {`#${candidate.index} ${candidate.title}`}
                        </div>
                        <div style={{ marginTop: 2, fontSize: 11, color: 'var(--text-tertiary)' }}>
                          {`${formatSeconds(candidate.start)} – ${formatSeconds(candidate.end)}`}
                        </div>
                      </button>
                    ))}
                  </div>

                  <button className="notion-btn notion-btn-primary" onClick={() => void handleApproveCandidate()} disabled={isBusy}>
                    후보 승인
                  </button>
                </div>
              ) : null}

              {/* Clip step */}
              {activeStep === 'clip' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="notion-surface" style={{ padding: 16, fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                    {selectedReel.approvedCandidateIndex === null
                      ? '먼저 후보를 승인해야 클립을 준비할 수 있습니다.'
                      : `승인 후보 #${selectedReel.approvedCandidateIndex}를 내려받아 미리보기에 연결합니다.`}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      className="notion-btn notion-btn-primary"
                      onClick={() => void downloadApprovedHighlight(selectedReel.jobId)}
                      disabled={isBusy || selectedReel.approvedCandidateIndex === null}
                    >
                      클립 다운로드
                    </button>
                    <button className="notion-btn notion-btn-secondary" onClick={() => void openPath(selectedReel.path)}>
                      Job 폴더
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Output step */}
              {activeStep === 'output' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="notion-surface" style={{ padding: 16 }}>
                    <div className="notion-label" style={{ marginBottom: 8 }}>수동 검토</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                      Studio는 컷 검토용입니다. 최종 출력과 동일한 화면은 아닙니다.
                    </div>
                    <button
                      className="notion-btn notion-btn-secondary"
                      style={{ marginTop: 12, width: '100%' }}
                      onClick={() => void openStudio()}
                      disabled={isBusy}
                    >
                      Studio 열기
                    </button>
                  </div>

                  <div className="notion-surface" style={{ padding: 16 }}>
                    <div className="notion-label" style={{ color: 'var(--accent)', marginBottom: 8 }}>최종 출력</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                      승인 클립 다운로드 후 FFmpeg 렌더를 실행합니다.
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="notion-btn notion-btn-primary" onClick={() => void handleRender()} disabled={isBusy}>
                        최종 렌더
                      </button>
                      {selectedReel.renderedOutputPath ? (
                        <button className="notion-btn notion-btn-secondary" onClick={() => void openPath(selectedReel.renderedOutputPath!)}>
                          출력 파일
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              fontSize: 13,
              color: 'var(--text-tertiary)',
            }}
          >
            릴스 Job을 선택하면 여기에 편집 화면이 열립니다.
          </div>
        )}
      </div>

      {/* ─── Right panel: Preview ─── */}
      <div
        style={{
          borderLeft: '1px solid var(--border-default)',
          padding: '20px 16px',
          overflowY: 'auto',
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>미리보기</div>
          <div style={{ marginTop: 2, fontSize: 11, color: 'var(--text-tertiary)' }}>인스타 릴스 해상도</div>
        </div>
        <InstagramReelPreview model={previewModel} />
      </div>
    </section>
  );
};
