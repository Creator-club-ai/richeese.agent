# AGENTS.md

This wrapper stays thin by design.

The shared editorial operating model lives in:

- `.claude/shared/richesse-editorial-core.md`
- `.claude/shared/runtime-architecture.md`
- `.claude/shared/phase-contracts.md`
- `.claude/skills/head/SKILL.md`

Read order for any runtime:

1. `ACTIVE_PROFILE.md`
2. the profile documents referenced there
3. `.claude/shared/richesse-editorial-core.md`
4. `.claude/shared/runtime-architecture.md`
5. `.claude/shared/phase-contracts.md`
6. `.claude/skills/head/SKILL.md`
7. the user request
8. relevant source material only if the current run needs it

Compatibility notes:

- `AGENTS.md` is the Codex-style wrapper.
- `CLAUDE.md` is the Claude-style wrapper.
- Both wrappers must point to the same shared core and should never carry independent editorial policy.
- `.claude/commands/*.md` are command surfaces only.
- `.claude/agents/*.md` are internal desk prompts for subagent dispatch.
- In Codex, users should normally invoke `head` or the public phases through natural-language requests.
- In Claude, users may use `.claude/commands/*.md` as wrapper aliases for the same runtime surface.

Graphify:

- If `graphify-out/GRAPH_REPORT.md` exists, read it before answering architecture or codebase questions.
- If `graphify-out/GRAPH_REPORT.md` does not exist, do not block on it.
- After modifying code files, rebuild graphify if the local graphify environment is available.

Do not duplicate substantive workflow policy here.
Edit the shared core first, then refresh both wrappers together.
