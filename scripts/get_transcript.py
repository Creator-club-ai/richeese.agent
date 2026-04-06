"""
get_transcript.py

YouTube URL을 받아 자막(타임스탬프 포함)을 추출한다.
Claude가 이 출력을 읽고 챕터 구성 + 요약을 직접 수행한다.

Usage:
    python get_transcript.py <youtube_url> [--lang ko en]

Output:
    JSON to stdout
    {
        "video_id": "...",
        "title": "...",
        "url": "...",
        "language": "ko",
        "segments": [
            {"start": 0.0, "text": "..."},
            ...
        ],
        "full_text": "..."
    }
"""

import sys
import json
import re
import argparse

try:
    from youtube_transcript_api import YouTubeTranscriptApi  # noqa: F401
except ImportError:
    print(json.dumps({
        "error": (
            "youtube-transcript-api가 설치되어 있지 않습니다. "
            "다음 명령으로 설치하세요: pip install youtube-transcript-api"
        )
    }, ensure_ascii=False))
    sys.exit(1)


def extract_video_id(url: str) -> str:
    patterns = [
        r"(?:v=|youtu\.be/|embed/|shorts/)([A-Za-z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise ValueError(f"YouTube URL에서 video ID를 찾을 수 없습니다: {url}")


def get_video_title(video_id: str) -> str:
    """yt-dlp로 영상 제목을 가져온다."""
    try:
        import yt_dlp
        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(
                f"https://www.youtube.com/watch?v={video_id}",
                download=False
            )
            return info.get("title", "")
    except Exception:
        return ""


def get_transcript(video_id: str, lang_priority: list[str]) -> tuple[list[dict], str, str]:
    """youtube-transcript-api 1.x로 자막을 가져온다."""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        from youtube_transcript_api._errors import (
            TranscriptsDisabled,
            NoTranscriptFound,
            VideoUnavailable,
        )
    except ImportError:
        raise RuntimeError(
            "youtube-transcript-api가 설치되어 있지 않습니다. "
            "다음 명령으로 설치하세요: pip install youtube-transcript-api"
        )

    api = YouTubeTranscriptApi()

    try:
        transcript_list = api.list(video_id)
    except TranscriptsDisabled:
        raise RuntimeError("이 영상은 자막이 비활성화되어 있습니다.")
    except VideoUnavailable:
        raise RuntimeError("영상을 찾을 수 없거나 비공개 영상입니다.")

    # 수동 자막 우선 → 자동 생성 자막 순서로 시도
    transcript = None
    used_language = None

    for lang in lang_priority:
        try:
            transcript = transcript_list.find_manually_created_transcript([lang])
            used_language = lang
            break
        except NoTranscriptFound:
            pass

    if not transcript:
        for lang in lang_priority:
            try:
                transcript = transcript_list.find_generated_transcript([lang])
                used_language = lang + " (auto)"
                break
            except NoTranscriptFound:
                pass

    if not transcript:
        # 아무 자막이나 첫 번째로 시도
        try:
            available = [t.language_code for t in transcript_list]
            transcript = transcript_list.find_generated_transcript(available)
            used_language = "auto"
        except Exception:
            raise RuntimeError(
                "사용 가능한 자막이 없습니다. "
                "자동 자막이 생성되지 않은 영상일 수 있습니다."
            )

    raw = transcript.fetch()

    segments = []
    for item in raw:
        if hasattr(item, "text") and hasattr(item, "start"):
            segments.append({
                "start": round(float(item.start), 2),
                "text": item.text.strip(),
            })
        elif isinstance(item, dict):
            segments.append({
                "start": round(float(item.get("start", 0)), 2),
                "text": item.get("text", "").strip(),
            })

    full_text = " ".join(s["text"] for s in segments if s["text"])
    return segments, full_text, used_language


def format_timestamp(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def main():
    parser = argparse.ArgumentParser(description="YouTube 자막 추출기")
    parser.add_argument("url", help="YouTube URL")
    parser.add_argument(
        "--lang",
        nargs="+",
        default=["ko", "en"],
        help="자막 언어 우선순위 (기본값: ko en)",
    )
    parser.add_argument(
        "--timestamps",
        action="store_true",
        help="full_text에 타임스탬프 포함",
    )
    args = parser.parse_args()

    try:
        video_id = extract_video_id(args.url)
    except ValueError as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        sys.exit(1)

    try:
        segments, full_text, used_language = get_transcript(video_id, args.lang)
    except RuntimeError as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        sys.exit(1)

    title = get_video_title(video_id)

    # --timestamps 옵션이면 full_text에 타임스탬프 삽입
    if args.timestamps:
        lines = []
        for seg in segments:
            ts = format_timestamp(seg["start"])
            lines.append(f"[{ts}] {seg['text']}")
        full_text = "\n".join(lines)

    output = {
        "video_id": video_id,
        "title": title,
        "url": args.url,
        "language": used_language,
        "segment_count": len(segments),
        "segments": segments,
        "full_text": full_text,
    }

    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
