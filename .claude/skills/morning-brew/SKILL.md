---
name: morning-brew
description: This skill should be used when Head or the public `research` phase needs feed scanning, signal triage, or latest-signals intake for the active profile. It is an internal execution block, not the default public product surface.
---

# Morning Brew

## Role

`morning-brew` is an internal latest-signals execution block under the public `research` phase.

Use it to scan feeds quickly, filter for the active profile, and return a shortlist that `research` can turn into a valid `ResearchOutput`.

## Read First

1. `.claude/shared/richesse-editorial-core.md`
2. `ACTIVE_PROFILE.md`
3. the profile documents referenced there
4. the current request, if one exists

## Run

```bash
python scripts/fetch_and_curate.py
```

## Own

- feed scanning
- candidate filtering
- system-owned latest-signals artifacts
- shortlist strength labeling

## Do

- prefer signals with power, incentives, numbers, strategic implications, or hard movement
- filter out soft, generic, or obviously off-profile items
- save only system-owned signal artifacts that the current runtime supports
- stop after returning a shortlist or a clear "nothing strong enough" outcome

## Do Not Own

- deep source normalization
- final angle selection
- publishable drafting
- final stop/go decisions for the full run

## Return

Return one of:

- a shortlist strong enough for `research` to convert into `ResearchOutput`
- a clear stop recommendation
