# Content OS Skills

Version 0 has four skills only.

Claude should read these four project skills:

```text
.claude/skills/content-os-news/
.claude/skills/content-os-research/
.claude/skills/content-os-planner/
.claude/skills/content-os-writer/
```

## Flow

```text
content-os-news -> content-os-research -> content-os-planner -> content-os-writer
```

Run one skill at a time unless the user explicitly asks for the next step.

## Skills

- `content-os-news`: scrape and shortlist signals from configured sources.
- `content-os-research`: deep-research one selected signal or direct source.
- `content-os-planner`: turn research into one content plan.
- `content-os-writer`: turn an approved plan into publishable copy.

## What Is Not In V0

- Head runner
- gate/review skill
- repair skill
- designer handoff
- mandatory memory
- mandatory artifacts
- global runtime or CLI

## Source Adapters

Keep `scripts/signal_adapters/`.

They are intentionally split by platform. RSS, X, YouTube, Threads, and Naver fail in different ways and need separate parsing logic.
