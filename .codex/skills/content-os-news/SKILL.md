---
name: content-os-news
description: Use to collect and shortlist fresh content signals from configured sources such as RSS, X, YouTube, Threads, and Naver. This is the Detect layer in the content OS. Use when the user wants today's news, fresh signals, what to cover, or a shortlist to send into research or wiki. This skill discovers candidates only; it does not deep-research, plan, or write.
---

# Content OS News

## Job

우선 신호를 모으고 오늘 볼 만한 shortlist를 만든다.

이 스킬은 `Detect` 레이어다.  
여기서 하는 일은 후보를 찾는 것이지, 너무 이른 단계에서 브랜드 핏만으로 후보를 죽이는 것이 아니다.

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

Freshness is a hard gate.

- Do not surface stale items just because they are relevant.
- If a source cannot verify recency well enough, keep it out of the shortlist unless the user explicitly asks for archival or evergreen discovery.
- Search-based sources must not stamp today's date onto old content just to pass filtering.

Platform adapters stay here:

```text
scripts/signal_adapters/
```

## Selection stance

메인 축은 분명하다.

- `AI`
- `Business`
- `Wealth`
- `Startup`

하지만 이 축은 `hard gate`가 아니라 `sorting preference`다.

- 메인 축과 가까운 신호를 위로 올린다.
- 바로 richesse에 맞지 않아 보여도 신선하고 살아 있으면 `wildcard`로 남긴다.
- 강한 editorial filtering은 후속 `research`, `planner`, `review`에서 한다.

## Deduplication stance

같은 이야기를 여러 출처가 반복한 경우, 여러 건으로 보지 않는다.

- 원문 기사와 Google News 요약이 겹치면 한 건으로 묶는다.
- 기사와 X/Threads 재유통이 겹치면 원문 쪽을 우선한다.
- 같은 주제를 다른 헤드라인으로 반복해도 사실상 같은 story면 한 건으로 묶는다.

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

When obvious, include:

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

Wildcard items should not be linkless notes.

- If an item is kept in `Wildcard / 보류`, include at minimum `source`, `URL`, and a short `reason`.
- `Wildcard` means “alive but not primary,” not “unstructured dump.”
