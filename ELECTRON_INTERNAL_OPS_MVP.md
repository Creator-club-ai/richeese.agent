# Electron Internal Ops MVP

작성일: 2026-03-06

## 1. 목적

현재 로컬 스킬/스크립트 기반 운영을 `Electron 내부 운영툴`로 감싸서, 브라우저처럼 쓰되 로컬 실행 능력은 유지한다.

핵심 목표:
- 별도 외부 API 서버 없이 로컬 앱으로 운영한다.
- `projects/`, `ops/`, `templates/` 구조를 UI에서 바로 다룬다.
- 슬라이드 승인과 릴스 하이라이트 승인을 앱 안에서 처리한다.
- `yt-dlp`, `ffmpeg`, `remotion`, 파일 이동/저장 같은 로컬 작업을 앱에서 직접 실행한다.

## 2. 비목표

- 퍼블릭 웹서비스화
- 멀티유저 실시간 협업
- 완전 자동 편집/완전 자동 하이라이트 선택
- 첫 버전부터 DB 의존 구조로 전환

## 3. 왜 Electron인가

이 워크스페이스는 일반 웹앱보다 로컬 제작툴에 가깝다.

필수 로컬 작업:
- `.agent/skills/**/SKILL.md` 읽기
- `projects/`, `ops/`, `templates/` 파일 생성/수정/이동
- `yt-dlp`, `ffmpeg`, `remotion` 실행
- 산출물 열기, 폴더 열기, 경로 검증

이 작업은 브라우저 단독으로 처리할 수 없고, Electron `main process`에서는 자연스럽게 처리할 수 있다.

## 4. 핵심 전제

- `스킬`은 실행 엔진이 아니라 지침/워크플로우다.
- Electron은 `스킬을 읽고`, `로컬 런타임 또는 스크립트`를 호출하는 오케스트레이터다.
- 결정적 작업은 기존 스크립트를 그대로 재사용한다.
- 생성형 작업은 향후 `로컬 에이전트 런타임` 또는 `LLM provider`와 연결할 수 있다.

정리:
- 외부 API 서버는 없어도 된다.
- 서버 역할은 Electron `main process` + `preload IPC`가 대신한다.
- LLM이 필요하면 별도 provider 또는 로컬 모델은 나중에 붙일 수 있다.

## 5. 현재 자산 재사용 범위

### 비디오
- `.agent/skills/remotion_pd/reels_renderer/scripts/pipeline-youtube.mjs`
- `.agent/skills/remotion_pd/reels_renderer/scripts/ingest-youtube.mjs`
- `.agent/skills/remotion_pd/reels_renderer/scripts/download-highlight.mjs`
- `.agent/skills/remotion_pd/reels_renderer/scripts/render-job.mjs`
- `.agent/skills/remotion_pd/reels_renderer/scripts/rank-highlight-candidates.mjs`

### 슬라이드
- `.agent/skills/content_planner/SKILL.md`
- `.agent/skills/slide_designer/SKILL.md`
- `.agent/skills/slide_designer/slide_renderer`

### 운영 기준
- `README.md`
- `QA_CHECKLIST.md`
- `SOURCE_INTAKE_PLAYBOOK.md`
- `ops/TEAM_RACI_CURRENT_2026-03.md`

## 6. Electron 앱 구조

권장 폴더:

```text
apps/desktop/
  electron/
    main.ts
    preload.ts
    ipc/
      projects.ts
      approvals.ts
      reels.ts
      slides.ts
      files.ts
      system.ts
  src/
    app/
    pages/
    components/
    store/
    lib/
  package.json
```

권장 스택:
- Electron
- React + Vite
- Zustand
- TypeScript

## 7. 프로세스 역할 분리

### Main Process
- 워크스페이스 루트 탐색
- 파일 읽기/쓰기/이동
- 스크립트 실행
- 승인 상태 저장
- 산출물 경로 열기
- 화이트리스트 기반 명령 실행

### Preload
- 안전한 IPC만 노출
- renderer에 직접 `fs`, `child_process`를 열지 않음

### Renderer
- 프로젝트 목록
- 승인 대기 화면
- 하이라이트 후보 선택
- 슬라이드 기획 승인
- 렌더 상태 확인

## 8. 데이터 구조

운영 루트는 현재 구조를 유지한다.

```text
ops/
projects/
templates/
.agent/
```

프로젝트 폴더 표준화:

```text
projects/<project-id>/
  project.json
  approvals.json
  research_brief.md
  slide_plan.md
  carousel_draft.md
  handoff_brief.md
  carousel.json
  assets/
  renders/
```

현재 이미 있는 `research_brief.md`, `carousel_draft.md`, `handoff_brief.md`, `carousel.json`은 그대로 재사용 가능하다.

추가 권장 파일:

### `project.json`
- `id`
- `title`
- `contentType` (`slide` | `reels`)
- `sourceType` (`provided` | `researched` | `youtube`)
- `status`
- `createdAt`
- `updatedAt`
- `owner`
- `paths`

### `approvals.json`
- `slidePlan.status`
- `slidePlan.approvedBy`
- `slidePlan.approvedAt`
- `reelsHighlight.status`
- `reelsHighlight.candidateIndex`
- `reelsHighlight.approvedBy`
- `reelsHighlight.approvedAt`

## 9. 상태 머신

### 슬라이드

```text
research_ready
-> planning
-> awaiting_plan_approval
-> plan_approved
-> writing
-> designing
-> qa
-> done
```

Hold 가능 상태:
- `awaiting_plan_approval`
- `qa`

### 릴스

```text
source_registered
-> probed
-> awaiting_highlight_approval
-> highlight_approved
-> downloading_section
-> captioning
-> rendering
-> done
```

Hold 가능 상태:
- `awaiting_highlight_approval`
- `qa`

## 10. 승인 규칙

### 슬라이드
- `content_planner`가 기획안 작성
- 상태를 `Pending owner approval`로 저장
- `dasarom4` 승인 전에는 `content_editor`, `slide_designer` 시작 금지

### 릴스
- `remotion_pd`가 하이라이트 후보 리포트 생성
- 후보 index 승인 전 다운로드/렌더 금지

## 11. IPC 설계

권장 IPC surface:

### System
- `system.getWorkspace()`
- `system.openPath(path)`
- `system.runCommand(commandId, payload)`

### Projects
- `projects.list()`
- `projects.get(projectId)`
- `projects.create(payload)`
- `projects.updateMeta(projectId, payload)`

### Slides
- `slides.createPlan(projectId, payload)`
- `slides.markAwaitingApproval(projectId)`
- `slides.approvePlan(projectId, approver)`
- `slides.holdPlan(projectId, reason)`

### Reels
- `reels.probeYoutube(projectId, url)`
- `reels.rankHighlights(projectId)`
- `reels.approveHighlight(projectId, candidateIndex, approver)`
- `reels.downloadApprovedHighlight(projectId)`
- `reels.renderShort(projectId)`

### Files
- `files.readText(path)`
- `files.writeText(path, content)`
- `files.move(from, to)`

중요:
- renderer는 shell command를 직접 만들지 않는다.
- `commandId + typed payload`만 main process로 보낸다.

## 12. 기존 스크립트 매핑

### 릴스
- probe: `node scripts/pipeline-youtube.mjs --url ... --probe-only true`
- 후보 리포트: `node scripts/rank-highlight-candidates.mjs --job-id ...`
- 구간 다운로드: `node scripts/download-highlight.mjs --job-id ... --candidate-index ...`
- 렌더: `node scripts/render-job.mjs --job-id ... --targets short`

### 슬라이드
- 렌더: `node scripts/render.js --data <json> --output renders/<content-id> --skip-build`

### 주의
- 슬라이드 기획 생성 자체는 아직 결정적 스크립트가 없다.
- 첫 MVP에서는 `기획 승인 관리`와 `파일/상태 관리`를 먼저 UI화하고, 생성은 로컬 에이전트 런타임 또는 수동 입력으로 둔다.

## 13. 스킬 연동 전략

권장 방식:

1. Electron이 필요한 `SKILL.md`와 관련 문서를 수집
2. 작업 타입별 프롬프트 패키지를 생성
3. 로컬 에이전트 런타임 또는 추후 연결할 모델 provider에 전달
4. 응답을 프로젝트 폴더 파일에 저장

즉:
- 스킬은 `prompt assembly source of truth`
- Electron은 `workflow shell`
- 스크립트는 `deterministic executor`

## 14. UI 화면

### 1. Dashboard
- 승인 대기 프로젝트
- 렌더 진행 중 작업
- 최근 완료 산출물

### 2. Project List
- 슬라이드 / 릴스 필터
- 상태 필터
- owner approval 대기 필터

### 3. Slide Plan Review
- 기획안 본문 표시
- Approve / Hold 버튼
- 승인 이력

### 4. Reels Highlight Review
- 후보 리스트
- 구간 미리보기
- 후보 index 승인

### 5. Project Detail
- 파일 목록
- 현재 상태
- 산출물 열기
- 로그 보기

## 15. 보안 원칙

- `nodeIntegration: false`
- `contextIsolation: true`
- `preload + contextBridge`만 사용
- renderer에 `fs`, `child_process`, 임의 shell 노출 금지
- 실행 가능한 명령은 화이트리스트로 고정
- 워크스페이스 루트 밖 경로 접근 제한

## 16. MVP 구현 순서

### Phase 1
- Electron shell
- 프로젝트 목록/상세
- 파일 브라우징
- 상태 표시

### Phase 2
- 릴스 probe
- 하이라이트 승인
- 구간 다운로드
- 숏폼 렌더

### Phase 3
- 슬라이드 기획 승인
- 승인 이력 저장
- handoff/render 연결

### Phase 4
- 로컬 에이전트 런타임 연결
- skill 기반 생성 자동화

## 17. 가장 현실적인 첫 릴리즈

첫 릴리즈는 아래만 되어도 충분히 가치가 있다.

- YouTube URL 입력
- 하이라이트 후보 자동 생성
- owner 승인
- short render 실행
- 슬라이드 기획 승인 UI
- 프로젝트/운영 파일 한 화면 조회

즉, `생성형 완전 자동화`보다 `승인/상태/실행 오케스트레이션`을 먼저 웹처럼 만드는 것이 맞다.

## 18. 결론

이 워크스페이스는 Electron으로 랩업하기에 적합하다.

정확한 해석:
- `스킬만으로 웹앱이 되는 것`은 아니다.
- `스킬 + Electron main process + 기존 스크립트` 조합으로는 충분히 내부 운영툴을 만들 수 있다.
- 첫 MVP는 `API 서버 없는 로컬 앱`으로 시작하고, 필요할 때만 외부 모델 provider 또는 API 레이어를 추가한다.
