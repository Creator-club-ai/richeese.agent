# Content OS Skills

Version 1 keeps the live vault structure and adds a reviewer gate.

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

Artifacts follow the live vault conventions in `.claude/shared/runtime-architecture.md`.
Phase schemas live in `.claude/shared/phase-contracts.md`.

## Skills

- `content-os-news` — scrape and shortlist fresh signals, write `오늘의 뉴스/<date>.md`, and keep optional machine artifacts alongside it.
- `content-os-research` — deep-research one selected signal, update `raw/` and `wiki/`, and optionally save machine-only artifacts under `wiki/editorial-memory/head-artifacts/`.
- `content-os-planner` — turn research into one editorial brief and emit `content/ideas/<slug>.md`.
- `content-os-writer` — turn the approved brief into copy and emit a draft in `content/instagram/drafts/` or `content/magazine/drafts/`.
- `content-os-reviewer` — gate the draft before publish and emit a review artifact, with pass/fix/revise as the only verdicts.

## Install

Skills must live in `~/.claude/skills/` to be callable from the vault. Run:

```bash
bash scripts/install_skills.sh
```

Re-run whenever a `SKILL.md` or `references/` file changes.

## Source Adapters

Keep `scripts/signal_adapters/`. They are intentionally split by platform because RSS, X, YouTube, Threads, and Naver fail in different ways and need separate parsing logic.
