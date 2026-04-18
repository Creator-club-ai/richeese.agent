# review

Use `.codex/skills/content-os-reviewer/SKILL.md`.

Return a `ReviewOutput`.

Use an existing draft from `content/instagram/drafts/` or `content/magazine/drafts/`, together with the originating brief in `content/ideas/` and any needed supporting research or wiki notes.

Do not rewrite the draft, re-plan, or re-research. Reviewer emits a verdict (`pass` | `fix` | `revise`) with concrete line edits (`fix`) or revise instructions (`revise`) only.

When `pass`, ask the user before copying to the matching `content/.../published/<slug>.md` path.
