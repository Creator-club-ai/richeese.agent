from __future__ import annotations

import re
from datetime import datetime, timezone

from .common import MAX_PER_FEED, SignalArticle, SourceConfig, fetch_jina_content, is_relevant, parse_jina_date
from .runtime import cutoff_utc


def fetch_threads(config: SourceConfig) -> list[SignalArticle]:
    handle = str(config["handle"])
    articles: list[SignalArticle] = []
    target_url = f"https://www.threads.net/@{handle}"
    content = fetch_jina_content(target_url, f"Threads/@{handle}")
    if not content:
        return articles

    blocks = re.split(r"\n{2,}", content.strip())
    cutoff = cutoff_utc()
    reference = datetime.now(timezone.utc)
    raw_count = 0
    missing_dates = 0
    for block in blocks:
        if len(articles) >= MAX_PER_FEED:
            break

        text = block.strip()
        if len(text) < 20:
            continue

        published_at = parse_jina_date(text, reference)
        if not published_at:
            missing_dates += 1
            continue
        if published_at < cutoff:
            continue

        raw_count += 1
        title = text[:120].replace("\n", " ")
        summary = text[:300].replace("\n", " ")
        if not is_relevant(title, summary):
            continue

        articles.append(
            {
                "title": title,
                "url": target_url,
                "source": f"Threads/@{handle}",
                "category": config["category"],
                "priority": config["priority"],
                "type": "threads_jina",
                "published": published_at.strftime("%Y-%m-%d"),
                "summary": summary,
            }
        )

    filtered_out = raw_count - len(articles)
    extras: list[str] = []
    if filtered_out:
        extras.append(f"filtered out {filtered_out}")
    if missing_dates:
        extras.append(f"missing date {missing_dates}")
    suffix = f" ({', '.join(extras)})" if extras else ""
    print(f"  - Threads/@{handle}: kept {len(articles)}{suffix}")
    return articles
