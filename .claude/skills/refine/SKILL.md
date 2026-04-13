---
name: refine
description: Public repair phase under Head. Use when review failed and the work needs a targeted repair. `refine` routes the issue back to the correct internal layer instead of restarting the whole run.
---

# Refine

## Purpose

`refine` repairs the failing layer only.

It is not a generic retry phase.

## Invocation

- In Codex, users normally reach `refine` through `head` after a failed review or an explicit repair request.
- In Claude, `.claude/commands/refine.md` is only a wrapper alias.
- `refine` is a public repair phase, not a standalone drafting desk.

## Read First

1. `.claude/shared/richesse-editorial-core.md`
2. `.claude/shared/phase-contracts.md`
3. `ACTIVE_PROFILE.md`
4. the profile documents referenced there
5. the `ReviewVerdict`
6. the current artifact that failed

## Route-Back Logic

- evidence weakness or unsupported claims -> `source-intake`
- broad angle, weak save reason, or generic framing -> `content-planner`
- weak hook, bloated body, or flat copy -> `editor`
- optional visual mismatch after explicit handoff -> `designer`

Subagent rule:

- `refine` should dispatch back to the failing internal layer instead of retrying the whole run.
- it may use the same desk as before, but it should carry the review diagnosis forward explicitly.

## Rules

- preserve the strongest parts
- repair by cause
- return to `review` after repair unless the run should stop

## Output

Return a `RepairRequest` that satisfies `.claude/shared/phase-contracts.md`.
