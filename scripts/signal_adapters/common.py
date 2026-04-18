from __future__ import annotations

import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

import requests

SignalArticle = dict[str, object]
SourceConfig = dict[str, object]

MAX_PER_FEED = 5

JINA_BASE = "https://r.jina.ai/"
JINA_HEADERS = {"Accept": "application/json", "X-No-Cache": "true"}
REQUEST_TIMEOUT = 30

EXCLUDE_PATTERNS = [
    r"\b(baseball|football|nba|nfl|nhl|soccer|golf|tennis|tournament|playoff|pitcher|batting)\b",
    r"\b(grammy|billboard|oscar|emmy|album|box office|box-office|movie|sitcom|k-pop)\b",
    r"(euthanasia|abortion|impeach|democrat|republican|congress|senate|partisan)",
    r"\b(5 ways to|10 tips|how to be|morning routine|self-care)\b",
]
EXCLUDE_RE = re.compile("|".join(EXCLUDE_PATTERNS), re.IGNORECASE)

TRACKING_QUERY_PREFIXES = ("utm_",)
TRACKING_QUERY_KEYS = {"fbclid", "gclid", "igshid", "mc_cid", "mc_eid", "ref", "ref_src", "source"}
SOCIAL_PREFIX_RE = re.compile(r"^(rt\s+@?\w+:\s+|via\s+@?\w+:\s+)", re.IGNORECASE)
URL_SUFFIX_RE = re.compile(r"https?://\S+$", re.IGNORECASE)
SOURCE_SUFFIX_RE = re.compile(r"\s+[-|·]\s+[A-Za-z0-9&.,'\- ]+$")

TITLE_STOPWORDS = {
    "the",
    "a",
    "an",
    "of",
    "in",
    "to",
    "and",
    "for",
    "with",
    "on",
    "at",
    "by",
    "from",
    "is",
    "are",
    "was",
    "were",
    "has",
    "have",
    "its",
    "it",
    "this",
    "that",
    "be",
    "as",
    "or",
    "but",
    "not",
    "new",
    "says",
    "said",
    "after",
    "ahead",
    "just",
    "now",
    "latest",
}

SOURCE_TYPE_ORDER = {
    "rss": 0,
    "naver": 0,
    "threads": 1,
    "x": 1,
    "x_syndication": 2,
    "google_news": 2,
    "youtube_ytdlp": 3,
    "youtube_search": 4,
}


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
    compact = SOCIAL_PREFIX_RE.sub("", compact)
    compact = URL_SUFFIX_RE.sub("", compact).strip()
    compact = SOURCE_SUFFIX_RE.sub("", compact).strip()
    return re.sub(r"[^\w\s가-힣]", "", compact).strip()


def title_tokens(title: str) -> set[str]:
    normalized = normalize_title(title)
    tokens = set(re.findall(r"[a-z0-9가-힣]{3,}", normalized))
    return {token for token in tokens if token not in TITLE_STOPWORDS}


def article_keys(article: SignalArticle) -> list[str]:
    keys: list[str] = []
    normalized_url = normalize_url(str(article.get("url", "")))
    if normalized_url:
        keys.append(f"url:{normalized_url}")
    normalized_heading = normalize_title(str(article.get("title_en") or article.get("title", "")))
    if normalized_heading:
        keys.append(f"title:{normalized_heading}")
    return keys


def same_story(left: SignalArticle, right: SignalArticle) -> bool:
    left_url = normalize_url(str(left.get("url", "")))
    right_url = normalize_url(str(right.get("url", "")))
    if left_url and right_url and left_url == right_url:
        return True

    left_title = str(left.get("title_en") or left.get("title", ""))
    right_title = str(right.get("title_en") or right.get("title", ""))
    left_tokens = title_tokens(left_title)
    right_tokens = title_tokens(right_title)
    if len(left_tokens) < 2 or len(right_tokens) < 2:
        return False

    overlap = left_tokens & right_tokens
    if len(overlap) >= 4:
        return True

    minimum = min(len(left_tokens), len(right_tokens))
    if minimum >= 3 and len(overlap) >= minimum - 1:
        return True
    return False


def article_rank(article: SignalArticle) -> tuple[int, int, int, int]:
    return (
        int(article.get("priority", 99)),
        SOURCE_TYPE_ORDER.get(str(article.get("type", "")), 9),
        0 if article.get("summary") else 1,
        -int(article.get("source_count", 1) or 1),
    )


def parse_date(entry: object) -> datetime | None:
    for attr in ("published_parsed", "updated_parsed"):
        value = getattr(entry, attr, None)
        if value:
            try:
                return datetime(*value[:6], tzinfo=timezone.utc)
            except Exception:
                continue
    return None


def parse_datetime_string(value: str) -> datetime | None:
    if not value:
        return None
    try:
        return parsedate_to_datetime(value)
    except Exception:
        return None


def fetch_jina_content(target_url: str, label: str) -> str:
    try:
        response = requests.get(
            f"{JINA_BASE}{target_url}",
            headers=JINA_HEADERS,
            timeout=REQUEST_TIMEOUT,
        )
        if response.status_code != 200:
            print(f"  - {label}: Jina HTTP {response.status_code}")
            return ""
    except Exception as exc:
        print(f"  - {label}: 요청 실패 ({exc})")
        return ""

    try:
        data = response.json().get("data", {})
        content = data.get("content", "")
    except (json.JSONDecodeError, AttributeError):
        content = response.text

    if not content:
        print(f"  - {label}: 내용 없음")
        return ""
    return content


def run_ytdlp_json(args: list[str], timeout: int = 60) -> list[dict[str, object]]:
    commands = [
        ["yt-dlp", "--dump-json", "--no-download", *args],
        [sys.executable, "-m", "yt_dlp", "--dump-json", "--no-download", *args],
    ]
    result: subprocess.CompletedProcess[str] | None = None
    for command in commands:
        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=timeout,
            )
            break
        except FileNotFoundError:
            continue
        except subprocess.TimeoutExpired:
            return []

    if result is None:
        return []

    items: list[dict[str, object]] = []
    for line in result.stdout.strip().splitlines():
        try:
            payload = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(payload, dict):
            items.append(payload)
    return items


def count_cross_sources(articles: list[SignalArticle]) -> list[int]:
    source_counts = [1] * len(articles)
    for index, article in enumerate(articles):
        keywords_i = title_tokens(str(article.get("title", "")))
        if len(keywords_i) < 2:
            continue

        sources_seen = {str(article.get("source", ""))}
        for other_index, other_article in enumerate(articles):
            if index == other_index:
                continue
            keywords_j = title_tokens(str(other_article.get("title", "")))
            if len(keywords_i & keywords_j) >= 2:
                sources_seen.add(str(other_article.get("source", "")))
        source_counts[index] = len(sources_seen)

    return source_counts


def deduplicate(articles: list[SignalArticle]) -> list[SignalArticle]:
    seen: set[str] = set()
    unique: list[SignalArticle] = []
    for article in sorted(articles, key=article_rank):
        keys = article_keys(article)
        if keys and any(key in seen for key in keys):
            continue
        if any(same_story(article, kept) for kept in unique):
            continue
        unique.append(article)
        seen.update(keys)
    return unique
