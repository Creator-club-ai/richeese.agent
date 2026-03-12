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
4. Build slide layouts and export `carousel.json`.
5. Render only when requested.

## Rule

Slide count is driven by the approved plan. Do not force a fixed number.
