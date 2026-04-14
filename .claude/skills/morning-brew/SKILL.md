---
name: morning-brew
description: This skill should be used when Head needs an optional discovery pass over latest signals for the active profile before one signal is selected for `research`. It is a discovery utility, not part of the default public loop.
---

# Morning Brew

## Role

`morning-brew` is an optional latest-signals discovery utility that sits ahead of the default public loop.

Use it to scan feeds quickly, filter for the active profile, and return a shortlist that the user can narrow to one signal for `research`.

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
- platform collection through `scripts/signal_adapters/*.py`

## Do

- prefer signals with power, incentives, numbers, strategic implications, or hard movement
- filter out soft, generic, or obviously off-profile items
- save only system-owned signal artifacts that the current runtime supports
- stop after returning a shortlist or a clear "nothing strong enough" outcome
- expect a separate selection step before `research`
- keep normalization/scoring reusable so `research` can inherit the selected signal context later
- default to supporting user selection, not replacing it

## Do Not Own

- deep source normalization
- full evidence packet assembly
- final angle selection
- publishable drafting
- final stop/go decisions for the full run

## Return

Return one of:

- a shortlist strong enough for one signal to be escalated into `research`
- a clear stop recommendation
