---
name: content-planner
description: This skill should be used when Head or the public `analyze` phase needs one evidence-backed direction selected from completed research. It is an internal planning executor, not a public entrypoint.
---

# Content Planner

## Role

`content-planner` is the internal planning executor under the public `analyze` phase.

Use it to turn evidence into one angle, one thesis, one save reason, and one usable slide outline.

## Read First

1. `.claude/shared/richesse-editorial-core.md`
2. `.claude/shared/phase-contracts.md`
3. `ACTIVE_PROFILE.md`
4. the profile documents referenced there
5. the current `ResearchOutput`

## Own

- one winning direction
- working title
- category / format / user value / depth / timing
- core thesis
- save reason
- slide outline

## Do

- choose one angle only
- reject broad, generic, or evidence-thin plans
- use angle-mining sidecars only when multiple credible directions compete
- preserve the strongest evidence from research

## Do Not Own

- raw source normalization
- publishable drafting
- final approval
- design handoff

## Return

Return one of:

- a valid `AnalyzeOutput`
- a reroute target for `refine`
- a clear stop recommendation
