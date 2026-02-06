# 콘텐츠 리퍼포징 시스템

> **Richesse.club** 소셜 미디어 콘텐츠 에이전트  
> 유튜브/아티클 하나로 5개 플랫폼 콘텐츠 자동 생성

---

## 📁 파일 구조

```
콘텐츠/
├── .agent/
│   ├── config/                    # 🔧 공통 설정
│   │   ├── brand_guide.md         # 브랜드 가이드라인
│   │   ├── content_analyzer.md    # 콘텐츠 분석 프레임워크
│   │   ├── design_system.md       # 디자인 시스템
│   │   └── video_analyzer.md      # 영상 분석 가이드
│   │
│   └── skills/                    # 🧠 자동 참조 스킬 (7개)
│       ├── instagram-slides/SKILL.md   # 인스타 캐러셀
│       ├── linkedin-post/SKILL.md      # LinkedIn 포스트
│       ├── threads-post/SKILL.md       # Threads 게시물
│       ├── x-post/SKILL.md             # X 단일 트윗
│       ├── x-thread/SKILL.md           # X 쓰레드
│       ├── youtube-shorts/SKILL.md     # YouTube 쇼츠
│       └── repurpose/SKILL.md          # 통합 리퍼포징
│
├── output/                        # 📤 생성된 콘텐츠
│   ├── youtube/shorts/
│   ├── instagram/slides/
│   ├── threads/
│   ├── x/posts/
│   ├── x/threads/
│   └── linkedin/posts/
│
├── scripts/                       # 🔨 자동화 스크립트
├── sources/                       # 📥 원본 콘텐츠
├── templates/                     # 🎨 디자인 템플릿
└── docs/                          # 📚 문서화
```

---

## 🎯 지원하는 플랫폼 & 콘텐츠

| 플랫폼 | 콘텐츠 타입 | 스킬 |
|--------|-----------|------|
| **YouTube** | 쇼츠 (30~55초 영상) | `youtube-shorts` |
| **Instagram** | 캐러셀 슬라이드 (5~n장) | `instagram-slides` |
| **Threads** | 게시물 (300~500자) | `threads-post` |
| **X (Twitter)** | 단일 트윗 (280자) | `x-post` |
| **X (Twitter)** | 트윗 쓰레드 (5~10개) | `x-thread` |
| **LinkedIn** | 포스트 (1,000~1,500자) | `linkedin-post` |

---

## 🚀 사용법

에이전트에게 자연어로 요청하면 자동으로 적절한 스킬을 선택하여 실행합니다:

### 개별 플랫폼

```
"이 유튜브 영상으로 인스타 슬라이드 만들어줘"
→ instagram-slides 스킬 자동 실행

"이 아티클로 X 트윗 써줘"
→ x-post 스킬 자동 실행

"LinkedIn 포스트로 변환해줘"
→ linkedin-post 스킬 자동 실행
```

### 통합 실행 (모든 플랫폼)

```
"이 유튜브 영상으로 모든 플랫폼 콘텐츠 만들어줘"
→ repurpose 스킬 자동 실행 (5개 플랫폼 한 번에)
```

---

## 📊 지원하는 입력 형식

| 입력 타입 | 예시 | 지원 스킬 |
|----------|------|----------|
| 유튜브 영상 | `https://youtube.com/watch?v=xxx` | 모두 |
| 전사 파일 | `transcript.txt`, `subtitle.srt` | 텍스트 계열 |
| 웹 아티클 | `https://blog.com/article` | 텍스트 계열 |
| PDF 문서 | `document.pdf` | 텍스트 계열 |

> **참고**: 쇼츠는 영상 소스에서만 생성 가능

---

## 📚 설정 파일 역할

### .agent/config/

| 파일 | 역할 |
|------|------|
| `brand_guide.md` | Richesse 브랜드 가이드 (톤앤매너, 해시태그) |
| `content_analyzer.md` | 텍스트 콘텐츠 분석 프레임워크 |
| `video_analyzer.md` | 영상 하이라이트 분석 기준 |
| `design_system.md` | 디자인 스펙 (색상, 폰트) |

---

## 🎨 콘텐츠 스타일

### YouTube 쇼츠 (1080x1920)
- 세로 영상 9:16 비율
- 금색 제목 (상단) + 흰색 자막 (하단)
- Richesse 워터마크

### Instagram 캐러셀 (1080x1350)
- 10장 구성: Hook → 인사이트 → CTA → 브랜딩
- 다크/라이트 배경 + 골드 포인트
- 미니멀 디자인

### Threads (300~500자)
- 짧은 문장 + 줄바꿈
- 이모지 적절히 활용

### X (Twitter)
- **단일 트윗**: 280자 이내, 강렬한 Hook
- **쓰레드**: 5~10개 연결, 번호(1/n) 표기

### LinkedIn (1,000~1,500자)
- 스토리텔링 구조
- 첫 3줄이 Hook (더 보기 유도)
- 전문적이면서 진정성 있는 톤

---

## ⚙️ 작동 방식

1. **자연어 요청 인식**: 사용자의 요청을 분석
2. **스킬 자동 선택**: 적절한 스킬 SKILL.md 자동 참조
3. **콘텐츠 추출**: 유튜브/아티클에서 텍스트 추출
4. **분석**: 핵심 인사이트 5개 + 하이라이트 3개 추출
5. **생성**: 각 플랫폼에 맞는 형식으로 변환
6. **저장**: `output/` 폴더에 자동 저장

---

## 🔧 사전 요구사항

- Python 3.8+
- yt-dlp (`pip install yt-dlp`)
- FFmpeg (쇼츠 생성용)
- Whisper (선택, 고품질 전사용)

---

## 📩 문의

Richesse.club 콘텐츠 팀
