---
name: content-os-planner
description: Use to turn a ResearchOutput or approved evidence packet into one editorial brief. Produces a PlanOutput only.
---

# Content OS Planner

## Master Source

This skill follows the repository's live operating docs.
Use the project's own wiki, brand, and review documents as the decision standard.

## Job

Turn evidence into one usable editorial brief.

Use this after `content-os-research`, or when the user provides an already-approved evidence packet.

## Read First

1. `AGENTS.md`
2. `content-os-schema.md`
3. `wiki/concepts/content-type.md`
4. `wiki/editorial-memory/richesse-house-voice.md`
5. `wiki/editorial-memory/instagram-format-playbooks.md`
6. `wiki/editorial-memory/review-rubric.md`
7. `wiki/editorial/briefs/editorial-brief-template.md`
8. the relevant wiki notes already connected to the topic
9. the `ResearchOutput` or evidence packet
10. the user request

## Owns

- topic candidates
- one selected topic
- core fact
- key insights
- angle candidates
- one selected angle
- content type options
- one selected `content_type`
- backup angles
- format options
- one selected format
- tension
- user value
- readability note
- outline
- blockers

## Does Not Own

- source gathering
- deep source validation beyond the provided evidence
- final copywriting
- review and repair

## Workflow

1. Normalize the core fact and the real editorial question.
2. Extract topic candidates.
3. Extract key insights.
4. Generate angle candidates.
5. Select one primary angle and keep backups when useful.
6. Choose the `content_type` that best translates the angle.
7. Choose the format that best translates the angle and `content_type`.
8. Turn the decision into one editorial brief in `wiki/editorial/briefs/`.

## Rules

- Do not hand raw source into planning. Research first.
- Follow the current order:
  - `topic -> insight -> angle -> content_type -> format`
- `content_type` is one of:
  - `news`
  - `list`
  - `organize`
  - `reported`
  - `essay`
- Use the active docs, not old archived docs, as the main standard.
- Keep backup angles alive only when they are still genuinely usable.
- Stop if the evidence packet is too weak.
- Treat the output as an editorial brief, not a generic outline.
- Keep the brief concrete enough that a writer can draft immediately.

## Required Questions

Before finalizing the brief, answer these:

- What is the real topic here?
- What are the strongest insights?
- What tension makes this worth reading?
- Why would someone save this?
- What `content_type` best translates this angle?
- What format best translates this angle?
- What 1-2 backup angles are still alive?

## Quality Bar

The brief is not ready if any of these are missing:

- a clear selected topic
- a clear selected angle
- a clear selected `content_type`
- a real save reason
- a visible tension
- an outline that matches the chosen format

## Output

Return `PlanOutput`.
