---
name: content-os-reviewer
description: Use to review a draft against the current richesse content OS before publishing. Checks angle fit, content_type/format fit, headline/body tone, source-backed claims, and user value focus. Produces a ReviewOutput with verdict pass|fix|revise. Does not rewrite copy.
---

# Content OS Reviewer

## Master Source

This skill does not invent its own rules.
Use the repository's live operating docs as the source of truth.

## Job

Review one draft against the current richesse system.

Use this after `content-os-writer`, or when the user brings any draft that needs a brand-fit and structure-fit check before publishing.

## Read First

1. `AGENTS.md`
2. `content-os-schema.md`
3. `wiki/editorial-memory/richesse-house-voice.md`
4. `wiki/editorial-memory/instagram-format-playbooks.md`
5. `wiki/editorial-memory/review-rubric.md`
6. the approved brief in `wiki/editorial/briefs/`
7. the target draft
8. the user request

## Owns

- selected angle vs actual draft fit
- selected `content_type` vs actual rhythm fit
- selected format vs actual draft fit
- headline / body tone split check
- source-backed claim check
- user value focus check
- verdict: `pass`, `fix`, or `revise`
- concrete fix notes

## Does Not Own

- rewriting the draft
- replanning the topic from scratch
- deep source gathering
- wiki ingest

## Workflow

1. Confirm the intended brief.
   Identify the relevant brief first. Do not review a draft in isolation if the brief exists.

2. Check angle fit.
   Ask: is the draft still clearly executing the selected angle, or did it drift?

3. Check `content_type` fit.
   Use `news / list / organize / reported / essay` as the current type system.
   Flag when the draft reads like the wrong type.

4. Check format fit.
   For Instagram, confirm the draft behaves like a carousel and not a memo.
   For magazine, confirm it behaves like long-form prose and not a slide deck.

5. Check tone split.
   Headlines should create tension or reading direction.
   Body should stay readable, concrete, and non-defensive.

6. Check anchors and claims.
   Numbers, names, scenes, documents, or quotes should be present where needed.
   Unsupported claims should be called out directly.

7. Check user value.
   The draft should converge on one main reason to save or care.

8. Return one verdict with concrete notes.

## Rules

- Judge against the live active docs, not old brand-guide files.
- Use `wiki/editorial-memory/review-rubric.md` for final pass/fix/revise judgment.
- Do not praise the draft. Diagnose it.
- Do not rewrite full copy. Point to what is wrong and why.
- If the draft is missing the chosen `content_type` rhythm, that is at least `fix`, often `revise`.
- If claims are not traceable to source or brief evidence, do not allow `pass`.
- If the brief is missing or clearly stale, say so and stop instead of pretending the review is complete.

## Verdict Standard

- `pass`: the draft fits the brief, fits the active docs, and the claims are supportable
- `fix`: the direction is right but specific sections, lines, or cadence need repair
- `revise`: the draft is fundamentally the wrong shape, wrong angle, or not supportable enough to rescue with line edits

## Output

Return `ReviewOutput` with:

- verdict: `pass` | `fix` | `revise`
- what fits
- what fails
- exact lines or sections to revisit
- whether the next step is writer, planner, or research
