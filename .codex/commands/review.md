# review

Use `.codex/skills/content-os-reviewer/SKILL.md`.

Return a `ReviewOutput`.

Use an existing `draft.md` (with its sibling `plan.md` and `research.md`) as input.

Do not rewrite the draft, re-plan, or re-research. Reviewer emits verdict (`pass` | `fix` | `revise`) with concrete line edits (fix) or revise instructions (revise) only.

When `pass`, ask the user before copying to `04 Published/<slug>.md`.
