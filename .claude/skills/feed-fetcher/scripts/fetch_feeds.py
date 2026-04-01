#!/usr/bin/env python3
"""
feed-fetcher: RSS 피드에서 최신 기사를 수집하고 Obsidian vault에 저장합니다.
실행: python fetch_feeds.py
의존성: pip install feedparser
"""

import sys
import json
import re
from datetime import datetime, timezone, timedelta
from pathlib import Path

import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

try:
    import feedparser
except ImportError:
    print("feedparser가 없습니다.\n실행: pip install feedparser")
    sys.exit(1)

# ── 설정 ──────────────────────────────────────────────────────────────────────

VAULT_PATH = Path("C:/Users/dasar/OneDrive/문서/Obsidian Vault/richesse-content-os")
HOURS_LOOKBACK = 48

FEEDS = [
    # Priority 1 — Business / Startup
    {"name": "Harvard Business Review", "url": "http://feeds.hbr.org/harvardbusiness",             "category": "Business",  "priority": 1},
    {"name": "Fast Company",            "url": "https://www.fastcompany.com/latest/rss",            "category": "Business",  "priority": 1},
    {"name": "플래텀",                   "url": "https://platum.kr/feed",                            "category": "Startup",   "priority": 1},
    # Priority 2 — Money / Strategy
    {"name": "매일경제 증권",             "url": "https://www.mk.co.kr/rss/40300001/",                "category": "Money",     "priority": 2},
    {"name": "The Generalist",          "url": "https://thegeneralist.substack.com/feed",            "category": "Strategy",  "priority": 2},
    {"name": "Stratechery",             "url": "https://stratechery.com/feed/",                      "category": "Strategy",  "priority": 2},
    # Priority 3 — Lifestyle / Places
    {"name": "Business of Fashion",     "url": "https://www.businessoffashion.com/feeds/news",       "category": "Lifestyle", "priority": 3},
    {"name": "Monocle",                 "url": "https://monocle.com/feed/",                          "category": "Lifestyle", "priority": 3},
]

MAX_PER_FEED = 5

# ── 헬퍼 ──────────────────────────────────────────────────────────────────────

def parse_date(entry):
    """feedparser entry에서 UTC datetime 추출"""
    for attr in ("published_parsed", "updated_parsed"):
        val = getattr(entry, attr, None)
        if val:
            try:
                return datetime(*val[:6], tzinfo=timezone.utc)
            except Exception:
                continue
    return None


def strip_html(text):
    """간단한 HTML 태그 제거"""
    return re.sub(r"<[^>]+>", "", text or "").strip()


def fetch_feed(config):
    """단일 피드 수집 → 기사 리스트 반환"""
    articles = []
    cutoff = datetime.now(timezone.utc) - timedelta(hours=HOURS_LOOKBACK)

    try:
        parsed = feedparser.parse(config["url"])
        if not parsed.entries:
            print(f"  — {config['name']}: 기사 없음 (페이월 또는 빈 피드)")
            return articles

        for entry in parsed.entries:
            if len(articles) >= MAX_PER_FEED:
                break

            url = entry.get("link", "").strip()
            if not url:
                continue

            pub_date = parse_date(entry)
            if pub_date and pub_date < cutoff:
                continue

            summary = strip_html(getattr(entry, "summary", ""))[:300]

            articles.append({
                "title":     strip_html(entry.get("title", "")),
                "url":       url,
                "source":    config["name"],
                "category":  config["category"],
                "priority":  config["priority"],
                "published": pub_date.strftime("%Y-%m-%d") if pub_date else "",
                "summary":   summary,
            })

        print(f"  ✓ {config['name']}: {len(articles)}개")

    except Exception as e:
        print(f"  ✗ {config['name']}: {e}")

    return articles


def deduplicate(articles):
    """URL 기준 중복 제거, 우선순위 높은 것 유지"""
    seen = {}
    for a in articles:
        url = a["url"]
        if url not in seen or a["priority"] < seen[url]["priority"]:
            seen[url] = a
    return list(seen.values())


def save_to_obsidian(articles, date_str):
    """Obsidian 00_feeds 폴더에 MD + JSON 저장"""
    out_dir = VAULT_PATH / "00_feeds"
    out_dir.mkdir(parents=True, exist_ok=True)

    # 카테고리별 그룹
    by_category = {}
    for a in sorted(articles, key=lambda x: (x["priority"], x["source"])):
        by_category.setdefault(a["category"], []).append(a)

    # Markdown
    lines = [
        "---",
        f"date: {date_str}",
        f"total: {len(articles)}",
        "---",
        "",
        f"# Fetched Articles — {date_str}",
        "",
    ]
    for cat, items in sorted(by_category.items()):
        lines += [f"## {cat}", ""]
        for a in items:
            lines += [
                f"### {a['title']}",
                f"- **Source**: {a['source']}",
                f"- **URL**: {a['url']}",
                *([ f"- **Published**: {a['published']}"] if a["published"] else []),
                *([ f"- **Summary**: {a['summary']}"]    if a["summary"]    else []),
                "",
            ]

    md_path   = out_dir / f"{date_str}.md"
    json_path = out_dir / f"{date_str}.json"

    md_path.write_text("\n".join(lines), encoding="utf-8")
    json_path.write_text(json.dumps(articles, ensure_ascii=False, indent=2), encoding="utf-8")

    return md_path, json_path


# ── 메인 ──────────────────────────────────────────────────────────────────────

def main():
    date_str = datetime.now().strftime("%Y-%m-%d")
    print(f"\n Feed Fetcher — {date_str}")
    print(f"   {len(FEEDS)}개 피드 수집 중...\n")

    all_articles = []
    for feed in FEEDS:
        all_articles.extend(fetch_feed(feed))

    unique = deduplicate(all_articles)
    removed = len(all_articles) - len(unique)

    print(f"\n수집 {len(all_articles)}개 → 중복 {removed}개 제거 → {len(unique)}개 저장")

    md_path, json_path = save_to_obsidian(unique, date_str)

    print(f"\n저장 완료")
    print(f"   MD  : {md_path}")
    print(f"   JSON: {json_path}")
    print(f"\n다음 단계: /feed-curator 를 실행하세요.")


if __name__ == "__main__":
    main()
