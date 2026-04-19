---
name: content-os-writer
description: Use to turn an approved editorial brief into publishable or reviewable richesse copy. Produces CopyOutput only.
---

# Content OS Writer

## Master Source

This skill follows the repository's live operating docs.
Do not invent a parallel writing system.

## Job

Turn one approved brief into content copy.

Use this after `content-os-planner`, or when the user provides an already-approved brief in the repository's current structure.

## Read First

1. `AGENTS.md`
2. `content-os-schema.md`
3. `wiki/editorial-memory/richesse-house-voice.md`
4. `wiki/editorial-memory/instagram-format-playbooks.md`
5. `wiki/editorial-memory/review-rubric.md`
6. the approved brief in `wiki/editorial/briefs/`
7. the user request

## Owns

- cover headline
- interpretation line when the brief calls for one
- body copy
- slide copy or section copy
- claim list
- open questions

## Does Not Own

- source discovery
- deep research
- strategic angle selection
- final review gate
- wiki routing

## Workflow

1. Start from the brief, not raw source.
2. Preserve the selected topic, selected angle, selected `content_type`, and selected format.
3. Translate the brief into the right draft destination:
   - `wiki/editorial/instagram/drafts/`
   - `wiki/editorial/magazine/drafts/`
4. Write for readability first, then sharpness.
5. Keep claims traceable to the evidence already baked into the brief.

## Instagram Rules

- Use `content block -> role -> headline form -> body`.
- Roles are:
  - `question`
  - `label`
  - `judgment`
- Mix question / noun / judgment headlines instead of repeating one cadence.
- Avoid default headline past tense like `됐다` / `이었다` unless there is a strong reason.
- Use at least one anchor per slide when the brief calls for depth:
  - number
  - scene
  - document
  - name
  - quote
- Headlines should read like direction, tension, or framing, not memo labels.

## Readability Rules

- General readers should be able to follow in one pass.
- Technical terms are allowed only when necessary, and should be explained nearby.
- Do not bluff missing facts.
- If a key fact is missing, expose it as an open question.

## Rules

- Write from an approved brief, not a raw source packet.
- Treat the brief as the editorial contract.
- Use backup angles only as context. Do not silently switch direction.
- Keep the wording richesse-like, not Forbes-like, Economist-like, or anyone else.
- If the selected format is Instagram, do not let the draft turn into a research memo.
- If the selected format is magazine, do not let the prose turn into stacked slide captions.

## Output

Return `CopyOutput`.
