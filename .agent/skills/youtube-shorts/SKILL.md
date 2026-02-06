---
name: YouTube Shorts Generator
description: YouTube 영상에서 쇼츠(30~55초) 3개를 자동 생성하는 스킬
---

# YouTube Shorts Generator

## 이 스킬은 언제 사용하나요?

- 사용자가 "쇼츠 만들어줘" 요청 시
- 사용자가 "YouTube 쇼츠 생성해줘" 요청 시
- 사용자가 "짧은 영상 클립 뽑아줘" 요청 시

> **주의**: 쇼츠는 영상 소스에서만 생성 가능합니다.

## 참조 문서

- `.agent/config/content_analyzer.md` - 다양한 입력 소스 처리 가이드
- `.agent/config/video_analyzer.md` - 하이라이트 분석 기준
- `.agent/config/brand_guide.md` - Richesse 브랜드 가이드

---

## 사전 요구사항

- Python 3.x
- yt-dlp (`pip install yt-dlp`)
- FFmpeg (winget으로 설치됨)

---

## 실행 순서

### 1. 영상 다운로드
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
```powershell
# 클립 1 추출 (시작시간, 길이는 분석 결과에 따라 조정)
ffmpeg -y -ss <START_TIME> -i "output/video.mp4" -t <DURATION> -vf "crop=ih*9/16:ih,scale=1080:1920" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -movflags +faststart "output/youtube/shorts/short_1.mp4"
```

### 5. 결과물 저장
```
output/youtube/shorts/
├── short_1.mp4         ← 쇼츠 1
├── short_2.mp4         ← 쇼츠 2
├── short_3.mp4         ← 쇼츠 3
└── source.txt          ← 원본 정보
```

---

## 자막 스타일 가이드

- **제목**: 상단, 금색(#FFD700), 90pt, 굵게
- **본문 자막**: 하단, 흰색(#FFFFFF), 65pt
- **브랜드**: Richesse.club 워터마크

---

## 쇼츠 구간 선정 기준

| 우선순위 | 기준 | 예시 |
|---------|------|------|
| 1 | 핵심 메시지 | "이게 가장 중요한 포인트입니다" |
| 2 | 감정적 임팩트 | 놀라운 반전, 감동적인 순간 |
| 3 | 실용적 팁 | 바로 적용 가능한 조언 |
| 4 | 유머/재미 | 웃긴 순간, 밈 가능성 |

---

## 체크리스트

- [ ] 영상이 정상적으로 다운로드되었는가?
- [ ] 자막 파일이 있는가?
- [ ] 3개 구간이 모두 30~55초인가?
- [ ] 세로 비율(9:16)로 변환되었는가?
- [ ] 워터마크가 추가되었는가?
