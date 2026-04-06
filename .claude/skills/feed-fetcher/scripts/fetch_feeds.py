#!/usr/bin/env python3
"""
feed-fetcher: RSS 피드에서 최신 기사를 수집하고 Obsidian vault에 저장합니다.
실행: python fetch_feeds.py
의존성: pip install feedparser deep-translator
"""

import sys
import json
import re
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

try:
    import feedparser
except ImportError:
    print("feedparser가 없습니다.\n실행: pip install feedparser")
    sys.exit(1)

try:
    from deep_translator import GoogleTranslator
    _translator = GoogleTranslator(source="auto", target="ko")
    TRANSLATE = True
except ImportError:
    TRANSLATE = False


def translate_ko(text: str) -> str:
    """한국어가 아닌 텍스트를 한국어로 번역. 실패하면 원문 반환."""
    if not text or not TRANSLATE:
        return text
    # 이미 한국어면 번역 스킵 (한글 포함 비율 30% 이상)
    korean_chars = sum(1 for c in text if "\uAC00" <= c <= "\uD7A3")
    if korean_chars / max(len(text), 1) > 0.3:
        return text
    try:
        return _translator.translate(text[:500])
    except Exception:
        return text

# ── 설정 ──────────────────────────────────────────────────────────────────────

VAULT_PATH = Path("C:/Users/HP/OneDrive/문서/Obsidian Vault/richesse-content-os")
HOURS_LOOKBACK = 48          # 기본 lookback (RSS/Google News/Twitter)
YOUTUBE_LOOKBACK = 168       # YouTube는 7일 (영상은 매일 안 올라옴)

FEEDS = [
    # ── Business / Startup ────────────────────────────────────────────────
    {"name": "TechCrunch",              "url": "https://techcrunch.com/feed/",                                                              "category": "Business", "priority": 1, "type": "rss"},
    {"name": "Harvard Business Review", "url": "http://feeds.hbr.org/harvardbusiness",                                                     "category": "Business", "priority": 1, "type": "rss"},
    {"name": "Fast Company",            "url": "https://www.fastcompany.com/latest/rss",                                                   "category": "Business", "priority": 1, "type": "rss"},
    {"name": "Forbes Business",         "url": "https://www.forbes.com/business/feed/",                                                    "category": "Business", "priority": 1, "type": "rss"},
    {"name": "Wired Business",          "url": "https://www.wired.com/feed/category/business/latest/rss",                                  "category": "Business", "priority": 2, "type": "rss"},
    {"name": "한국경제 IT",              "url": "https://www.hankyung.com/feed/it",                                                         "category": "Business", "priority": 1, "type": "rss"},

    # ── VC / People ───────────────────────────────────────────────────────
    {"name": "a16z",                    "url": "https://a16z.com/feed/",                                                                   "category": "Strategy", "priority": 1, "type": "rss"},
    {"name": "First Round Review",      "url": "https://review.firstround.com/feed.xml",                                                   "category": "People",   "priority": 1, "type": "rss"},
    {"name": "Lenny's Newsletter",      "url": "https://www.lennysnewsletter.com/feed",                                                    "category": "People",   "priority": 1, "type": "rss"},

    # ── Strategy / Insight ────────────────────────────────────────────────
    {"name": "Stratechery",             "url": "https://stratechery.com/feed/",                                                            "category": "Strategy", "priority": 2, "type": "rss"},
    {"name": "The Generalist",          "url": "https://thegeneralist.substack.com/feed",                                                  "category": "Strategy", "priority": 2, "type": "rss"},
    {"name": "Not Boring",              "url": "https://www.notboring.co/feed",                                                            "category": "Strategy", "priority": 2, "type": "rss"},

    # ── Money / Finance ───────────────────────────────────────────────────
    {"name": "Reuters Business",        "url": "https://feeds.reuters.com/reuters/businessNews",                                           "category": "Money",    "priority": 1, "type": "rss"},
    {"name": "The Economist (Business)","url": "https://www.economist.com/business/rss.xml",                                               "category": "Money",    "priority": 1, "type": "rss"},
    {"name": "매일경제 증권",             "url": "https://www.mk.co.kr/rss/40300001/",                                                       "category": "Money",    "priority": 2, "type": "rss"},

    # ── Google News (키워드 기반) ──────────────────────────────────────────
    {"name": "GNews: startup founder",  "url": "https://news.google.com/rss/search?q=startup+founder+interview&hl=en&gl=US&ceid=US:en",   "category": "Business", "priority": 1, "type": "google_news"},
    {"name": "GNews: venture capital",  "url": "https://news.google.com/rss/search?q=venture+capital+startup&hl=en&gl=US&ceid=US:en",    "category": "People",   "priority": 1, "type": "google_news"},
    {"name": "GNews: AI business",      "url": "https://news.google.com/rss/search?q=AI+startup+business+model&hl=en&gl=US&ceid=US:en",  "category": "Business", "priority": 1, "type": "google_news"},
    {"name": "GNews: 한국 스타트업",     "url": "https://news.google.com/rss/search?q=한국+스타트업+투자&hl=ko&gl=KR&ceid=KR:ko",           "category": "Business", "priority": 1, "type": "google_news"},

    # ── YouTube 채널 (7일 lookback) ───────────────────────────────────────
    {"name": "Lex Fridman",             "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCSHZKyawb77ixDdsGog4iWA",            "category": "People",   "priority": 1, "type": "youtube"},
    {"name": "Y Combinator",            "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCcefcZRL2oaA_uBNeo5UOWg",            "category": "Business", "priority": 1, "type": "youtube"},
    # ── Threads: RSSHub 공개 인스턴스 차단으로 자동 수집 불가 ─────────────
    # choi.openai 등 Threads 포스트는 직접 source-intake에 붙여넣기로 처리
]

MAX_PER_FEED = 5
TRACKING_QUERY_PREFIXES = ("utm_",)
TRACKING_QUERY_KEYS = {
    "fbclid",
    "gclid",
    "igshid",
    "mc_cid",
    "mc_eid",
    "ref",
    "ref_src",
    "source",
}

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


def normalize_url(url: str) -> str:
    """추적 파라미터를 제거한 canonical URL. Google News wrapper는 빈 문자열 반환."""
    if not url:
        return ""

    parsed = urlparse(url)
    host = parsed.netloc.lower()
    if "news.google.com" in host:
        return ""

    filtered_query = []
    for key, value in parse_qsl(parsed.query, keep_blank_values=False):
        lowered = key.lower()
        if lowered in TRACKING_QUERY_KEYS or lowered.startswith(TRACKING_QUERY_PREFIXES):
            continue
        filtered_query.append((key, value))

    normalized_host = host.removeprefix("www.")
    normalized_path = parsed.path.rstrip("/")
    return urlunparse(
        (
            parsed.scheme.lower(),
            normalized_host,
            normalized_path,
            "",
            urlencode(filtered_query, doseq=True),
            "",
        )
    )


def normalize_title(title: str) -> str:
    """제목 기반 dedupe용 정규화."""
    cleaned = re.sub(r"\s+", " ", (title or "").strip().lower())
    cleaned = re.sub(r"[^\w\s가-힣]", "", cleaned)
    return cleaned.strip()


def article_keys(article):
    """URL 우선, Google News 등은 제목 fallback 키를 함께 사용."""
    keys = []
    normalized_url = normalize_url(article.get("url", ""))
    if normalized_url:
        keys.append(f"url:{normalized_url}")

    title_key = normalize_title(article.get("title_en") or article.get("title"))
    if title_key:
        keys.append(f"title:{title_key}")

    return keys


def article_rank(article):
    """낮을수록 우선 보존."""
    return (
        article.get("priority", 99),
        1 if article.get("type") == "google_news" else 0,
        0 if article.get("summary") else 1,
        article.get("source", ""),
        article.get("url", ""),
    )


def fetch_feed(config):
    """단일 피드 수집 → 기사 리스트 반환"""
    articles = []
    source_type = config.get("type", "rss")
    lookback = YOUTUBE_LOOKBACK if source_type == "youtube" else HOURS_LOOKBACK
    cutoff = datetime.now(timezone.utc) - timedelta(hours=lookback)

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

            title_raw = strip_html(entry.get("title", ""))
            summary_raw = strip_html(getattr(entry, "summary", ""))[:300]

            articles.append({
                "title":     translate_ko(title_raw),
                "title_en":  title_raw,
                "url":       url,
                "source":    config["name"],
                "category":  config["category"],
                "priority":  config["priority"],
                "type":      source_type,
                "published": pub_date.strftime("%Y-%m-%d") if pub_date else "",
                "summary":   translate_ko(summary_raw),
            })

        print(f"  ✓ {config['name']}: {len(articles)}개")

    except Exception as e:
        print(f"  ✗ {config['name']}: {e}")

    return articles


def deduplicate(articles):
    """Canonical URL + 제목 fallback 기준 중복 제거."""
    seen_keys = set()
    unique = []

    for article in sorted(articles, key=article_rank):
        keys = article_keys(article)
        if keys and any(key in seen_keys for key in keys):
            continue

        unique.append(article)
        for key in keys:
            seen_keys.add(key)

    return unique


CATEGORY_CALLOUT = {
    "Business": "abstract",
    "People":   "info",
    "Strategy": "tip",
    "Money":    "note",
}

SOURCE_TYPE_ICON = {
    "rss":          "📰",
    "google_news":  "🔍",
    "youtube":      "▶️",
    "twitter":      "𝕏",
    "threads":      "🧵",
}


def save_to_obsidian(articles, date_str):
    """Obsidian 00_feeds 폴더에 MD + JSON 저장"""
    out_dir = VAULT_PATH / "00_feeds"
    out_dir.mkdir(parents=True, exist_ok=True)

    # 카테고리별 그룹 (priority → source 정렬)
    by_category = {}
    for a in sorted(articles, key=lambda x: (x["priority"], x["source"])):
        by_category.setdefault(a["category"], []).append(a)

    # Markdown (Obsidian callout 카드 형식)
    lines = [
        "---",
        f"date: {date_str}",
        f"total: {len(articles)}",
        "---",
        "",
        f"# 📥 Feed — {date_str}  ({len(articles)}개)",
        "",
    ]

    for cat in sorted(by_category.keys()):
        items = by_category[cat]
        callout = CATEGORY_CALLOUT.get(cat, "note")
        lines += [f"## {cat}  ({len(items)})", ""]

        for a in items:
            icon  = SOURCE_TYPE_ICON.get(a.get("type", "rss"), "📰")
            title = a["title"] or "(제목 없음)"
            pub   = f"  ·  {a['published']}" if a.get("published") else ""
            src   = a["source"]
            url   = a["url"]
            summary = a.get("summary", "")

            lines += [
                f"> [!{callout}] {icon} {src}{pub}",
                f"> **[{title}]({url})**",
            ]
            if summary:
                lines += [f"> {summary[:200]}"]
            lines += [">", ""]

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
    if not TRANSLATE:
        print("   ! deep-translator 없음: 영문 제목/요약은 원문 그대로 저장됩니다.\n")

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
