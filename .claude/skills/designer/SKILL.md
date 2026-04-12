---
name: designer
description: This skill should be used when the user has approved carousel copy from the editor skill and is ready for design handoff and Figma production. Take the approved copy and content-planner classification, produce design notes, then build the actual slides in Figma using the Figma MCP. This is outside the default automated loop and should run only when design handoff is explicitly requested.
---

# Designer

## Purpose

승인된 카피를 실제 제작 지시서와 Figma 작업으로 옮긴다. 이 단계에서는 추상적인 무드 설명보다 디자이너가 바로 쓸 수 있는 생산 지시를 남긴다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- `brands/richesse-club/CONTENT_STRATEGY.md`
- 승인된 content plan
- 승인된 Slide Copy
- `python scripts/editorial_memory.py snapshot` when running under automated PDCA

## Workflow

1. content-planner 분류와 copy를 같이 읽는다.
2. visual direction을 정한다.
3. `final_report.md`를 작성한다.
4. 필요하면 design adversarial check를 한 번 더 한다.
5. 승인 후 운영 카드와 `final_report.md`에 반영한다.
6. 필요하면 Figma MCP로 실제 슬라이드를 만든다.

## final_report.md Structure

항상 아래 섹션을 포함한다.

- `Topic`
- `Category`
- `Format`
- `User Value`
- `Depth`
- `Timing`
- `Core Angle`
- `Why Now`
- `Slide Outline`
- `Slide Copy`
- `Design Notes`
- `Risks or Source Limits`

## Design Notes Rule

`Design Notes`에는 아래를 구체적으로 쓴다.

- `Canvas`
- `Visual Mood`
- `Cover Direction`
- `Typography`
- `Layout Rhythm`
- `Color / Material / Image Direction`
- `Production Workflow`
- `Do Not Use`
- `Reference Search Keywords`

추상어만 쓰지 않는다. 바로 제작 가능한 문장으로 쓴다.

## Default System

- Canvas: `1080 x 1440`
- Headline serif: `BookkMyungjo`
- Body sans: `Pretendard`
- Background: `#14110f`
- Text: `white`
- Production: `Figma`

## Save Path

Vault 경로 우선순위:

1. `$RICHESSE_VAULT_PATH`
2. `%OneDrive%/문서/Obsidian Vault/richesse-content-os`

승인 후 저장:

- `{vault}/content/instagram/[working-title].md`
- `{repo}/final_report.md`

운영 카드에는 `## Design Notes`와 `## Risks or Source Limits`를 동기화한다.

## Rules

- copy를 다시 쓰지 않는다.
- generic luxury 스타일을 밀지 않는다.
- 정보 구조와 분위기를 같이 설계한다.
- 승인 전에는 최종 저장이나 Figma production을 확정하지 않는다.

## Automation Rule

When running under `head`:

- run only when design handoff is explicitly requested
- route backward only for real hierarchy, pacing, or brand-fit failures
- log the verdict after the design note pass
