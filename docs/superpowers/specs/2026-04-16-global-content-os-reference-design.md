# Four Skill Content OS Reference Design

Date: 2026-04-16

## Decision

Content OS v0 is a skill bundle, not a runtime harness.

The active surface has four skills:

1. `content-os-news`
2. `content-os-research`
3. `content-os-planner`
4. `content-os-writer`

Default flow:

```text
content-os-news -> content-os-research -> content-os-planner -> content-os-writer
```

Commands may exist as wrappers, but commands must not carry independent workflow policy.

## Keep

- `scripts/fetch_and_curate.py`
- `scripts/get_transcript.py`
- `scripts/signal_adapters/*`
- project-specific source catalogs such as `config/richesse-signal-sources.json`

The signal adapters stay split by platform. RSS, X, YouTube, Threads, Naver, and similar sources need different parsing and failure handling.

Latest-signal artifacts must save only the filtered shortlist, not the raw collected feed dump.

Projects can customize filtering with:

- `signal_sources_path`
- `signal_max_items`
- `signal_lookback_days`
- `signal_allowed_categories`
- `signal_include_keywords`
- `signal_exclude_keywords`

Default lookback should be 3 days. The normal allowed window is 1-4 days so discovery stays timely without becoming a broad archive scrape.

## Remove From V0

- Head runner harness
- global Content OS CLI
- mandatory memory refresh
- mandatory artifact writing
- review/gate desk
- repair/refine desk
- designer handoff
- multi-agent runtime assumptions

These can return later as optional add-ons. They are not needed for the immediate content team workflow.

## Skill Ownership

### `content-os-news`

Owns broad signal discovery.

Inputs:

- configured feeds and adapters
- direct source lists when provided

Outputs:

- `SignalShortlist`
- recommendation to research one selected signal or skip

Does not own:

- deep research
- thesis selection
- copywriting

### `content-os-research`

Owns evidence building for one selected signal or direct source.

Outputs:

- `ResearchOutput`
- recommendation to send to `content-os-planner` or stop

Does not own:

- broad feed scanning
- final angle selection
- copywriting

### `content-os-planner`

Owns the content direction.

Outputs:

- `PlanOutput`
- one thesis
- one save reason
- one slide/content outline

Does not own:

- raw source collection
- final publishable copy

### `content-os-writer`

Owns final draft copy from an approved plan.

Outputs:

- `CopyOutput`
- cover headline
- slide copy
- caption
- claim list

Does not own:

- new research
- plan reshaping unless the user explicitly asks

## Repository Shape

```text
.codex/
  shared/
  skills/
    README.md
    content-os-news/
    content-os-research/
    content-os-planner/
    content-os-writer/

.claude/
  shared/
  skills/
    README.md
    content-os-news/
    content-os-research/
    content-os-planner/
    content-os-writer/

scripts/
  fetch_and_curate.py
  get_transcript.py
  signal_adapters/
```

Codex reads `.codex/*`.

Claude reads `.claude/*`.

Keep the two runtime folders synchronized while avoiding a cross-runtime wrapper dependency.

## Immediate Use

Use the smallest useful next skill:

- Want today's candidates: run `content-os-news`.
- Have one article, X post, YouTube video, transcript, or signal: run `content-os-research`.
- Have research and need a content direction: run `content-os-planner`.
- Have an approved plan and need copy: run `content-os-writer`.
