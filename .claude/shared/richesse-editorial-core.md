# Content OS Core

This repository is a skill-bundle-first Content OS.

Version 0 has four public skills only:

- `content-os-news`
- `content-os-research`
- `content-os-planner`
- `content-os-writer`

The default flow is:

```text
content-os-news -> content-os-research -> content-os-planner -> content-os-writer
```

Run one skill at a time unless the user explicitly asks to continue.

## Product Surface

- `content-os-news` scrapes and shortlists current signals from configured sources.
- `content-os-research` deep-researches one selected signal or direct source.
- `content-os-planner` turns research into one content plan.
- `content-os-writer` turns an approved plan into publishable copy.

Not in v0:

- Head runner
- gate/review desk
- repair/refine desk
- designer handoff
- mandatory memory
- mandatory artifacts
- global runtime or CLI

Compatibility aliases may exist in older prompts, but the active surface is the four skills above.

## Output Language

- Editorial outputs should follow the active profile.
- For `richesse-club`, editorial outputs should be Korean unless the user asks otherwise.
- Code paths, file names, URLs, proper nouns, and source titles should remain literal.

## Calling Model

- Users may invoke any of the four skills by natural language or command wrapper.
- Commands are allowed as aliases; they must not become a runtime harness.
- Do not imply that the full chain must run automatically.
- Stop at a useful checkpoint and name the next skill.

## Read Order

1. `ACTIVE_PROFILE.md`
2. the profile documents referenced there
3. this file
4. `.claude/shared/runtime-architecture.md`
5. `.claude/shared/phase-contracts.md`
6. `.claude/skills/README.md`
7. the selected `.claude/skills/*/SKILL.md`
8. the user request
9. source material only when the current run needs it

## Source Adapters

Keep `scripts/signal_adapters/`.

They are intentionally split by platform because RSS, X, YouTube, Threads, Naver, and other sources fail in different ways.

Adapters own collection and normalization only. They do not own deep research, planning, copywriting, review, repair, or publishing decisions.

## Storage Rules

Storage is optional infrastructure.

Use the active profile's Obsidian vault only when the run benefits from durable state or the user asks for files.

Primary optional locations:

- `raw/` for immutable source snapshots
- the profile-defined latest-signals folder for discovery outputs
- `wiki/` for reusable knowledge
- `wiki/editorial-memory/` for adaptive memory
- `content/instagram/` for working cards

Do not create extra project-root planning files by default.

## Stop Conditions

Stop when:

- the source is too weak
- fact risk remains critical after serious research
- the plan is generic or off-brand
- the approved plan is missing
- the user explicitly requests manual mode

Otherwise complete the requested skill and name the next step.

## Sync Rule

When the operating model changes:

1. edit this file first
2. update `.claude/shared/phase-contracts.md` if the public contracts changed
3. update `AGENTS.md` and `CLAUDE.md` in the same work
4. update `.claude/skills/README.md` and affected `.claude/skills/*/SKILL.md` files
