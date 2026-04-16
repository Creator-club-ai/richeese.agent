---
name: content-os-writer
description: Use to turn an approved PlanOutput into publishable or reviewable content copy. Produces CopyOutput only.
---

# Content OS Writer

## Job

Turn an approved plan into content copy.

Use this after `content-os-planner`, or when the user provides an approved plan.

## Read First

1. `ACTIVE_PROFILE.md` if it exists
2. the profile documents referenced there
3. `references/copy-output.md`
4. the approved `PlanOutput`
5. the user request

## Owns

- headline
- body copy
- slide copy or section copy
- claim list
- open questions
- confidence note

## Does Not Own

- source discovery
- deep research
- strategic angle selection
- final review gate

## Rules

- Write from an approved plan, not raw source.
- Treat `PlanOutput` as an editorial brief.
- Preserve the selected topic, selected angle, and selected format.
- Use backup angles only as context; do not silently switch directions.
- Keep claims traceable to the research packet.
- If key facts are missing, mark open questions instead of bluffing.
- Follow the active profile language and voice.

## Output

Return `CopyOutput`.
