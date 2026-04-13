---
name: source-intake
description: This skill should be used when Head or the public `research` phase needs one direct source normalized into evidence. It handles articles, YouTube, X posts, transcripts, memos, pasted text, and selected signals as an internal execution block.
---

# Source Intake

## Role

`source-intake` is the internal direct-source normalizer under the public `research` phase.

Use it to turn one raw source into usable evidence, save an immutable snapshot, and prepare a packet that can satisfy `ResearchOutput`.

## Read First

1. `.claude/shared/richesse-editorial-core.md`
2. `.claude/shared/phase-contracts.md`
3. `ACTIVE_PROFILE.md`
4. the profile documents referenced there
5. the source material for the current run

## Own

- raw source normalization
- immutable snapshot discipline
- transcript retrieval when relevant
- source packet assembly
- wiki ingest when reusable context exists

## Supported Inputs

- YouTube URL
- article URL
- X post
- transcript
- memo
- pasted text
- selected signal from `morning-brew`
- idea with enough concrete substance to normalize

## YouTube Rule

Use the transcript script first.

```bash
python scripts/get_transcript.py "<youtube_url>" --lang ko en --save
```

## Do

- extract what happened
- compress usable points
- surface direction cues
- name risks or gaps directly
- stop cleanly if the source is too weak

## Do Not Own

- final angle choice
- final brand-fit call
- publishable drafting
- final review verdict

## Return

Return one of:

- a valid `ResearchOutput`
- a clear stop recommendation
