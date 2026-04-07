---
name: brief
description: Use this skill when the user has approved an angle from the pitch skill and is ready to plan the slide structure. Turns the approved angle into a 4–11 slide skeleton — each slide's role, goal, and key point — then stops for user approval before handing off to the editor skill. Drafts in chat first, then saves the approved structure to Obsidian.
---

# Brief

## Role

확정된 각도를 슬라이드 구조로 설계한다. 원고는 쓰지 않는다. 각 슬라이드가 무슨 일을 해야 하는지 정확히 짜는 것이 이 단계의 전부다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- pitch에서 확정된 각도 (Category, Format, User Value, Depth, Timing, Core Thesis)

## Workflow

1. 이 포스트의 목적을 한 줄로 고정한다.
   - 읽고 나면 무엇이 남아야 하는가
   - 저장형이면 무엇을 저장하게 만드는가
   - 브랜딩형이면 어떤 richesse.club 시선을 남기는가

2. 슬라이드 수를 정한다. 정보량에 따라 유연하게 결정한다.
   - 최소: 4장 (정보가 적을 때)
   - 일반: 6~8장
   - 인사이트가 풍부한 소스: 10~11장도 가능
   - 12장 초과 시 사용자에게 확인 후 진행
   - 정보량이 적으면 억지로 늘리지 않는다.

3. 각 슬라이드의 역할을 정한다.
   - cover, thesis, expansion, signal reading, comparison, conclusion, closing 중 선택
   - 역할이 겹치면 안 된다
   - 앞 장의 내용을 다음 장이 반복하면 안 된다

4. 구조를 채팅에 출력하고 **멈춘다**.

## Output Format

초안은 채팅에 출력한다. 승인 후에는 Obsidian에 저장한다.

---

**Slide Structure**

```
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
> 승인되면 에디터로 넘어갑니다.

구조 승인 시 Obsidian에 저장한다:
- 경로: `{vault}/03_brief/YYYY-MM-DD-[working-title].md` (vault = $RICHESSE_VAULT_PATH 또는 %OneDrive%/문서/Obsidian Vault/richesse-content-os)

## Rules

- 원고를 쓰지 않는다. key point는 내용 힌트이지 완성 문장이 아니다.
- 디자인 노트를 쓰지 않는다.
- 구조 승인 전까지 다음 단계로 넘어가지 않는다.
- 승인 전까지는 chat draft만 사용한다.
