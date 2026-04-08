---
name: content-planner
description: This skill should be used when source-intake has finished and the user is ready to plan a piece of content end-to-end before copywriting. Turn an approved source packet or signal packet into one working title, one core thesis, one save reason, and a 4-11 slide content plan, then stop for user approval before handing off to the editor skill.
---

# 콘텐츠 기획자

## Purpose

콘텐츠의 방향, 핵심 주장, 저장 이유, 슬라이드 흐름까지 한 번에 설계한다. 이 단계의 목적은 단순한 구조 스케치가 아니라 "이 카드가 무엇을 어떻게 말할지"를 끝까지 짜서 `editor`에게 넘길 수 있는 상태로 만드는 것이다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- 승인된 source packet 또는 signal packet

## Workflow

1. 가장 강한 단일 방향을 고른다.
2. 방향 메타를 고정한다.
3. 4-11장 사이에서 슬라이드 구조를 설계한다.
4. 슬라이드 흐름과 운영 카드 뼈대를 같이 채운다.
5. 초안을 채팅에 보여주고 멈춘다.
6. 승인 후 Obsidian stage note와 운영 카드에 반영한다.

## Direction Fields

항상 아래 항목을 먼저 고정한다.

- `Working Title`
- `Category`
- `Format`
- `Content Pattern`
- `User Value`
- `Depth`
- `Timing`
- `Core Thesis`
- `Save Reason`

## Content Pattern Rule

기획 단계에서는 채널 형식과 별도로 콘텐츠 패턴을 하나 고른다.

- `정리형`: 하나의 주제나 프레임을 구조적으로 정리하는 카드
- `리스트형`: 여러 항목을 병렬로 나열하고 비교하는 카드
- `뉴스형`: 최신 사건이나 발표를 중심으로 빠르게 맥락과 의미를 붙이는 카드
- `인사이트형`: 하나의 강한 관찰이나 판단을 중심으로 밀어붙이는 카드

`인사이트형`은 `정리형`에 포함하지 않는다. 정리형은 구조화가 중심이고, 인사이트형은 해석과 주장 자체가 중심이다.

## Content Planning Rule

- 최소 4장
- 보통 6-8장
- 정보량이 많을 때만 10-11장
- 정보가 약하면 억지로 늘리지 않는다

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
Content Pattern:
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

- `{vault}/03_brief/YYYY-MM-DD-[working-title].md`
- `{vault}/content/instagram/[working-title].md`

## Card Sync Rule

운영 카드에는 아래 frontmatter를 기본으로 맞춘다.

```yaml
---
working_title:
core_angle:
publish_date:
category:
format: carousel
content_pattern:
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
- 승인 전에는 `editor`로 넘어가지 않는다.
- `designer` 전제 문구를 여기서 만들지 않는다.
