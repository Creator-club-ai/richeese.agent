#!/usr/bin/env python3
"""
get_transcript.py

YouTube URL에서 자막을 추출하고 읽기 좋은 마크다운으로 정리합니다.
--save 플래그를 사용하면 Obsidian raw/ 폴더에 자동 저장됩니다.

Usage:
    python get_transcript.py <youtube_url>
    python get_transcript.py <youtube_url> --save
    python get_transcript.py <youtube_url> --lang ko en --save

의존성: pip install youtube-transcript-api yt-dlp
"""

import sys
import re
import argparse
import os
from datetime import datetime
from pathlib import Path

try:
    from youtube_transcript_api import YouTubeTranscriptApi
except ImportError:
    print("youtube-transcript-api가 없습니다.\n실행: pip install youtube-transcript-api")
    sys.exit(1)


# ── Vault 경로 ─────────────────────────────────────────────────────────────────

def get_vault_path() -> Path:
    env = os.environ.get("RICHESSE_VAULT_PATH")
    if env:
        return Path(env)
    onedrive = os.environ.get("OneDrive", "")
    if onedrive:
        return Path(onedrive) / "문서" / "Obsidian Vault" / "richesse-content-os"
    return Path.home() / "OneDrive" / "문서" / "Obsidian Vault" / "richesse-content-os"


# ── 유틸 ───────────────────────────────────────────────────────────────────────

def extract_video_id(url: str) -> str:
    match = re.search(r"(?:v=|youtu\.be/|embed/|shorts/)([A-Za-z0-9_-]{11})", url)
    if match:
        return match.group(1)
    raise ValueError(f"YouTube URL에서 video ID를 찾을 수 없습니다: {url}")


def get_video_meta(video_id: str) -> dict:
    """yt-dlp로 영상 제목, 채널, 날짜를 가져온다."""
    try:
        import yt_dlp
        with yt_dlp.YoutubeDL({"quiet": True, "no_warnings": True, "skip_download": True}) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            return {
                "title":   info.get("title", ""),
                "channel": info.get("uploader", ""),
                "date":    info.get("upload_date", ""),  # YYYYMMDD
            }
    except Exception:
        return {"title": "", "channel": "", "date": ""}


def get_transcript(video_id: str, lang_priority: list) -> tuple:
    """자막 세그먼트 리스트, 사용 언어 반환."""
    from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound, VideoUnavailable

    api = YouTubeTranscriptApi()

    try:
        transcript_list = api.list(video_id)
    except TranscriptsDisabled:
        raise RuntimeError("이 영상은 자막이 비활성화되어 있습니다.")
    except VideoUnavailable:
        raise RuntimeError("영상을 찾을 수 없거나 비공개 영상입니다.")

    transcript = None
    used_lang = None

    for lang in lang_priority:
        try:
            transcript = transcript_list.find_manually_created_transcript([lang])
            used_lang = lang
            break
        except NoTranscriptFound:
            pass

    if not transcript:
        for lang in lang_priority:
            try:
                transcript = transcript_list.find_generated_transcript([lang])
                used_lang = f"{lang} (auto)"
                break
            except NoTranscriptFound:
                pass

    if not transcript:
        try:
            available = [t.language_code for t in transcript_list]
            transcript = transcript_list.find_generated_transcript(available)
            used_lang = "auto"
        except Exception:
            raise RuntimeError("사용 가능한 자막이 없습니다.")

    raw = transcript.fetch()
    segments = []
    for item in raw:
        if hasattr(item, "text") and hasattr(item, "start"):
            segments.append({"start": round(float(item.start), 2), "text": item.text.strip()})
        elif isinstance(item, dict):
            segments.append({"start": round(float(item.get("start", 0)), 2), "text": item.get("text", "").strip()})

    return segments, used_lang


def segments_to_paragraphs(segments: list, gap_threshold: float = 4.0) -> list:
    """
    시간 간격 기준으로 세그먼트를 단락으로 묶는다.
    gap_threshold초 이상 간격이 있으면 새 단락 시작.
    중복/잘린 문장 정리 포함.
    """
    if not segments:
        return []

    paragraphs = []
    current_lines = []
    current_start = segments[0]["start"]

    for i, seg in enumerate(segments):
        text = seg["text"].strip()
        if not text:
            continue

        # 이전 세그먼트와의 간격 계산
        if i > 0:
            gap = seg["start"] - segments[i - 1]["start"]
            if gap >= gap_threshold and current_lines:
                paragraphs.append({
                    "start": current_start,
                    "text": " ".join(current_lines),
                })
                current_lines = []
                current_start = seg["start"]

        current_lines.append(text)

    if current_lines:
        paragraphs.append({
            "start": current_start,
            "text": " ".join(current_lines),
        })

    return paragraphs


def format_timestamp(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s가-힣-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return text[:60]


def make_markdown(video_id: str, url: str, meta: dict, paragraphs: list, lang: str) -> str:
    """Obsidian raw/ 저장용 마크다운 생성."""
    title   = meta.get("title", "")
    channel = meta.get("channel", "")
    raw_date = meta.get("date", "")
    upload_date = f"{raw_date[:4]}-{raw_date[4:6]}-{raw_date[6:]}" if len(raw_date) == 8 else raw_date

    lines = [
        "---",
        f'source_type: youtube',
        f'title: "{title}"',
        f'channel: "{channel}"',
        f'url: "{url}"',
        f'video_id: "{video_id}"',
        f'language: "{lang}"',
        f'upload_date: "{upload_date}"',
        f'captured: "{datetime.now().strftime("%Y-%m-%d")}"',
        "---",
        "",
        f"# {title}",
        "",
        f"**채널:** {channel}  ",
        f"**URL:** {url}  ",
        f"**자막 언어:** {lang}",
        "",
        "---",
        "",
        "## 트랜스크립트",
        "",
    ]

    for para in paragraphs:
        ts = format_timestamp(para["start"])
        lines.append(f"**`{ts}`** {para['text']}")
        lines.append("")

    return "\n".join(lines)


def save_to_vault(markdown: str, meta: dict, date_str: str) -> Path:
    vault = get_vault_path()
    raw_dir = vault / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)

    title_slug = slugify(meta.get("title", "untitled"))
    filename = f"{date_str}-{title_slug}.md"
    out_path = raw_dir / filename
    out_path.write_text(markdown, encoding="utf-8")
    return out_path


# ── 메인 ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="YouTube 자막 추출 → 가독성 마크다운")
    parser.add_argument("url", help="YouTube URL")
    parser.add_argument("--lang", nargs="+", default=["ko", "en"], help="자막 언어 우선순위 (기본: ko en)")
    parser.add_argument("--save", action="store_true", help="Obsidian raw/ 폴더에 저장")
    args = parser.parse_args()

    try:
        video_id = extract_video_id(args.url)
    except ValueError as e:
        print(f"오류: {e}")
        sys.exit(1)

    print(f"영상 ID: {video_id}")
    print("메타데이터 가져오는 중...")
    meta = get_video_meta(video_id)
    if meta.get("title"):
        print(f"제목: {meta['title']}")

    print("자막 추출 중...")
    try:
        segments, lang = get_transcript(video_id, args.lang)
    except RuntimeError as e:
        print(f"오류: {e}")
        sys.exit(1)

    print(f"자막 언어: {lang}  /  세그먼트 {len(segments)}개")
    paragraphs = segments_to_paragraphs(segments)
    print(f"단락 정리: {len(paragraphs)}개")

    date_str = datetime.now().strftime("%Y-%m-%d")
    markdown = make_markdown(video_id, args.url, meta, paragraphs, lang)

    if args.save:
        out_path = save_to_vault(markdown, meta, date_str)
        print(f"\n저장 완료: {out_path}")
    else:
        print("\n" + "─" * 60)
        print(markdown)


if __name__ == "__main__":
    main()
