from __future__ import annotations

import feedparser

from .common import (
    MAX_PER_FEED,
    SignalArticle,
    SourceConfig,
    is_relevant,
    parse_date,
    strip_html,
)
from .runtime import cutoff_utc


def fetch_rss(config: SourceConfig, feed_type: str = "rss") -> list[SignalArticle]:
    articles: list[SignalArticle] = []
    cutoff = cutoff_utc()

    try:
        parsed = feedparser.parse(str(config["url"]))
    except Exception as exc:
        print(f"  - {config['name']}: feed parse failed ({exc})")
        return articles

    if not parsed.entries:
        print(f"  - {config['name']}: no entries")
        return articles

    raw_count = 0
    missing_dates = 0
    for entry in parsed.entries:
        if len(articles) >= MAX_PER_FEED:
            break

        url = str(entry.get("link", "")).strip()
        if not url:
            continue

        published_at = parse_date(entry)
        if not published_at:
            missing_dates += 1
            continue
        if published_at < cutoff:
            continue

        title = strip_html(entry.get("title", ""))
        summary = strip_html(getattr(entry, "summary", ""))[:300]
        raw_count += 1

        if not is_relevant(title, summary):
            continue

        articles.append(
            {
                "title": title,
                "url": url,
                "source": config["name"],
                "category": config["category"],
                "priority": config["priority"],
                "type": feed_type,
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
    print(f"  - {config['name']}: kept {len(articles)}{suffix}")
    return articles
