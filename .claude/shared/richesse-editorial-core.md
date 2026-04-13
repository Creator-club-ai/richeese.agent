# Richesse Editorial Core

This file is the canonical operating model for the repository.

## Product Surface

- `head` is the primary runner.
- `research -> analyze -> write -> review -> refine` are the public phase labels.
- `designer` is outside the default loop and runs only on explicit handoff.
- Legacy desks remain internal execution layers under `.claude/agents/`.
- Legacy stage skills remain internal execution wrappers under `.claude/skills/`.

## Calling Model

- In Codex-style runtimes, users normally call the system with natural language such as `Head로 이 주제 research부터 review까지 진행해줘`.
- In Claude-style runtimes, `.claude/commands/*.md` provide command sugar for the same public surface.
- `head` and the public phases are the only user-facing runtime concepts that should feel first-class.
- Internal desks, sidecars, and legacy stage wrappers should not be presented as the default entrypoint.

## Read Order

1. `ACTIVE_PROFILE.md`
2. the profile documents referenced there
3. this file
4. `.claude/shared/phase-contracts.md`
5. `.claude/skills/head/SKILL.md`
6. the user request
7. source material only when the current run needs it

## Ownership

- Shared core owns substantive policy.
- `AGENTS.md` and `CLAUDE.md` are wrappers only.
- `head` owns orchestration behavior.
- Public phase skills own handoff semantics.
- Legacy stage skills and desk prompts own focused execution.
- Commands are entrypoint sugar only.

## Surface Taxonomy

Keep the stack explicit:

- public orchestrator: `head`
- public phases: `research`, `analyze`, `write`, `review`, `refine`
- internal desks: `.claude/agents/*.md`
- internal legacy execution wrappers: `morning-brew`, `source-intake`, `content-planner`, `editor`, `wiki`
- no deprecated orchestration aliases by default

If a name does not belong to the first two layers, it should not be treated as a default user-facing runtime surface.

## Operating Identity

Act like the editorial operator for the active profile.

The system should behave like a lean editorial company:

- `Head` owns routing, integration, gates, and the final call.
- `research` is the evidence phase.
- `analyze` is the planning phase.
- `write` is the drafting phase.
- `review` is the quality gate.
- `refine` is the targeted repair phase.
- `designer` is optional production handoff.

## Phase Map

| Public phase | Internal execution |
| --- | --- |
| `research` | `morning-brew`, `source-intake`, `wiki`, `research-desk`, `memory-ops` |
| `analyze` | `content-planner`, `strategy-desk`, optional angle-mining sidecars |
| `write` | `editor`, `copy-desk`, optional copy-critic sidecar |
| `review` | `risk-desk`, `copy-desk` in critic mode, `memory-ops` |
| `refine` | reroute to `source-intake`, `content-planner`, or `editor` by cause |

## Subagent Dispatch Rule

Absorb the useful part of the second-claude-code model:

- `head` is the orchestrator, not the main hands-on worker.
- Most non-trivial execution should be dispatched to internal desks or sidecars.
- `head` keeps the routing, gate, and integration logic.
- Desks do focused execution and return structured outputs.
- Sidecars attack ambiguity, weak hooks, and fact risk; they do not own the full run.

Practical rule:

- If a task is trivial, `head` may do it inline.
- If a task is non-trivial, `head` should prefer dispatch.
- If there is disagreement between subagents, `head` makes the final call.

## Default Loop

The default loop is:

`head -> research -> analyze -> write -> review -> [refine if needed]`

Use `designer` only after the copy is approved and the user explicitly wants production handoff.

## Routing Rules

- latest signals / RSS / "today's signals" requests start at `research` via `morning-brew`
- YouTube URL, article URL, X post, transcript, memo, pasted source, and selected signals start at `research` via `source-intake`
- do not send raw source directly to `analyze`
- `analyze` must choose one angle only
- `write` must consume an approved plan, not raw source
- `review` can approve, reroute, or block
- `refine` repairs the failing layer instead of restarting the full loop

## Storage Rules

Use the Obsidian vault as the system state layer.

Primary locations:

- `raw/` for immutable source snapshots
- the profile-defined latest-signals folder for morning-brew outputs
- `wiki/` for reusable knowledge
- `wiki/editorial-memory/` for adaptive memory
- `wiki/editorial-memory/head-artifacts/` for phase handoff artifacts and templates
- `content/instagram/` for working cards

Do not create extra project-root planning files by default.
Before design handoff, the only default project-root artifact is `final_report.md`.

## Memory Rules

- `head` should read `python scripts/editorial_memory.py snapshot` before a substantial run.
- Log verdicts when a phase meaningfully completes.
- Run `python scripts/editorial_memory.py refresh` at the end of a completed loop or a meaningful stop.

## Stop Conditions

Stop when:

- the source is too weak
- fact risk remains critical after one serious repair pass
- the angle remains generic or off-brand
- editorial memory strongly matches rejected patterns
- the user explicitly requests manual mode

Otherwise keep moving through the public phases.

## final_report.md Contract

Use `final_report.md` only for explicit design handoff.

Minimum sections:

- `Topic`
- `Category`
- `Format`
- `User Value`
- `Depth`
- `Timing`
- `Core Angle`
- `Why Now`
- `Slide Outline`
- `Slide Copy`
- `Design Notes`
- `Risks or Source Limits`

`Design Notes` should be production guidance, not abstract mood text.

## Sync Rule

When the operating model changes:

1. edit this file first
2. update `.claude/shared/phase-contracts.md` if the public contracts changed
3. update `AGENTS.md` and `CLAUDE.md` in the same work
4. update `head` and any affected phase wrappers
