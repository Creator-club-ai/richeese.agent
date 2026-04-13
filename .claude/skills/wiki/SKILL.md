---
name: wiki
description: This skill should be used when Head or the public `research` and `review` phases need reusable Obsidian context, wiki ingest, or wiki maintenance. It is a support layer, not a default public phase.
---

# Wiki

## Role

`wiki` is a support knowledge layer for the active Obsidian vault.

Use it to preserve reusable context, query prior context, and keep the knowledge layer helpful without turning it into a second planning system.

## Read First

1. `ACTIVE_PROFILE.md`
2. the profile documents referenced there
3. the relevant wiki page, if it exists
4. the current source packet, `ResearchOutput`, or `ReviewVerdict`
5. the current task

## Modes

### Ingest

Use when source material contains reusable context.

- extract durable concepts, entities, and relationships
- update or create the right wiki page
- keep indexes and logs in sync when they exist

### Query

Use when Head needs prior context before planning or review.

- find the relevant page
- return only the useful signal
- avoid flooding the run with wiki noise

### Lint

Use when the user explicitly asks for wiki maintenance.

## Rules

- do not mutate raw source files
- do not force wiki ingest when nothing reusable exists
- do not turn wiki into a second planning layer

## Return

Return the minimum reusable knowledge needed for the current run.
