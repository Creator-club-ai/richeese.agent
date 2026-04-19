---
name: content-os-news
description: Use to collect and shortlist fresh content signals from configured sources. This skill discovers candidates only; it does not deep-research, plan, or write.
---

# Content OS News

## Master Source

This skill follows the repository's live operating docs and current capture layer.

## Job

Find fresh signals worth considering for content.

Use this first when the user wants news, latest signals, feed scanning, source discovery, or "what should we cover?"

## Read First

1. `AGENTS.md`
2. `content-os-schema.md`
3. `wiki/wiki-schema.md`
4. `wiki/capture/today/README.md`
5. the user request

## Run

From this repository:

```bash
python scripts/fetch_and_curate.py
```

The script should save the shortlist into the capture layer:

- machine artifact: `wiki/capture/today/YYYY-MM-DD.json`
- human note: `wiki/capture/today/YYYY-MM-DD.md`

## Owns

- source scanning
- candidate filtering
- signal deduplication
- shortlist generation
- recommendation labeling

## Does Not Own

- deep research
- final angle selection
- writing
- review
- wiki canonical ingest

## Output

Return a shortlist.

Each item should include:

- title
- source
- URL
- why it matters
- source strength
- risks or gaps
- recommendation:
  - `send to content-os-research`
  - `send to wikify`
  - `skip`

When obvious, it may also include:

- possible topic seeds
- related people, brands, or concepts
