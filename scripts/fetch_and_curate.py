#!/usr/bin/env python3
"""
Fetch profile-owned signal feeds, apply a light pre-filter, and persist a daily JSON shortlist.

This script does not produce a full ResearchOutput. It only emits a raw shortlist that Head can
optionally synthesize into a shallow research artifact.

Usage:
    python fetch_and_curate.py

Dependency:
    pip install feedparser
"""

from __future__ import annotations

import io
import json
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

import feedparser

from profile_runtime import load_runtime_profile

if hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")


RUNTIME_PROFILE = load_runtime_profile()
VAULT_PATH = RUNTIME_PROFILE.vault_path

HOURS_LOOKBACK = 48
YOUTUBE_LOOKBACK = 168
MAX_PER_FEED = 5

FEEDS = [
    {"name": "TechCrunch", "url": "https://techcrunch.com/feed/", "category": "Business", "priority": 1, "type": "rss"},
    {"name": "Harvard Business Review", "url": "http://feeds.hbr.org/harvardbusiness", "category": "Business", "priority": 1, "type": "rss"},
    {"name": "Wired Business", "url": "https://www.wired.com/feed/category/business/latest/rss", "category": "Business", "priority": 1, "type": "rss"},
    {"name": "a16z", "url": "https://a16z.com/feed/", "category": "People", "priority": 1, "type": "rss"},
    {"name": "First Round Review", "url": "https://review.firstround.com/feed.xml", "category": "People", "priority": 1, "type": "rss"},
    {"name": "Lenny's Newsletter", "url": "https://www.lennysnewsletter.com/feed", "category": "People", "priority": 1, "type": "rss"},
    {"name": "Stratechery", "url": "https://stratechery.com/feed/", "category": "Strategy", "priority": 1, "type": "rss"},
    {"name": "The Generalist", "url": "https://thegeneralist.substack.com/feed", "category": "Strategy", "priority": 2, "type": "rss"},
    {"name": "Not Boring", "url": "https://www.notboring.co/feed", "category": "Strategy", "priority": 2, "type": "rss"},
    {"name": "The Economist (Business)", "url": "https://www.economist.com/business/rss.xml", "category": "Money", "priority": 1, "type": "rss"},
    {"name": "Reuters Business", "url": "https://feeds.reuters.com/reuters/businessNews", "category": "Money", "priority": 2, "type": "rss"},
    {
        "name": "GNews: venture capital",
        "url": "https://news.google.com/rss/search?q=venture+capital+startup&hl=en&gl=US&ceid=US:en",
        "category": "People",
        "priority": 1,
        "type": "google_news",
    },
    {
        "name": "GNews: AI business",
        "url": "https://news.google.com/rss/search?q=AI+startup+business+model&hl=en&gl=US&ceid=US:en",
        "category": "Business",
        "priority": 1,
        "type": "google_news",
    },
    {
        "name": "GNews: 한국 스타트업",
        "url": "https://news.google.com/rss/search?q=한국+스타트업+투자&hl=ko&gl=KR&ceid=KR:ko",
        "category": "Business",
        "priority": 1,
        "type": "google_news",
    },
    {
        "name": "Lex Fridman",
        "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCSHZKyawb77ixDdsGog4iWA",
        "category": "People",
        "priority": 1,
        "type": "youtube",
    },
    {
        "name": "Y Combinator",
        "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCcefcZRL2oaA_uBNeo5UOWg",
        "category": "Business",
        "priority": 1,
        "type": "youtube",
    },
]

EXCLUDE_PATTERNS = [
    r"\b(baseball|football|nba|nfl|nhl|soccer|golf|tennis|tournament|playoff|pitcher|batting)\b",
    r"\b(grammy|billboard|oscar|emmy|album|box office|box-office|movie|sitcom|k-pop)\b",
    r"(경기 결과|중계권|감독|구속|체포|선고|범행|피의자)",
    r"\b(euthanasia|abortion|impeach|democrat|republican|congress|senate|partisan)\b",
    r"(임상시험|처방약|제약사|주사기|의료기기|항암제|백신)",
    r"(쿠팡|이마트|홈플러스|편의점|마트|할인행사)",
    r"\b(5 ways to|10 tips|how to be|morning routine|self-care)\b",
]
EXCLUDE_RE = re.compile("|".join(EXCLUDE_PATTERNS), re.IGNORECASE)

TRACKING_QUERY_PREFIXES = ("utm_",)
TRACKING_QUERY_KEYS = {"fbclid", "gclid", "igshid", "mc_cid", "mc_eid", "ref", "ref_src", "source"}


def strip_html(text: str | None) -> str:
    return re.sub(r"<[^>]+>", "", text or "").strip()


def is_relevant(title: str, summary: str) -> bool:
    return not EXCLUDE_RE.search(f"{title} {summary}")


def normalize_url(url: str) -> str:
    if not url:
        return ""
    parsed = urlparse(url)
    if "news.google.com" in parsed.netloc.lower():
        return ""
    filtered = [
        (key, value)
        for key, value in parse_qsl(parsed.query)
        if key.lower() not in TRACKING_QUERY_KEYS and not key.lower().startswith(TRACKING_QUERY_PREFIXES)
    ]
    return urlunparse(
        (
            parsed.scheme.lower(),
            parsed.netloc.lower().removeprefix("www."),
            parsed.path.rstrip("/"),
            "",
            urlencode(filtered),
            "",
        )
    )


def normalize_title(title: str) -> str:
    compact = re.sub(r"\s+", " ", (title or "").strip().lower())
    return re.sub(r"[^\w\s가-힣]", "", compact).strip()


def article_keys(article: dict[str, object]) -> list[str]:
    keys: list[str] = []
    normalized_url = normalize_url(str(article.get("url", "")))
    if normalized_url:
        keys.append(f"url:{normalized_url}")
    normalized_heading = normalize_title(str(article.get("title_en") or article.get("title", "")))
    if normalized_heading:
        keys.append(f"title:{normalized_heading}")
    return keys


def article_rank(article: dict[str, object]) -> tuple[int, int, int]:
    return (
        int(article.get("priority", 99)),
        1 if article.get("type") == "google_news" else 0,
        0 if article.get("summary") else 1,
    )


def parse_date(entry) -> datetime | None:
    for attr in ("published_parsed", "updated_parsed"):
        value = getattr(entry, attr, None)
        if value:
            try:
                return datetime(*value[:6], tzinfo=timezone.utc)
            except Exception:
                continue
    return None


def fetch_feed(config: dict[str, object]) -> list[dict[str, object]]:
    articles: list[dict[str, object]] = []
    lookback = YOUTUBE_LOOKBACK if config.get("type") == "youtube" else HOURS_LOOKBACK
    cutoff = datetime.now(timezone.utc) - timedelta(hours=lookback)

    try:
        parsed = feedparser.parse(str(config["url"]))
    except Exception as exc:
        print(f"  - {config['name']}: failed to parse feed ({exc})")
        return articles

    if not parsed.entries:
        print(f"  - {config['name']}: no entries")
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
                "type": config.get("type", "rss"),
                "published": published_at.strftime("%Y-%m-%d") if published_at else "",
                "summary": summary,
            }
        )

    filtered_out = raw_count - len(articles)
    suffix = f" (filtered out {filtered_out})" if filtered_out else ""
    print(f"  - {config['name']}: kept {len(articles)}{suffix}")
    return articles


def count_cross_sources(articles: list[dict[str, object]]) -> list[int]:
    stopwords = {
        "the", "a", "an", "of", "in", "to", "and", "for", "with", "on", "at",
        "by", "from", "is", "are", "was", "were", "has", "have", "its", "it",
        "this", "that", "be", "as", "or", "but", "not", "new", "says", "said",
    }

    def extract_keywords(title: str) -> set[str]:
        words = re.findall(r"[A-Za-z가-힣]{3,}", title.lower())
        return {word for word in words if word not in stopwords}

    source_counts = [1] * len(articles)
    for index, article in enumerate(articles):
        keywords_i = extract_keywords(str(article.get("title", "")))
        if len(keywords_i) < 2:
            continue

        sources_seen = {str(article.get("source", ""))}
        for other_index, other_article in enumerate(articles):
            if index == other_index:
                continue
            keywords_j = extract_keywords(str(other_article.get("title", "")))
            if len(keywords_i & keywords_j) >= 2:
                sources_seen.add(str(other_article.get("source", "")))
        source_counts[index] = len(sources_seen)

    return source_counts


def deduplicate(articles: list[dict[str, object]]) -> list[dict[str, object]]:
    seen: set[str] = set()
    unique: list[dict[str, object]] = []
    for article in sorted(articles, key=article_rank):
        keys = article_keys(article)
        if keys and any(key in seen for key in keys):
            continue
        unique.append(article)
        seen.update(keys)
    return unique


def load_existing(date_str: str) -> list[dict[str, object]]:
    json_path = RUNTIME_PROFILE.latest_signals_dir / f"{date_str}.json"
    if not json_path.exists():
        return []
    try:
        payload = json.loads(json_path.read_text(encoding="utf-8"))
    except Exception:
        return []
    return payload if isinstance(payload, list) else []


def save(articles: list[dict[str, object]], date_str: str) -> Path:
    output_dir = RUNTIME_PROFILE.latest_signals_dir
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{date_str}.json"
    output_path.write_text(json.dumps(articles, ensure_ascii=False, indent=2), encoding="utf-8")
    return output_path


def main() -> None:
    date_str = datetime.now().strftime("%Y-%m-%d")
    print(f"\nFetch & Curate - {date_str}")
    print(f"Scanning {len(FEEDS)} feeds")
    print(f"Vault: {VAULT_PATH}\n")

    existing = load_existing(date_str)
    existing_keys: set[str] = set()
    for article in existing:
        existing_keys.update(article_keys(article))

    if existing:
        print(f"Loaded {len(existing)} existing articles for duplicate filtering.\n")

    all_articles: list[dict[str, object]] = []
    for feed in FEEDS:
        all_articles.extend(fetch_feed(feed))

    for article, count in zip(all_articles, count_cross_sources(all_articles)):
        article["source_count"] = count

    unique_new = deduplicate(all_articles)
    if existing_keys:
        unique_new = [article for article in unique_new if not any(key in existing_keys for key in article_keys(article))]

    removed = len(all_articles) - len(unique_new)
    print(f"\nCollected {len(all_articles)} items. Removed {removed}. New shortlist: {len(unique_new)}")

    merged = existing + unique_new
    output_path = save(merged, date_str)
    print(f"Saved JSON ({len(merged)} total items): {output_path}")
    print(f"LATEST_SIGNALS_JSON_PATH: {output_path}")

    if unique_new:
        print("\n--- NEW_ARTICLES_START ---")
        print(json.dumps(unique_new, ensure_ascii=False, indent=2))
        print("--- NEW_ARTICLES_END ---")
        return

    print("\nNo new shortlisted articles.")


if __name__ == "__main__":
    main()
