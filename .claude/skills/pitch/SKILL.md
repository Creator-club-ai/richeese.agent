---
name: pitch
description: Use this skill when the user has a source, news signal, or rough idea and wants to find the right richesse.club angle before producing content. Trigger after radar output, or when the user provides an article, video, interview, memo, or vague topic idea. Produces 3 distinct pitchable angles with full classification, then stops for the user to pick one before moving to the brief skill.
---

# Pitch

## Role

richesse.club CMO로서 소재를 읽고 가장 날카로운 각도 3개를 뽑는다. 주제를 넓게 보고 좁게 패키징한다. 단순 요약이나 뻔한 방향은 내지 않는다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- 사용자가 제공한 소스 또는 radar 출력 결과

## Input Types

- Radar에서 선택된 신호
- URL (기사, 유튜브, 인터뷰)
- 텍스트 (트랜스크립트, 메모, 발췌)
- 막연한 아이디어 ("호텔 라운지에 대해 뭔가 하고 싶어")

## Workflow

1. 소스를 richesse.club 편집 기준으로 읽는다.
   - 이 소재가 wealth의 어느 세계에 닿는가
   - 가장 살아있는 장면이나 주장은 무엇인가
   - 뭘 버리고 뭘 남겨야 하는가

2. 각도 3개를 뽑는다.
   - 서로 다른 Format, User Value, 저장 포인트를 가진 3개
   - 같은 말 다르게 포장한 파생 후보는 인정하지 않는다
   - 각도마다 왜 richesse.club에 맞는지 편집 판단을 붙인다

3. 각 각도를 완전히 분류한다.
   - Category, Format, User Value, Depth, Timing

4. 추천 1순위를 정하고 이유를 붙인다.

5. 멈추고 사용자에게 묻는다.

## Output Format

채팅에 출력한다. 파일로 저장하지 않는다.

---

**Pitch Board**

각도 3개를 아래 형식으로 낸다.

```
## 각도 A
- Working Title:
- Category:
- Format:
- User Value: [메인] + [서브 있으면]
- Depth: Light / Medium / Deep
- Timing: Now / Evergreen / Seasonal
- Core Thesis: [이 포스트가 결국 하는 말 한 문장]
- Why Richesse: [왜 richesse.club이 이걸 다뤄야 하는가]
- Save Reason: [사람들이 왜 저장하거나 공유하는가]
- Slide Promise: [4~7장이 어떤 흐름으로 전개되는지 한 줄씩]
```

3개 출력 후:

```
**추천:** 각도 [X]
이유: [왜 지금 이 각도가 richesse.club에 가장 맞는가]
```

마지막 한 줄:

> 어떤 각도로 갈까요? 수정이 필요하면 말씀해주세요.

## Pitch Rules

- 각도마다 Format이 달라야 한다.
- User Value를 3개 이상 붙이지 않는다.
- Slide Promise는 전체 원고가 아니라 흐름만 보여준다. 각 장의 역할을 한 줄씩.
- 소스가 약하면 억지로 3개를 채우지 말고 솔직하게 말한다.
- generic self-help, pure news recap, shouty wealth flex는 각도로 내지 않는다.
- 소스 언어를 그대로 각도 제목에 쓰지 않는다. richesse.club 언어로 재해석한다.
- 파일을 만들지 않는다. 출력은 chat에만.
