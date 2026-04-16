---
name: content-os-research
description: Use to deep-research one selected signal, URL, transcript, memo, or pasted source before planning content. This is the Normalize layer in the content OS. Use after news discovery or when the user provides a direct source that needs normalization into usable evidence. Produces a ResearchOutput only.
---

# Content OS Research

## Job

Turn one selected signal or direct source into usable evidence.

Use this after `content-os-news`, or directly when the user provides a URL, transcript, memo, source packet, or pasted material.

This skill owns `Normalize`, not `Decide`.

## Read First

1. `ACTIVE_PROFILE.md` if it exists
2. the profile documents referenced there
3. `references/research-output.md`
4. `content-os-schema.md` if it exists
5. `wiki/wiki-schema.md` if it exists
6. `wiki/dossiers/README.md` if it exists
7. `wiki/topics/index.md` if it exists
8. a related dossier, brand, people, concept, topic, or signal note if it already exists
9. the selected signal or source material
10. the user request

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
- Keep interpretation light enough that `planner` still has room to decide topic, angle, and format.
- Recommend the next step clearly.

## Output

Return `ResearchOutput`.

Next step is usually `content-os-planner`.
