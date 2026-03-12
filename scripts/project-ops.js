#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SOURCES_DIR = path.join(ROOT, 'sources');
const PROJECTS_DIR = path.join(ROOT, 'projects');
const DEFAULT_OWNER = 'dasarom4';
const IGNORED_PROJECT_DIRS = new Set(['archive']);

const SOURCE_FILE_NAMES = {
  metadata: 'source.json',
  planning: 'planning.md',
};

const REQUIRED_SOURCE_PLANNING_SECTIONS = [
  'Source Snapshot',
  'Core Theme',
  'Main Topic',
  'Packaging Map',
  'Candidate Scoreboard',
  'Candidate Plans',
  'Recommended Route',
  'Approval Guide',
];

const REQUIRED_PLANNING_FIELDS = [
  'candidateId',
  'workingTitle',
  'packaging',
  'reviewStatus',
  'slideCount',
  'contentAngle',
  'whyItDeservesAPost',
  'recommendedPriority',
];

const REQUIRED_NON_REJECT_PLAN_SECTIONS = [
  'Audience',
  'Core Message',
  'Why Now',
  'Key Point 1',
  'Key Point 2',
  'Key Point 3',
  'Hook',
  'Closing Note',
  'Slide Flow',
  'Visual Direction',
];

const KNOWN_PLANNING_FIELDS = new Set(REQUIRED_PLANNING_FIELDS);
const ALLOWED_SOURCE_TYPES = new Set(['youtube', 'web', 'document', 'bundle']);
const ALLOWED_SOURCE_STATUS = new Set(['ingested', 'analyzed', 'approved', 'spawned']);
const ALLOWED_PACKAGING = new Set(['umbrella', 'standalone', 'series-only', 'reject']);
const ALLOWED_REVIEW_STATUS = new Set(['ready', 'hold', 'reject']);
const ALLOWED_PRIORITY = new Set(['P1', 'P2', 'P3']);
const STAGE_ORDER = {
  draft: 0,
  researching: 1,
  planning: 2,
  awaiting_plan_approval: 3,
  plan_approved: 4,
  writing: 5,
  designing: 6,
  qa: 7,
  done: 8,
  sample: 9,
};

main();

function main() {
  const [command = 'validate', arg] = process.argv.slice(2);

  if (command === 'validate') {
    const sourceResults = validateSources({ silent: true });
    const projectResults = validateProjects({ silent: true, sourceLookup: sourceResults.sourceLookup });
    printValidationResults('Sources', sourceResults);
    printValidationResults('Projects', projectResults);
    exitFromResults([sourceResults, projectResults]);
    return;
  }

  if (command === 'validate-sources') {
    const results = validateSources({ silent: false });
    exitFromResults([results]);
    return;
  }

  if (command === 'validate-projects') {
    const sourceResults = validateSources({ silent: true });
    const results = validateProjects({ silent: false, sourceLookup: sourceResults.sourceLookup });
    exitFromResults([results]);
    return;
  }

  if (command === 'sync-approvals') {
    syncApprovals();
    return;
  }

  if (command === 'spawn-approved') {
    spawnApproved(arg);
    return;
  }

  console.error(`Unknown command: ${command}`);
  process.exit(1);
}

function validateSources({ silent }) {
  const directories = listDirectories(SOURCES_DIR);
  const errors = [];
  const warnings = [];
  const sourceLookup = new Map();

  if (directories.length === 0) {
    warnings.push('No source directories found.');
  }

  for (const sourceId of directories) {
    const context = loadSourceContext(sourceId);
    sourceLookup.set(sourceId, context);

    if (context.loadErrors.length > 0) {
      errors.push(...context.loadErrors);
      continue;
    }

    const result = validateSourceContext(context);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  const results = { checked: directories.length, errors, warnings, sourceLookup };
  if (!silent) {
    printValidationResults('Sources', results);
  }
  return results;
}

function validateProjects({ silent, sourceLookup }) {
  const directories = listDirectories(PROJECTS_DIR).filter((name) => !IGNORED_PROJECT_DIRS.has(name));
  const errors = [];
  const warnings = [];

  if (directories.length === 0) {
    warnings.push('No project directories found.');
  }

  for (const projectId of directories) {
    const context = loadProjectContext(projectId);

    if (context.loadErrors.length > 0) {
      errors.push(...context.loadErrors);
      continue;
    }

    const result = validateProjectContext(context, sourceLookup);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  const results = { checked: directories.length, errors, warnings };
  if (!silent) {
    printValidationResults('Projects', results);
  }
  return results;
}

function loadSourceContext(sourceId) {
  const dir = path.join(SOURCES_DIR, sourceId);
  const metadataPath = path.join(dir, SOURCE_FILE_NAMES.metadata);
  const planningPath = path.join(dir, SOURCE_FILE_NAMES.planning);
  const loadErrors = [];

  let source = null;
  let planningText = '';
  let candidatePlans = [];

  if (!fileExists(metadataPath)) {
    loadErrors.push(`[source:${sourceId}] Missing ${SOURCE_FILE_NAMES.metadata}`);
  } else {
    source = readJson(metadataPath);
  }

  if (fileExists(planningPath)) {
    planningText = fs.readFileSync(planningPath, 'utf8');
    candidatePlans = parsePlanningBlocks(planningText);
  }

  const candidateMap = new Map();
  for (const candidate of candidatePlans) {
    if (candidate.candidateId) {
      candidateMap.set(candidate.candidateId, candidate);
    }
  }

  return {
    id: sourceId,
    dir,
    metadataPath,
    planningPath,
    source,
    planningText,
    candidatePlans,
    candidateMap,
    loadErrors,
  };
}

function loadProjectContext(projectId) {
  const dir = path.join(PROJECTS_DIR, projectId);
  const projectPath = path.join(dir, 'project.json');
  const loadErrors = [];
  let project = null;

  if (!fileExists(projectPath)) {
    loadErrors.push(`[project:${projectId}] Missing project.json`);
  } else {
    project = readJson(projectPath);
  }

  return { id: projectId, dir, projectPath, project, loadErrors };
}

function validateSourceContext(context) {
  const errors = [];
  const warnings = [];
  const source = context.source;

  if (!source) {
    return { errors, warnings };
  }

  if (!ALLOWED_SOURCE_TYPES.has(source.sourceType)) {
    errors.push(`[source:${context.id}] Invalid sourceType: ${source.sourceType}`);
  }

  if (!ALLOWED_SOURCE_STATUS.has(source.status)) {
    errors.push(`[source:${context.id}] Invalid status: ${source.status}`);
  }

  if (!source.brand) {
    errors.push(`[source:${context.id}] Missing brand`);
  }

  const candidateIds = readStringArray(source, ['analysis', 'candidateIds']);
  const mainCandidateId = readOptionalString(source, ['analysis', 'mainCandidateId']);
  const standaloneCandidateIds = readStringArray(source, ['analysis', 'standaloneCandidateIds']);
  const approvedCandidateIds = readStringArray(source, ['analysis', 'approvedCandidateIds']);
  const planningRequired = source.status !== 'ingested' || candidateIds.length > 0;

  if (planningRequired && !fileExists(context.planningPath)) {
    errors.push(`[source:${context.id}] Missing ${SOURCE_FILE_NAMES.planning}`);
  }

  if (context.planningText) {
    for (const section of REQUIRED_SOURCE_PLANNING_SECTIONS) {
      if (!hasLevel2Section(context.planningText, section)) {
        errors.push(`[source:${context.id}] planning.md missing section: ${section}`);
      }
    }

    if (context.candidatePlans.length === 0) {
      errors.push(`[source:${context.id}] planning.md has no candidate blocks under ## Candidate Plans`);
    }

    const seen = new Set();
    for (const candidate of context.candidatePlans) {
      const label = `[source:${context.id} candidate:${candidate.candidateId || candidate.heading}]`;
      if (!candidate.candidateId) {
        errors.push(`${label} Missing candidateId`);
        continue;
      }
      if (seen.has(candidate.candidateId)) {
        errors.push(`${label} Duplicate candidateId`);
      }
      seen.add(candidate.candidateId);

      for (const field of REQUIRED_PLANNING_FIELDS) {
        if (!candidate[field]) {
          errors.push(`${label} Missing field: ${field}`);
        }
      }

      if (candidate.packaging && !ALLOWED_PACKAGING.has(candidate.packaging)) {
        errors.push(`${label} Invalid packaging: ${candidate.packaging}`);
      }
      if (candidate.reviewStatus && !ALLOWED_REVIEW_STATUS.has(candidate.reviewStatus)) {
        errors.push(`${label} Invalid reviewStatus: ${candidate.reviewStatus}`);
      }
      if (candidate.recommendedPriority && !ALLOWED_PRIORITY.has(candidate.recommendedPriority)) {
        errors.push(`${label} Invalid recommendedPriority: ${candidate.recommendedPriority}`);
      }

      if (candidate.reviewStatus !== 'reject') {
        for (const section of REQUIRED_NON_REJECT_PLAN_SECTIONS) {
          if (!hasRequiredCandidateSection(candidate, section)) {
            errors.push(`${label} Missing section: ${section}`);
          }
        }
      }
    }

    for (const candidateId of candidateIds) {
      if (!context.candidateMap.has(candidateId)) {
        errors.push(`[source:${context.id}] source.json candidateId missing in planning.md: ${candidateId}`);
      }
    }

    for (const candidate of context.candidatePlans) {
      if (!candidateIds.includes(candidate.candidateId)) {
        warnings.push(`[source:${context.id}] planning.md candidate not listed in source.json: ${candidate.candidateId}`);
      }
    }
  }

  if ((source.status === 'approved' || source.status === 'spawned') && approvedCandidateIds.length === 0) {
    errors.push(`[source:${context.id}] status is ${source.status} but approvedCandidateIds is empty`);
  }

  if (approvedCandidateIds.length > 0 && !['approved', 'spawned'].includes(source.status)) {
    errors.push(`[source:${context.id}] approvedCandidateIds exist but status is ${source.status}`);
  }

  if (mainCandidateId) {
    validateSelectedCandidate({
      bucket: 'mainCandidateId',
      candidateId: mainCandidateId,
      sourceId: context.id,
      candidateIds,
      candidateMap: context.candidateMap,
      errors,
    });
  }

  for (const candidateId of standaloneCandidateIds) {
    validateSelectedCandidate({
      bucket: 'standaloneCandidateIds',
      candidateId,
      sourceId: context.id,
      candidateIds,
      candidateMap: context.candidateMap,
      errors,
    });
  }

  if (mainCandidateId && standaloneCandidateIds.includes(mainCandidateId)) {
    errors.push(`[source:${context.id}] mainCandidateId must not also appear in standaloneCandidateIds`);
  }

  for (const candidateId of approvedCandidateIds) {
    if (!candidateIds.includes(candidateId)) {
      errors.push(`[source:${context.id}] approved candidate not present in candidateIds: ${candidateId}`);
      continue;
    }

    const candidate = context.candidateMap.get(candidateId);
    if (!candidate) {
      errors.push(`[source:${context.id}] approved candidate missing in planning.md: ${candidateId}`);
      continue;
    }

    if (candidate.reviewStatus === 'reject' || candidate.packaging === 'reject') {
      errors.push(`[source:${context.id}] rejected candidate cannot be approved: ${candidateId}`);
    }

    if (mainCandidateId || standaloneCandidateIds.length > 0) {
      const allowedForSpawn =
        candidateId === mainCandidateId ||
        standaloneCandidateIds.includes(candidateId);

      if (!allowedForSpawn) {
        errors.push(
          `[source:${context.id}] approvedCandidateIds must be a subset of mainCandidateId + standaloneCandidateIds: ${candidateId}`
        );
      }
    }
  }

  return { errors, warnings };
}

function validateProjectContext(context, sourceLookup) {
  const errors = [];
  const warnings = [];
  const project = context.project;

  if (!project) {
    return { errors, warnings };
  }

  if (!project.id) {
    errors.push(`[project:${context.id}] Missing id`);
  }

  if (!project.brand) {
    errors.push(`[project:${context.id}] Missing brand`);
  }

  const stage = project.workflow && project.workflow.stage;
  const stageIndex = STAGE_ORDER[stage];
  if (stage && stageIndex === undefined) {
    errors.push(`[project:${context.id}] Invalid workflow.stage: ${stage}`);
  }

  const requiredFiles = collectRequiredProjectFiles(project, stageIndex);
  for (const relativeFile of requiredFiles) {
    const absoluteFile = path.join(context.dir, relativeFile);
    if (!fileExists(absoluteFile)) {
      errors.push(`[project:${context.id}] Missing required file: ${relativeFile}`);
    }
  }

  const approvalMirrorPath = project.paths && project.paths.approvals
    ? path.join(context.dir, project.paths.approvals)
    : null;
  if (approvalMirrorPath && fileExists(approvalMirrorPath)) {
    const mirror = readJson(approvalMirrorPath);
    const expected = (project.workflow && project.workflow.approvals) || {};
    if (JSON.stringify(mirror) !== JSON.stringify(expected)) {
      errors.push(`[project:${context.id}] approvals.json does not match project.json.workflow.approvals`);
    }
  }

  const derivedFrom = project.derivedFrom;
  if (derivedFrom && derivedFrom.sourceId && derivedFrom.candidateId) {
    const sourceContext = sourceLookup && sourceLookup.get(derivedFrom.sourceId);
    if (!sourceContext || !sourceContext.source) {
      errors.push(`[project:${context.id}] Missing source for derivedFrom.sourceId: ${derivedFrom.sourceId}`);
      return { errors, warnings };
    }

    const approvedIds = readStringArray(sourceContext.source, ['analysis', 'approvedCandidateIds']);
    if (!approvedIds.includes(derivedFrom.candidateId)) {
      errors.push(
        `[project:${context.id}] derivedFrom.candidateId is not approved in source ${derivedFrom.sourceId}: ${derivedFrom.candidateId}`
      );
    }

    if (!sourceContext.candidateMap.has(derivedFrom.candidateId)) {
      errors.push(
        `[project:${context.id}] derivedFrom.candidateId is missing in ${SOURCE_FILE_NAMES.planning}: ${derivedFrom.candidateId}`
      );
    }
  }

  return { errors, warnings };
}

function collectRequiredProjectFiles(project, stageIndex) {
  const profile = project.validation && project.validation.profile;
  const requiredFiles = new Set();

  if ((profile === 'sample' || profile === 'legacy') && Array.isArray(project.validation && project.validation.requiredFiles)) {
    for (const file of project.validation.requiredFiles) {
      requiredFiles.add(file);
    }
    return Array.from(requiredFiles);
  }

  const stageValue = stageIndex === undefined ? 0 : stageIndex;
  const paths = project.paths || {};

  if (project.workflow && project.workflow.requiresResearchBrief && stageValue >= STAGE_ORDER.researching && paths.researchBrief) {
    requiredFiles.add(paths.researchBrief);
  }

  if (stageValue >= STAGE_ORDER.awaiting_plan_approval && paths.slidePlan) {
    requiredFiles.add(paths.slidePlan);
  }

  if (stageValue >= STAGE_ORDER.plan_approved) {
    if (paths.approvals) {
      requiredFiles.add(paths.approvals);
    }
    if (paths.carouselDraft) {
      requiredFiles.add(paths.carouselDraft);
    }
    if (paths.handoffBrief) {
      requiredFiles.add(paths.handoffBrief);
    }
  }

  if (stageValue >= STAGE_ORDER.qa && paths.carouselJson) {
    requiredFiles.add(paths.carouselJson);
  }

  return Array.from(requiredFiles);
}

function syncApprovals() {
  const directories = listDirectories(PROJECTS_DIR).filter((name) => !IGNORED_PROJECT_DIRS.has(name));
  let updated = 0;

  for (const projectId of directories) {
    const context = loadProjectContext(projectId);
    if (context.loadErrors.length > 0) {
      continue;
    }

    const approvalsPath = context.project.paths && context.project.paths.approvals
      ? path.join(context.dir, context.project.paths.approvals)
      : null;

    if (!approvalsPath) {
      continue;
    }

    writeJson(approvalsPath, (context.project.workflow && context.project.workflow.approvals) || {});
    updated += 1;
  }

  console.log(`Synced approvals for ${updated} project(s).`);
}

function spawnApproved(sourceId) {
  const sourceIds = sourceId ? [sourceId] : listDirectories(SOURCES_DIR);
  let created = 0;
  let touchedSources = 0;

  for (const currentSourceId of sourceIds) {
    const context = loadSourceContext(currentSourceId);

    if (context.loadErrors.length > 0) {
      for (const error of context.loadErrors) {
        console.error(error);
      }
      continue;
    }

    const validation = validateSourceContext(context);
    if (validation.errors.length > 0) {
      for (const error of validation.errors) {
        console.error(error);
      }
      continue;
    }

    const approvedCandidateIds = readStringArray(context.source, ['analysis', 'approvedCandidateIds']);
    if (context.source.status !== 'approved') {
      console.log(`[source:${currentSourceId}] Skip: status is ${context.source.status}`);
      continue;
    }

    if (approvedCandidateIds.length === 0) {
      console.log(`[source:${currentSourceId}] Skip: no approved candidates`);
      continue;
    }

    const approvedAt = new Date().toISOString();
    for (const candidateId of approvedCandidateIds) {
      const candidate = context.candidateMap.get(candidateId);
      try {
        const wasCreated = spawnApprovedCandidateProject(context, candidate, approvedAt);
        if (wasCreated) {
          created += 1;
        }
      } catch (error) {
        console.error(error.message);
      }
    }

    context.source.status = 'spawned';
    writeJson(context.metadataPath, context.source);
    touchedSources += 1;
  }

  console.log(`Spawned ${created} project(s) from ${touchedSources} source(s).`);
}

function spawnApprovedCandidateProject(sourceContext, candidate, approvedAt) {
  const projectId = candidate.candidateId;
  const projectDir = path.join(PROJECTS_DIR, projectId);
  const projectPath = path.join(projectDir, 'project.json');

  if (fileExists(projectPath)) {
    const existing = readJson(projectPath);
    const sameSource =
      existing.derivedFrom &&
      existing.derivedFrom.sourceId === sourceContext.id &&
      existing.derivedFrom.candidateId === candidate.candidateId;

    if (sameSource) {
      console.log(`[project:${projectId}] Skip: already exists for this approved candidate`);
      return false;
    }

    throw new Error(`[project:${projectId}] Already exists and belongs to a different source candidate`);
  }

  ensureDir(projectDir);

  const project = {
    schemaVersion: 1,
    id: projectId,
    title: candidate.workingTitle,
    brand: sourceContext.source.brand,
    projectType: 'campaign',
    contentType: 'carousel',
    sourceType: 'provided',
    derivedFrom: {
      sourceId: sourceContext.id,
      candidateId: candidate.candidateId,
    },
    owner: DEFAULT_OWNER,
    workflow: {
      stage: 'plan_approved',
      requiresResearchBrief: false,
      approvals: {
        slidePlan: {
          status: 'approved',
          approvedAt,
        },
      },
    },
    paths: {
      slidePlan: 'slide_plan.md',
      approvals: 'approvals.json',
      carouselDraft: 'carousel_draft.md',
      handoffBrief: 'handoff_brief.md',
      carouselJson: 'carousel.json',
      renderDir: 'renders/current',
    },
    validation: {
      profile: 'strict',
    },
    distribution: {
      trackRendersInGit: false,
    },
  };

  writeJson(projectPath, project);
  writeJson(path.join(projectDir, 'approvals.json'), project.workflow.approvals);
  writeText(path.join(projectDir, 'slide_plan.md'), buildSlidePlanMarkdown(sourceContext, candidate, approvedAt));
  writeText(path.join(projectDir, 'carousel_draft.md'), buildCarouselDraftMarkdown(sourceContext, candidate));
  writeText(path.join(projectDir, 'handoff_brief.md'), buildHandoffBriefMarkdown(sourceContext, candidate));
  console.log(`[project:${projectId}] Created from approved candidate ${candidate.candidateId}`);
  return true;
}

function buildSlidePlanMarkdown(sourceContext, candidate, approvedAt) {
  return [
    `# Slide Plan - ${candidate.workingTitle}`,
    '',
    '## Meta',
    `- sourceId: ${sourceContext.id}`,
    `- candidateId: ${candidate.candidateId}`,
    `- brand: ${sourceContext.source.brand}`,
    `- packaging: ${candidate.packaging}`,
    `- slideCount: ${candidate.slideCount}`,
    `- reviewStatus: ${candidate.reviewStatus}`,
    `- approvedAt: ${approvedAt}`,
    '',
    '## Source Angle',
    `- contentAngle: ${candidate.contentAngle}`,
    `- whyItDeservesAPost: ${candidate.whyItDeservesAPost}`,
    '',
    '## Audience',
    candidateSection(candidate, 'Audience'),
    '',
    '## Core Message',
    candidateSection(candidate, 'Core Message'),
    '',
    '## Why Now',
    candidateSection(candidate, 'Why Now'),
    '',
    '## Key Point 1',
    candidateSection(candidate, 'Key Point 1'),
    '',
    '## Key Point 2',
    candidateSection(candidate, 'Key Point 2'),
    '',
    '## Key Point 3',
    candidateSection(candidate, 'Key Point 3'),
    '',
    '## Hook',
    candidateSection(candidate, 'Hook'),
    '',
    '## Closing Note',
    candidateSection(candidate, 'Closing Note'),
    '',
    '## Slide Flow',
    candidateSection(candidate, 'Slide Flow'),
    '',
    '## Visual Direction',
    candidateSection(candidate, 'Visual Direction'),
    '',
  ].join('\n');
}

function buildCarouselDraftMarkdown(sourceContext, candidate) {
  return [
    `# Carousel Draft Seed - ${candidate.workingTitle}`,
    '',
    '## Positioning',
    `- brand: ${sourceContext.source.brand}`,
    `- candidateId: ${candidate.candidateId}`,
    `- slideCount: ${candidate.slideCount}`,
    `- packaging: ${candidate.packaging}`,
    '',
    '## Core Message',
    candidateSection(candidate, 'Core Message'),
    '',
    '## Hook',
    candidateSection(candidate, 'Hook'),
    '',
    '## Closing Note',
    candidateSection(candidate, 'Closing Note'),
    '',
    '## Slide Flow',
    candidateSection(candidate, 'Slide Flow'),
    '',
    '## Notes',
    '- Seeded automatically from the approved source planning document.',
    '- Expand slide-by-slide copy here if the editor wants to refine before design.',
    '',
  ].join('\n');
}

function buildHandoffBriefMarkdown(sourceContext, candidate) {
  return [
    `# Designer Handoff - ${candidate.workingTitle}`,
    '',
    '## Meta',
    `- brand: ${sourceContext.source.brand}`,
    `- sourceId: ${sourceContext.id}`,
    `- candidateId: ${candidate.candidateId}`,
    `- slideCount: ${candidate.slideCount}`,
    '',
    '## Content Angle',
    candidate.contentAngle,
    '',
    '## Audience',
    candidateSection(candidate, 'Audience'),
    '',
    '## Core Message',
    candidateSection(candidate, 'Core Message'),
    '',
    '## Hook',
    candidateSection(candidate, 'Hook'),
    '',
    '## Slide Flow',
    candidateSection(candidate, 'Slide Flow'),
    '',
    '## Visual Direction',
    candidateSection(candidate, 'Visual Direction'),
    '',
    '## Closing Note',
    candidateSection(candidate, 'Closing Note'),
    '',
  ].join('\n');
}

function parsePlanningBlocks(markdown) {
  const section = extractLevel2Section(markdown, 'Candidate Plans');
  if (!section) {
    return [];
  }

  const blocks = [];
  const lines = section.split(/\r?\n/);
  let currentHeading = null;
  let currentLines = [];

  function flushBlock() {
    if (!currentHeading) {
      return;
    }

    const heading = currentHeading;
    const body = currentLines.join('\n').trim();
    const fields = {};
    const fieldRegex = /^- ([A-Za-z][A-Za-z0-9]*):\s*(.+)$/gm;
    let fieldMatch;

    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      const key = fieldMatch[1];
      if (!KNOWN_PLANNING_FIELDS.has(key)) {
        continue;
      }
      fields[key] = cleanValue(fieldMatch[2]);
    }

    const sections = parseSubsections(body);

    blocks.push({
      heading,
      ...fields,
      sections,
    });
  }

  for (const line of lines) {
    if (line.startsWith('### ')) {
      flushBlock();
      currentHeading = line.slice(4).trim();
      currentLines = [];
      continue;
    }

    if (currentHeading) {
      currentLines.push(line);
    }
  }

  flushBlock();

  return blocks;
}

function printValidationResults(label, results) {
  console.log(`${label}: checked ${results.checked}`);
  if (results.errors.length === 0) {
    console.log(`${label}: no errors`);
  } else {
    for (const error of results.errors) {
      console.error(error);
    }
  }

  if (results.warnings.length > 0) {
    for (const warning of results.warnings) {
      console.warn(warning);
    }
  }
}

function exitFromResults(resultsList) {
  const hasErrors = resultsList.some((results) => results.errors.length > 0);
  process.exit(hasErrors ? 1 : 0);
}

function candidateSection(candidate, name) {
  if (name === 'Closing Note') {
    return candidate.sections['Closing Note'] || candidate.sections.CTA || 'TBD';
  }
  return candidate.sections[name] || 'TBD';
}

function hasRequiredCandidateSection(candidate, name) {
  if (name === 'Closing Note') {
    return Boolean(candidate.sections['Closing Note'] || candidate.sections.CTA);
  }
  return Boolean(candidate.sections[name]);
}

function hasLevel2Section(markdown, heading) {
  return new RegExp(`^##\\s+${escapeRegex(heading)}\\s*$`, 'm').test(markdown);
}

function extractLevel2Section(markdown, heading) {
  const lines = markdown.split(/\r?\n/);
  const target = `## ${heading}`;
  let startIndex = -1;

  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim() === target) {
      startIndex = index + 1;
      break;
    }
  }

  if (startIndex === -1) {
    return '';
  }

  let endIndex = lines.length;
  for (let index = startIndex; index < lines.length; index += 1) {
    if (lines[index].startsWith('## ')) {
      endIndex = index;
      break;
    }
  }

  return lines.slice(startIndex, endIndex).join('\n');
}

function parseSubsections(body) {
  const sections = {};
  const lines = body.split(/\r?\n/);
  let currentHeading = null;
  let currentLines = [];

  function flushSection() {
    if (!currentHeading) {
      return;
    }
    sections[currentHeading] = currentLines.join('\n').trim();
  }

  for (const line of lines) {
    if (line.startsWith('#### ')) {
      flushSection();
      currentHeading = line.slice(5).trim();
      currentLines = [];
      continue;
    }

    if (currentHeading) {
      currentLines.push(line);
    }
  }

  flushSection();
  return sections;
}

function readStringArray(object, pathParts) {
  let current = object;
  for (const part of pathParts) {
    current = current && current[part];
  }
  return Array.isArray(current) ? current.filter((value) => typeof value === 'string') : [];
}

function readOptionalString(object, pathParts) {
  let current = object;
  for (const part of pathParts) {
    current = current && current[part];
  }
  return typeof current === 'string' && current.trim() ? current.trim() : null;
}

function validateSelectedCandidate({ bucket, candidateId, sourceId, candidateIds, candidateMap, errors }) {
  if (!candidateIds.includes(candidateId)) {
    errors.push(`[source:${sourceId}] ${bucket} is not present in candidateIds: ${candidateId}`);
    return;
  }

  const candidate = candidateMap.get(candidateId);
  if (!candidate) {
    errors.push(`[source:${sourceId}] ${bucket} is missing in ${SOURCE_FILE_NAMES.planning}: ${candidateId}`);
    return;
  }

  if (candidate.reviewStatus === 'reject' || candidate.packaging === 'reject') {
    errors.push(`[source:${sourceId}] ${bucket} cannot point to a rejected candidate: ${candidateId}`);
  }
}

function cleanValue(value) {
  return String(value).trim().replace(/^`|`$/g, '').replace(/^"|"$/g, '');
}

function listDirectories(baseDir) {
  if (!fs.existsSync(baseDir)) {
    return [];
  }

  return fs.readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeText(filePath, text) {
  fs.writeFileSync(filePath, text.trimEnd() + '\n', 'utf8');
}

function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function fileExists(filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
