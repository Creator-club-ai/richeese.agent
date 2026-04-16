from __future__ import annotations

from datetime import datetime, timezone

from .common import MAX_PER_FEED, SignalArticle, SourceConfig, is_relevant, run_ytdlp_json
from .runtime import cutoff_utc


def fetch_youtube_channel(config: SourceConfig) -> list[SignalArticle]:
    articles: list[SignalArticle] = []
    cutoff = cutoff_utc()
    items = run_ytdlp_json(
        ["--flat-playlist", "--playlist-end", str(MAX_PER_FEED * 2), str(config["url"])],
        timeout=60,
    )
    if not items:
        print(f"  - YT/{config['name']}: no results")
        return articles

    raw_count = 0
    for item in items:
        if len(articles) >= MAX_PER_FEED:
            break

        title = str(item.get("title", ""))
        video_id = item.get("id", "")
        video_url = item.get("url", "") or f"https://www.youtube.com/watch?v={video_id}"
        uploader = item.get("uploader", config["name"])
        duration = item.get("duration")

        upload_date_str = str(item.get("upload_date", ""))
        published_at = None
        if upload_date_str and len(upload_date_str) == 8:
            try:
                published_at = datetime.strptime(upload_date_str, "%Y%m%d").replace(tzinfo=timezone.utc)
            except ValueError:
                pass

        if published_at and published_at < cutoff:
            continue

        raw_count += 1
        description = str(item.get("description", ""))[:300] if item.get("description") else ""
        duration_str = f" ({int(duration) // 60}m)" if duration else ""
        summary = f"[{uploader}]{duration_str} {description}"
        if not is_relevant(title, summary):
            continue

        articles.append(
            {
                "title": title,
                "url": video_url,
                "source": f"YT/{config['name']}",
                "category": config["category"],
                "priority": config["priority"],
                "type": "youtube_ytdlp",
                "published": published_at.strftime("%Y-%m-%d") if published_at else "",
                "summary": summary[:300],
            }
        )

    filtered_out = raw_count - len(articles)
    suffix = f" (filtered out {filtered_out})" if filtered_out else ""
    print(f"  - YT/{config['name']}: kept {len(articles)}{suffix}")
    return articles


def fetch_youtube_search(config: SourceConfig) -> list[SignalArticle]:
    articles: list[SignalArticle] = []
    cutoff = cutoff_utc()
    query = str(config["query"])
    search_term = f"ytsearch{MAX_PER_FEED}:{query}"
    items = run_ytdlp_json([search_term], timeout=90)
    if not items:
        print(f"  - YT/search:{query[:30]}: no results")
        return articles

    raw_count = 0
    missing_dates = 0
    for item in items:
        if len(articles) >= MAX_PER_FEED:
            break

        title = str(item.get("title", ""))
        video_id = item.get("id", "")
        video_url = item.get("url", "") or f"https://www.youtube.com/watch?v={video_id}"
        uploader = item.get("uploader", "")
        duration = item.get("duration")
        view_count = item.get("view_count")

        upload_date_str = str(item.get("upload_date", ""))
        published_at = None
        if upload_date_str and len(upload_date_str) == 8:
            try:
                published_at = datetime.strptime(upload_date_str, "%Y%m%d").replace(tzinfo=timezone.utc)
            except ValueError:
                published_at = None

        if not published_at:
            missing_dates += 1
            continue

        if published_at < cutoff:
            continue

        raw_count += 1
        description = str(item.get("description", ""))[:300] if item.get("description") else ""
        duration_str = f" ({int(duration) // 60}m)" if duration else ""
        views_str = f" views:{view_count}" if view_count else ""
        summary = f"[{uploader}]{duration_str}{views_str} {description}"
        if not is_relevant(title, summary):
            continue

        articles.append(
            {
                "title": title,
                "url": video_url,
                "source": f"YT/search:{query[:30]}",
                "category": config["category"],
                "priority": config["priority"],
                "type": "youtube_ytdlp",
                "published": published_at.strftime("%Y-%m-%d"),
                "summary": summary[:300],
            }
        )

    filtered_out = raw_count - len(articles)
    extra = []
    if filtered_out:
        extra.append(f"filtered out {filtered_out}")
    if missing_dates:
        extra.append(f"missing date {missing_dates}")
    suffix = f" ({', '.join(extra)})" if extra else ""
    print(f"  - YT/search:{query[:30]}: kept {len(articles)}{suffix}")
    return articles

