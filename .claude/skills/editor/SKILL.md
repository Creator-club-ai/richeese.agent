---
name: editor
description: Use this skill when the user has approved a slide structure from the brief skill and is ready to write carousel copy. Takes the approved slide skeleton and writes headline + body copy for each slide following richesse.club tone rules. Stops for user approval before handing off to the designer skill. Does NOT produce design notes or save files.
---

# Editor

## Role

승인된 슬라이드 구조를 실제 원고로 채운다. 각 슬라이드마다 headline과 body를 쓴다. 디자인 판단은 하지 않는다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- brief에서 승인된 슬라이드 구조
- pitch에서 확정된 각도 (Category, Format, User Value, Depth, Timing, Core Thesis)
- 원본 소스 (있으면)

## Workflow

1. 슬라이드 구조를 각도와 함께 다시 읽는다.
   - Core Thesis를 잃지 않는다
   - 각 슬라이드의 role과 goal을 지킨다

2. 각 슬라이드 원고를 쓴다.
   - **Cover**: 포맷에 맞는 제목 문법. 첫 장에서 약속하는 가치가 분명해야 한다.
   - **Body 슬라이드**: 슬라이드마다 메시지 1개. 앞 장 반복 없음.
   - **Closing**: 억지 CTA 없이 저장 이유나 richesse.club 시선으로 닫는다.

3. 원고를 채팅에 출력하고 **멈춘다**.

## Tone Rules

- **표지 / 헤드라인 / 리스트**: 짧고 강하게. 문어체(`~한다`, `~하는가`) 가능.
- **본문 / 캡션 단락**: 딱딱한 문어체 금지. 세련된 대화체 / 반존대체(`~요`, `~죠`).
- 자기계발 클리셰, 허세, 권위적 어조 금지.
- `있어 보이는 말`보다 `바로 읽히는 말` 우선.
- 소스 언어를 그대로 쓰지 않는다. richesse.club 언어로 재해석한다.

## Output Format

채팅에 출력한다. 파일로 저장하지 않는다.

---

```
## Slide Copy

**Slide 1 — cover**
headline:
body:

**Slide 2 — [role]**
headline:
body:

... (전체 슬라이드)
```

출력 후:

> 원고 확인해주세요. 수정할 부분 있으면 말씀해주세요.
> 승인되면 디자이너로 넘어갑니다.

원고 승인 시 Obsidian에 저장한다:
- 경로: `C:/Users/dasar/OneDrive/문서/Obsidian Vault/richesse-content-os/04_copy/YYYY-MM-DD-[working-title].md`

## Rules

- 디자인 노트를 쓰지 않는다.
- depth Light이면 과하게 무겁게 쓰지 않는다.
- 표지 / 헤드라인 톤과 본문 톤을 섞지 않는다.
- 한 슬라이드에 메시지 2개를 쑤셔 넣지 않는다.
- 원고 승인 전까지 다음 단계로 넘어가지 않는다.
- 파일을 만들지 않는다. 출력은 chat에만.
