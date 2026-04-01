# RSS Feed List

richesse.club 콘텐츠 OS 수집 소스 목록.
우선순위 1 → 3 순으로 정렬. 스크립트의 `FEEDS` 리스트와 동기화.

---

## Priority 1 — Business / Startup

| 소스 | 카테고리 | RSS URL | 비고 |
|---|---|---|---|
| Harvard Business Review | Business | `http://feeds.hbr.org/harvardbusiness` | |
| Fast Company | Business | `https://www.fastcompany.com/latest/rss` | |
| 플래텀 | Startup | `https://platum.kr/feed` | 한국 스타트업 |

## Priority 2 — Money / Strategy

| 소스 | 카테고리 | RSS URL | 비고 |
|---|---|---|---|
| 매일경제 증권 | Money | `https://www.mk.co.kr/rss/40300001/` | 증권/소비 섹션만 |
| The Generalist | Strategy | `https://thegeneralist.substack.com/feed` | Substack |
| Stratechery | Strategy | `https://stratechery.com/feed/` | 무료 글만 수집됨 |

## Priority 3 — Lifestyle / Places

| 소스 | 카테고리 | RSS URL | 비고 |
|---|---|---|---|
| Business of Fashion | Lifestyle | `https://www.businessoffashion.com/feeds/news` | |
| Monocle | Lifestyle | `https://monocle.com/feed/` | |

---

## 피드 추가 방법

1. 이 파일에 행 추가
2. `scripts/fetch_feeds.py` 상단 `FEEDS` 리스트에도 동일하게 추가:
```python
{"name": "소스명", "url": "RSS URL", "category": "카테고리", "priority": 우선순위},
```
