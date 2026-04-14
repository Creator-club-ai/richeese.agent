---
name: research
description: Public evidence phase under Head. Use when the user wants one chosen signal or one direct source turned into usable evidence before planning. `research` routes into `research-desk`, can reuse discovery shortlist context when `morning-brew` already ran, uses `wiki` and `memory-ops` as support, and returns a `ResearchOutput`.
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

- selected signal from `morning-brew` -> `research-desk`
- direct source / URL / transcript / memo / pasted text -> `research-desk`
- use `wiki` for ingest or lookup when it adds signal
- use `memory-ops` when a snapshot or refresh is needed
- use `morning-brew` only when the user explicitly needs discovery before selecting one signal
- reuse shared signal helpers from `scripts/signal_adapters/common.py` when discovery context needs to carry into evidence building

Subagent rule:

- `research` should normally dispatch internal desks instead of doing non-trivial normalization inline.
- `research-desk` is the default internal owner for evidence building.
- `morning-brew` is optional discovery support, not a public competitor to `research`.
- platform collectors stay in `scripts/signal_adapters/*.py`; `research` owns evidence synthesis, not multi-source scanning.

## Rules

- one selected signal or one raw source must stop here before planning
- do not hand raw source straight to `analyze`
- do not treat a `morning-brew` shortlist as a finished `ResearchOutput`
- return a structured `ResearchOutput`
- stop cleanly when source strength is too weak

## Output

Return a `ResearchOutput` that satisfies `.claude/shared/phase-contracts.md`.
