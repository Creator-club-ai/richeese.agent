from __future__ import annotations

import re
from datetime import datetime, timezone

from .common import MAX_PER_FEED, SignalArticle, SourceConfig, fetch_jina_content, is_relevant, normalize_title, parse_jina_date
from .runtime import cutoff_utc


def fetch_naver_news(config: SourceConfig) -> list[SignalArticle]:
    articles: list[SignalArticle] = []
    target_url = str(config["url"])
    content = fetch_jina_content(target_url, str(config["name"]))
    if not content:
        return articles

    article_url_re = re.compile(r"n\.news\.naver\.com/mnews/article/|news\.naver\.com/cluster/")
    link_pattern = re.compile(r"\[([^\]]{5,})\]\((https?://[^\)]+)\)")

    cutoff = cutoff_utc()
    reference = datetime.now(timezone.utc)
    seen_titles: set[str] = set()
    missing_dates = 0
    for match in link_pattern.finditer(content):
        if len(articles) >= MAX_PER_FEED:
            break

        title = match.group(1).strip()
        url = match.group(2).strip()
        if not article_url_re.search(url):
            continue
        if "comment" in url:
            continue
        if len(title) < 10:
            continue
        if re.search(r"사진\s*보기|관련뉴스\s*\d+\s*개의", title):
            continue

        normalized = normalize_title(title)
        if normalized in seen_titles:
            continue
        seen_titles.add(normalized)

        published_at = parse_jina_date(title, reference)
        if not published_at:
            missing_dates += 1
            continue
        if published_at < cutoff:
            continue

        if not is_relevant(title, ""):
            continue

        articles.append(
            {
                "title": title,
                "url": url,
                "source": config["name"],
                "category": config["category"],
                "priority": config["priority"],
                "type": "naver_jina",
                "published": published_at.strftime("%Y-%m-%d"),
                "summary": title,
            }
        )

    suffix = f" (missing date {missing_dates})" if missing_dates else ""
    print(f"  - {config['name']}: kept {len(articles)}{suffix}")
    return articles
