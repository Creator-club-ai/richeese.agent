import { startTransition, useDeferredValue, useEffect, useState } from 'react';
import { InstagramPostPreview } from '../components/InstagramPostPreview';
import { ProjectCard } from '../components/ProjectCard';
import { StatusPill } from '../components/StatusPill';
import type { ProjectDetails, SourceType } from '../lib/contracts';
import { formatSourceTypeLabel, formatStatusLabel, formatTimestamp, statusTone } from '../lib/format';
import { buildPostPreviewModel, buildPostStepViewModels, type PostStepId } from '../lib/viewModels';
import { useAppStore } from '../store/useAppStore';

const buildProjectFilePath = (projectPath: string, filename: string) => {
  const trimmed = projectPath.replace(/[\\/]+$/, '');
  return `${trimmed}\\${filename}`;
};

const readOptionalText = async (reader: (targetPath: string) => Promise<string>, targetPath: string) => {
  try {
    return await reader(targetPath);
  } catch {
    return '';
  }
};

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

export const PostsPage = () => {
  const {
    projects,
    selectedProject,
    selectedProjectId,
    isBusy,
    createProject,
    selectProject,
    saveProjectTextFile,
    saveSlidePlan,
    markSlideAwaitingApproval,
    approveSlidePlan,
    holdSlidePlan,
    renderSlideProject,
    openPath,
    readTextFile,
    resolveMediaUrl,
  } = useAppStore();

  const [search, setSearch] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('성장 인사이트 게시물');
  const [newPostSourceType, setNewPostSourceType] = useState<SourceType>('researched');
  const [activeStep, setActiveStep] = useState<PostStepId>('research');
  const [researchBriefDraft, setResearchBriefDraft] = useState('');
  const [slidePlanDraft, setSlidePlanDraft] = useState('');
  const [carouselDraft, setCarouselDraft] = useState('');
  const [handoffBrief, setHandoffBrief] = useState('');
  const [carouselJsonDraft, setCarouselJsonDraft] = useState('');
  const [approver, setApprover] = useState('dasarom4');
  const [holdReason, setHoldReason] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [renderAssetUrls, setRenderAssetUrls] = useState<string[]>([]);
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const postProjects = projects.filter((project) => {
    if (project.contentType !== 'slide') return false;
    if (!deferredSearch) return true;
    return `${project.title} ${project.id} ${project.status}`.toLowerCase().includes(deferredSearch);
  });

  const selectedPost: ProjectDetails | null = selectedProject?.contentType === 'slide' ? selectedProject : null;
  const stepModels = buildPostStepViewModels(selectedPost);
  const activeStepModel = stepModels.find((step) => step.id === activeStep) ?? stepModels[0];

  useEffect(() => {
    if (!selectedPost && postProjects[0]) {
      void selectProject(postProjects[0].id);
    }
  }, [selectedPost, postProjects, selectProject]);

  useEffect(() => {
    if (!selectedPost) {
      setResearchBriefDraft('');
      setSlidePlanDraft('');
      setCarouselDraft('');
      setHandoffBrief('');
      setCarouselJsonDraft('');
      setRenderAssetUrls([]);
      return;
    }

    const loadDrafts = async () => {
      const researchPath = selectedPost.paths.researchBrief ?? buildProjectFilePath(selectedPost.path, 'research_brief.md');
      const planPath = selectedPost.paths.slidePlan ?? buildProjectFilePath(selectedPost.path, 'slide_plan.md');
      const carouselDraftPath = selectedPost.paths.carouselDraft ?? buildProjectFilePath(selectedPost.path, 'carousel_draft.md');
      const handoffPath = selectedPost.paths.handoffBrief ?? buildProjectFilePath(selectedPost.path, 'handoff_brief.md');
      const carouselJsonPath = selectedPost.paths.carouselJson ?? buildProjectFilePath(selectedPost.path, 'carousel.json');

      const [researchText, planText, draftText, handoffText, jsonText, assetUrls] = await Promise.all([
        readOptionalText(readTextFile, researchPath),
        readOptionalText(readTextFile, planPath),
        readOptionalText(readTextFile, carouselDraftPath),
        readOptionalText(readTextFile, handoffPath),
        readOptionalText(readTextFile, carouselJsonPath),
        Promise.all(selectedPost.renderAssets.map((asset) => resolveMediaUrl(asset.path))),
      ]);

      setResearchBriefDraft(researchText);
      setSlidePlanDraft(planText);
      setCarouselDraft(draftText);
      setHandoffBrief(handoffText);
      setCarouselJsonDraft(jsonText);
      setRenderAssetUrls(assetUrls);
    };

    void loadDrafts();
  }, [selectedPost, readTextFile, resolveMediaUrl]);

  const previewModel = buildPostPreviewModel({
    project: selectedPost,
    step: activeStep,
    renderAssetUrls,
    researchBrief: researchBriefDraft,
    slidePlan: slidePlanDraft,
    carouselDraft,
    handoffBrief,
    carouselJson: carouselJsonDraft,
  });

  const handleCreatePost = async () => {
    await createProject({
      title: newPostTitle,
      contentType: 'slide',
      sourceType: newPostSourceType,
      owner: 'dasarom4',
    });
    setValidationMessage(null);
  };

  const handleSaveResearch = async () => {
    if (!selectedPost) return;
    await saveProjectTextFile(selectedPost.id, 'research_brief.md', researchBriefDraft, {
      title: '리서치 브리프 저장',
      successDetail: '리서치 브리프를 저장했습니다.',
      statusOnSuccess: selectedPost.status === 'draft' ? 'planning' : undefined,
    });
    setValidationMessage(null);
  };

  const handleSavePlan = async () => {
    if (!selectedPost) return;
    await saveSlidePlan(selectedPost.id, slidePlanDraft);
    setValidationMessage(null);
  };

  const handleRequestApproval = async () => {
    if (!selectedPost) return;
    await markSlideAwaitingApproval(selectedPost.id);
    setValidationMessage(null);
  };

  const handleApprovePlan = async () => {
    if (!selectedPost) return;
    await approveSlidePlan(selectedPost.id, approver.trim() || 'dasarom4');
    setValidationMessage(null);
  };

  const handleHoldPlan = async () => {
    if (!selectedPost) return;
    if (!holdReason.trim()) {
      setValidationMessage('보류 사유를 입력해 주세요.');
      return;
    }
    await holdSlidePlan(selectedPost.id, holdReason.trim());
    setValidationMessage(null);
  };

  const handleSaveCopy = async () => {
    if (!selectedPost) return;
    await saveProjectTextFile(selectedPost.id, 'carousel_draft.md', carouselDraft, {
      title: '카피 초안 저장',
      successDetail: '카피 초안을 저장했습니다.',
    });
    await saveProjectTextFile(selectedPost.id, 'handoff_brief.md', handoffBrief, {
      title: '디자이너 핸드오프 저장',
      successDetail: '핸드오프 문서를 저장했습니다.',
    });
    setValidationMessage(null);
  };

  const handleSaveCarouselJson = async () => {
    if (!selectedPost) return;
    try {
      JSON.parse(carouselJsonDraft);
    } catch {
      setValidationMessage('carousel.json 형식이 올바르지 않습니다. JSON 문법을 확인해 주세요.');
      return;
    }
    await saveProjectTextFile(selectedPost.id, 'carousel.json', carouselJsonDraft, {
      title: 'carousel.json 저장',
      successDetail: 'carousel.json 초안을 저장했습니다.',
      statusOnSuccess: selectedPost.approvals.slidePlan.status === 'approved' ? 'designing' : undefined,
    });
    setValidationMessage(null);
  };

  const handleRenderPost = async () => {
    if (!selectedPost) return;
    if (selectedPost.approvals.slidePlan.status !== 'approved') {
      setValidationMessage('기획 승인 후에만 게시물 렌더를 실행할 수 있습니다.');
      return;
    }
    await renderSlideProject(selectedPost.id);
    setValidationMessage(null);
    setActiveStep('design');
  };

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: '280px minmax(0, 1fr) 420px',
        gap: 0,
        height: '100%',
      }}
    >
      {/* ─── Left panel: Project list ─── */}
      <div
        style={{
          borderRight: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Create form */}
        <div style={{ padding: '16px 12px', borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              placeholder="새 게시물 제목"
              style={{ flex: 1, fontSize: 13 }}
            />
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
            <select
              value={newPostSourceType}
              onChange={(e) => setNewPostSourceType(e.target.value as SourceType)}
              style={{ flex: 1, fontSize: 12, height: 28 }}
            >
              <option value="researched">리서치</option>
              <option value="provided">제공 자료</option>
            </select>
            <button
              className="notion-btn notion-btn-primary"
              onClick={() => void handleCreatePost()}
              disabled={isBusy || !newPostTitle.trim()}
            >
              만들기
            </button>
          </div>
        </div>

        {/* Project list header */}
        <div style={{ padding: '12px 12px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>작업목록</div>
            <div style={{ marginTop: 2, fontSize: 11, color: 'var(--text-tertiary)' }}>{`${postProjects.length}개 프로젝트`}</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '0 12px 8px' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제목, ID 검색"
            style={{ fontSize: 12 }}
          />
        </div>

        {/* Project cards */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 4px' }}>
          {postProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              selected={selectedProjectId === project.id}
              onSelect={() =>
                startTransition(() => {
                  void selectProject(project.id);
                })
              }
            />
          ))}
        </div>
      </div>

      {/* ─── Center panel: Editor ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedPost ? (
          <>
            {/* Page header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div className="notion-label">게시물 편집</div>
                  <h1 className="notion-page-title" style={{ marginTop: 8 }}>{selectedPost.title}</h1>
                  <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-tertiary)' }}>
                    {`${formatSourceTypeLabel(selectedPost.sourceType)} · ${formatTimestamp(selectedPost.updatedAt)}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  <StatusPill label={formatStatusLabel(selectedPost.status)} tone={statusTone(selectedPost.status)} />
                  <button className="notion-btn notion-btn-secondary" onClick={() => void openPath(selectedPost.path)}>
                    폴더
                  </button>
                </div>
              </div>

              {/* Step tabs */}
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
              {/* Step header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                <div>
                  <div className="notion-label" style={{ color: 'var(--accent)' }}>{activeStepModel.title}</div>
                  <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-secondary)' }}>{activeStepModel.description}</div>
                </div>
                <StatusPill label={activeStepModel.statusLabel} tone={activeStepModel.tone} />
              </div>

              {/* Research step */}
              {activeStep === 'research' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <textarea
                    value={researchBriefDraft}
                    onChange={(e) => setResearchBriefDraft(e.target.value)}
                    style={{ minHeight: 280, fontFamily: 'inherit' }}
                  />
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="notion-btn notion-btn-primary" onClick={() => void handleSaveResearch()} disabled={isBusy}>
                      브리프 저장
                    </button>
                    <button
                      className="notion-btn notion-btn-secondary"
                      onClick={() => void openPath(selectedPost.paths.researchBrief ?? buildProjectFilePath(selectedPost.path, 'research_brief.md'))}
                    >
                      파일 열기
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Planning step */}
              {activeStep === 'planning' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <textarea
                    value={slidePlanDraft}
                    onChange={(e) => setSlidePlanDraft(e.target.value)}
                    style={{ minHeight: 280, fontFamily: 'inherit' }}
                  />
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      value={approver}
                      onChange={(e) => setApprover(e.target.value)}
                      placeholder="승인자"
                      style={{ width: 140 }}
                    />
                    <button className="notion-btn notion-btn-secondary" onClick={() => void handleRequestApproval()} disabled={isBusy || !slidePlanDraft.trim()}>
                      승인 요청
                    </button>
                    <button className="notion-btn notion-btn-primary" onClick={() => void handleApprovePlan()} disabled={isBusy}>
                      승인
                    </button>
                  </div>
                  <textarea
                    value={holdReason}
                    onChange={(e) => setHoldReason(e.target.value)}
                    style={{ minHeight: 80 }}
                    placeholder="보류 사유"
                  />
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="notion-btn notion-btn-primary" onClick={() => void handleSavePlan()} disabled={isBusy}>
                      플랜 저장
                    </button>
                    <button className="notion-btn notion-btn-secondary" onClick={() => void handleHoldPlan()} disabled={isBusy}>
                      보류
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Copy step */}
              {activeStep === 'copy' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div className="notion-label" style={{ marginBottom: 6 }}>carousel_draft.md</div>
                      <textarea value={carouselDraft} onChange={(e) => setCarouselDraft(e.target.value)} style={{ minHeight: 240 }} />
                    </div>
                    <div>
                      <div className="notion-label" style={{ marginBottom: 6 }}>handoff_brief.md</div>
                      <textarea value={handoffBrief} onChange={(e) => setHandoffBrief(e.target.value)} style={{ minHeight: 240 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="notion-btn notion-btn-primary" onClick={() => void handleSaveCopy()} disabled={isBusy}>
                      카피 저장
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Design step */}
              {activeStep === 'design' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <textarea
                    value={carouselJsonDraft}
                    onChange={(e) => setCarouselJsonDraft(e.target.value)}
                    style={{ minHeight: 280, fontFamily: "'Consolas', 'Fira Code', monospace", fontSize: 12 }}
                  />
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="notion-btn notion-btn-primary" onClick={() => void handleSaveCarouselJson()} disabled={isBusy}>
                      JSON 저장
                    </button>
                    <button className="notion-btn notion-btn-secondary" onClick={() => void handleRenderPost()} disabled={isBusy}>
                      렌더
                    </button>
                    <button
                      className="notion-btn notion-btn-secondary"
                      onClick={() => void openPath(selectedPost.paths.rendersDir ?? buildProjectFilePath(selectedPost.path, 'renders'))}
                    >
                      결과 폴더
                    </button>
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
            게시물을 선택하면 여기에 편집 화면이 열립니다.
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
          <div style={{ marginTop: 2, fontSize: 11, color: 'var(--text-tertiary)' }}>인스타그램 피드 해상도</div>
        </div>
        <InstagramPostPreview model={previewModel} />
      </div>
    </section>
  );
};
