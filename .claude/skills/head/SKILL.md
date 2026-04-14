---
name: head
description: Use when the user wants active-profile content work run end-to-end, wants one orchestrator to own routing and quality gates, or asks for an agentic workflow with heavy subagent delegation. `head` is the primary runner. It routes work through the public phases `research -> analyze -> write -> review -> refine`, dispatches internal desks for most non-trivial execution, and stops with approved copy unless design handoff is explicitly requested.
---

# Head

## Purpose

`head` is the primary public entrypoint for the repository.

It should behave like the orchestrator in a second-claude-code-style system:

- `head` owns routing
- `head` owns the gates
- `head` owns the final decision
- desks and sidecars do most of the non-trivial execution

`head` is not a generic narrator.
It is the operating brain for the editorial loop.

## Calling Surface

Treat `head` as the only true orchestrator surface.

- In Codex, `head` is normally called through natural-language requests.
- In Claude, `.claude/commands/head.md` is only a wrapper alias for the same surface.
- `research`, `analyze`, `write`, `review`, and `refine` are public phase labels, not separate orchestrators.
- `morning-brew` is an optional discovery utility, not part of the default public loop.
- Internal desks and sidecars should never be presented as the default way to use the system.

## Read First

1. `.claude/shared/richesse-editorial-core.md`
2. `.claude/shared/runtime-architecture.md`
3. `ACTIVE_PROFILE.md`
4. the profile documents referenced there
5. `.claude/shared/phase-contracts.md`
6. `python scripts/editorial_memory.py snapshot`
7. the user request
8. only the source material needed for the current run

## Public Phase Model

The public loop is:

`research -> analyze -> write -> review -> refine`

Phase ownership:

- `research` gathers evidence
- `analyze` chooses one angle
- `write` drafts copy
- `review` gates quality
- `refine` repairs the failing layer

`designer` is not part of the default loop.

## Internal Dispatch Model

Use internal desks for almost all non-trivial execution.

Default mappings:

- `research`
  - `research-desk`
  - `wiki`
  - `memory-ops`
- `analyze`
  - `content-planner`
  - `strategy-desk`
  - optional angle-mining sidecars
- `write`
  - `editor`
  - `copy-desk`
  - optional copy-critic sidecar
- `review`
  - `risk-desk`
  - `copy-desk` in critic mode
  - `memory-ops`
- `refine`
  - reroute to `research-desk`, `content-planner`, or `editor`

Rules:

- do not ask one desk to own the full run
- keep the integration logic in `head`
- prefer dispatch over self-processing once the work becomes non-trivial
- treat phase wrappers as dispatch boundaries, not as independent runtime brains

## Start Routing

- latest signals / RSS / "today's signals" when the user wants discovery first -> `morning-brew`
- selected signal / YouTube URL / article URL / X post / memo / transcript / pasted source -> `research` via `research-desk`
- approved source packet or explicit angle request -> `analyze`
- approved plan or explicit copy request -> `write`
- draft copy or approval gate request -> `review`
- failed review or targeted rewrite request -> `refine`
- design handoff request after approval -> `designer`

Never send raw source directly to `analyze`.
Never let `morning-brew` skip `research` and feed raw shortlist output straight into `analyze`.
Treat shortlist choice as a user decision unless the user explicitly delegates that prioritization.

## Default Operating Loop

### 1. Snapshot

Run:

```bash
python scripts/editorial_memory.py snapshot
```

Use the memory snapshot as adaptive context, not as a replacement for the brand guide.

### 2. Research

Route into the right research path.

- `research-desk` for direct source work
- `research-desk` for one selected signal from `morning-brew`
- use `morning-brew` only when the user explicitly needs a discovery shortlist first
- do not silently auto-pick a morning-brew candidate unless the user asked Head to prioritize on their behalf

The output must satisfy `ResearchOutput`.

### 3. Analyze

Dispatch planning work and force one angle only.

- use `strategy-desk`
- use angle sidecars only when multiple directions compete

The output must satisfy `AnalyzeOutput`.

### 4. Write

Dispatch drafting work.

- use `editor`
- use `copy-desk`
- use copy-sidecars only when the draft is flat, generic, or over-explained

The output must satisfy `WriteOutput`.

### 5. Review

Gate the work.

- use `risk-desk`
- use review sidecars when claims are risky or the copy is suspiciously soft
- return a hard verdict, not vague commentary

The output must satisfy `ReviewVerdict`.

### 6. Refine

Repair only the failing layer.

- reroute to `research`, `analyze`, or `write` by cause
- preserve good work
- return to `review` after the repair unless the run is blocked

The output must satisfy `RepairRequest`.

### 7. Refresh

At the end of a completed run or a meaningful stop:

```bash
python scripts/editorial_memory.py refresh
```

## Sidecar Policy

Use sidecars when they add real signal.

Planning sidecars:

- use at most 2 parallel angle miners
- use them only when more than one plausible angle competes

Review sidecars:

- use at most 2 in one pass
- use them for fact-risk, genericity, hook weakness, or structural flatness

Do not use sidecars as a decorative ritual.

## Stop Conditions

Stop when:

- the source is too weak
- fact risk remains critical after one serious repair pass
- the angle remains generic or off-brand
- memory strongly matches rejected patterns
- the user explicitly requests manual mode

Otherwise keep the loop moving.

## Final State

Default successful end state:

- approved plan
- approved copy
- memory refreshed

Only continue to `designer` when the user explicitly wants handoff.
