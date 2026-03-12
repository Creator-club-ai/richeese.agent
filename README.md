# Content Marketing Hub

This workspace is a source-first operating system for content planning and carousel production.

The core rule is simple:

`raw source -> planning.md review -> owner approval -> spawn project -> editor/designer`

## Structure

```text
.
├─ brands/
├─ projects/
├─ scripts/
├─ sources/
├─ templates/
├─ CARD_NEWS_TEAM.md
└─ SOURCE_INTAKE_PLAYBOOK.md
```

## What Lives Where

- `sources/<source-id>/source.json`
  - raw source metadata and approval state
- `sources/<source-id>/planning.md`
  - the single owner-facing planning document
  - includes source summary, packaging map, candidate scoreboard, and slide plans
- `projects/<topic>/project.json`
  - project metadata and workflow state
- `projects/<topic>/slide_plan.md`
  - approved planning output for production
- `projects/<topic>/carousel_draft.md`
  - copy seed for editorial refinement
- `projects/<topic>/handoff_brief.md`
  - designer-facing brief
- `projects/<topic>/carousel.json`
  - rendered slide payload

## Source-First Workflow

1. Create `source.json`.
2. Analyze the source into one `planning.md`.
3. Show `planning.md` to the owner.
4. The owner selects one main card and any standalone-worthy follow-ups.
5. Write those choices into:
   - `source.json.analysis.mainCandidateId`
   - `source.json.analysis.standaloneCandidateIds`
   - `source.json.analysis.approvedCandidateIds`
6. Set `status` to `approved`.
7. Run `npm run spawn:approved -- <source-id>`.
8. Only approved candidates become child projects.

Important:

- `planning.md` must show both:
  - subtopics that stay inside one main card
  - subtopics strong enough to become standalone posts
- `mainCandidateId` is the selected main card.
- `standaloneCandidateIds` is the set of subtopics worth tracking as independent posts.
- `approvedCandidateIds` is the actual spawn queue for right now.
- No project is created before the owner reviews `planning.md`.
- Spawned projects are created in `plan_approved` state, with `slide_plan.md`, `carousel_draft.md`, and `handoff_brief.md` already seeded.

## Richesse Insight Filtering

For `richesse-club`, planning should not jump straight from transcript to slide flow.

Use this sequence instead:

1. extract `10-15` raw insights from the transcript
2. rewrite them into `richesse-club` editorial language
3. score each insight on:
   - `Brand Fit`
   - `Content Value`
   - `Novelty`
   - `Evidence Strength`
   - `Slide-worthiness`
4. remove weak, duplicate, or non-editorial points
5. confirm that at least `5` usable body insights remain before proposing a summary-style carousel

If the filtered list is too weak, do not force a carousel. Either:

- hold the source
- narrow it to one deeper insight card
- reject the angle

## Project Workflow

`project.json -> slide_plan.md -> carousel_draft.md + handoff_brief.md -> carousel.json -> renders/`

Typical state progression:

`draft -> planning -> awaiting_plan_approval -> plan_approved -> writing -> designing -> qa -> done`

Source-approved projects skip the extra planning gate and are spawned directly as:

- `workflow.stage = plan_approved`
- `workflow.approvals.slidePlan.status = approved`

## Commands

- `npm run validate:sources`
  - validate `sources/` only
- `npm run validate:projects`
  - validate `projects/` only
- `npm run validate:all`
  - validate both source and project layers
- `npm run sync:approvals`
  - mirror `project.json.workflow.approvals` into `approvals.json`
- `npm run spawn:approved -- <source-id>`
  - create designer-ready child projects from approved candidates
- `npm run render -- --data <carousel.json> --output <dir>`
  - render final images
- `npm run render:preview -- --data <carousel.json> --output <dir>`
  - render preview images faster

## Templates

- `templates/SOURCE_TEMPLATE.json`
- `templates/PLANNING_TEMPLATE.md`
- `templates/PROJECT_TEMPLATE.json`

## Validation Rules

- Every source folder must have `source.json`.
- Any analyzed source must also have `planning.md`.
- `planning.md` must contain the required sections and candidate plans.
- `mainCandidateId`, `standaloneCandidateIds`, and `approvedCandidateIds` must point to candidate IDs that exist in `planning.md`.
- Any project with `derivedFrom` must point to an approved source candidate.
- `approvals.json` must match `project.json.workflow.approvals`.

## Current Operating Intent

This repo is optimized for a small team where the owner wants to review planning first, then immediately hand the chosen direction to the designer. Keep the workflow minimal. Do not add extra report layers unless the owner explicitly asks for them.
