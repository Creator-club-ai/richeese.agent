---
name: radar
description: Manual fallback only — use feed-fetcher + feed-curator instead when running locally. Use this skill only when the Python environment is unavailable and RSS scripts cannot run. Surfaces 5 richesse.club-relevant signals by searching the web directly. Prefer feed-fetcher → feed-curator for the standard workflow.
---

# Radar

## Role

Python 환경 없이 웹 검색으로 오늘의 소재를 직접 찾는다. feed-fetcher를 쓸 수 없을 때만 사용한다. 단순 뉴스 수집이 아니라 richesse.club 편집 판단을 붙여서 신호를 낸다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- `brands/richesse-club/CONTENT_STRATEGY.md`

## When to Use

- Python 환경을 실행할 수 없을 때 (비상용)
- 사용자가 "뭐 만들지?", "오늘 소재 없어?", "뉴스 뭐 있어?" 같은 말을 할 때
- feed-fetcher 실행이 불가능한 상황

**평상시에는 feed-fetcher → feed-curator를 쓴다.**

## Search Strategy

Business / People / Money 중심으로 검색한다. 한국 + 글로벌 둘 다 본다.

**글로벌 비즈니스/VC:**
- `startup founder decision 2025`
- `a16z investment thesis`
- `YC founder interview`
- `tech acquisition deal`
- `AI startup business model`

**글로벌 인물/발언:**
- `[유명 창업자/투자자 이름] interview 2025`
- `silicon valley founder opinion`
- `venture capitalist controversial take`

**한국 비즈니스:**
- `한국 스타트업 투자 유치`
- `국내 테크 기업 전략`
- `창업자 인터뷰`
- `한국 VC 투자`

**Money/Finance:**
- `부의 이동 트렌드`
- `억만장자 투자 결정`
- `private equity deal`

## Filtering Rules

**통과 기준 — 하나 이상 Yes:**
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
- 1년 넘은 오래된 소재

## Output Format

채팅에 출력한다. 파일로 저장하지 않는다.

---

**오늘의 소재 레이더**

신호 5개를 아래 형식으로 낸다.

```
## 신호 1
- 소재: [무엇에 관한 이야기인가]
- 출처: [링크 또는 출처명]
- richesse 각도: [이 신호를 richesse.club은 어떤 방향으로 읽을 수 있는가]
- 추천 포맷: [정리형 / 인사이트형 / 해설형 / 케이스형 등]
- 타이밍: [Now / Evergreen / Seasonal]
```

5개 출력 후:

> 어떤 신호가 끌리나요? 고르시면 source-intake에서 원문을 정리한 뒤 pitch로 넘기겠습니다.

## Hard Rules

- 5개 모두 카테고리가 다양하게 분포. 같은 카테고리 3개 이상 금지.
- 각도 없이 뉴스 제목만 나열하지 않는다.
- 신호가 약하면 솔직하게 "오늘은 강한 소재가 없습니다"라고 말한다.
- 파일을 만들지 않는다. 출력은 chat에만.
- 신호 선택 후 pitch가 아닌 source-intake로 넘긴다.
