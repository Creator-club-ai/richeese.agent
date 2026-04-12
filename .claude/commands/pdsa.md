---
description: Alias for the richesse editorial PDCA workflow, framed as PDSA
argument-hint: [source, URL, idea, or task]
---

Run the richesse.club editorial workflow for: $ARGUMENTS

Treat this as `PDSA` in operating semantics:

- Plan
- Do
- Study
- Act

Use `.claude/skills/head/SKILL.md` as the source of truth.
Use `.claude/skills/head/references/decision-table.md` for spawn and escalation policy.

Requirements:

- prefer Codex-style full orchestration when available
- keep Claude commands as wrappers
- log verdicts to editorial memory and refresh at the end
- stop after planning plus copy by default; continue to design only on explicit request
