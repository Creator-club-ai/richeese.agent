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
        print(f"  - {config['name']}: 피드 파싱 실패 ({exc})")
        return articles

    if not parsed.entries:
        print(f"  - {config['name']}: 항목 없음")
        return articles

    raw_count = 0
    for entry in parsed.entries:
        if len(articles) >= MAX_PER_FEED:
            break

        url = str(entry.get("link", "")).strip()
        if not url:
            continue

        published_at = parse_date(entry)
        if published_at and published_at < cutoff:
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
                "published": published_at.strftime("%Y-%m-%d") if published_at else "",
                "summary": summary,
            }
        )

    filtered_out = raw_count - len(articles)
    suffix = f" (제외 {filtered_out}개)" if filtered_out else ""
    print(f"  - {config['name']}: {len(articles)}개 수집{suffix}")
    return articles

