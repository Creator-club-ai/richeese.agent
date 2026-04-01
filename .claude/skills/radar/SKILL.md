---
name: radar
description: Manual fallback only — use feed-fetcher + feed-curator instead when running locally. Use this skill only when the Python environment is unavailable and RSS scripts cannot run. Surfaces 5 richesse.club-relevant signals by searching the web directly. Prefer feed-fetcher → feed-curator for the standard workflow.
---

# Radar

## Role

richesse.club 편집장이 매일 아침 훑는 방식으로 뉴스와 트렌드를 읽는다. 단순 뉴스 수집이 아니라, 각 신호가 richesse.club의 어떤 세계 안에 들어오는지 편집 판단을 붙여서 내놓는다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`

## When to Use

- 사용자가 "뭐 만들지?", "오늘 소재 없어?", "뉴스 뭐 있어?" 같은 말을 할 때
- 소스 없이 주제 아이디어가 필요할 때
- 콘텐츠 캘린더가 비어 있을 때

## Search Strategy

아래 카테고리별로 검색한다. 한국어 + 영어 둘 다 본다.

- **Business / Money**: 브랜드 전략, 가격 결정, 창업가 선택, 자산 흐름, 소비 변화, 부의 구조
- **Culture / People**: 멤버십 문화, 계층 감각, 취향 신호, 주목받는 인물의 선택
- **Places / Taste**: 새로 뜨는 공간, 리테일 변화, 호텔/라운지/레스토랑 트렌드, 좋은 소비재

검색 키워드 예시:
- `luxury brand strategy 2025`
- `서울 프라이빗 멤버십 클럽`
- `부의 이동 트렌드`
- `quiet luxury 소비`
- `창업가 가격 전략`
- `fine dining 서울`

## Filtering Rules

아래 중 하나라도 해당하면 제외한다.

- 단순 수치 보도 (주가, 통계 나열)
- 정치/사회 논쟁성 이슈
- richesse.club 세계 밖의 일반 대중 뉴스
- 1년 넘은 오래된 소재
- 이미 다른 계정이 뻔하게 다룬 주제

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
- 추천 포맷: [정리형 / 인사이트형 / 해설형 / 큐레이션형 등]
- 타이밍: [Now / Evergreen / Seasonal]
```

5개 출력 후 마지막에 한 줄만 붙인다:

> 어떤 신호가 끌리나요? 고르시면 각도를 잡아볼게요.

## Hard Rules

- 5개 모두 카테고리가 다양하게 분포되도록 한다. 같은 카테고리 3개 이상 금지.
- 각도 없이 뉴스 제목만 나열하지 않는다.
- richesse.club 편집 판단 없이 "이런 기사가 있습니다" 수준으로 끝내지 않는다.
- 신호가 약하면 솔직하게 "오늘은 강한 소재가 없습니다"라고 말한다.
- 파일을 만들지 않는다. 출력은 chat에만.
