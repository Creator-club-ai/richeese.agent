# Content Marketing Hub

This workspace is an intake-first operating system for content planning and carousel production.

The core rule is simple:

`intake(source-backed | topic-backed) -> scout research + planning.md review -> owner approval -> spawn project(plan_approved | researching) -> researcher(if needed) -> editor -> designer -> qa`

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

- `sources/<intake-id>/source.json`
  - intake metadata, source/topic mode, and approval state
- `sources/<intake-id>/planning.md`
  - the single owner-facing intake review document
  - includes scout research, packaging map, candidate scoreboard, and either slide plans or research routes
- `projects/<topic>/project.json`
  - project metadata and workflow state
- `projects/<topic>/slide_plan.md`
  - approved planning output for production
- `projects/<topic>/carousel_draft.md`
  - editor-owned copy draft
- `projects/<topic>/handoff_brief.md`
  - editor-owned designer brief
- `projects/<topic>/carousel.json`
  - designer-owned slide payload
- `projects/<topic>/qa_report.md`
  - qa-owned pass/fail record and route-back note

## Intake Workflow

1. Create `source.json` for a source-backed or topic-backed intake.
2. Run `scout research` until the angle is strong enough to judge.
3. Analyze the intake into one `planning.md`.
4. Show `planning.md` to the owner.
5. The owner selects one main card, any standalone-worthy follow-ups, and the spawn route.
6. Write those choices into:
   - `source.json.analysis.mainCandidateId`
   - `source.json.analysis.standaloneCandidateIds`
   - `source.json.analysis.approvedCandidateIds`
   - `source.json.generation.spawnMode`
7. Set `status` to `approved`.
8. Run `npm run spawn:approved -- <intake-id>`.
9. Only approved candidates become child projects.

Important:

- `planning.md` must show both:
  - subtopics that stay inside one main card
  - subtopics strong enough to become standalone posts
- `mainCandidateId` is the selected main card.
- `standaloneCandidateIds` is the set of subtopics worth tracking as independent posts.
- `approvedCandidateIds` is the actual spawn queue for right now.
- `generation.spawnMode` decides whether approved candidates become `plan_approved` or `researching` projects.
- No project is created before the owner reviews `planning.md`.
- `plan_approved` spawns are created with an approved `slide_plan.md`.
- `research_first` spawns are created in `researching` state with `research_brief.md` seeded first.
- `carousel_draft.md` and `handoff_brief.md` are created only after the project has an approved slide plan.

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

Planner rule:

- if two body slides would land on the same takeaway, merge or cut them before approval
- each approved body slide should play a distinct role in the argument, not a paraphrase of the previous slide

If the filtered list is too weak, do not force a carousel. Either:

- hold the source
- narrow it to one deeper insight card
- reject the angle

## Project Workflow

`project.json -> research_brief.md(optional or required) -> slide_plan.md -> carousel_draft.md + handoff_brief.md -> carousel.json -> renders/ -> qa_report.md`

Typical state progression:

`draft -> researching -> planning -> awaiting_plan_approval -> plan_approved -> writing -> designing -> qa -> done`

`plan_approved` projects are spawned directly with:

- `workflow.stage = plan_approved`
- `workflow.approvals.slidePlan.status = approved`
- `workflow.quality.qaStatus = not_started`

`research_first` projects are spawned directly with:

- `workflow.stage = researching`
- `workflow.requiresResearchBrief = true`
- `workflow.approvals.slidePlan.status = pending`

## Agent Ownership

- `content_researcher`
  - owns evidence only
- `content_planner`
  - owns intake planning and `slide_plan.md` refinement only
- `content_editor`
  - owns copy and designer brief only
- `content_editor` must rewrite planning language into final reader-facing Korean copy and remove repeated adjacent slide claims before design
- `slide_designer`
  - owns `carousel.json`, renders, and local visual asset freeze only
- `content_qa`
  - owns `qa_report.md` and QA status only

Do not let one shared agent overwrite another shared agent's stage output.

## Commands

- `npm run validate:sources`
  - validate `sources/` only
- `npm run validate:projects`
  - validate `projects/` only
- `npm run validate:all`
  - validate both source and project layers
- `npm run sync:approvals`
  - mirror `project.json.workflow.approvals` into `approvals.json`
- `npm run spawn:approved -- <intake-id>`
  - create plan-approved child projects from approved candidates
- `npm run render -- --data <carousel.json> --output <dir>`
  - render final images
- `npm run render:preview -- --data <carousel.json> --output <dir>`
  - render preview images faster

## Templates

- `templates/SOURCE_TEMPLATE.json`
- `templates/PLANNING_TEMPLATE.md`
- `templates/PROJECT_TEMPLATE.json`
- `templates/QA_REPORT_TEMPLATE.md`

## Validation Rules

- Every intake folder under `sources/` must have `source.json`.
- Any analyzed intake must also have `planning.md`.
- `planning.md` must contain the required sections and candidate plans.
- `mainCandidateId`, `standaloneCandidateIds`, and `approvedCandidateIds` must point to candidate IDs that exist in `planning.md`.
- Any project with `derivedFrom` must point to an approved intake candidate.
- `approvals.json` must match `project.json.workflow.approvals`.
- strict projects in `qa` or `done` must have `qa_report.md` and `workflow.quality.qaStatus`
- strict projects in `done` must have `workflow.quality.qaStatus = passed`

## Current Operating Intent

This repo is optimized for a small team where the owner wants to review planning once, then let specialized agents move the project forward without role overlap. Keep the workflow minimal, but keep ownership boundaries explicit.
