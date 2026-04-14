from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

from .common import SignalArticle, SourceConfig
from .naver import fetch_naver_news
from .rss import fetch_rss
from .threads import fetch_threads
from .x_adapter import fetch_twitter
from .youtube import fetch_youtube_channel, fetch_youtube_search

SourceFetcher = Callable[[SourceConfig], list[SignalArticle]]


@dataclass(frozen=True)
class SourceGroup:
    label: str
    summary_label: str
    items: list[SourceConfig]
    fetcher: SourceFetcher


RSS_FEEDS = [
    {"name": "TechCrunch", "url": "https://techcrunch.com/feed/", "category": "Business", "priority": 1},
    {"name": "Harvard Business Review", "url": "http://feeds.hbr.org/harvardbusiness", "category": "Business", "priority": 1},
    {"name": "Wired Business", "url": "https://www.wired.com/feed/category/business/latest/rss", "category": "Business", "priority": 1},
    {"name": "a16z", "url": "https://a16z.com/feed/", "category": "People", "priority": 1},
    {"name": "First Round Review", "url": "https://review.firstround.com/feed.xml", "category": "People", "priority": 1},
    {"name": "Lenny's Newsletter", "url": "https://www.lennysnewsletter.com/feed", "category": "People", "priority": 1},
    {"name": "Stratechery", "url": "https://stratechery.com/feed/", "category": "Strategy", "priority": 1},
    {"name": "The Generalist", "url": "https://thegeneralist.substack.com/feed", "category": "Strategy", "priority": 2},
    {"name": "Not Boring", "url": "https://www.notboring.co/feed", "category": "Strategy", "priority": 2},
    {"name": "The Economist (Business)", "url": "https://www.economist.com/business/rss.xml", "category": "Money", "priority": 1},
    {"name": "Reuters Business", "url": "https://feeds.reuters.com/reuters/businessNews", "category": "Money", "priority": 2},
    {"name": "한국경제 IT", "url": "https://www.hankyung.com/feed/it", "category": "Business", "priority": 1},
    {"name": "한국경제 경제", "url": "https://www.hankyung.com/feed/economy", "category": "Money", "priority": 1},
]

GOOGLE_NEWS_FEEDS = [
    {
        "name": "GNews: venture capital",
        "url": "https://news.google.com/rss/search?q=venture+capital+startup&hl=en&gl=US&ceid=US:en",
        "category": "People",
        "priority": 1,
    },
    {
        "name": "GNews: AI business",
        "url": "https://news.google.com/rss/search?q=AI+startup+business+model&hl=en&gl=US&ceid=US:en",
        "category": "Business",
        "priority": 1,
    },
    {
        "name": "GNews: 한국 스타트업",
        "url": "https://news.google.com/rss/search?q=한국+스타트업+투자&hl=ko&gl=KR&ceid=KR:ko",
        "category": "Business",
        "priority": 1,
    },
]

X_HANDLES = [
    {"handle": "TechCrunch", "category": "Business", "priority": 1},
    {"handle": "business", "category": "Money", "priority": 1},
    {"handle": "WSJ", "category": "Money", "priority": 1},
    {"handle": "elikikosk", "category": "People", "priority": 2},
    {"handle": "sama", "category": "People", "priority": 1},
]

THREADS_HANDLES = [
    {"handle": "techcrunch", "category": "Business", "priority": 1},
    {"handle": "theverge", "category": "Business", "priority": 2},
]

YOUTUBE_CHANNELS = [
    {"name": "Lex Fridman", "url": "https://www.youtube.com/@lexfridman/videos", "category": "People", "priority": 1},
    {"name": "Y Combinator", "url": "https://www.youtube.com/@ycombinator/videos", "category": "Business", "priority": 1},
]

YOUTUBE_SEARCHES = [
    {"query": "AI startup business model 2026", "category": "Business", "priority": 2},
    {"query": "한국 스타트업 투자 인터뷰", "category": "Business", "priority": 2},
]

NAVER_NEWS_URLS = [
    {"name": "네이버 뉴스 경제", "url": "https://news.naver.com/section/101", "category": "Money", "priority": 1},
    {"name": "네이버 뉴스 IT/과학", "url": "https://news.naver.com/section/105", "category": "Business", "priority": 1},
]


def build_source_groups() -> list[SourceGroup]:
    return [
        SourceGroup("[RSS feeds]", "RSS", RSS_FEEDS, lambda config: fetch_rss(config, "rss")),
        SourceGroup("[Google News]", "GNews", GOOGLE_NEWS_FEEDS, lambda config: fetch_rss(config, "google_news")),
        SourceGroup("[X/Twitter - Syndication API]", "X", X_HANDLES, fetch_twitter),
        SourceGroup("[Threads - Jina Reader]", "Threads", THREADS_HANDLES, fetch_threads),
        SourceGroup("[YouTube channels - yt-dlp]", "YT channels", YOUTUBE_CHANNELS, fetch_youtube_channel),
        SourceGroup("[YouTube searches - yt-dlp]", "YT searches", YOUTUBE_SEARCHES, fetch_youtube_search),
        SourceGroup("[Naver News - Jina Reader]", "Naver", NAVER_NEWS_URLS, fetch_naver_news),
    ]
