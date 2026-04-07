---
name: editor
description: Use this skill when the user has approved a slide structure from the brief skill and is ready to write carousel copy. Takes the approved slide skeleton and writes headline + body copy for each slide following richesse.club tone rules. Stops for user approval before handing off to the designer skill. Drafts in chat first, then saves the approved copy to Obsidian.
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

**기본값: 격식체 (`~다`, `~한다`)**
- 표지 / 헤드라인 / 본문 / 클로징 모두 격식체로 쓴다.
- `~요`, `~죠` 대화체는 사용자가 명시적으로 요청할 때만 사용한다.
- BRAND_GUIDE.md 3)항 톤 규칙보다 이 스킬 규칙이 우선한다. 포스트별로 오버라이드 가능.
- 자기계발 클리셰, 허세, 권위적 어조 금지.
- `있어 보이는 말`보다 `바로 읽히는 말` 우선.
- 소스 언어를 그대로 쓰지 않는다. richesse.club 언어로 재해석한다.

## Body 길이 기준

- **Default**: 120~150자 (한글 기준)
- **Expansion / Signal Reading 슬라이드**: 최대 180자 (정보 밀도가 높을 때)
- **Cover / Closing**: 80자 이내
- 기준을 초과하면 문장을 줄인다. 억지로 채우지 않는다.

## 소스 충실도

- 소스가 있으면 반드시 원문을 확인하고 richesse.club 언어로 재해석한다.
- 소스에 없는 내용을 창작하지 않는다.
- 원문 표현을 그대로 번역하지 않는다. 편집 언어로 다시 쓴다.

## Output Format

초안은 채팅에 출력한다. 승인 후에는 Obsidian에 저장한다.

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
- 경로: `{vault}/04_copy/YYYY-MM-DD-[working-title].md` (vault = $RICHESSE_VAULT_PATH 또는 %OneDrive%/문서/Obsidian Vault/richesse-content-os)

## Rules

- 디자인 노트를 쓰지 않는다.
- depth Light이면 과하게 무겁게 쓰지 않는다.
- 표지 / 헤드라인 톤과 본문 톤을 섞지 않는다.
- 한 슬라이드에 메시지 2개를 쑤셔 넣지 않는다.
- 원고 승인 전까지 다음 단계로 넘어가지 않는다.
- 승인 전까지는 chat draft만 사용한다.
