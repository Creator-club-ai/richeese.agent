---
name: feed-curator
description: DEPRECATED — merged into feed-fetcher. feed-fetcher now runs fetch_and_curate.py which collects AND curates in one step. Do not invoke this skill separately.
---

# Feed Curator

> **DEPRECATED**: 이 스킬은 `feed-fetcher`에 통합되었다.
> `python scripts/fetch_and_curate.py` 한 번으로 수집 + 큐레이션이 함께 실행된다.
> 이 스킬을 별도로 호출하지 않는다. `feed-fetcher`를 사용할 것.

## Role

수집된 기사를 richesse.club 편집 기준으로 읽고 오늘 만들 만한 신호를 고른다. 뉴스 요약이 아니라 편집 판단이다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- Obsidian vault: `richesse-content-os/00_feeds/YYYY-MM-DD.json` (오늘 날짜)

## Workflow

1. 오늘 날짜의 JSON 파일을 읽는다.
   - 경로: `C:/Users/HP/OneDrive/문서/Obsidian Vault/richesse-content-os/00_feeds/YYYY-MM-DD.json`
   - 파일이 없으면 feed-fetcher를 먼저 실행하라고 안내한다.

2. 각 기사를 richesse.club 기준으로 평가한다.

   **통과 기준 — 세 질문 중 하나 이상 Yes + 아래 필터 통과:**
   1. 이 기사가 없었어도 richesse.club 독자는 몰랐을 것인가?
   2. 이걸 카드뉴스로 만들었을 때 실제로 저장하거나 공유하는 사람이 있는가?
   3. 업계 사람이 "이거 봤어?" 하고 링크를 던질 만한가?
      → 인지도 있는 인물/브랜드 + 예상 밖의 행동·발언·숫자가 결합된 것

   **즉시 제외:**
   - 기업 PR / 보도자료 형식
   - 수치만 있고 "그래서 왜?"가 없는 것 (화제성 있는 실적·투자는 통과 가능)
   - 정치/사회 논쟁성 이슈
   - 일반 대중 미디어 수준의 뉴스 (누구나 이미 봤을 것)
   - 자기계발 / how-to 팁 형식
   - richesse.club 독자가 "그래서 나한테 왜 중요해?"라고 물을 것 같은 기사

3. 신호를 선별하고 편집 각도를 붙인다.
   - 기본: 5개
   - 소재가 풍부한 날: 최대 10개까지
   - 소재가 빈약한 날: 기준 통과한 1~4개도 그대로 출력
   - 카테고리가 다양하게 분포되도록 한다

4. 영어 기사는 모든 출력을 한국어로 번역한다.
   - 소재 설명, richesse 각도, 추천 포맷 모두 한국어로 작성
   - 원문 제목은 괄호 안에 영어 병기 가능
   - 번역투 금지

5. 채팅에 출력하고 Obsidian `01_signals/`에 저장한다.

6. 사용자가 신호를 고르면 그 신호는 `source-intake`로 넘긴다.

## Output Format

**오늘의 소재 레이더 — YYYY-MM-DD**

```
## 신호 1
- 소재: [무엇에 관한 이야기인가]
- 출처: [소스명 + URL]
- richesse 각도: [이 신호를 richesse.club은 어떤 방향으로 읽을 수 있는가]
- 추천 포맷: [정리형 / 인사이트형 / 해설형 / 큐레이션형 등]
- 타이밍: [Now / Evergreen / Seasonal]
```

마지막 두 줄:

> 어떤 신호가 끌리나요?
> 고르시면 source-intake에서 원문을 정리한 뒤 pitch로 넘기겠습니다.

**Obsidian 저장:**
- 경로: `C:/Users/HP/OneDrive/문서/Obsidian Vault/richesse-content-os/01_signals/YYYY-MM-DD.md`
- 채팅 출력과 동일한 내용 저장

## 소재 없을 때

통과 기사가 0개면 신호 목록 대신 아래 메시지를 출력한다:

> 오늘은 헤드라인급 소재가 없습니다.
> 직접 소스를 붙여넣거나 URL을 던져주시면 source-intake부터 시작하겠습니다.

## Rules

- 모든 출력은 한국어로 작성한다.
- 각도 없이 기사 제목만 나열하지 않는다.
- 원문을 읽을 수 있으면 읽는다. 페이월이면 헤드라인+요약으로만 판단한다.
- 신호가 1~2개여도 기준을 통과하면 그대로 내보낸다.
- `feed-curator`는 `pitch`로 직접 넘기지 않는다.
