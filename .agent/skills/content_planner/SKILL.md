---
name: content_planner
description: Use this skill when the user asks to plan a card-news post from a raw source or to turn an approved direction into a project plan. It supports `planning.md` for source review and `slide_plan.md` refinement for approved projects.
---

# Card-News Planner Skill

## Purpose

`content_planner` has two modes:

1. `source planning mode`
   - raw URL, transcript, article, notes in
   - `sources/<source-id>/planning.md` out
2. `project planning mode`
   - approved project in
   - `slide_plan.md` refinement out when needed

## Read First

- `CARD_NEWS_TEAM.md`
- `SOURCE_INTAKE_PLAYBOOK.md`
- `sources/<source-id>/source.json` or `projects/<topic>/project.json`
- `brands/README.md`
- `brands/<active-brand>/BRAND_GUIDE.md`

## Mode 1: Source Planning

Use this when a raw source may branch into multiple content directions.

### Output

- `source.json`
- `planning.md`

Do not create a child project in this mode.

### Required Planning Behavior

- identify the core thesis
- separate main-card subtopics from standalone-worthy subtopics
- show all viable candidate directions
- give each candidate a real slide plan, not just a title
- make the document strong enough that the owner can approve without a second planning pass

### Required `planning.md` Sections

- `Source Snapshot`
- `Core Theme`
- `Main Topic`
- `Packaging Map`
- `Candidate Scoreboard`
- `Candidate Plans`
- `Recommended Route`
- `Approval Guide`

### Required Candidate Fields

- `candidateId`
- `workingTitle`
- `packaging`
- `reviewStatus`
- `slideCount`
- `contentAngle`
- `whyItDeservesAPost`
- `recommendedPriority`

### Required Candidate Sections

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

## Mode 2: Project Planning

Use this when the owner already approved a direction and the team wants to refine `slide_plan.md`.

### Output

- update `slide_plan.md`

Do not create `carousel.json` in this mode.

## Operating Rule

The owner should see the planning first.

The planner's job is not just to summarize the source. The planner must decide:

- what belongs inside one carousel
- what should become its own post
- what should be held or rejected
- what should be framed as the main card versus what should stay in the standalone queue
