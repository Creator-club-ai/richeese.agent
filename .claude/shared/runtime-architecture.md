# Runtime Architecture

이 문서는 `content-os` 스킬 체인이 **현재 live vault 구조** 위에서 어떻게 붙는지 정의한다.
브랜드 판단 기준은 여기 두지 않는다. 브랜드 규칙은 active profile 문서를 따른다.

## Active Runtime

- active profile: `ACTIVE_PROFILE.md`
- runtime overlay: `brands/<profile>/RUNTIME_PROFILE.md`
- brand rules: `brands/<profile>/BRAND_GUIDE.md`
- strategy context: `brands/<profile>/CONTENT_STRATEGY.md`

## Skill Chain (v1)

```text
content-os-news -> content-os-research -> content-os-planner -> content-os-writer -> content-os-reviewer
```

- 한 번에 한 단계만 실행한다.
- 다음 단계는 사용자가 명시적으로 요청할 때만 간다.
- `content-os-reviewer`는 추가됐지만, 구조 자체는 기존 live vault를 그대로 따른다.

## Live Vault Structure

```text
<vault>/
  raw/
  오늘의 뉴스/
    YYYY-MM-DD.md
    YYYY-MM-DD.json
  wiki/
    dossiers/
    people/
    brands/
    concepts/
    developments/
    signals/
    angles/
    topics/
    editorial-memory/
      head-artifacts/
  content/
    ideas/
    instagram/
      templates/
      drafts/
      published/
    magazine/
      drafts/
      published/
```

## Artifact Contract

- `content-os-news`
  - 사람용: `오늘의 뉴스/YYYY-MM-DD.md`
  - 기계용: `오늘의 뉴스/YYYY-MM-DD.json`
- `content-os-research`
  - source를 정리하고 wiki를 업데이트한다
  - 필요하면 `wiki/editorial-memory/head-artifacts/<run-id>/research-output.md`를 남긴다
- `content-os-planner`
  - `content/ideas/<slug>.md`에 editorial brief를 만든다
- `content-os-writer`
  - 포맷에 맞춰 `content/instagram/drafts/` 또는 `content/magazine/drafts/`에 초안을 만든다
- `content-os-reviewer`
  - draft를 검수하고 `ReviewOutput`을 남긴다
  - `pass`여도 자동 publish는 하지 않는다
  - 사용자가 확인한 뒤에만 matching `published/` 폴더로 복사한다

## Handoff Rule

- source는 `raw/`와 `오늘의 뉴스/`에 쌓인다
- reusable knowledge는 `wiki/`로 간다
- 사람이 실제로 편집하는 brief는 `content/ideas/`
- 발행 전 산출물은 `drafts/`
- 발행본은 `published/`
- machine-only artifacts는 `wiki/editorial-memory/head-artifacts/`

## What This Document Does Not Own

- category / format / user value / depth / timing 판단
- richesse tone 기준
- anti-pattern
- topic coverage 우선순위

이 판단은 active profile 문서와 wiki 문서가 맡는다.
