---
name: analyze
description: Public planning phase under Head. Use when research is complete and one clear direction needs to be chosen. `analyze` routes into `content-planner`, uses `strategy-desk` as the internal planner, and can call angle-mining sidecars when multiple directions compete.
---

# Analyze

## Purpose

`analyze` turns evidence into one approved direction.

It is a public facade over the existing planning layer.

## Invocation

- In Codex, users normally reach `analyze` through `head` or by explicitly asking for the planning phase in natural language.
- In Claude, `.claude/commands/analyze.md` is only a wrapper alias.
- `analyze` is a public phase boundary, not a second orchestrator.

## Read First

1. `.claude/shared/richesse-editorial-core.md`
2. `.claude/shared/phase-contracts.md`
3. `ACTIVE_PROFILE.md`
4. the profile documents referenced there
5. the `ResearchOutput`

## Dispatch

- main internal executor: `content-planner`
- internal planning desk: `strategy-desk`
- optional sidecars: angle miners when more than one credible angle competes

Subagent rule:

- `analyze` should dispatch `strategy-desk` by default for non-trivial planning work.
- angle miners are sidecars, not independent public surfaces.

## Rules

- choose one angle only
- `analyze` consumes evidence, not raw source
- do not draft final copy here
- route weak or generic plans to `refine`

## Output

Return an `AnalyzeOutput` that satisfies `.claude/shared/phase-contracts.md`.
