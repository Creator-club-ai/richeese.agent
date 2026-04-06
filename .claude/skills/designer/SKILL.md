---
name: designer
description: Use this skill when the user has approved carousel copy from the editor skill and is ready for design handoff AND Figma production. Takes the approved copy and angle classification to produce design notes, then builds the actual slides in Figma using the Figma MCP. Saves final_report.md to Obsidian 05_handoff and project root. This is the final step before export.
---

# Designer

## Role

승인된 원고와 각도 분류를 받아 디자인 노트를 쓰고, Figma MCP를 통해 실제 슬라이드를 제작한다. 두 단계로 진행한다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- editor에서 승인된 슬라이드 원고
- pitch에서 확정된 각도 (Category, Format, User Value, Depth, Timing, Core Thesis)

## Phase 1 — 디자인 노트 + final_report.md

### 디자인 판단

원고와 각도를 함께 읽고 결정한다:
- photo-led / type-led / mixed editorial 중 무엇인가
- 어디서 여백이 필요하고 어디서 밀도가 높아야 하는가
- 시각적 긴장이 어디서 와야 하는가

### 디자인 시스템 기본값

- **Canvas**: 1080 × 1440
- **Headline**: BookkMyungjo
- **Body / Label**: Pretendard
- **Background**: #14110f
- **Text**: white
- **Production**: Figma

### 출력 형식

```
# [Topic]

**Category:** / **Format:** / **User Value:** / **Depth:** / **Timing:**

---

### Core Angle
[한 문장]

### Why Now
[왜 지금인가]

---

### Slide Outline
[슬라이드별 role + key point 요약]

---

### Slide Copy
[editor에서 승인된 원고 그대로]

---

### Design Notes

**Canvas:** 1080 x 1440

**Visual Mood:**
[photo-led / type-led / mixed editorial — 구체적으로. "고급스럽게" 같은 추상어 금지]

**Cover Direction:**
[레이아웃, 여백, 이미지 비중. 디자이너가 바로 상상할 수 있게]

**Typography:**
- headline: BookkMyungjo
- body / label: Pretendard
[추가 지침]

**Layout Rhythm:**
[슬라이드마다 밀도와 여백 흐름]

**Color / Image Direction:**
- base background: #14110f
- base text: white
[보조 톤, 이미지 방향]

**Production Workflow:**
- build in Figma via MCP
- revise in Figma
- export in Figma

**Do Not Use:**
[이 포스트에 맞게 — 일반론 말고]

**Reference Search Keywords:**
[Pinterest 검색용. 필요한 경우만]

---

### Risks or Source Limits
[근거가 약한 부분, 확인 필요한 부분]
```

출력 후 사용자 승인 받고 저장:
- `C:/Users/HP/OneDrive/문서/Obsidian Vault/richesse-content-os/05_handoff/YYYY-MM-DD-[topic].md`
- 프로젝트 루트 `final_report.md`

---

## Phase 2 — Figma 제작

final_report.md 저장 후, 사용자에게 묻는다:

> Figma에서 슬라이드를 바로 만들까요? Figma 파일 URL을 주시면 시작합니다.

### Figma MCP 작업 순서

1. 사용자가 Figma 파일 URL 제공
2. 파일 구조 확인 (기존 페이지/컴포넌트 파악)
3. 새 페이지 생성: `[날짜] [토픽]`
4. 슬라이드마다 1080×1440 프레임 생성
5. 각 프레임에 디자인 노트 기준으로 요소 배치:
   - 배경 사각형 (#14110f)
   - headline 텍스트 (BookkMyungjo)
   - body 텍스트 (Pretendard)
   - 여백과 레이아웃 리듬 적용
6. 완료 후 Figma 링크 출력

### Figma 제작 규칙

- 슬라이드 1개 만들고 사용자 확인 후 나머지 진행
- 폰트가 Figma에 없으면 사용자에게 알린다
- 이미지 삽입은 사용자가 직접 소스를 제공할 때만 진행
- 자동으로 publish하거나 공유 설정을 바꾸지 않는다

## Hard Rules

- Phase 1 디자인 노트 승인 없이 Phase 2로 넘어가지 않는다
- 디자인 노트에 추상어 금지 ("고급스럽게", "세련되게" 등)
- photo-led / type-led / mixed editorial 중 반드시 명시
- 파일 저장은 Obsidian + 프로젝트 루트에만
