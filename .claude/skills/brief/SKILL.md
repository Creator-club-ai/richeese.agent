---
name: brief
description: Use this skill when the user has approved a topic angle from the pitch skill and is ready to produce content. Turns the approved angle into a complete creative brief: slide structure, full carousel copy, and design notes — all in one pass. Has one mid-point checkpoint to confirm slide structure before writing copy. Final output is ready to save as final_report.md.
---

# Brief

## Role

확정된 각도를 실제 카드뉴스로 만든다. 기획과 원고를 분리하지 않고 한 번에 간다. 슬라이드 구조를 먼저 보여주고 사용자가 확인한 뒤 전체 원고와 디자인 노트까지 완성한다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- pitch에서 확정된 각도 (Category, Format, User Value, Depth, Timing, Core Thesis)
- 원본 소스 (있으면)

## Two-Phase Workflow

### Phase 1 — Slide Structure

각도를 4~7장 슬라이드 구조로 설계한다.

1. 이 포스트의 목적을 한 줄로 고정한다.
   - 읽고 나면 무엇이 남아야 하는가
   - 저장형이면 무엇을 저장하게 만드는가
   - 브랜딩형이면 어떤 richesse.club 시선을 남기는가

2. 슬라이드 수를 정한다. 정보량이 적으면 억지로 늘리지 않는다.

3. 각 슬라이드의 역할을 정한다.
   - cover, thesis, expansion, signal reading, comparison, conclusion, closing 중 선택
   - 역할이 겹치면 안 된다
   - 앞 장의 내용을 다음 장이 반복하면 안 된다

4. 구조를 채팅에 출력하고 **멈춘다**.

**Phase 1 Output:**

```
**Slide Structure**

Slide 1 — [role]
goal: [이 슬라이드가 해야 할 일]
key point: [핵심 내용]

Slide 2 — [role]
goal:
key point:

... (전체 슬라이드)
```

출력 후:

> 구조 괜찮으면 "좋아" 또는 "진행해"라고 말씀해주세요. 수정할 부분 있으면 알려주세요.

---

### Phase 2 — Full Copy + Design Notes

구조 승인 후에만 시작한다.

1. 각 슬라이드 원고를 쓴다.
   - Cover: 포맷에 맞는 제목 문법. 첫 장에서 약속하는 가치가 분명해야 한다.
   - Body: 슬라이드마다 메시지 1개. 앞 장 반복 없음.
   - Closing: 억지 CTA 없이 저장 이유나 richesse.club 시선으로 닫는다.

2. 톤 규칙을 지킨다.
   - 표지/헤드라인/리스트: 짧고 강하게. 문어체(`~한다`, `~하는가`) 가능.
   - 본문/캡션 단락: 딱딱한 문어체 금지. 세련된 대화체/반존대(`~요`, `~죠`).
   - 자기계발 클리셰, 허세, 권위적 어조 금지.
   - `있어 보이는 말`보다 `바로 읽히는 말` 우선.

3. 디자인 노트를 쓴다.
   - 추상어로 끝내지 않는다. 디자이너가 바로 제작 판단을 내릴 수 있어야 한다.
   - photo-led / type-led / mixed editorial 중 무엇인지 명시한다.
   - 이미지가 필요하면 Pinterest 검색 키워드를 남긴다.

**Phase 2 Output:**

```
## [Topic]

**Category:** / **Format:** / **User Value:** / **Depth:** / **Timing:**

---

### Core Angle
[한 문장]

### Why Now
[왜 지금인가]

---

### Slide Copy

**Slide 1 — cover**
headline:
body:

**Slide 2 — [role]**
headline:
body:

... (전체 슬라이드)

---

### Design Notes

**Canvas:** 1080 x 1440

**Visual Mood:**
[restrained editorial / type-led / photo-led / mixed — 구체적으로]

**Cover Direction:**
[첫 장의 인상을 디자이너가 바로 상상할 수 있게]

**Typography:**
- headline: BookkMyungjo
- body / label: Pretendard
[추가 지침]

**Layout Rhythm:**
[각 슬라이드의 밀도와 여백 흐름]

**Color / Image Direction:**
- base background: #14110f
- base text: white
[보조 톤, 이미지 방향]

**Production Workflow:**
- build in Figma
- revise in Figma
- export in Figma

**Do Not Use:**
[이 포스트에서 피해야 할 것들]

**Reference Search Keywords:**
[필요한 경우만]

---

### Risks or Source Limits
[근거가 약한 부분, copy 단계에서 더 걸러야 할 부분]
```

마지막:

> `final_report.md`로 저장할까요?

## Quality Rules

- Phase 1 없이 Phase 2로 넘어가지 않는다.
- 슬라이드 역할이 겹치면 구조를 다시 짠다.
- 한 포스트에 메시지가 여러 개로 갈라지면 다시 줄인다.
- depth Light면 과하게 무겁게 쓰지 않는다.
- 디자인 노트는 `고급스럽게` 같은 추상어로 끝내지 않는다.
- 원고에서 표지/헤드라인 톤과 본문 톤을 섞지 않는다.
- richesse.club의 일관된 기준: 선택의 정확도, 여백의 컨트롤, 조용한 권위.
- 파일 저장은 사용자가 승인한 후에만. 그 전까지 chat에만 출력한다.
