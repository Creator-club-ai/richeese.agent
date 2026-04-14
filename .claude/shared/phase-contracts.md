# Phase Contracts

These are the public handoff contracts for:

`research -> analyze -> write -> review -> refine`

The contracts are intentionally lightweight.
They are meant to stabilize handoffs, not force JSON for every run.

## ResearchOutput

Purpose:

- turn one chosen source or one selected signal into usable evidence

Required fields:

- `Topic`
- `Research Depth`
- `Source Inventory`
- `What Happened`
- `Usable Points`
- `Direction Cues`
- `Risks or Gaps`
- `Source Strength`
- `Fact Risk`
- `Recommendation`

Recommendation values:

- `hand off to analyze`
- `stop`

## AnalyzeOutput

Purpose:

- turn evidence into one approved direction only

Required fields:

- `Working Title`
- `Category`
- `Format`
- `User Value`
- `Depth`
- `Timing`
- `Core Thesis`
- `Save Reason`
- `Slide Outline`
- `Selected Angle`
- `Blockers`
- `Angle Status`

Angle status values:

- `approved`
- `route to refine`
- `stop`

## WriteOutput

Purpose:

- turn an approved plan into reviewable copy

Required fields:

- `Working Title`
- `Cover Headline`
- `Slide Copy`
- `Claims`
- `Open Questions`
- `Confidence`
- `Copy Status`

Copy status values:

- `ready for review`
- `route to refine`

## ReviewVerdict

Purpose:

- return a hard gate decision with a reroute target when needed

Required fields:

- `Status`
- `Issues`
- `Severity`
- `Strengths To Preserve`
- `Target Phase`
- `Required Changes`
- `Suggested Patch`

Status values:

- `approve`
- `revise`
- `block`

Target phase values:

- `research`
- `analyze`
- `write`
- `design`
- `none`

## RepairRequest

Purpose:

- repair the failing layer without restarting the whole run

Required fields:

- `Target Phase`
- `Patch`
- `Rationale`
- `Preserve Angle`
- `Next Step`

Next step values:

- `return to review`
- `stop`
