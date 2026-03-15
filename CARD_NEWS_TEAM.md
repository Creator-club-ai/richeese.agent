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
- Use single-responsibility agents. One agent owns one stage output.

## Required Flow

`source.json -> planning.md -> owner review -> mainCandidateId / standaloneCandidateIds -> approvedCandidateIds -> spawn approved project -> researcher(optional) -> editor -> designer -> qa`

Do not create a project before owner review.

## Single-Responsibility Agent Map

| Agent | Responsibility | Reads | Owns | Must Not Edit |
| --- | --- | --- | --- | --- |
| `content_researcher` | evidence strengthening only | source/project + approved plan | `research_brief.md` | `planning.md`, `slide_plan.md`, `carousel_draft.md`, `handoff_brief.md`, `carousel.json` |
| `content_planner` | source planning or approved plan refinement | `source.json`, `planning.md`, `project.json`, brand guide | `sources/*/planning.md`, refined `slide_plan.md` | `research_brief.md`, `carousel_draft.md`, `handoff_brief.md`, `carousel.json`, `qa_report.md` |
| `content_editor` | copy and designer-facing brief only | `slide_plan.md`, optional `research_brief.md`, brand docs | `carousel_draft.md`, `handoff_brief.md` | `planning.md`, `slide_plan.md`, `carousel.json`, `qa_report.md` |
| `slide_designer` | slide system and render output only | `carousel_draft.md`, `handoff_brief.md`, brand docs | `carousel.json`, renders, local visual assets | `planning.md`, `slide_plan.md`, `research_brief.md`, `qa_report.md` |
| `content_qa` | quality judgment only | approved project files + renders | `qa_report.md`, `project.json.workflow.quality` | planning, copy, and design files |

## Human Gate

- The owner approval on `planning.md` is the only required human approval gate.
- After source approval, agent handoff and QA should carry the project forward.
- Final visual review is optional, not part of the default pipeline.

## Editor Copy Rules

- `content_editor` owns the final reader-facing slide copy in `carousel_draft.md` and the designer-facing wording in `handoff_brief.md`.
- For Korean-brand outputs, source keywords are reference material only. Final slide copy should be written as natural Korean for the reader, not as leftover source vocabulary.
- Do not leave untranslated source keywords, mixed Korean-English label phrases, or half-translated abstract terms in final slide copy unless they are unavoidable proper nouns or quoted source language.
- Rewrite the idea, not the keyword. The final line should read like finished Korean editorial copy, not like a memo copied from the source.
- Do not treat planner labels, transcript phrasing, or source-side concept tags as publishable slide copy. The editor must rewrite them into reader-facing Korean sentences.
- Adjacent slides must not make the same point with slightly different wording. If two slides land on the same conclusion, merge them or split their roles clearly into `claim / reason / evidence / implication`.
- Before handoff to design, the editor should check whether each body slide introduces a distinct takeaway, not just a repeated restatement of the previous slide.

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

## Planner Slide De-duplication Rule

- `content_planner` must remove overlap before owner approval, not after design starts.
- If two candidate body slides would produce the same one-sentence takeaway, they are not two slides. Merge them or cut one.
- In `Slide Flow`, each body slide should have a distinct job such as `claim`, `reason`, `evidence`, `example`, `implication`, or `closing insight`.
- Adjacent slides must advance the argument, not restate the previous slide with different wording.
- The planner should explicitly check whether Slide 2~N each adds new information, not just a new phrasing of the same point.

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

Spawned projects must be created as production-ready but role-safe:

- `workflow.stage = plan_approved`
- `workflow.approvals.slidePlan.status = approved`
- `workflow.quality.qaStatus = not_started`
- `slide_plan.md` exists
- `carousel_draft.md` exists
- `handoff_brief.md` exists
- `carousel_draft.md` and `handoff_brief.md` are `skeleton-only` at spawn time
- planner content should not fully prewrite editor/designer files during spawn

This allows the owner to review planning once and then move straight into production without role overlap.

## Project Stage Ownership

| Stage | Owner | Exit Condition |
| --- | --- | --- |
| `analyzed` source | `content_planner` | `planning.md` complete |
| `approved` source | owner | candidate selection written to `source.json` |
| `plan_approved` project | system | spawn complete |
| `researching` | `content_researcher` | `research_brief.md` ready or skipped |
| `writing` | `content_editor` | final `carousel_draft.md` + `handoff_brief.md` ready |
| `designing` | `slide_designer` | `carousel.json` + render output ready |
| `qa` | `content_qa` | `qa_report.md` written and `workflow.quality.qaStatus` set |
| `done` | system | QA passed and validation passed |

## QA Rule

- strict projects in `qa` or `done` stage must have `paths.qaReport`
- strict projects in `qa` or `done` stage must have `workflow.quality.qaStatus`
- `done` requires `workflow.quality.qaStatus = passed`
- remote asset URLs in `carousel.json` should be treated as an operational warning until local assets are frozen
- QA records findings and routes the project back to `writing` or `designing`; QA does not directly rewrite those files

## Validation Rule

Use `node scripts/project-ops.js validate` or `npm run validate:all` before handoff.
