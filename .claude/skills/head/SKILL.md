---
name: head
description: Use when the user wants richesse.club content work automated from source to planning to copy, wants autopilot with editorial memory, or calls for a role-based execution model such as head, research desk, strategy desk, copy desk, design desk, or memory ops. The head routes inputs through morning-brew/source-intake/content-planner/editor, uses sidecar reviewers when useful, logs verdicts to editorial memory, and stops with a strong plan plus finished slide copy unless design handoff is explicitly requested.
---

# Head

## Purpose

`head` is the orchestration layer for richesse.club.
It does not replace the existing stage skills. It orchestrates them.

The public workflow label may still be `PDCA` for command compatibility, but the operating semantics are closer to `PDSA`:

- plan
- do
- study
- act

The important difference is that the review phase is evidence-based study, not a shallow checklist pass.

The goal is:

1. route the input to the right starting point
2. move through source-intake, planning, and copy automatically
3. read and update editorial memory before and after the run
4. stop with a strong plan plus finished slide copy unless design handoff is explicitly requested

## Read First

1. `brands/richesse-club/BRAND_GUIDE.md`
2. `brands/richesse-club/CONTENT_STRATEGY.md`
3. `python scripts/editorial_memory.py snapshot`
4. the user request
5. only the source material needed for the current run

If `BRAND_GUIDE.md` conflicts with editorial memory, the brand guide wins.

## Default Mode

- Default mode is `planning-and-copy autopilot`.
- Do not stop for approval between major stages until the `editor` final is ready, unless one of the stop conditions fires.
- Save intermediate system memory automatically to Obsidian.
- Keep the final answer concise and operational.
- `designer` is outside the default loop and should run only on explicit handoff request.

## Model Policy

Use model tiers by role, not by stage count.

- **Head / orchestrator / final decision-maker**: use `gpt-5.4`
  - default reasoning: `high`
  - raise to `xhigh` when the source is ambiguous, the angle is high-stakes, or the routing decision is unclear
- **Planner-side critical sidecars**: use `gpt-5.4`
  - `Angle Miner A`
  - `Angle Miner B`
  - `Brand Judge` when needed
  - default reasoning: `high`
- **Review sidecars**:
  - `Copy Critic`: `gpt-5.4` or `gpt-5.4-mini`
  - `Fact Risk Auditor`: prefer `gpt-5.4`
  - default reasoning: `medium` for routine checks, `high` when claims are dense or risky
- **Cheap pattern scans / formatting / extraction**: use `gpt-5.4-mini`
  - default reasoning: `medium`

Practical rule:

- one strong head, small number of focused sidecars
- do not spend frontier-model budget on low-signal extraction work
- do not let mini models make the final brand-fit decision

## Downshift Policy

Not every task needs the head.

Use `gpt-5.4-mini medium` for:

- frontmatter cleanup
- formatting normalization
- section extraction
- tag suggestion
- transcript cleanup
- memory log append / refresh
- simple summary of an already-approved card

Use `gpt-5.4-mini high` for:

- one-source intake compression
- structured extraction from a long raw source
- turning an existing plan into a cleaner outline without changing the angle
- scanning old cards for repeated patterns

Use `gpt-5.4 high` for:

- choosing the final angle
- deciding whether a topic is on-brand
- routing a failure back to the right phase
- rewriting hooks and body copy that affect publish quality
- fact-risk review when claims are central to the post

Use `gpt-5.4 xhigh` only for:

- ambiguous source material with multiple plausible angles
- high-stakes route decisions where the wrong phase loop would waste time
- final approval on structurally strong but still suspiciously generic work
- contradictions between brand guide, editorial memory, and current request

If in doubt:

- extraction and admin work go down
- judgment and direction stay up

## Organization Model

Treat the workflow like a lean editorial company.

- `Head`: overall brain and final decision-maker
- `Research Desk`: signal collection and source packet building
- `Strategy Desk`: content planning and angle selection
- `Copy Desk`: slide headline/body writing
- `Risk Desk`: fact-risk and weak-point review
- `Design Desk`: design handoff and visual direction, optional unless explicitly requested
- `Memory Ops`: editorial memory upkeep and pattern refresh

The head can call the desks. The desks do not outrank the head.
The desks are internal execution roles. `head` is the primary public entry point.

Read `references/role-matrix.md` for role-to-model mapping.
Read `references/runtime-policy.md` for Codex-first runtime policy.
Read `references/decision-table.md` for spawn and escalation rules.

## Start Routing

Use this routing table first.

- latest signals / 오늘의 뉴스 / RSS request -> `morning-brew`
- YouTube URL / article URL / X post / memo / transcript / pasted raw source -> `source-intake`
- approved source packet or explicit planning request -> `content-planner`
- existing approved plan or direct copy request -> `editor`
- approved copy plus explicit design handoff request -> `designer`

Never route raw source directly to `content-planner`.

## End-to-End Workflow

### 1. Memory Snapshot

Run:

```bash
python scripts/editorial_memory.py snapshot
```

Use the snapshot as adaptive context:

- approval patterns
- rejection patterns
- routing pressure
- top outcome signals

### 2. Plan

Move the request into the correct start stage and complete that stage fully.

For source work:
- create or update the append-only `raw/` snapshot
- finish wiki ingest
- extract clear usable points and direction cues

For planning:
- produce one sharp direction only
- fill `Working Title / Category / Format / User Value / Depth / Timing / Core Thesis / Save Reason`
- create a 4-11 slide structure
- keep the result directly writable by `editor`

### 3. Do

Write the carousel copy in the existing richesse.club structure.

- compress hard
- protect save value
- avoid self-help drift
- avoid generic startup inspiration language
- prefer short, high-pressure cover headlines over explanatory cover lines

### 4. Study

Before moving forward, review the output against `references/review-rubric.md`.

If the task is substantial or the source is ambiguous, use sidecars:

- `Angle Miner A`: one evidence-backed angle focused on save value
- `Angle Miner B`: one evidence-backed angle focused on brand distinctiveness
- `Copy Critic`: attack weak hooks, generic framing, flat body copy, and overexplained covers
- `Fact Risk Auditor`: isolate unsupported numbers, quotes, and strong claims

Sidecar rules:

- use at most 2 parallel angle miners during planning
- use at most 2 review sidecars during copy checks
- the main agent makes the final route decision
- do not ask sidecars to own the whole run
- keep the head on `gpt-5.4 high/xhigh`; lower-value sidecars may use `gpt-5.4-mini medium`

### 5. Act

Route failures by root cause.

- weak source / unsupported claim / missing proof -> back to `source-intake`
- broad angle / weak save reason / generic framing -> back to `content-planner`
- weak hook / bloated body / repetitive slide logic / overexplained cover -> back to `editor`
- visual hierarchy or design-tone issues -> hold for optional `designer` handoff, not default continuation

Do not use generic "try again" loops.
Always route to the phase that can actually fix the problem.

### 6. Memory Writeback

After each major phase, log the verdict.

```bash
python scripts/editorial_memory.py log --title "..." --stage planner --verdict approved --score 0.82 --category Business --pattern 정리형 --tags sharp-angle,strong-save-value --route editor
```

At the end of the run, rebuild memory artifacts:

```bash
python scripts/editorial_memory.py refresh
```

## Save Rules

- system memory goes to `wiki/editorial-memory/`
- working cards stay in `content/instagram/`
- source snapshots stay in `raw/`
- `final_report.md` remains the default project-root artifact only when design handoff is explicitly requested

## Stop Conditions

Stop only if one of these is true:

- the source is too weak to support a richesse.club post
- fact risk is still critical after one repair pass
- the angle is off-brand and no strong revision path exists
- editorial memory strongly matches rejected patterns
- the draft still feels generic or low-pressure after one serious revision pass
- the user explicitly asks to switch back to manual mode

Otherwise, continue the loop automatically through `editor`, then stop with the planning final and copy final ready for review.
