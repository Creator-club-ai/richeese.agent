# AGENTS.md

This wrapper stays thin by design.

The shared Content OS model lives in:

- `.codex/shared/richesse-editorial-core.md`
- `.codex/shared/runtime-architecture.md`
- `.codex/shared/phase-contracts.md`
- `.codex/skills/README.md`
- `.codex/commands/*.md` as thin aliases only

Read order for any run:

1. `ACTIVE_PROFILE.md`
2. the profile documents referenced there
3. `.codex/shared/richesse-editorial-core.md`
4. `.codex/shared/runtime-architecture.md`
5. `.codex/shared/phase-contracts.md`
6. `.codex/skills/README.md`
7. the selected `.codex/skills/*/SKILL.md`
8. the selected `.codex/commands/*.md`, if invoked
9. the user request
10. relevant source material only if the current run needs it

Active v1 skills:

- `content-os-news`
- `content-os-research`
- `content-os-planner`
- `content-os-writer`
- `content-os-reviewer`

Compatibility notes:

- `AGENTS.md` is the Codex-style wrapper.
- `CLAUDE.md` is the Claude-style wrapper.
- Codex reads `.codex/*`; Claude reads `.claude/*`.
- Keep both runtime folders synchronized when changing shared policy or skills.
- Commands may exist as aliases, but they must stay thin wrappers.

Do not duplicate substantive workflow policy here.
Edit the relevant runtime shared core first, then refresh the matching wrapper.
