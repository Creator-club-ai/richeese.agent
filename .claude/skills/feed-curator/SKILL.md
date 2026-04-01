---
name: feed-curator
description: Use this skill after feed-fetcher has run and saved articles to Obsidian. Reads today's fetched articles from the Obsidian vault, evaluates each one against richesse.club editorial standards, and surfaces the 5 best signals with angle suggestions. Saves output to 01_signals in Obsidian. Run after feed-fetcher, before pitch.
---

# Feed Curator

## Role

수집된 기사를 richesse.club 편집 기준으로 읽고 오늘 만들 만한 신호 5개를 고른다. 뉴스 요약이 아니라 편집 판단이다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- Obsidian vault: `richesse-content-os/00_feeds/YYYY-MM-DD.json` (오늘 날짜)

## Workflow

1. 오늘 날짜의 JSON 파일을 읽는다.
   - 경로: `C:/Users/dasar/OneDrive/문서/Obsidian Vault/richesse-content-os/00_feeds/YYYY-MM-DD.json`
   - 파일이 없으면 feed-fetcher를 먼저 실행하라고 안내한다.

2. 각 기사를 richesse.club 기준으로 평가한다.

   **통과 기준 — 두 질문 모두 Yes여야 한다:**
   1. 이 기사가 없었어도 richesse.club 독자는 몰랐을 것인가?
   2. 이걸 카드뉴스로 만들었을 때 실제로 저장하거나 공유하는 사람이 있는가?

   **즉시 제외:**
   - 기업 PR / 보도자료 형식
   - 단순 수치 보도 (실적, 주가, 통계 나열)
   - 정치/사회 논쟁성 이슈
   - 일반 대중 미디어 수준의 뉴스 (누구나 이미 봤을 것)
   - 자기계발 / how-to 팁 형식
   - richesse.club 독자가 "그래서 나한테 왜 중요해?"라고 물을 것 같은 기사

3. 신호 5개를 선별하고 편집 각도를 붙인다. 카테고리가 다양하게 분포되도록 한다 (같은 카테고리 3개 이상 금지).

4. 영어 기사는 모든 출력을 한국어로 번역한다.
   - 소재 설명, richesse 각도, 추천 포맷 모두 한국어로 작성
   - 원문 제목은 괄호 안에 영어 병기 가능: `나이키의 D2C 전환 (Nike's D2C Shift)`
   - 번역투 금지. richesse.club 편집 언어로 자연스럽게 재해석한다.

4. 채팅에 출력하고 Obsidian에 저장한다.

## Output Format

**채팅 출력:**

---

**오늘의 소재 레이더 — YYYY-MM-DD**

```
## 신호 1
- 소재: [무엇에 관한 이야기인가]
- 출처: [소스명 + URL]
- richesse 각도: [이 신호를 richesse.club은 어떤 방향으로 읽을 수 있는가]
- 추천 포맷: [정리형 / 인사이트형 / 해설형 / 큐레이션형 등]
- 타이밍: [Now / Evergreen / Seasonal]
```

5개 출력 후:

> 어떤 신호가 끌리나요? 고르시면 각도를 잡아볼게요. (`/pitch`)

---

**Obsidian 저장:**
- 경로: `richesse-content-os/01_signals/YYYY-MM-DD.md`
- 채팅 출력과 동일한 내용 저장

## 소재 없을 때

통과 기사가 3개 미만이면 신호 목록 대신 아래 메시지를 출력한다:

> 오늘은 헤드라인급 소재가 없습니다.
> 직접 소스를 붙여넣거나 URL을 던져주시면 `/pitch`로 바로 시작할게요.

억지로 채우지 않는다. 기준 미달 소재로 만든 콘텐츠는 브랜드 손해다.

## Rules

- 모든 출력은 한국어로 작성한다. 영어 기사도 한국어로 재해석해서 낸다.
- 각도 없이 기사 제목만 나열하지 않는다.
- 원문을 WebFetch로 읽을 수 있으면 읽는다. 페이월이면 헤드라인+요약으로만 판단한다.
- 파일 저장은 Obsidian 경로에만. 프로젝트 루트에 파일을 만들지 않는다.
