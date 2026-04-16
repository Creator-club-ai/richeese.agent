---
name: content-os-news
description: Use to collect and shortlist fresh content signals from configured sources such as RSS, X, YouTube, Threads, and Naver. This is the Detect layer in the content OS. Use when the user wants today's news, fresh signals, what to cover, or a shortlist to send into research or wiki. This skill discovers candidates only; it does not deep-research, plan, or write.
---

# Content OS News

## Job

Find fresh signals worth considering for content.

Use this first when the user wants news, latest signals, feed scanning, source discovery, or "what should we cover?"

This skill owns `Detect`, not `Decide`.

## Read First

1. `ACTIVE_PROFILE.md` if it exists
2. the profile documents referenced there
3. `references/signal-schema.md`
4. `content-os-schema.md` if it exists
5. `wiki/wiki-schema.md` if it exists
6. `오늘의 뉴스/README.md` if it exists
7. `오늘의 뉴스/TEMPLATE.md` if it exists
8. the user request

## Run

From this repository:

```bash
python scripts/fetch_and_curate.py
```

The script must save only the filtered shortlist.

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

Freshness is a hard gate.

- Do not surface stale items just because they are relevant.
- If a source cannot verify recency well enough, keep it out of the shortlist unless the user explicitly asks for archival or evergreen discovery.
- Search-based sources must not stamp today's date onto old content just to pass filtering.

For another project, add those fields to its `RUNTIME_PROFILE.md`, or set `CONTENT_OS_SIGNAL_SOURCES` to a JSON source catalog.

Platform adapters stay here:

```text
scripts/signal_adapters/
```

Do not merge them. They are split by platform on purpose.

## Owns

- RSS, X, YouTube, Threads, Naver, and configured source scanning
- candidate filtering
- signal deduplication
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

Do not overfit to the brand too early.

- At `Detect`, the job is to surface strong and fresh signals, not to prove they are already perfect richesse.club pieces.
- If a signal is fresh and interesting but not yet clearly shaped for the brand, keep it as a lower-priority or wildcard candidate instead of killing it too early.
- Strong editorial filtering belongs later in `research`, `planner`, and `review`.
- Write the daily note in the house structure when `오늘의 뉴스/TEMPLATE.md` exists.

Each item should include:

- title
- source
- URL
- why it matters
- source strength
- risks or gaps
- recommendation: `send to content-os-research`, `send to wiki-ingest`, or `skip`

When obvious, it may also include:

- possible topic seeds
- related people, brands, or concepts
