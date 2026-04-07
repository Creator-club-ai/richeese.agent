#!/usr/bin/env python3
"""
fetch_and_curate.py

RSS 피드에서 기사를 수집하고, 키워드 사전 필터링으로 노이즈를 제거한 뒤
Obsidian `오늘의 뉴스/` 폴더에 저장합니다.

Claude가 이 출력을 읽고 최종 편집 큐레이션을 수행합니다.

실행: python fetch_and_curate.py
의존성: pip install feedparser
"""

import sys
import json
import re
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse
import os

import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

try:
    import feedparser
except ImportError:
    print("feedparser가 없습니다.\n실행: pip install feedparser")
    sys.exit(1)

# ── Vault 경로 ─────────────────────────────────────────────────────────────────
def get_vault_path() -> Path:
    env = os.environ.get("RICHESSE_VAULT_PATH")
    if env:
        return Path(env)
    onedrive = os.environ.get("OneDrive", "")
    if onedrive:
        return Path(onedrive) / "문서" / "Obsidian Vault" / "richesse-content-os"
    return Path.home() / "OneDrive" / "문서" / "Obsidian Vault" / "richesse-content-os"

VAULT_PATH = get_vault_path()

# ── 수집 설정 ──────────────────────────────────────────────────────────────────
HOURS_LOOKBACK    = 48
YOUTUBE_LOOKBACK  = 168   # 7일
MAX_PER_FEED      = 5

# ── 피드 목록 ─────────────────────────────────────────────────────────────────
# 제거한 소스:
#   Forbes Business     — 스포츠/오락/정치 혼재, 노이즈 과다
#   Fast Company        — 자기계발·워크라이프 밸런스 기사 과다
#   매일경제 증권        — 범죄·사회면·보도자료 혼재, richesse 맞지 않음
#   한국경제 IT          — 의약/의료 비중 높음, 스타트업 비즈니스 아님
#   GNews: startup founder — 실제 수집 기사 0건, 효과 없음

FEEDS = [
    # ── Business / Startup ────────────────────────────────────────────────
    {"name": "TechCrunch",              "url": "https://techcrunch.com/feed/",                                                              "category": "Business", "priority": 1, "type": "rss"},
    {"name": "Harvard Business Review", "url": "http://feeds.hbr.org/harvardbusiness",                                                     "category": "Business", "priority": 1, "type": "rss"},
    {"name": "Wired Business",          "url": "https://www.wired.com/feed/category/business/latest/rss",                                  "category": "Business", "priority": 1, "type": "rss"},

    # ── VC / People ───────────────────────────────────────────────────────
    {"name": "a16z",                    "url": "https://a16z.com/feed/",                                                                   "category": "People",   "priority": 1, "type": "rss"},
    {"name": "First Round Review",      "url": "https://review.firstround.com/feed.xml",                                                   "category": "People",   "priority": 1, "type": "rss"},
    {"name": "Lenny's Newsletter",      "url": "https://www.lennysnewsletter.com/feed",                                                    "category": "People",   "priority": 1, "type": "rss"},

    # ── Strategy / Insight ────────────────────────────────────────────────
    {"name": "Stratechery",             "url": "https://stratechery.com/feed/",                                                            "category": "Strategy", "priority": 1, "type": "rss"},
    {"name": "The Generalist",          "url": "https://thegeneralist.substack.com/feed",                                                  "category": "Strategy", "priority": 2, "type": "rss"},
    {"name": "Not Boring",              "url": "https://www.notboring.co/feed",                                                            "category": "Strategy", "priority": 2, "type": "rss"},

    # ── Money / Finance ───────────────────────────────────────────────────
    {"name": "The Economist (Business)","url": "https://www.economist.com/business/rss.xml",                                               "category": "Money",    "priority": 1, "type": "rss"},
    {"name": "Reuters Business",        "url": "https://feeds.reuters.com/reuters/businessNews",                                           "category": "Money",    "priority": 2, "type": "rss"},

    # ── Google News (키워드 기반) ──────────────────────────────────────────
    {"name": "GNews: venture capital",  "url": "https://news.google.com/rss/search?q=venture+capital+startup&hl=en&gl=US&ceid=US:en",    "category": "People",   "priority": 1, "type": "google_news"},
    {"name": "GNews: AI business",      "url": "https://news.google.com/rss/search?q=AI+startup+business+model&hl=en&gl=US&ceid=US:en",  "category": "Business", "priority": 1, "type": "google_news"},
    {"name": "GNews: 한국 스타트업",     "url": "https://news.google.com/rss/search?q=한국+스타트업+투자&hl=ko&gl=KR&ceid=KR:ko",           "category": "Business", "priority": 1, "type": "google_news"},

    # ── YouTube (7일 lookback) ────────────────────────────────────────────
    {"name": "Lex Fridman",             "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCSHZKyawb77ixDdsGog4iWA",            "category": "People",   "priority": 1, "type": "youtube"},
    {"name": "Y Combinator",            "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCcefcZRL2oaA_uBNeo5UOWg",            "category": "Business", "priority": 1, "type": "youtube"},
]

# ── 사전 필터: 제목/요약에 이 패턴이 있으면 즉시 제외 ─────────────────────────
EXCLUDE_PATTERNS = [
    # 스포츠
    r"\b(baseball|football|NBA|NFL|NHL|soccer|golf|tennis|tournament|playoff|pitcher|batting)\b",
    # 오락/연예
    r"\b(Grammy|Billboard|Oscar|Emmy|album|box office|box-office|movie|sitcom|K-pop|아이돌|드라마|영화)\b",
    # 범죄/사회 (한국어)
    r"(사기꾼|학대|도박|살인|폭행|체포|경찰|검거|구속|피의자|성범죄)",
    # 정치 논쟁
    r"\b(euthanasia|abortion|impeach|democrat|republican|Congress|Senate|partisan)\b",
    # 의료/제약 PR
    r"(임상시험|처방전|의약품|혈우병|수액백|주사기|의료기기)",
    # 소비재 할인/유통
    r"(쿠팡|이마트|마트|편의점|할인|세일|마일리지)",
    # 일반 How-to / 자기계발
    r"\b(5 ways to|10 tips|how to be|morning routine|self-care)\b",
]

_exclude_re = re.compile("|".join(EXCLUDE_PATTERNS), re.IGNORECASE)


def is_relevant(title: str, summary: str) -> bool:
    """사전 필터 통과 여부. True이면 보관."""
    combined = f"{title} {summary}"
    return not _exclude_re.search(combined)

# ── URL 유틸 ───────────────────────────────────────────────────────────────────
TRACKING_QUERY_PREFIXES = ("utm_",)
TRACKING_QUERY_KEYS = {"fbclid", "gclid", "igshid", "mc_cid", "mc_eid", "ref", "ref_src", "source"}


def normalize_url(url: str) -> str:
    if not url:
        return ""
    parsed = urlparse(url)
    if "news.google.com" in parsed.netloc.lower():
        return ""
    filtered = [(k, v) for k, v in parse_qsl(parsed.query) if k.lower() not in TRACKING_QUERY_KEYS and not k.lower().startswith(TRACKING_QUERY_PREFIXES)]
    return urlunparse((parsed.scheme.lower(), parsed.netloc.lower().removeprefix("www."), parsed.path.rstrip("/"), "", urlencode(filtered), ""))


def normalize_title(title: str) -> str:
    return re.sub(r"[^\w\s가-힣]", "", re.sub(r"\s+", " ", (title or "").strip().lower())).strip()


def article_keys(article):
    keys = []
    u = normalize_url(article.get("url", ""))
    if u:
        keys.append(f"url:{u}")
    t = normalize_title(article.get("title_en") or article.get("title", ""))
    if t:
        keys.append(f"title:{t}")
    return keys


def article_rank(article):
    return (article.get("priority", 99), 1 if article.get("type") == "google_news" else 0, 0 if article.get("summary") else 1)

# ── 수집 ───────────────────────────────────────────────────────────────────────

def strip_html(text):
    return re.sub(r"<[^>]+>", "", text or "").strip()


def parse_date(entry):
    for attr in ("published_parsed", "updated_parsed"):
        val = getattr(entry, attr, None)
        if val:
            try:
                return datetime(*val[:6], tzinfo=timezone.utc)
            except Exception:
                continue
    return None


def fetch_feed(config):
    articles = []
    lookback = YOUTUBE_LOOKBACK if config.get("type") == "youtube" else HOURS_LOOKBACK
    cutoff = datetime.now(timezone.utc) - timedelta(hours=lookback)

    try:
        parsed = feedparser.parse(config["url"])
        if not parsed.entries:
            print(f"  — {config['name']}: 기사 없음")
            return articles

        raw_count = 0
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

            raw_count += 1
            if not is_relevant(title_raw, summary_raw):
                continue

            articles.append({
                "title":     title_raw,
                "url":       url,
                "source":    config["name"],
                "category":  config["category"],
                "priority":  config["priority"],
                "type":      config.get("type", "rss"),
                "published": pub_date.strftime("%Y-%m-%d") if pub_date else "",
                "summary":   summary_raw,
            })

        filtered_out = raw_count - len(articles)
        suffix = f"  (사전 필터 {filtered_out}개 제외)" if filtered_out else ""
        print(f"  ✓ {config['name']}: {len(articles)}개{suffix}")

    except Exception as e:
        print(f"  ✗ {config['name']}: {e}")

    return articles


def deduplicate(articles):
    seen = set()
    unique = []
    for article in sorted(articles, key=article_rank):
        keys = article_keys(article)
        if keys and any(k in seen for k in keys):
            continue
        unique.append(article)
        for k in keys:
            seen.add(k)
    return unique

# ── 저장 ───────────────────────────────────────────────────────────────────────

def load_existing(date_str) -> list:
    """오늘 이미 저장된 JSON이 있으면 불러온다."""
    json_path = VAULT_PATH / "오늘의 뉴스" / f"{date_str}.json"
    if json_path.exists():
        try:
            return json.loads(json_path.read_text(encoding="utf-8"))
        except Exception:
            return []
    return []


def save(articles, date_str):
    out_dir = VAULT_PATH / "오늘의 뉴스"
    out_dir.mkdir(parents=True, exist_ok=True)
    json_path = out_dir / f"{date_str}.json"
    json_path.write_text(json.dumps(articles, ensure_ascii=False, indent=2), encoding="utf-8")
    return json_path

# ── 메인 ───────────────────────────────────────────────────────────────────────

def main():
    date_str = datetime.now().strftime("%Y-%m-%d")
    print(f"\n Fetch & Curate — {date_str}")
    print(f"   {len(FEEDS)}개 피드 수집 중...\n")
    print(f"   Vault: {VAULT_PATH}\n")

    # 기존 오늘 기사 로드 (있으면 중복 제외 기준으로 사용)
    existing = load_existing(date_str)
    existing_keys: set = set()
    for a in existing:
        for k in article_keys(a):
            existing_keys.add(k)
    if existing:
        print(f"   기존 기사 {len(existing)}개 확인 (중복 제외 적용)\n")

    all_articles = []
    for feed in FEEDS:
        all_articles.extend(fetch_feed(feed))

    # 배치 내 중복 제거 → 기존과 중복 제거
    unique_new = deduplicate(all_articles)
    if existing_keys:
        unique_new = [a for a in unique_new if not any(k in existing_keys for k in article_keys(a))]

    removed = len(all_articles) - len(unique_new)
    print(f"\n수집 {len(all_articles)}개 → 중복/필터 {removed}개 제거 → 신규 {len(unique_new)}개")

    merged = existing + unique_new
    json_path = save(merged, date_str)
    print(f"JSON 저장 (누적 {len(merged)}개): {json_path}")

    if unique_new:
        print("\n--- NEW_ARTICLES_START ---")
        print(json.dumps(unique_new, ensure_ascii=False, indent=2))
        print("--- NEW_ARTICLES_END ---")
    else:
        print("\n신규 기사가 없습니다.")


if __name__ == "__main__":
    main()
