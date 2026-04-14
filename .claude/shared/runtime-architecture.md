# Runtime Architecture

This document is the repository skeleton for the editorial runtime.

Use it before changing orchestration, memory semantics, artifact contracts, or test coverage.

## Goal

Keep the runtime stable by making the layer boundaries explicit.

The recurring failure mode in this repo has been policy and infrastructure drifting apart:

- public docs promise one workflow
- scripts implement a narrower or different workflow
- tests only cover the happy path
- memory logs blur "captured" with "approved"

This document is the guardrail against that drift.

## Layers

### 1. Policy Layer

Owns product behavior and editorial rules.

- `ACTIVE_PROFILE.md`
- `brands/*/BRAND_GUIDE.md`
- `brands/*/CONTENT_STRATEGY.md`
- `.claude/shared/richesse-editorial-core.md`
- `.claude/shared/phase-contracts.md`

This layer answers:

- what the public phases are
- what each phase must output
- what should stop the run
- what design handoff means

### 2. Architecture Layer

Owns implementation boundaries and invariants.

- `.claude/shared/runtime-architecture.md`

This layer answers:

- which script owns which concern
- how requested CLI modes resolve into actual execution modes
- how artifacts are named
- how memory events are classified
- which tests are mandatory when changing the skeleton

### 3. Runtime Infrastructure Layer

Owns reusable runtime primitives.

- `scripts/profile_runtime.py`
- `scripts/editorial_memory.py`
- `scripts/phase_artifacts.py`

Responsibilities:

- resolve the active profile and storage overlay
- write memory artifacts into the vault
- emit phase artifact files that match public contracts

These scripts must stay generic. They should not embed phase-specific editorial judgment.

### 4. Orchestration Layer

Owns request routing and minimal automation assembly.

- `scripts/run_head_cycle.py`
- `.claude/skills/head/SKILL.md`

Responsibilities:

- resolve requested mode into a concrete run mode
- run the cheapest valid automation step
- synthesize public artifacts from leaf outputs
- log capture events and refresh memory
- stop before pretending the whole loop is complete

### 5. Leaf Automation Layer

Owns narrow extraction or collection tasks.

- `scripts/fetch_and_curate.py`
- `scripts/get_transcript.py`
- `scripts/signal_adapters/*.py`

Responsibilities:

- collect raw feed shortlist or transcript text
- emit narrow machine-usable output
- never claim to satisfy higher-phase contracts on their own

Recommended shape for discovery collectors:

- one thin entry script such as `fetch_and_curate.py`
- platform-specific adapter modules under `scripts/signal_adapters/`
- shared normalization helpers reused across discovery and evidence intake

These scripts are inputs to Head, not substitutes for Head.

### 6. Test Layer

Owns structural regression checks.

- `tests/test_runtime_contracts.py`

Responsibilities:

- cover the default path, not just explicit happy-path flags
- verify contract names and artifact scaffolds
- verify memory semantics when they affect approval signals

## Signal Pipeline

This repository should treat multi-source signal reading as a reusable pipeline, not as one monolithic collector script.

The default editorial loop starts at `research`.

`morning-brew` may exist as an optional discovery utility ahead of that loop, but it is not a required public phase.

When runtime code needs a concrete execution label for that discovery path, use `signals` as the canonical run mode and treat `brew` as a legacy alias only.

### Roles

- source adapters
  - platform-specific readers such as RSS, Google News, YouTube, X, Threads, and Naver
  - responsibility: fetch and normalize raw items into a common signal shape
- `morning-brew`
  - optional discovery utility
  - responsibility: read broadly, score heat/relevance/fit, and output a shortlist for user selection
- `research`
  - source normalizer and evidence builder
  - responsibility: take one chosen signal or one direct source and turn it into a `ResearchOutput`
- `analyze`
  - angle selector only
  - responsibility: choose the content direction from evidence that already exists

### Rule

If a concern depends on reading many candidate sources and deciding what is worth escalating, it belongs to `morning-brew`.

If a concern depends on turning one chosen signal or one direct source into usable evidence, it belongs to `research`.

If a concern depends on deciding thesis, save reason, or slide direction, it belongs to `analyze`.

`analyze` should never fetch raw platform signals directly.

### Reuse Boundary

Reuse should happen through shared signal schema and scoring helpers, not by letting every phase call every collector.

Good reuse:

- `morning-brew` and `research` share `scripts/signal_adapters/common.py` and the common signal schema
- `research` can reuse a shortlisted signal or scoring context from `morning-brew`
- direct-source intake can reuse the same normalized signal shape
- platform-specific collectors stay in `scripts/signal_adapters/*.py`, while evidence-building stays under `research` / `research-desk`

Bad reuse:

- `analyze` reaching back into raw feeds
- platform adapters deciding editorial angle
- one giant script owning collection, scoring, evidence synthesis, and planning at once

### Discovery Boundary

The intended shape is:

- optional discovery: `morning-brew`
- core loop start: `research`

Good paths:

- `morning-brew -> user picks one signal -> research -> analyze`
- `direct source -> research -> analyze`

Bad path:

- `morning-brew -> analyze`

`morning-brew` may help select what to escalate, but it should not replace the evidence-building responsibility of `research`.


## Core Invariants

These rules should remain true after every change.

### Invariant 1: requested mode is not execution mode

`auto` is a request, not a concrete runtime mode.

Before any work starts, Head must resolve:

- `auto` + no source ref -> `signals`
- `auto` + source ref -> `direct`
- explicit `signals` -> `signals`
- explicit `brew` -> `signals` (legacy alias only)
- explicit `direct` -> `direct`

Anything downstream of that resolution should operate on the concrete run mode.

### Invariant 2: leaf scripts do not own public contracts

Leaf scripts may emit:

- JSON shortlist
- raw transcript markdown
- narrow extraction artifacts

Only Head may convert those into public phase artifacts such as `ResearchOutput`.

### Invariant 3: artifact types must match public contracts exactly

The artifact names are:

- `ResearchOutput`
- `AnalyzeOutput`
- `WriteOutput`
- `ReviewVerdict`
- `RepairRequest`

Do not invent nearby names like `ReviewOutput` or `RefineOutput`.

### Invariant 4: capture is not approval

Memory logs must distinguish between:

- capture events: `captured`
- gate outcomes: `approved`, `revise`, `rejected`, `published`

Only gate outcomes should feed approval/rejection pattern summaries.

### Invariant 5: default path must be tested

If the public runtime says "run Head normally", tests must cover the default path that users actually hit.

Explicit-flag-only tests are not enough.

## Script Ownership

### `scripts/profile_runtime.py`

Owns:

- active profile resolution
- vault path resolution
- runtime directory mapping

Must not own:

- orchestration decisions
- memory scoring
- artifact judgment

### `scripts/editorial_memory.py`

Owns:

- log append
- snapshot synthesis
- refresh outputs

Must not own:

- public phase routing
- contract synthesis

### `scripts/phase_artifacts.py`

Owns:

- run directory creation
- public artifact writing
- phase template scaffolding

Must not own:

- phase decisions
- memory verdict selection

### `scripts/run_head_cycle.py`

Owns:

- run-mode resolution
- minimal routing
- leaf automation calls
- ResearchOutput synthesis from leaf results
- capture-event logging

Must not own:

- editorial policy
- brand rules
- claim truth beyond shallow synthesis

## Change Checklist

When changing the runtime skeleton:

1. update the policy doc if behavior changed
2. update this architecture doc if boundaries changed
3. update scripts
4. update tests for the default path and the changed invariant
5. run `python -m unittest -v`
6. if that misses tests, fix discovery instead of accepting the gap

## Test Entry Point

The baseline command is:

```bash
python -m unittest -v
```

If that does not discover the runtime tests, the repository skeleton is broken and should be fixed before relying on the suite.
