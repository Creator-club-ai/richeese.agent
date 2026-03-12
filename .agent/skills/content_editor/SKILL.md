---
name: content_editor
description: Use this skill when the user asks for carousel copy, `carousel_draft.md`, or `handoff_brief.md`. It writes or refines both files from an approved slide plan.
---

# Card-News Editor Skill

## Purpose

Turn an approved plan into production-ready copy and a designer brief.

## Read First

- `CARD_NEWS_TEAM.md`
- `projects/<topic>/project.json`
- `projects/<topic>/slide_plan.md`
- `projects/<topic>/approvals.json` when needed
- `projects/<topic>/research_brief.md` when it exists
- `brands/<active-brand>/BRAND_GUIDE.md`
- `brands/<active-brand>/DESIGNER_HANDOFF_BRIEF.md`

## Start Condition

- `project.json.workflow.approvals.slidePlan.status` must be `approved`
- `slide_plan.md` must exist

Note:

- Source-approved projects now receive `skeleton-only` versions of `carousel_draft.md` and `handoff_brief.md`
- Fill them from `slide_plan.md`; do not assume planner copy is already final

## Output

- `carousel_draft.md`
- `handoff_brief.md`

Do not edit:

- `planning.md`
- `slide_plan.md`
- `carousel.json`
- `qa_report.md`

## Rule

Do not start from visual styling first.

Lock these in first:

- audience
- message
- slide flow
- closing note

This skill owns copy and handoff only. It must not solve layout problems by editing design output directly.
