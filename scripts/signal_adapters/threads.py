from __future__ import annotations

import re
from datetime import datetime

from .common import MAX_PER_FEED, SignalArticle, SourceConfig, fetch_jina_content, is_relevant


def fetch_threads(config: SourceConfig) -> list[SignalArticle]:
    handle = str(config["handle"])
    articles: list[SignalArticle] = []
    target_url = f"https://www.threads.net/@{handle}"
    content = fetch_jina_content(target_url, f"Threads/@{handle}")
    if not content:
        return articles

    blocks = re.split(r"\n{2,}", content.strip())
    today_str = datetime.now().strftime("%Y-%m-%d")
    raw_count = 0
    for block in blocks:
        if len(articles) >= MAX_PER_FEED:
            break

        text = block.strip()
        if len(text) < 20:
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
                "published": today_str,
                "summary": summary,
            }
        )

    filtered_out = raw_count - len(articles)
    suffix = f" (filtered out {filtered_out})" if filtered_out else ""
    print(f"  - Threads/@{handle}: kept {len(articles)}{suffix}")
    return articles

