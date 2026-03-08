# YouthFounderClub 콘텐츠 운영 허브

이 폴더는 디자이너 주도 제작 워크플로우를 운영하기 위한 허브입니다. AI 툴은 보조 수단으로만 사용합니다.

## 운영 원칙
- 하나의 콘텐츠는 한 명의 담당자(Responsible)와 한 명의 최종 승인자(Accountable)를 반드시 가집니다.
- 게시 전 QA 체크리스트를 통과하지 못하면 게시하지 않습니다.
- 월 1회 KPI 회고를 통해 다음 달 기획 우선순위를 조정합니다.
- 탐색형 콘텐츠는 콘텐츠 유형별 탐색 강도와 출처 신뢰도 티어를 충족해야 다음 단계로 진행합니다.
- 고난도 주제(인사이트형/논쟁형)는 `content_researcher -> content_planner -> content_editor/slide_designer` 순서로 진행합니다.
- `Researcher`는 "추가 승인자"가 아니라 `Research Brief`를 공급하는 서비스 역할입니다.
- 슬라이드는 `6~10장`을 기본으로 하고, 정보 밀도가 높은 주제에 한해 `최대 12장`까지 확장합니다.
- 슬라이드는 기본적으로 `content_planner -> owner 승인 -> content_editor/slide_designer` 순서로 진행하며, 승인되지 않은 기획안으로는 다음 단계로 넘어가지 않습니다.
- 릴스는 기본적으로 `probe -> 하이라이트 후보 리포트 -> 오너 승인 -> 선택 구간 다운로드 -> 자막/렌더` 순서로 진행합니다.

## 파일 안내
- `templates/TEAM_RACI.md`: 역할/책임 매트릭스 템플릿
- `templates/CONTENT_CALENDAR_TEMPLATE.md`: 주간/월간 캘린더 템플릿
- `QA_CHECKLIST.md`: 게시 전 품질 점검표
- `templates/KPI_RETRO_TEMPLATE.md`: 월간 성과 추적 및 회고 템플릿
- `ops/TEAM_RACI_CURRENT_2026-03.md`: 현재 배정표(즉시 실행용)
- `ops/CONTENT_CALENDAR_2026_W10.md`: 이번 주 캘린더(채워진 버전)
- `ops/QA_BOARD_2026_W10.md`: 이번 주 QA 실행 보드
- `ops/KPI_RETRO_2026-03.md`: 이번 달 KPI 기록 파일
- `SOURCE_INTAKE_PLAYBOOK.md`: 소스 제공형/탐색형 운영 규칙
- `ELECTRON_INTERNAL_OPS_MVP.md`: Electron 기반 내부 운영툴 MVP 구조 문서
- `projects/<topic>/`: 프로젝트별 브리프, 원고, 핸드오프, 렌더용 JSON 묶음
- `BRAND_GUIDE.md`: 디자이너용 브랜드/레이아웃 유연성 가이드
- `DESIGNER_HANDOFF_BRIEF.md`: 디자이너 주도 제작용 상세 핸드오프 브리프

## 문서 우선순위
문서 간 규칙이 충돌하면 아래 순서로 해석합니다.

1. `README.md`: 운영 원칙과 전체 워크플로우의 기준 문서
2. `ops/TEAM_RACI_CURRENT_2026-03.md`, `ops/CONTENT_CALENDAR_2026_W10.md`: 현재 주차의 실제 운영 상태
3. `SOURCE_INTAKE_PLAYBOOK.md`: 제공형/탐색형 소스 게이트와 `Research Brief` 기준
4. `BRAND_GUIDE.md`, `DESIGNER_HANDOFF_BRIEF.md`: 디자인 가드레일
5. `.agent/skills/*/SKILL.md`: 실행 지침. 상위 문서와 충돌하면 상위 문서를 따릅니다.

## 역할명과 실행 주체
- `Researcher`는 역할명이며, 현재 실행 주체는 `content_researcher`입니다.
- `리드` -> `dasarom4`는 오너/최종 승인자 호출명이며, 자동 실행 에이전트가 아닙니다.
- 탐색형 또는 인사이트형 주제는 `Research Brief` 없이 `플랜` 단계로 넘기지 않습니다.
- 슬라이드 기획안은 `dasarom4` 승인 없이 `카피`, `카드` 단계로 넘기지 않습니다.

## 산출물 파일명 규칙
- 리서치 브리프: `RESEARCH_BRIEF_<YYYY>_<TOPIC>.md`
- 디자이너 핸드오프: `HANDOFF_BRIEF_<YYYY>_<TOPIC>.md`
- 캐러셀 원고 초안: `CAROUSEL_DRAFT_<YYYY>_<TOPIC>.md`
- 렌더용 JSON: `<topic>_carousel.json`
- 렌더 결과물 폴더: `renders/<content-id>`

## 호출 이름 (콜사인)
- `리드` -> `dasarom4` (오너/최종 승인자, 자동 실행 에이전트 아님)
- `스카웃` -> `content_researcher` (`Researcher` 역할명과 동일)
- `플랜` -> `content_planner`
- `카피` -> `content_editor`
- `카드` -> `slide_designer`
- `모션` -> `remotion_pd`

빠른 호출 예시:
1. "스카웃, 나발 라비칸트 how to get rich 관련 Research Brief 만들어줘"
2. "플랜, 스카웃 브리프로 8장짜리 캐러셀 기획해줘"
3. "카피, 8장 슬라이드 원고 + 캡션 작성해줘"
4. "카드, 브리프 기준으로 슬라이드 디자인 완성해줘"

## 주간 운영 루틴 (권장)
1. 월요일: 캘린더 확정, 우선순위 설정
2. 화~목: 제작 및 QA
3. 금요일: 게시/성과 점검, 다음 주 리스크 정리

## 워크플로우
1. `content_researcher` (`Researcher`)가 소스 탐색/검증 후 `Research Brief` 작성
2. Planner가 기획안 작성
3. Editor가 슬라이드/캡션 작성
4. Designer가 브리프를 바탕으로 레이아웃/비주얼을 주도적으로 재구성
5. QA 체크리스트 1차 검수
6. Designer/PD 최종 산출
7. 최종 승인자 확인 후 산출물 전달 (업로드는 오너가 수동 진행)
8. KPI 기록 및 월간 회고 반영

슬라이드는 위 기본 워크플로우의 2번과 3번 사이에 `owner 승인 게이트`를 둡니다.

릴스 세부 흐름:
1. `remotion_pd`가 메타데이터/전사만 먼저 수집
2. `remotion_pd`가 하이라이트 후보를 우선순위와 함께 리포트로 정리
3. `dasarom4`가 후보 중 1개를 승인
4. 승인된 구간만 다운로드/컷 편집 후 자막과 렌더 진행

슬라이드 세부 흐름:
1. `content_planner`가 슬라이드 기획안과 권장 장수, 핵심 메시지, 아웃라인을 작성
2. `content_planner`가 `dasarom4`에게 승인 요청
3. `dasarom4`가 Approve 또는 Hold를 결정
4. 승인된 기획안만 `content_editor`, `slide_designer`가 후속 작업

운영 메모:
- 디자인 시스템은 가드레일이며, 최종 시각 의사결정은 디자이너가 수행합니다.
- `slide_renderer`는 필요 시 구조 검토용으로만 사용합니다(필수 아님).

## 즉시 실행 세트 (이번 주)
1. `ops/TEAM_RACI_CURRENT_2026-03.md` 확인 후 역할 고정
2. `ops/CONTENT_CALENDAR_2026_W10.md` 일정 기준으로 제작 진행
3. 각 콘텐츠는 `ops/QA_BOARD_2026_W10.md`에서 Pass 이후 오너에게 전달
4. 주간 실적은 `ops/KPI_RETRO_2026-03.md`의 W10 행부터 누적 입력
5. 소스 입력 방식은 `SOURCE_INTAKE_PLAYBOOK.md`의 제공형/탐색형 규칙 적용

## 시작 체크리스트
- `templates/TEAM_RACI.md`에서 실제 팀원 이름으로 소유자 지정
- `templates/CONTENT_CALENDAR_TEMPLATE.md`를 이번 주 기준으로 채움
- 첫 게시물부터 `QA_CHECKLIST.md` 사용
- 월말에 `templates/KPI_RETRO_TEMPLATE.md` 1회 작성
