---
name: content-os-research
description: Use to deep-research one selected signal, URL, transcript, memo, or pasted source before planning content. Produces a ResearchOutput only.
---

# Content OS Research

## Master Source

This skill follows the repository's live operating docs and current wiki structure.

## Job

Turn one selected signal or direct source into usable evidence.

Use this after `content-os-news`, or directly when the user provides a URL, transcript, memo, source packet, or pasted material.

## Read First

1. `AGENTS.md`
2. `content-os-schema.md`
3. `wiki/wiki-schema.md`
4. the most relevant existing wiki note(s)
5. the selected signal or source material
6. the user request

## Owns

- source normalization
- claim extraction
- source strength judgment
- fact-risk judgment
- usable points
- direction cues
- likely wiki routing suggestions

## Does Not Own

- choosing the final content angle
- writing copy
- reviewing copy
- directly turning research into draft copy

## Rules

- Research one source or one selected signal at a time unless the user asks otherwise.
- If the source is too weak, stop.
- Keep claims traceable to the source.
- Do not invent facts to fill gaps.
- Use the project's current wiki structure to suggest where the evidence belongs.
- If quotes, recurring themes, or reusable observations stand out, include them.
- Recommend the next step clearly:
  - planner
  - wikify
  - stop

## Output

Return `ResearchOutput`.
