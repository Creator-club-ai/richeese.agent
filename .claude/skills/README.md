# Content OS Skills

Version 1 has five skills:

```text
.claude/skills/content-os-news/
.claude/skills/content-os-research/
.claude/skills/content-os-planner/
.claude/skills/content-os-writer/
.claude/skills/content-os-reviewer/
```

## Flow

```text
content-os-news -> content-os-research -> content-os-planner -> content-os-writer -> content-os-reviewer
```

Run one skill at a time unless the user explicitly asks for the next step.

Artifacts land in the Obsidian vault following the folder conventions in `.claude/shared/runtime-architecture.md`. Frontmatter schemas per phase live in `.claude/shared/phase-contracts.md`.

## Skills

- `content-os-news` — scrape and shortlist signals, write `01 Daily Brief/<date>.md` with 5-axis hints and a checkbox per signal.
- `content-os-research` — deep-research one selected signal, update `06 Wiki/`, save `05 Sources/` raw, emit `03 Workshop/<slug>/research.md`.
- `content-os-planner` — turn research into an editorial brief with 5-axis locked in; emit `03 Workshop/<slug>/plan.md`.
- `content-os-writer` — turn the plan into slide copy respecting the tone split; emit `03 Workshop/<slug>/draft.md`.
- `content-os-reviewer` — gate the draft against BRAND_GUIDE + CONTENT_STRATEGY; emit `03 Workshop/<slug>/review.md` with verdict `pass | fix | revise`.

## Install

Skills must live in `~/.claude/skills/` to be callable from the Obsidian vault. Run:

```bash
bash scripts/install_skills.sh
```

Re-run whenever a SKILL.md or references/ file changes.

## Source Adapters

Keep `scripts/signal_adapters/`. They are intentionally split by platform. RSS, X, YouTube, Threads, and Naver fail in different ways and need separate parsing logic.
