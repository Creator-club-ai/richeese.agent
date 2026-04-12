---
description: Run richesse editorial PDCA end-to-end with memory
argument-hint: [source, URL, idea, or task]
---

Run the richesse.club editorial PDCA workflow end-to-end for: $ARGUMENTS

Use `.claude/skills/head/SKILL.md` as the main workflow.

Requirements:

- Read `brands/richesse-club/BRAND_GUIDE.md`
- Read `brands/richesse-club/CONTENT_STRATEGY.md`
- Run `python scripts/editorial_memory.py snapshot` before acting
- Route the task to the correct starting stage
- Proceed automatically through source-intake, planning, and copy unless there is a critical blocker or memory blocker
- Use sub-agents only as sidecars for angle generation or review, not as full-run owners
- After each major stage, log the verdict with `python scripts/editorial_memory.py log ...`
- At the end, run `python scripts/editorial_memory.py refresh`
- Stop after the final content plan and slide copy are ready unless design handoff is explicitly requested
