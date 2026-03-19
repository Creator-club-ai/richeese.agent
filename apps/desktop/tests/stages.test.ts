import { describe, expect, it } from 'vitest';

import { getProjectStageDefinitions, getSourceStageDefinitions } from '../src/shared/stages';
import type { ProjectEntity, SourceEntity } from '../src/shared/types';

const sourceEntity: SourceEntity = {
  type: 'source',
  id: 'source-a',
  title: 'Source A',
  brand: 'richesse-club',
  statusOrStage: 'approved',
  sourceType: 'youtube',
  status: 'approved',
  planningPath: 'planning.md',
  candidateIds: ['a'],
  approvedCandidateIds: ['a'],
  standaloneCandidateIds: [],
  mainCandidateId: 'a',
  spawnMode: 'plan_approved',
  candidates: [],
  documents: [],
  paths: { source: 'source.json', planning: 'planning.md' },
  validationState: 'valid',
  lastModifiedAt: new Date().toISOString(),
};

const projectEntity: ProjectEntity = {
  type: 'project',
  id: 'project-a',
  title: 'Project A',
  brand: 'richesse-club',
  statusOrStage: 'planning',
  stage: 'planning',
  requiresResearchBrief: true,
  qaStatus: 'not_started',
  approvalStatus: 'pending',
  derivedFrom: null,
  documents: [],
  paths: {
    researchBrief: 'research_brief.md',
    slidePlan: 'slide_plan.md',
    carouselDraft: 'carousel_draft.md',
    handoffBrief: 'handoff_brief.md',
    carouselJson: 'carousel.json',
    qaReport: 'qa_report.md',
    renderDir: 'renders/current',
  },
  validationState: 'valid',
  lastModifiedAt: new Date().toISOString(),
};

describe('getSourceStageDefinitions', () => {
  it('enables spawning only when a source is approved with approved candidates', () => {
    const stages = getSourceStageDefinitions(sourceEntity);
    const spawnStage = stages.find((stage) => stage.stageId === 'spawn-approved');

    expect(spawnStage?.canRun).toBe(true);
    expect(spawnStage?.nextStage).toBe('spawned');
  });
});

describe('getProjectStageDefinitions', () => {
  it('describes manual approval and downstream stages', () => {
    const stages = getProjectStageDefinitions(projectEntity);
    const planStage = stages.find((stage) => stage.stageId === 'plan');
    const approveStage = stages.find((stage) => stage.stageId === 'approve-slide-plan');
    const renderStage = stages.find((stage) => stage.stageId === 'render-preview');

    expect(planStage?.allowedOutputs).toEqual(['slide_plan.md']);
    expect(approveStage?.category).toBe('manual');
    expect(renderStage?.nextStage).toBe('qa');
  });
});
