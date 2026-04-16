---
name: content-os-research
description: Use to deep-research one selected signal, URL, transcript, memo, or pasted source before planning content. Produces a ResearchOutput only.
---

# Content OS Research

## Job

Turn one selected signal or direct source into usable evidence.

Use this after `content-os-news`, or directly when the user provides a URL, transcript, memo, source packet, or pasted material.

## Read First

1. `ACTIVE_PROFILE.md` if it exists
2. the profile documents referenced there
3. `references/research-output.md`
4. `content-os-schema.md` if it exists
5. `wiki/wiki-schema.md` if it exists
6. a related dossier, brand, people, concept, or signal note if it already exists
7. the selected signal or source material
8. the user request

## Owns

- source normalization
- claim extraction
- source strength judgment
- fact-risk judgment
- usable points
- direction cues

## Does Not Own

- choosing the final content angle
- writing copy
- reviewing copy
- repairing drafts

## Rules

- Research one source or one selected signal at a time unless the user asks otherwise.
- If the source is too weak, stop.
- Keep claims traceable to the source.
- Do not invent facts to fill gaps.
- Use the project's own wiki structure to suggest where this evidence belongs.
- If quotes, recurring themes, or reusable observations stand out, include them.
- Recommend the next step clearly.

## Output

Return `ResearchOutput`.

Next step is usually `content-os-planner`.
