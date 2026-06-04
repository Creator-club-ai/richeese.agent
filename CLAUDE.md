# CLAUDE.md

This wrapper stays thin by design.

The shared Content OS model lives in:

- `.claude/shared/richesse-editorial-core.md`
- `.claude/shared/runtime-architecture.md`
- `.claude/shared/phase-contracts.md`
- `.claude/skills/README.md`

Read order for any run:

1. `ACTIVE_PROFILE.md`
2. the profile documents referenced there
3. `.claude/shared/richesse-editorial-core.md`
4. `.claude/shared/runtime-architecture.md`
5. `.claude/shared/phase-contracts.md`
6. `.claude/skills/README.md`
7. the selected `.claude/skills/*/SKILL.md`
8. the user request
9. relevant source material only if the current run needs it

Active v1 skills:

- `content-os-news`
- `content-os-research`
- `content-os-planner`
- `content-os-writer`
- `content-os-reviewer`

Skills install to `~/.claude/skills/` via `scripts/install_skills.sh` so they are callable from the Obsidian vault (the workspace).

Runtime notes:

- This repo is Claude-only. Claude reads `.claude/*`; `CLAUDE.md` is the single wrapper.
- The Codex runtime (`.codex/*`, `AGENTS.md`) has been removed — do not reintroduce it.
- The live editorial system runs in the `richesse-obsidian` vault. This repo is the skill
  source: skills install from here into `~/.claude/skills/` via `scripts/install_skills.sh`.
- Commands may exist as aliases, but they must stay thin wrappers.

Do not duplicate substantive workflow policy here.
Edit the relevant runtime shared core first, then refresh the matching wrapper.
