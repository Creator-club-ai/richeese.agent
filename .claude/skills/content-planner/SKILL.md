---
name: content-planner
description: This skill should be used when source-intake has finished and the user is ready to plan a piece of content end-to-end before copywriting. Turn a source packet into one working title, one core thesis, one save reason, and a 4-11 slide content plan. In automated PDCA mode, use angle sidecars when needed, log the verdict, and continue to the editor skill unless the angle is still weak or off-brand.
---

# 콘텐츠 기획자

## Purpose

콘텐츠의 방향, 핵심 주장, 저장 이유, 슬라이드 흐름까지 한 번에 설계한다. 이 단계의 목적은 단순한 구조 스케치가 아니라 "이 카드가 무엇을 어떻게 말할지"를 끝까지 짜서 `editor`에게 넘길 수 있는 상태로 만드는 것이다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- `brands/richesse-club/CONTENT_STRATEGY.md`
- source-intake가 끝난 source packet
- `python scripts/editorial_memory.py snapshot` when running under automated PDCA

## Workflow

1. 가장 강한 단일 방향을 고른다.
2. 방향 메타를 고정한다.
3. 4-11장 사이에서 슬라이드 구조를 설계한다.
4. 슬라이드 흐름과 운영 카드 뼈대를 같이 채운다.
5. 필요하면 `Angle Miner A / B`를 sidecar로 돌린다.
6. manual mode면 초안을 채팅에 보여주고 멈춘다.
7. 승인 후 또는 automated PDCA mode면 Obsidian `content/instagram/` 카드에 저장한다.
8. blocker가 없으면 `editor`로 넘긴다. `designer`는 이 단계의 기본 다음 단계가 아니다.

## Direction Fields

항상 아래 항목을 먼저 고정한다.

- `Working Title`
- `Category`
- `Format`
- `User Value`
- `Depth`
- `Timing`
- `Core Thesis`
- `Save Reason`

## Format Rule

`Format`은 항상 `BRAND_GUIDE.md`의 공식 포맷 분류에서만 고른다.

- `뉴스형`
- `큐레이션형`
- `입문형`
- `정리형`
- `비교형`
- `리스트형`
- `케이스형`
- `인사이트형`
- `해설형`

기획 단계에서 별도의 패턴 체계를 새로 만들지 않는다. 브랜드 가이드의 `Format`이 single source of truth다.

## Content Planning Rule

- 최소 4장
- 보통 6-8장
- 정보량이 많을 때만 10-11장
- 정보가 약하면 억지로 늘리지 않는다
- 각도는 하나로 묶되, 너무 빨리 좁혀 힘을 죽이지 않는다
- 자기계발형, 마인드셋형, 커리어형 카드도 source-backed면 허용한다

각 슬라이드에는 아래 3개를 반드시 쓴다.

- `role`
- `goal`
- `key point`

필요하면 아래를 추가한다.

- `tone`
- `evidence`
- `bridge`

## Output Format

```markdown
## Direction
Working Title:
Category:
Format:
User Value:
Depth:
Timing:
Core Thesis:
Save Reason:

## Structure
Slide 1 - [role]
goal:
key point:

Slide 2 - [role]
goal:
key point:
```

이 출력은 단순 outline이 아니라 `editor`가 바로 카피를 쓸 수 있는 콘텐츠 설계도여야 한다.

## Save Path

Vault 경로 우선순위:

1. `$RICHESSE_VAULT_PATH`
2. `%OneDrive%/문서/Obsidian Vault/richesse-content-os`

승인 후 저장:

- `{vault}/content/instagram/[working-title].md`

## Card Sync Rule

운영 카드에는 아래 frontmatter를 기본으로 맞춘다.

```yaml
---
working_title:
core_angle:
publish_date:
category:
content_format:
platform_format: carousel
priority:
status: idea
done: false
instagram_permalink:
ig_reach:
ig_saves:
---
```

카드 본문에는 최소 아래 섹션을 유지한다.

- `# 제목`
- `## 핵심 문장`
- `## 한 줄 요지`
- `## 왜 저장하나?`
- `## 슬라이드 흐름`
- `## 박히는 문장`
- `## 소스`
- `## 비주얼`
- `## 메모`
- `## Slide Copy`

이 형식이 현재 운영의 기본 기획 산출물이다. 디자이너 handoff가 없어도 여기까지면 기획 노트로 완결돼 있어야 한다.

## Rules

- 방향은 하나만 잡는다.
- 본문 카피는 여기서 완성하지 않는다.
- 승인 전에는 채팅 초안만 사용한다.
- manual mode에서는 승인 전 `editor`로 넘어가지 않는다.
- `designer` 전제 문구를 여기서 만들지 않는다.
- `Format`과 별도로 겹치는 패턴 필드를 만들지 않는다.

## Automation Rule

When running under `head`:

- read editorial memory first
- spawn `Angle Miner A` and `Angle Miner B` only when the angle is ambiguous
- the main planner chooses one direction only
- log the verdict before handing off

Spawn angle sidecars only when:

- 2개 이상 plausible angle이 보인다
- save reason이 아직 약하다
- broad topic을 강제로 좁혀야 한다

Do not spawn them when:

- the user already fixed the angle explicitly
- the source is too weak
- this is a simple revision of an approved card
