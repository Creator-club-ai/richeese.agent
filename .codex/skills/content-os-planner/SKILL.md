---
name: content-os-planner
description: Use to turn a ResearchOutput or reusable wiki context into one editorial brief when the user wants to plan content, pick a topic, choose an angle, decide a format, or turn research into a brief. This is the Decide layer in the content OS. Keep the skill generic and use the project's own content, wiki, brand, and review documents as the main judgment source. Produces a PlanOutput only.
---

# Content OS Planner

## Job

Turn evidence into one usable editorial brief.

Use this after `content-os-research`, or when the user provides an already-approved evidence packet.

This skill owns `Decide`, not `Produce`.

## Read First

1. `ACTIVE_PROFILE.md` if it exists
2. the profile documents referenced there
3. `references/plan-output.md`
4. `content-os-schema.md` if it exists
5. `wiki/wiki-schema.md` if it exists
6. `content/ideas/editorial-brief-template.md` if it exists
7. `wiki/dossiers/README.md` if it exists
8. `wiki/editorial-memory/review-rubric.md` if it exists
9. `wiki/angles/README.md` if it exists
10. `wiki/editorial-memory/approval-signals.md` if it exists
11. the `ResearchOutput` or the already-selected wiki context
12. the user request

## Owns

- topic candidates
- one selected topic
- core fact
- key insights
- angle candidates
- one selected angle
- backup angles
- format options
- one selected format
- core thesis
- save reason
- tension
- slide or section outline
- blockers

## Does Not Own

- source gathering
- deep source validation beyond the provided research packet
- final copywriting
- review and repair

## Workflow

1. Normalize the core fact and the real editorial question.
2. Extract topic candidates.
3. Extract key insights.
4. Generate angle candidates.
5. Select one primary angle and keep backups when useful.
6. Choose the format that best fits the angle.
7. Turn the decision into one editorial brief.

## Rules

- Do not hand raw source into planning. Require research first.
- If the user is explicitly reusing existing wiki context, start from the relevant compiled notes instead of re-running research.
- Do not jump from research straight into draft logic.
- Start with the bigger story, not the headline.
- Extract topic candidates before angle candidates.
- Keep multiple usable insights alive before choosing one primary direction.
- Keep backup angles only when they are still genuinely usable.
- Use the project's own wiki, brand, and review documents as the main decision standard.
- If the input is quotes, interviews, or multiple examples, synthesize the shared idea before picking the angle.
- Treat the output as an editorial brief, not a generic outline.
- Stop if the research packet is too weak.

## Required Questions

Before finalizing the brief, answer these questions:

- What is the real topic here?
- What are the strongest insights that came out of the research?
- What tension or contradiction makes this interesting?
- Why would someone save this?
- What format best translates this angle?
- What 1-2 viable backup angles should be kept alive?

## Quality Bar

The brief is not ready if any of these are missing:

- a clear selected topic
- a clear selected angle
- a real save reason
- a visible tension
- an outline that matches the chosen format

## Output Discipline

- Prefer a planning brief that a writer can immediately execute.
- Keep the brief concrete, not theoretical.
- Preserve good alternate directions as backups instead of deleting them.
- Make the `Outline` reflect the chosen format instead of generating a generic section list.

## Output

Return `PlanOutput`.

Next step is usually `content-os-writer`.
