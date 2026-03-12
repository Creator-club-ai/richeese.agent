# Card-News Team

This is the active operating standard for the carousel pipeline.

## Priority

- Follow this file first if older docs conflict.
- Source state lives in `sources/<source-id>/source.json`.
- Project state lives in `projects/<topic>/project.json`.
- `approvals.json` is a mirror of `project.json.workflow.approvals`.

## Goal

- Turn raw sources into strong Instagram carousels in the current team size standard: `1080x1440`.
- Show planning to the owner before design starts.
- Keep the workflow minimal and fast.

## Required Flow

`source.json -> planning.md -> owner review -> mainCandidateId / standaloneCandidateIds -> approvedCandidateIds -> spawn approved project -> editor/designer`

Do not create a project before owner review.

## `planning.md` Contract

Each source planning file must include these sections:

- `## Source Snapshot`
- `## Core Theme`
- `## Main Topic`
- `## Packaging Map`
- `## Candidate Scoreboard`
- `## Candidate Plans`
- `## Recommended Route`
- `## Approval Guide`

Inside `## Candidate Plans`, every candidate must include:

- `candidateId`
- `workingTitle`
- `packaging`
- `reviewStatus`
- `slideCount`
- `contentAngle`
- `whyItDeservesAPost`
- `recommendedPriority`

For any candidate that is not rejected, include:

- `Audience`
- `Core Message`
- `Why Now`
- `Key Point 1`
- `Key Point 2`
- `Key Point 3`
- `Hook`
- `Closing Note`
- `Slide Flow`
- `Visual Direction`

## Planning Rule

The planner must separate two things clearly:

- subtopics that belong inside one main carousel as slide structure
- subtopics that deserve their own standalone post

If a source supports both, show both in the same `planning.md`.

## Richesse Insight Role

When the active brand is `richesse-club`, the planner should act as a `Richesse Insight Curator`.

This role is not a generic video summarizer. It must:

- extract more raw insights than will actually be used
- filter those insights through the brand's startup / entrepreneurial / ownership lens
- rewrite educational or descriptive source material into sharper editorial claims
- remove weak, duplicate, or non-slide-worthy points before recommending a card

## Richesse Insight Filter

For `richesse-club`, the planning pass should follow this order before candidate selection:

1. Pull `raw insight` candidates from the transcript.
2. Rewrite them into brand-fit editorial statements.
3. Score each insight.
4. Keep only usable insights.
5. Decide whether the source supports an insight-summary carousel or should be held.

Recommended raw volume:

- `10-15` raw insights per source before filtering

Required scoring axes for `richesse-club`:

- `Brand Fit`
  - does the point connect naturally to entrepreneurship, startup thinking, ownership, decision-making, execution, or working attitude
- `Content Value`
  - is the point genuinely useful, interesting, or worth stopping for as a piece of editorial content
- `Novelty`
  - does the point feel sharper or less obvious than a generic self-help claim
- `Evidence Strength`
  - is the point clearly supported by the source transcript, examples, or repeated framing
- `Slide-worthiness`
  - can the point support one full slide without collapsing into filler

Recommended scoring scale:

- `1-5` for each axis

Recommended keep / cut rule:

- keep insights only when they are strong enough to stand as a slide in their own right
- cut any insight that is mostly program description, logistics, repetition, or weak motivation language
- merge insights that are conceptually overlapping before counting final usable slides

## Richesse Slide Feasibility Gate

Before recommending a `richesse-club` summary-style carousel:

- the filtered usable insight count should support at least `5` body slides
- this means `cover + minimum 5 body slides`, or `6` total slides minimum
- if fewer than `5` usable body insights remain after filtering, do not force a carousel; mark the source as `hold`, narrow to one deeper insight, or reject the angle

Add the filtered result to `planning.md` so the owner can see:

- how many raw insights were extracted
- how many survived the filter
- whether the source is strong enough for a summary-style card

## Approval Rule

- The owner reviews `planning.md`.
- `source.json.analysis.mainCandidateId` records the selected main card.
- `source.json.analysis.standaloneCandidateIds` records standalone-worthy follow-ups.
- `source.json.analysis.approvedCandidateIds` records what should be spawned right now.
- `source.json.status` must be `approved` before spawning.
- `npm run spawn:approved -- <source-id>` creates only the approved child projects.

## Spawn Rule

Spawned projects must be created as design-ready:

- `workflow.stage = plan_approved`
- `workflow.approvals.slidePlan.status = approved`
- `slide_plan.md` exists
- `carousel_draft.md` exists
- `handoff_brief.md` exists

This allows the owner to review planning once and then move straight into production.

## Validation Rule

Use `node scripts/project-ops.js validate` or `npm run validate:all` before handoff.
