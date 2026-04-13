---
name: write
description: Public drafting phase under Head. Use when the user wants publishable copy from an approved plan. `write` routes into `editor`, uses `copy-desk` for most drafting work, and can call copy-sidecars when hooks or body copy are weak.
---

# Write

## Purpose

`write` turns an approved plan into reviewable copy.

It is a public facade over the existing drafting layer.

## Invocation

- In Codex, users normally reach `write` through `head` or by explicitly asking for drafting in natural language.
- In Claude, `.claude/commands/write.md` is only a wrapper alias.
- `write` is a public phase boundary, not a standalone drafting product.

## Read First

1. `.claude/shared/richesse-editorial-core.md`
2. `.claude/shared/phase-contracts.md`
3. `ACTIVE_PROFILE.md`
4. the profile documents referenced there
5. the approved `AnalyzeOutput`

## Dispatch

- main internal executor: `editor`
- internal drafting desk: `copy-desk`
- optional sidecars: copy critic or review support when the draft is flat, generic, or over-explained

Subagent rule:

- `write` should dispatch `editor` and `copy-desk` for almost all non-trivial drafting.
- sidecars should be used when the hook, pacing, or compression is weak.

## Rules

- `write` consumes an approved plan only
- do not silently re-plan the angle
- optimize for compressed, save-worthy slide copy
- route weak drafts to `refine`

## Output

Return a `WriteOutput` that satisfies `.claude/shared/phase-contracts.md`.
