# RSS Feed List

richesse.club 콘텐츠 OS 수집 소스 목록.
우선순위 1 → 2 순으로 정렬. 스크립트의 소스 설정과 동기화.

---

## Priority 1 — Business / Startup (RSS)

| 소스 | 카테고리 | RSS URL | 비고 |
|---|---|---|---|
| TechCrunch | Business | `https://techcrunch.com/feed/` | |
| Harvard Business Review | Business | `http://feeds.hbr.org/harvardbusiness` | |
| a16z | People | `https://a16z.com/feed/` | VC 인사이트 |
| First Round Review | People | `https://review.firstround.com/feed.xml` | 창업자 심층 인터뷰 |
| Lenny's Newsletter | People | `https://www.lennysnewsletter.com/feed` | Substack |
| 한국경제 IT | Business | `https://www.hankyung.com/feed/it` | 한국 비즈니스 #1 |
| 한국경제 경제 | Money | `https://www.hankyung.com/feed/economy` | 한국 경제 전반 |

## Priority 2 — Strategy / Money (RSS)

| 소스 | 카테고리 | RSS URL | 비고 |
|---|---|---|---|
| Wired Business | Business | `https://www.wired.com/feed/category/business/latest/rss` | 테크×비즈니스 |
| Stratechery | Strategy | `https://stratechery.com/feed/` | 무료 글만 수집됨 |
| The Generalist | Strategy | `https://thegeneralist.substack.com/feed` | Substack |
| Not Boring | Strategy | `https://www.notboring.co/feed` | Substack |
| Reuters Business | Money | `https://feeds.reuters.com/reuters/businessNews` | 글로벌 딜/인수 |
| The Economist (Business) | Money | `https://www.economist.com/business/rss.xml` | 페이월 있음 |

---

## Google News (키워드 기반)

| 소스 | 카테고리 | URL | 비고 |
|---|---|---|---|
| GNews: venture capital | People | `https://news.google.com/rss/search?q=venture+capital+startup&hl=en&gl=US&ceid=US:en` | |
| GNews: AI business | Business | `https://news.google.com/rss/search?q=AI+startup+business+model&hl=en&gl=US&ceid=US:en` | |
| GNews: 한국 스타트업 | Business | `https://news.google.com/rss/search?q=한국+스타트업+투자&hl=ko&gl=KR&ceid=KR:ko` | |

---

## X/Twitter (Syndication API — insane-search 방식)

> API 키 불필요. `syndication.twitter.com` 엔드포인트로 타임라인 ~100개 수집.
> 비공식 엔드포인트이므로 X가 변경/차단할 수 있음.

| 핸들 | 카테고리 | 우선순위 | 비고 |
|---|---|---|---|
| @TechCrunch | Business | 1 | 테크 뉴스 |
| @business | Money | 1 | Bloomberg Business |
| @WSJ | Money | 1 | Wall Street Journal |
| @sama | People | 1 | Sam Altman |
| @elikikosk | People | 2 | AI/스타트업 |

### 핸들 추가 방법

`scripts/fetch_and_curate.py` 상단 `X_HANDLES` 리스트에 추가:
```python
{"handle": "핸들명", "category": "카테고리", "priority": 우선순위},
```

---

## Threads (Jina Reader — insane-search 방식)

> API 키 불필요. `r.jina.ai` 경유로 Threads 프로필 페이지를 마크다운 변환하여 포스트 추출.
> 기존 "RSSHub 공개 인스턴스 차단" 문제를 Jina Reader로 우회.

| 핸들 | 카테고리 | 우선순위 | 비고 |
|---|---|---|---|
| @techcrunch | Business | 1 | 테크 뉴스 |
| @theverge | Business | 2 | 테크 미디어 |

### 핸들 추가 방법

`scripts/fetch_and_curate.py` 상단 `THREADS_HANDLES` 리스트에 추가:
```python
{"handle": "핸들명", "category": "카테고리", "priority": 우선순위},
```

---

## YouTube (yt-dlp — insane-search 방식)

> 기존 RSS 방식에서 `yt-dlp`로 전환. 채널 목록 + 키워드 검색 모두 지원.
> `--flat-playlist --dump-json`으로 다운로드 없이 메타데이터만 수집.
> 의존성: `pip install yt-dlp`

### 채널 모니터링 (7일 lookback)

| 소스 | 카테고리 | Channel URL | 비고 |
|---|---|---|---|
| Lex Fridman | People | `https://www.youtube.com/@lexfridman/videos` | |
| Y Combinator | Business | `https://www.youtube.com/@ycombinator/videos` | |

### 키워드 검색

| 검색어 | 카테고리 | 우선순위 | 비고 |
|---|---|---|---|
| AI startup business model 2026 | Business | 2 | 영어권 AI 비즈니스 |
| 한국 스타트업 투자 인터뷰 | Business | 2 | 한국 스타트업 |

### 추가 방법

채널: `YOUTUBE_CHANNELS` 리스트에 추가
```python
{"name": "채널명", "url": "https://www.youtube.com/@handle/videos", "category": "카테고리", "priority": 우선순위},
```

검색: `YOUTUBE_SEARCHES` 리스트에 추가
```python
{"query": "검색어", "category": "카테고리", "priority": 우선순위},
```

---

## 네이버 뉴스 (Jina Reader — insane-search 방식)

> API 키 불필요. `r.jina.ai` 경유로 네이버 뉴스 섹션 페이지를 마크다운 변환하여 기사 추출.
> 개별 기사 본문도 `r.jina.ai/https://n.news.naver.com/article/{press_id}/{article_id}`로 접근 가능.

| 소스 | 카테고리 | URL | 비고 |
|---|---|---|---|
| 네이버 뉴스 경제 | Money | `https://news.naver.com/section/101` | 경제 섹션 |
| 네이버 뉴스 IT/과학 | Business | `https://news.naver.com/section/105` | IT/과학 섹션 |

### 추가 방법

`scripts/fetch_and_curate.py` 상단 `NAVER_NEWS_URLS` 리스트에 추가:
```python
{"name": "소스명", "url": "https://news.naver.com/section/{섹션ID}", "category": "카테고리", "priority": 우선순위},
```

---

## 접근 전략 요약 (insane-search 참조)

| 소스 | 접근 방법 | API 키 | 참조 |
|---|---|---|---|
| RSS 피드 | `feedparser` | 불필요 | 기존 방식 |
| Google News | `feedparser` (RSS) | 불필요 | 기존 방식 |
| X/Twitter | Syndication API (`syndication.twitter.com`) | 불필요 | [insane-search/twitter.md](https://github.com/fivetaku/insane-search) |
| Threads | Jina Reader (`r.jina.ai`) | 불필요 | [insane-search/jina.md](https://github.com/fivetaku/insane-search) |
| YouTube | `yt-dlp` (`--flat-playlist --dump-json`) | 불필요 | [insane-search/media.md](https://github.com/fivetaku/insane-search) |
| 네이버 뉴스 | Jina Reader (`r.jina.ai`) | 불필요 | [insane-search/naver.md](https://github.com/fivetaku/insane-search) |
| 한국경제 | RSS (`hankyung.com/feed/*`) | 불필요 | [insane-search/jina.md](https://github.com/fivetaku/insane-search) |

---

## 미수집 소스 (수동 research-desk 처리)

| 소스 | 이유 |
|---|---|
| Financial Times | 거의 전부 페이월 |
| 네이버 카페 | 로그인 + iframe 이중 장벽, 우회 불가 |
