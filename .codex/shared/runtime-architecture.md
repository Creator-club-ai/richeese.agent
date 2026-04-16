# Skill Bundle Architecture

This repository is now a thin Content OS skill bundle.

Use this document before changing skill boundaries, source adapters, optional memory, artifact contracts, or tests.

## Goal

Keep the usable surface small:

```text
content-os-news -> content-os-research -> content-os-planner -> content-os-writer
```

No Head runner harness is required.

## Layers

### 1. Policy Layer

Owns product behavior and editorial rules.

- `ACTIVE_PROFILE.md`
- `brands/*/BRAND_GUIDE.md`
- `brands/*/CONTENT_STRATEGY.md`
- `.codex/shared/richesse-editorial-core.md`
- `.codex/shared/phase-contracts.md`
- `.codex/skills/README.md`

### 2. Public Skill Layer

Owns the active user-facing workflow.

- `.codex/skills/content-os-news/SKILL.md`
- `.codex/skills/content-os-research/SKILL.md`
- `.codex/skills/content-os-planner/SKILL.md`
- `.codex/skills/content-os-writer/SKILL.md`

### 3. Command Alias Layer

Owns thin shortcuts only.

- `.codex/commands/news.md`
- `.codex/commands/research.md`
- `.codex/commands/plan.md`
- `.codex/commands/write.md`

Command aliases must point to the matching skill and must not carry independent workflow policy.

### 4. Source Adapter Layer

Owns narrow extraction and collection tasks.

- `scripts/fetch_and_curate.py`
- `scripts/get_transcript.py`
- `scripts/signal_adapters/*.py`

Responsibilities:

- collect raw feed candidates
- normalize platform-specific items
- deduplicate and shortlist
- emit narrow machine-usable output

Source catalogs should be project-configurable through `signal_sources_path` in `RUNTIME_PROFILE.md` or the `CONTENT_OS_SIGNAL_SOURCES` environment variable.

Saved latest-signal artifacts must contain only filtered shortlist items, not the raw collected feed dump.

Signal lookback should default to 3 days and stay within 1-4 days unless the project intentionally changes the adapter code.

Adapters must not own deep research, planning, writing, review, repair, or publishing decisions.

### 5. Optional Infrastructure Layer

Owns reusable mechanical helpers.

- `scripts/editorial_memory.py`
- `scripts/phase_artifacts.py`

These scripts are optional. They must not become the product surface.

### 6. Test Layer

Owns structural regression checks.

- `tests/test_runtime_contracts.py`

## Pipeline Rules

- Broad current-signal collection belongs to `content-os-news`.
- One chosen signal or direct source becomes evidence in `content-os-research`.
- Thesis, save reason, and slide/content structure belong to `content-os-planner`.
- Final copy belongs to `content-os-writer`.

Good paths:

- `content-os-news -> user picks one signal -> content-os-research -> content-os-planner -> content-os-writer`
- `direct source -> content-os-research -> content-os-planner -> content-os-writer`

Bad paths:

- source adapter -> planner
- raw source -> writer
- one giant script that collects, researches, plans, writes, reviews, and repairs

## Core Invariants

### Invariant 1: discovery is not evidence

`content-os-news` may produce a shortlist, but that shortlist is not a `ResearchOutput`.

### Invariant 2: adapters do not own public contracts

Leaf scripts may emit raw or normalized source data.

Only the relevant skill converts that data into public handoff contracts.

### Invariant 3: artifact names match v0 contracts

The active v0 artifact names are:

- `SignalShortlist`
- `ResearchOutput`
- `PlanOutput`
- `CopyOutput`

### Invariant 4: capture is not approval

Memory logs must distinguish between:

- capture events: `captured`
- outcome events: `approved`, `revise`, `rejected`, `published`

Only outcome events should feed approval/rejection pattern summaries.

### Invariant 5: commands are wrappers only

Command files may call these skills, but commands must not carry separate workflow policy or become a runtime harness.

## Change Checklist

When changing the skill skeleton:

1. update `.codex/shared/richesse-editorial-core.md` if behavior changed
2. update `.codex/shared/phase-contracts.md` if contracts changed
3. update this architecture document if boundaries changed
4. update the affected skill files
5. update tests for the changed invariant
6. run `python -m unittest -v`
