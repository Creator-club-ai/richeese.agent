# Brands Layer

이 디렉터리는 공통 역할 스킬과 분리된 브랜드 가이드 레이어입니다.

## 목적

- `content_researcher`, `content_planner`, `content_editor`, `slide_designer`, `content_qa` 는 공통 역할로 유지합니다.
- 브랜드 차이는 이 디렉터리 아래 문서에서 해결합니다.
- 공통 파일 파이프라인은 유지하고, 톤/보이스/시각 결정만 브랜드별로 다르게 가져갑니다.

## 구조

```text
brands/
  README.md
  startbase/
    BRAND_GUIDE.md
    DESIGNER_HANDOFF_BRIEF.md
  yfc/
    BRAND_GUIDE.md
    DESIGNER_HANDOFF_BRIEF.md
  richesse-club/
    BRAND_GUIDE.md
    DESIGNER_HANDOFF_BRIEF.md
```

## Active Brand 선택 규칙

아래 우선순위로 active brand 를 고정합니다.

1. 현재 사용자 요청이나 프로젝트 브리프가 명시한 브랜드
2. `sources/<source-id>/source.json.brand`
3. `projects/<topic>/project.json.brand`
4. 프로젝트 폴더 또는 핸드오프 문서가 명시한 브랜드 가이드 경로
5. 기존 샘플 프로젝트가 이미 연결한 브랜드 폴더
6. 위 정보가 없으면 추측하지 말고 브랜드를 먼저 고정

## 공통 규칙

- shared skill 은 브랜드 스타일을 하드코딩하지 않습니다.
- shared skill 은 active brand 폴더와 `source.json` 또는 `project.json` 을 읽고 판단합니다.
- 브랜드 문서가 비어 있거나 초안이면, 문서에 없는 브랜드 진실을 지어내지 않습니다.
- output 파일명과 handoff 파이프라인은 브랜드와 무관하게 유지합니다.
- shared skill 은 다른 skill 의 output owner 를 침범하지 않습니다.
- QA 판단은 브랜드 해석이 아니라, 브랜드 가이드 준수 여부를 점검하는 역할로만 사용합니다.

## 현재 브랜드

- `startbase`: 국내 창업 정보 플랫폼용 작업 브랜드
- `yfc`: 기존 YouthFounderClub 브랜드 레이어
- `richesse-club`: 절제된 에디토리얼 캐러셀 레이어
