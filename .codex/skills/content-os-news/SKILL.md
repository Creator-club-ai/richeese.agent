---
name: content-os-news
description: Use to collect and shortlist fresh content signals from configured sources such as RSS, X, YouTube, Threads, and Naver. This skill discovers candidates only; it does not deep-research, plan, or write.
---

# Content OS News

## Job

Collect fresh signals and turn them into one usable shortlist.

Use this first when the user wants news, latest signals, feed scanning, source discovery, or "what should we cover?"

This skill owns `Detect`.

## Read First

1. `ACTIVE_PROFILE.md` if it exists
2. the profile documents referenced there
3. `references/signal-schema.md`
4. `content-os-schema.md` if it exists
5. `wiki/wiki-schema.md` if it exists
6. the user request

## Run

From this repository:

```bash
python scripts/fetch_and_curate.py
```

The script saves the filtered shortlist as a machine artifact.

- `YYYY-MM-DD.json` is the machine artifact.
- The final daily note must be rewritten as `YYYY-MM-DD.md` using `오늘의 뉴스/TEMPLATE.md`.
- Do not treat the script's raw output as the final Obsidian note.

Filtering is configured by the active runtime profile:

```text
signal_sources_path
signal_max_items
signal_lookback_days
signal_allowed_categories
signal_include_keywords
signal_exclude_keywords
```

Default lookback is 3 days. Do not broaden beyond 4 days unless the script is changed intentionally.

For another project, add those fields to its `RUNTIME_PROFILE.md`, or set `CONTENT_OS_SIGNAL_SOURCES` to a JSON source catalog.

Freshness is a hard gate.

- Do not surface stale items just because they are relevant.
- If a source cannot verify recency well enough, keep it out of the shortlist unless the user explicitly asks for archival or evergreen discovery.
- Search-based sources must not stamp today's date onto old content just to pass filtering.

Platform adapters stay here:

```text
scripts/signal_adapters/
```

## Selection Stance

Main lenses are clear:

- `AI`
- `Business`
- `Wealth`
- `Startup`

But those lenses are sorting preferences, not hard gates.

- Prefer signals that sit close to the main lenses.
- Keep a strong wildcard alive when it still feels culturally or editorially promising.
- Save the harsher brand-fit filtering for `research`, `planner`, and `review`.

## Deduplication Stance

Do not treat the same story as multiple shortlist entries.

- If an original article and a Google News pickup overlap, keep one story.
- If an article and an X or Threads repost overlap, prefer the original source.
- If multiple headlines describe the same underlying event, merge them as one story.

## Owns

- RSS, X, YouTube, Threads, Naver, and configured source scanning
- candidate filtering
- same-story deduplication
- filtered latest-signals artifacts
- shortlist strength labels

## Does Not Own

- deep research
- final angle selection
- writing
- review
- repair

## Output

Return a shortlist.

Each shortlist item should include, when available:

- title
- source
- URL
- why it matters
- source strength
- risks or gaps
- recommendation: `send to content-os-research`, `send to wiki-ingest`, or `skip`

It may also include:

- possible topic seeds
- related people, brands, or concepts
- wildcard candidates that are worth keeping alive

Wildcard items should never be linkless notes.

- If an item is kept in `Wildcard / 보류`, include at minimum `source`, `URL`, and a short `reason`.
- `Wildcard` means "live but not primary", not "unstructured dump."
