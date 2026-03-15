---
name: slide_designer
description: Use this skill when the user asks to design a carousel, create `carousel.json`, or turn an approved card-news plan into slides.
---

# Card-News Slide Designer Skill

## Purpose

Turn approved card-news inputs into `carousel.json`.

## Read First

- `CARD_NEWS_TEAM.md`
- `projects/<topic>/project.json`
- `projects/<topic>/carousel_draft.md`
- `projects/<topic>/handoff_brief.md`
- `projects/<topic>/approvals.json` when needed
- `brands/README.md`
- `brands/<active-brand>/BRAND_GUIDE.md`
- `brands/<active-brand>/DESIGNER_HANDOFF_BRIEF.md`

## Start Condition

- `project.json.workflow.approvals.slidePlan.status` must be `approved`
- `carousel_draft.md` must exist
- `handoff_brief.md` must exist

Note:

- A project spawned from approved source planning is already created in `plan_approved` state
- Those spawned projects are allowed to move directly into design

## Workflow

1. Confirm approval state in `project.json`.
2. Read `carousel_draft.md` and `handoff_brief.md`.
3. Read the active brand guide.
4. Freeze local visual assets before final handoff when possible.
5. Build slide layouts and export `carousel.json`.
6. Render only when requested.

## Rule

Slide count is driven by the approved plan. Do not force a fixed number.

When the active brand is `richesse-club`, lock these cover defaults unless the user explicitly overrides them:

- cover title must be exactly `2 lines`
- cover tags and title must sit inside the `1080x1080` safe area even on a `1080x1440` canvas
- cover tags use `Neue Haas Grotesk Display Pro`, `35px`, `Extra Light`
- cover does not use an index marker by default

When the active brand is `richesse-club`, lock these body defaults unless the user explicitly overrides them:

- use `brands/richesse-club/body.template.json` as the canonical body template reference
- if `project.paths.templateData` exists, treat that file as the body copy source of truth and regenerate `carousel.json` from it before rendering
- preserve the first slide from the existing `carousel.json` as slide 1 when available, then append generated body slides after it
- for body/final slides, reuse the same fixed dark editorial template and only swap approved copy into the slots
- body slide numbering should be generated from slide order, starting after the preserved cover
- keep `theme: dark`, `chrome: none`, `footer: none`, `meta.width: 1080`, `meta.height: 1440`
- keep the slot order `index + rule -> 2-line headline -> lead body -> secondary body/quote -> bullet -> left/right source tags`
- use `Pretendard Medium` for index/body, `Pretendard ExtraBold` for headline, and `Neue Haas Grotesk Display Pro 45 Light` for bottom source tags
- do not introduce cards, data tables, icons, image blocks, or alternate body layouts for richesse unless the user explicitly asks
- if Korean final copy still contains untranslated source keywords, mixed-language label phrases, or adjacent slides that repeat the same takeaway, flag it back to the editor instead of silently preserving the weak draft

Do not edit:

- `planning.md`
- `slide_plan.md`
- `research_brief.md`
- `carousel_draft.md`
- `handoff_brief.md`
- `qa_report.md`

This skill owns layout and asset execution only. Copy disputes should go back to the editor.
