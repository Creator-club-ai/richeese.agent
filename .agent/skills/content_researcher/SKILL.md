---
name: content_researcher
description: Use this skill when the user asks for a research brief, fact support, or evidence strengthening for a content project. It prepares `research_brief.md` and blocks unsupported claims.
---

# Card-News Researcher Skill

## Purpose

Prepare `research_brief.md` for projects that need stronger evidence before writing or design.

## Read First

- `CARD_NEWS_TEAM.md`
- `projects/<topic>/project.json`
- `SOURCE_INTAKE_PLAYBOOK.md` if the project came from a raw source
- `sources/<source-id>/planning.md` if `project.json.derivedFrom` exists
- `brands/<active-brand>/BRAND_GUIDE.md` when tone and proof style matter

## Scope

- create or update `research_brief.md`
- strengthen claims with better sources
- flag weak or unsupported claims

Do not create:

- `planning.md`
- `slide_plan.md`
- `carousel_draft.md`
- `handoff_brief.md`
- `carousel.json`
- `qa_report.md`
- `project.json`

## Workflow

1. Read `project.json`.
2. If the project is source-derived, read the approved candidate in `planning.md`.
3. Turn the candidate into 3 to 5 research questions.
4. Collect strong evidence.
5. Organize claims, supporting sources, and cautions.
6. Write `research_brief.md`.

## Rule

If the source transcript gives the framing but not enough proof, keep the framing and upgrade the evidence.

This skill owns evidence only. Do not rewrite copy, plan structure, or slide layout decisions.
