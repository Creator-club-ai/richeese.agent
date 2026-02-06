---
name: Content Repurpose Master
description: 하나의 콘텐츠로 5개 플랫폼(YouTube, Instagram, Threads, X, LinkedIn) 콘텐츠를 한 번에 생성하는 통합 스킬
---

# Content Repurpose Master

## 이 스킬은 언제 사용하나요?

- 사용자가 "모든 플랫폼용으로 만들어줘" 요청 시
- 사용자가 "리퍼포즈 해줘" 요청 시
- 사용자가 "한 번에 다 만들어줘" 요청 시
- 사용자가 여러 플랫폼 콘텐츠를 동시에 요청할 때

## 생성되는 콘텐츠

- 🎬 YouTube 쇼츠 (영상만) - 3개
- 📸 Instagram 캐러셀 - 10장
- 💬 Threads 게시물 - 1개
- 🐦 X (Twitter) 트윗 + 쓰레드 - 각 1개
- 💼 LinkedIn 포스트 - 1개

> **참고**: 쇼츠는 영상 소스에서만 생성 가능합니다.

## 참조할 스킬

- `.agent/skills/youtube-shorts/SKILL.md` - 쇼츠 생성
- `.agent/skills/instagram-slides/SKILL.md` - 인스타 캐러셀
- `.agent/skills/threads-post/SKILL.md` - Threads 게시물
- `.agent/skills/x-post/SKILL.md` - X 단일 트윗
- `.agent/skills/x-thread/SKILL.md` - X 쓰레드
- `.agent/skills/linkedin-post/SKILL.md` - LinkedIn 포스트

## 참조할 설정

- `.agent/config/content_analyzer.md` - 콘텐츠 분석 프레임워크
- `.agent/config/video_analyzer.md` - 영상 분석 기준
- `.agent/config/brand_guide.md` - Richesse 브랜드 가이드

---

## 실행 순서

### Phase 1: 콘텐츠 수집 및 분석 (공통)

#### 1-0. 입력 타입 감지
- 유튜브 URL (`youtube.com`, `youtu.be`)
- 웹 아티클 URL (`http://`, `https://`)
- 로컬 파일 (`.txt`, `.srt`, `.md`, `.pdf`)

#### 1-1. 콘텐츠 추출

**유튜브 영상인 경우:**
```powershell
python -m yt_dlp --no-check-certificate -f "best[height<=720]" --no-playlist --write-auto-sub --sub-lang "en,ko" --convert-subs srt -o "output/source_video.%(ext)s" "<YOUTUBE_URL>"
```

**전사 파일 / 텍스트 파일인 경우:**
파일 직접 읽기

**웹 아티클인 경우:**
read_url_content 도구 사용

#### 1-2. 텍스트 분석

**쇼츠용 (영상 클립):**
- 하이라이트 구간 3개 (각 30~55초)
- 각 구간의 시작/끝 시간
- 각 구간의 추천 제목

**텍스트 콘텐츠용:**
- 핵심 인사이트 5개
- 기억에 남는 명언/인용구
- 실행 가능한 액션 아이템 3개

---

### Phase 2~6: 플랫폼별 콘텐츠 생성

각 플랫폼별 스킬을 순차적으로 실행:

| Phase | 스킬 | 결과물 |
|-------|-----|--------|
| 2 | `youtube-shorts/SKILL.md` | 쇼츠 3개 |
| 3 | `instagram-slides/SKILL.md` | 슬라이드 10장 + 캡션 |
| 4 | `threads-post/SKILL.md` | 게시물 1개 |
| 5 | `x-post/SKILL.md` + `x-thread/SKILL.md` | 트윗 + 쓰레드 |
| 6 | `linkedin-post/SKILL.md` | 포스트 1개 |

---

## 최종 결과물 구조

```
output/
├── youtube/
│   └── shorts/
│       ├── short_1.mp4
│       ├── short_2.mp4
│       └── short_3.mp4
│
├── instagram/
│   └── slides/
│       └── [날짜]_[주제]/
│           ├── slides.txt
│           ├── caption.txt
│           └── slide_01~10.png
│
├── threads/
│   └── [날짜]_[주제]/
│       └── post.txt
│
├── x/
│   ├── posts/
│   │   └── [날짜]_[주제]/tweet.txt
│   └── threads/
│       └── [날짜]_[주제]/thread.txt
│
└── linkedin/
    └── posts/
        └── [날짜]_[주제]/post.txt
```

---

## 진행 체크리스트

### Phase 1: 준비
- [ ] 콘텐츠 다운로드/추출 완료
- [ ] 핵심 인사이트 5개 추출
- [ ] 하이라이트 구간 3개 선정 (영상인 경우)

### Phase 2: YouTube 쇼츠
- [ ] 클립 3개 추출
- [ ] 자막 합성
- [ ] 워터마크 추가

### Phase 3: Instagram
- [ ] 슬라이드 10장 텍스트 작성
- [ ] 캡션 + 해시태그 작성

### Phase 4: Threads
- [ ] 게시물 작성 완료

### Phase 5: X (Twitter)
- [ ] 단일 트윗 작성
- [ ] 트윗 쓰레드 작성

### Phase 6: LinkedIn
- [ ] 포스트 작성
