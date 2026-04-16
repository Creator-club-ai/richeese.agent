# Phase Contracts

These are the public handoff contracts for the four-skill Content OS.

The contracts stabilize handoffs. They do not require JSON or file writing unless the user asks for an artifact.

## SignalShortlist

Owned by `content-os-news`.

Purpose:

- turn configured source scanning into a small set of timely candidates

Required fields:

- `Run Date`
- `Sources Checked`
- `Candidates`
- `Removed As Duplicate`
- `Shortlist`
- `Why These`
- `Risks or Gaps`
- `Recommendation`

Recommendation values:

- `send to content-os-research`
- `skip`

## ResearchOutput

Owned by `content-os-research`.

Purpose:

- turn one chosen signal or one direct source into usable evidence

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

- `send to content-os-planner`
- `stop`

## PlanOutput

Owned by `content-os-planner`.

Purpose:

- turn evidence into one content direction and slide/content plan

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
- `Claims To Preserve`
- `Risks or Gaps`
- `Plan Status`

Plan status values:

- `approved for content-os-writer`
- `needs more research`
- `stop`

## CopyOutput

Owned by `content-os-writer`.

Purpose:

- turn an approved plan into publishable copy

Required fields:

- `Working Title`
- `Cover Headline`
- `Slide Copy`
- `Caption`
- `Claims`
- `Open Questions`
- `Confidence`
- `Copy Status`

Copy status values:

- `publishable`
- `needs user edit`
- `blocked`
