# Card-News Team

이 문서는 현재 배치에서 카드뉴스 제작을 위한 활성 작업 기준서입니다.

## 우선순위

- 카드뉴스 제작 흐름에서 이 문서와 기존 루트 문서가 충돌하면 이 문서를 우선 적용합니다.
- 기존 문서는 참고용 레거시 레이어로 남겨 둡니다.
- 실제 승인 여부의 소스 오브 트루스는 문장 표현이 아니라 `approvals.json` 입니다.

## 목표

- 주제 또는 제공 자료를 인스타그램 4:5 카드뉴스로 빠르게 전환합니다.
- 자유 대화형 에이전트 회의 대신 파일 핸드오프로 생산합니다.
- 각 역할은 하나의 산출물에만 책임을 집니다.

## 브랜드 레이어

- `content_researcher`, `content_planner`, `content_editor`, `slide_designer` 는 공통 역할이다.
- 브랜드 차이는 공통 역할 정의가 아니라 `brands/<brand>/` 문서에서 해결한다.
- active brand 선택 우선순위는 아래와 같다.
  1. 현재 사용자 요청 또는 프로젝트 브리프가 명시한 브랜드
  2. 프로젝트 폴더 또는 핸드오프 문서가 명시한 브랜드 가이드 경로
  3. 이미 연결된 샘플 프로젝트의 브랜드 폴더
  4. 위 정보가 없으면 추측하지 말고 브랜드를 먼저 고정한다
- 공통 파일 파이프라인은 브랜드와 무관하게 유지한다.

## 지원 주제 클래스

| 클래스 | 쓰는 상황 | 기본 구조 |
| --- | --- | --- |
| `news` | 지금 바로 다뤄야 하는 이슈, 정책, 발표 | what happened -> why now -> impact -> action |
| `curation` | 여러 사례, 링크, 툴, 의견을 묶을 때 | selection logic -> picks -> comparison -> takeaway |
| `explainer` | 개념을 쉽게 설명해야 할 때 | problem -> concept -> mechanism -> example -> action |
| `checklist` | 저장 가치가 높은 실전형 정보 | situation -> checklist -> common mistakes -> CTA |
| `insight` | 해석, 관점, 프레임이 중요한 주제 | tension -> insight -> evidence -> implication -> CTA |

## 팀 구성

| 역할 | 콜사인 | 입력 | 출력 | 여기서 멈출 것 |
| --- | --- | --- | --- | --- |
| Researcher | `스카웃` | 주제, 링크, 문서, 메모 | `research_brief.md` | 슬라이드 기획, 카피 확정 |
| Planner | `플랜` | `research_brief.md` 또는 제공 자료 | `slide_plan.md` | 상세 원고, 디자인 지시 확정 |
| Editor | `카피` | 승인된 `slide_plan.md`, 필요 시 `research_brief.md` | `carousel_draft.md`, `handoff_brief.md` | 레이아웃 결정, JSON 작성 |
| Designer | `카드` | 승인된 계획, 원고, 핸드오프 | `carousel.json`, 선택적으로 렌더 | 리서치 재작성, 기획 재정의 |
| Owner | `리드` | 승인 대기 산출물 | 승인/보류 결정 | 실무 산출물 대행 |

## 파일 핸드오프 계약

카드뉴스 파이프라인은 아래 순서만 허용합니다.

`research_brief.md -> slide_plan.md -> carousel_draft.md + handoff_brief.md -> carousel.json -> renders/`

### `research_brief.md`

- 주제 클래스
- 왜 지금 다루는지
- 후보 앵글과 추천 앵글
- 핵심 주장과 주장별 근거
- 출처 목록과 Tier
- 시각 소재 힌트
- Unknowns

### `slide_plan.md`

앱과의 호환을 위해 아래 제목을 반드시 그대로 포함합니다.

- `## 대상 독자`
- `## 핵심 메시지 한 줄`
- `## 왜 지금 이 주제인가`
- `## 핵심 포인트 1`
- `## 핵심 포인트 2`
- `## 핵심 포인트 3`
- `## 예상 슬라이드 수`
- `## 마지막 CTA`

추가로 다음 정보를 포함합니다.

- 포맷 선택
- 슬라이드 흐름
- 비주얼 디렉션
- 승인 상태: `Pending owner approval`

### `carousel_draft.md`

- 슬라이드별 목적
- 슬라이드별 헤드라인/본문/강조어
- 팩트 메모 또는 출처 메모
- 캡션 초안

### `handoff_brief.md`

- 브랜드
- 브랜드 가이드 경로
- 프로젝트 목적
- 메시지 우선순위
- 톤/시각 방향
- 슬라이드별 역할과 추천 패턴
- 반드시 보여줄 수치/요소
- 피해야 할 표현

### `carousel.json`

- 1080x1350 기준의 렌더 입력 데이터
- 슬라이드별 `html`, `css`, `theme`, `chrome`, `footer`
- 디자이너의 최종 레이아웃 판단 반영

## 상태 흐름

카드뉴스는 현재 앱 상태를 그대로 사용합니다.

`draft -> planning -> awaiting_plan_approval -> plan_approved -> writing -> designing -> qa -> done`

## 승인 규칙

- `content_planner` 산출물은 승인 전까지 하위 단계로 넘기지 않습니다.
- `content_editor` 와 `slide_designer` 는 `approvals.json.slidePlan.status` 가 `approved` 인지 먼저 확인합니다.
- 마크다운 안에 적힌 승인 문구는 참고용이며, 실제 게이트는 `approvals.json` 입니다.
- 보류 사유가 있으면 하위 단계는 새 파일을 만들지 말고 멈춥니다.

## UI 운영 원칙

- 오너는 기본적으로 작성자가 아니라 승인자입니다.
- 기획 단계의 기본 화면은 입력 폼이 아니라 `slide_plan.md` 검토 화면입니다.
- 생성 단계의 기본 화면은 raw textarea 편집기가 아니라 원고/디자인 초안 검토 화면입니다.
- 직접 수정은 항상 가능하지만 `Edit manually` 또는 `Override draft` 성격의 보조 경로로만 둡니다.
- 이미 승인된 기획을 숨겨진 regenerate로 덮어쓰지 않습니다. 수정이 필요하면 다시 검토 가능한 상태로 되돌린 뒤 진행합니다.
- 디자이너 화면은 특정 브랜드 패턴을 하드코딩하지 않고 active brand 가이드를 읽은 뒤 판단합니다.

## 역할별 중단 조건

### Researcher

- 신뢰 가능한 근거가 부족함
- 주제 범위가 지나치게 넓음
- 핵심 주장을 3~5개로 정리할 수 없음

### Planner

- `researched` 프로젝트인데 `research_brief.md` 가 없음
- 카드뉴스 포맷을 하나로 좁히지 못함
- 10장을 넘겨야만 메시지가 성립함

### Editor

- `approvals.json` 에서 승인 상태가 아님
- 핵심 주장과 근거의 연결이 흐려짐
- 한 슬라이드에 메시지 2개 이상이 섞임

### Designer

- 승인 상태가 아님
- `carousel_draft.md` 또는 `handoff_brief.md` 가 없음
- active brand 가 불명확하거나 브랜드 가이드가 없음
- 4:5 규격과 모바일 가독성을 지킬 수 없음

## 운영 원칙

- 한 역할은 하나의 문서를 다음 단계가 바로 쓸 수 있게 만든다.
- 에이전트끼리 자유 토론하지 않는다. 파일로만 넘긴다.
- 리서치 단계에서 해결할 문제를 디자인 단계로 미루지 않는다.
- 디자인은 템플릿 복붙이 아니라 메시지 전달력 기준으로 결정한다.

## 빠른 호출 순서

0. 현재 프로젝트의 active brand 고정
1. `스카웃`: 주제 조사와 `research_brief.md`
2. `플랜`: 카드뉴스 구조와 `slide_plan.md`
3. `리드`: 승인 또는 보류
4. `카피`: `carousel_draft.md` 와 `handoff_brief.md`
5. `카드`: active brand 가이드 기준으로 `carousel.json` 생성과 필요 시 렌더
