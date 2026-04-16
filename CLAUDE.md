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

Active v0 skills:

- `content-os-news`
- `content-os-research`
- `content-os-planner`
- `content-os-writer`

Compatibility notes:

- `AGENTS.md` is the Codex-style wrapper.
- `CLAUDE.md` is the Claude-style wrapper.
- Claude reads `.claude/*`.
- Codex reads `.codex/*`.
- Keep both runtime folders synchronized when changing shared policy or skills.
- Commands may exist as aliases, but they must stay thin wrappers.

Do not duplicate substantive workflow policy here.
Edit the relevant runtime shared core first, then refresh the matching wrapper.
