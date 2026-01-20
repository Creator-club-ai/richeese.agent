---
description: YouTube URL을 입력받아 쇼츠 3개를 자동 생성하는 워크플로우
---

# /shorts 워크플로우

유튜브 URL을 입력받아 쇼츠 영상 3개를 만드는 에이전트입니다.

## 참조 문서

- `content_analyzer.md` - 다양한 입력 소스 처리 가이드
- `video_analyzer.md` - 하이라이트 분석 기준
- `brand_guide.md` - Richesse 브랜드 가이드

> **참고**: 쇼츠는 영상 소스에서만 생성 가능합니다.

## 사전 요구사항
- Python 3.x
- yt-dlp (`pip install yt-dlp`)
- FFmpeg (winget으로 설치됨)

## 실행 순서

### 1. 영상 다운로드
// turbo
```powershell
python -m yt_dlp --no-check-certificate -f "best[height<=720]" --no-playlist --write-auto-sub --sub-lang "en,ko" --convert-subs srt -o "output/video.mp4" "<YOUTUBE_URL>"
```

### 2. 자막 확인
output/ 폴더에서 .srt 또는 .vtt 파일이 있는지 확인합니다.

### 3. 자막 분석 및 하이라이트 선택
`video_analyzer.md`를 참고하여 다음 기준으로 쇼츠 구간 3개를 선정합니다:
- 핵심 메시지가 담긴 부분
- 감정적 임팩트 있는 부분
- 실용적인 팁이 있는 부분
- 각 클립은 30~55초

### 4. 쇼츠 추출
// turbo
```powershell
# 클립 1 추출 (시작시간, 길이는 분석 결과에 따라 조정)
"C:\Users\dasar\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin\ffmpeg.exe" -y -ss <START_TIME> -i "output/video.mp4" -t <DURATION> -vf "crop=ih*9/16:ih,scale=1080:1920" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -movflags +faststart "shorts_final/short_1.mp4"
```

### 5. 결과물 확인
shorts_final/ 폴더에서 생성된 쇼츠를 확인합니다.

## 파일 구조
```
richesseshorts/
├── .agent/workflows/shorts.md  ← 이 워크플로우
├── SKILL.md                    ← 스킬 정의
├── video_analyzer.md           ← 하이라이트 분석 가이드
├── shorts_agent.py             ← 자동화 스크립트
├── create_shorts.py            ← 샘플 쇼츠 생성 스크립트
├── output/                     ← 다운로드된 영상
└── shorts_final/               ← 완성된 쇼츠
```

## 자막 스타일 가이드
- **제목**: 상단, 금색(#FFD700), 90pt, 굵게
- **본문 자막**: 하단, 흰색(#FFFFFF), 65pt
- **브랜드**: Richesse.club 워터마크
