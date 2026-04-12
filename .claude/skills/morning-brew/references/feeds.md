# RSS Feed List

richesse.club 콘텐츠 OS 수집 소스 목록.
우선순위 1 → 2 순으로 정렬. 스크립트의 `FEEDS` 리스트와 동기화.

---

## Priority 1 — Business / Startup

| 소스 | 카테고리 | RSS URL | 비고 |
|---|---|---|---|
| TechCrunch | Business | `https://techcrunch.com/feed/` | |
| Harvard Business Review | Business | `http://feeds.hbr.org/harvardbusiness` | |
| Fast Company | Business | `https://www.fastcompany.com/latest/rss` | |
| Forbes Business | Business | `https://www.forbes.com/business/feed/` | |
| 한국경제 IT | Business | `https://www.hankyung.com/feed/it` | 한국 비즈니스 #1 |
| a16z | Strategy | `https://a16z.com/feed/` | VC 인사이트 |
| First Round Review | People | `https://review.firstround.com/feed.xml` | 창업자 심층 인터뷰 |
| Lenny's Newsletter | People | `https://www.lennysnewsletter.com/feed` | Substack |

## Priority 2 — Strategy / Money

| 소스 | 카테고리 | RSS URL | 비고 |
|---|---|---|---|
| Wired Business | Business | `https://www.wired.com/feed/category/business/latest/rss` | 테크×비즈니스 |
| Stratechery | Strategy | `https://stratechery.com/feed/` | 무료 글만 수집됨 |
| The Generalist | Strategy | `https://thegeneralist.substack.com/feed` | Substack |
| Not Boring | Strategy | `https://www.notboring.co/feed` | Substack |
| Reuters Business | Money | `https://feeds.reuters.com/reuters/businessNews` | 글로벌 딜/인수 |
| The Economist (Business) | Money | `https://www.economist.com/business/rss.xml` | 페이월 있음 |
| 매일경제 증권 | Money | `https://www.mk.co.kr/rss/40300001/` | 증권/소비 섹션 |

---

## Google News (키워드 기반)

| 소스 | 카테고리 | URL | 비고 |
|---|---|---|---|
| GNews: startup founder | Business | `https://news.google.com/rss/search?q=startup+founder+interview&hl=en&gl=US&ceid=US:en` | |
| GNews: venture capital | People | `https://news.google.com/rss/search?q=venture+capital+startup&hl=en&gl=US&ceid=US:en` | |
| GNews: AI business | Business | `https://news.google.com/rss/search?q=AI+startup+business+model&hl=en&gl=US&ceid=US:en` | |
| GNews: 한국 스타트업 | Business | `https://news.google.com/rss/search?q=한국+스타트업+투자&hl=ko&gl=KR&ceid=KR:ko` | |

---

## YouTube (7일 lookback)

| 소스 | 카테고리 | Channel ID | 비고 |
|---|---|---|---|
| Lex Fridman | People | `UCSHZKyawb77ixDdsGog4iWA` | |
| Y Combinator | Business | `UCcefcZRL2oaA_uBNeo5UOWg` | |

---

## 미수집 소스 (수동 source-intake 처리)

| 소스 | 이유 |
|---|---|
| Threads (choi.openai 등) | RSSHub 공개 인스턴스 차단 |
| Financial Times | 거의 전부 페이월 |

---

## 피드 추가 방법

1. 이 파일에 행 추가
2. `scripts/fetch_and_curate.py` 상단 `FEEDS` 리스트에도 동일하게 추가:
```python
{"name": "소스명", "url": "RSS URL", "category": "카테고리", "priority": 우선순위, "type": "rss"},
```
