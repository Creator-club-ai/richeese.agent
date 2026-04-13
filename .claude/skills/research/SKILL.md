---
name: research
description: Public evidence phase under Head. Use when the user wants source gathering, latest-signal scanning, or direct-source intake before planning. `research` routes into `morning-brew` or `source-intake`, uses `wiki` and `memory-ops` as support, and returns a `ResearchOutput`.
---

# Research

## Purpose

`research` is the public evidence phase.

It is a facade over the existing internal desks and stage skills.
Users should ask for `research`, not choose desks manually.

## Invocation

- In Codex, users usually reach this phase through natural-language requests under `head`.
- In Claude, `.claude/commands/research.md` is only wrapper sugar.
- `research` is a public phase boundary, not a separate orchestrator.

## Read First

1. `.claude/shared/richesse-editorial-core.md`
2. `.claude/shared/phase-contracts.md`
3. `ACTIVE_PROFILE.md`
4. the profile documents referenced there
5. the user request
6. the source material needed for the current run

## Dispatch

- latest signals / RSS / "today's signals" -> `morning-brew`
- direct source / URL / transcript / memo / pasted text -> `source-intake`
- use `wiki` for ingest or lookup when it adds signal
- use `memory-ops` when a snapshot or refresh is needed

Subagent rule:

- `research` should normally dispatch internal desks instead of doing non-trivial normalization inline.
- `morning-brew` and `source-intake` are execution wrappers, not public competitors to `research`.

## Rules

- raw source must stop here before planning
- do not hand raw source straight to `analyze`
- return a structured `ResearchOutput`
- stop cleanly when source strength is too weak

## Output

Return a `ResearchOutput` that satisfies `.claude/shared/phase-contracts.md`.
