# ReviewOutput

Purpose:

- gate a draft against richesse.club brand rules before publishing

Required fields:

- `Verdict` (`pass` | `fix` | `revise`)
- `Axes Coherence` (pass|fail + note)
- `Tone` (pass|fail + note)
- `Anti-richesse Check` (pass|fail + note)
- `Source-backed Check` (pass|fail + note)
- `Value Focus` (pass|fail + note)
- `Next Step`

Required when `Verdict = fix`:

- `Line Edits` — concrete before/after for each offending line

Required when `Verdict = revise`:

- `Revise Instructions` — which prior phase to re-run (`content-os-writer` | `content-os-planner` | `content-os-research`) and why

Next Step values:

- `publish` (only when `Verdict = pass`)
- `edit draft and re-review`
- `back to planner`
- `back to research`

Boundary:

- Reviewer does not rewrite the draft.
- Reviewer does not silently publish. Always ask the user before copying into the matching `content/.../published/` folder.
