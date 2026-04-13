---
name: review
description: Public quality gate under Head. Use when a draft needs an approval decision before finalizing. `review` uses `risk-desk`, critic-mode copy review, and memory checks to return a hard verdict with an explicit reroute target.
---

# Review

## Purpose

`review` is the public approval gate.

It should behave like the external check layer in a PDCA-style orchestration system:

- not a soft checklist
- not vague commentary
- always a hard verdict

## Invocation

- In Codex, users normally reach `review` through `head` or by explicitly asking for the quality gate in natural language.
- In Claude, `.claude/commands/review.md` is only a wrapper alias.
- `review` is a public phase boundary, not a separate orchestrator.

## Read First

1. `.claude/shared/richesse-editorial-core.md`
2. `.claude/shared/phase-contracts.md`
3. `ACTIVE_PROFILE.md`
4. the profile documents referenced there
5. the current draft
6. the approved plan
7. the supporting source material

## Dispatch

- main internal reviewer: `risk-desk`
- secondary review support: `copy-desk` in critic mode
- support layer: `memory-ops` for rejected-pattern context when useful

Subagent rule:

- `review` should usually dispatch more than one internal reviewer when claims, tone, or structure are non-trivial.
- internal reviewers return focused verdict inputs; `review` owns the public gate output.

## Rules

- review can approve, revise, or block
- review must name the target phase for reroute
- keep the strengths worth preserving
- do not pass weak or generic copy just because it is structurally complete

## Output

Return a `ReviewVerdict` that satisfies `.claude/shared/phase-contracts.md`.
