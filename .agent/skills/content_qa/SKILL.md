---
name: content_qa
description: Use this skill when the user asks for card-news QA, final validation, or a pass/fail quality check before handoff. It writes `qa_report.md` and records QA status without rewriting copy or design files.
---

# Card-News QA Skill

## Purpose

Judge whether a carousel is ready to move from `qa` to `done`.

## Read First

- `CARD_NEWS_TEAM.md`
- `projects/<topic>/project.json`
- `projects/<topic>/slide_plan.md`
- `projects/<topic>/carousel_draft.md`
- `projects/<topic>/handoff_brief.md`
- `projects/<topic>/carousel.json`
- `projects/<topic>/renders/current/*`
- `brands/<active-brand>/BRAND_GUIDE.md`

## Start Condition

- `project.json.workflow.stage` should be `qa`
- `carousel.json` must exist
- at least one render output should exist

## Output

- `qa_report.md`
- `project.json.workflow.quality`
- move `project.json.workflow.stage` to `done` only when QA passes

## Checks

- brand fidelity
- copy fidelity against the approved plan
- layout overflow / clipping / readability
- asset freeze status
- validation command result

## Rule

This skill records judgment only.

Do not edit:

- `planning.md`
- `slide_plan.md`
- `research_brief.md`
- `carousel_draft.md`
- `handoff_brief.md`
- `carousel.json`

If the issue is copy-related, route back to `writing`.
If the issue is visual or asset-related, route back to `designing`.
