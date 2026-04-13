#!/usr/bin/env python3
"""
Fetch a YouTube transcript and optionally save it into the active profile vault.

Usage:
    python get_transcript.py <youtube_url>
    python get_transcript.py <youtube_url> --save
    python get_transcript.py <youtube_url> --lang ko en --save

Dependencies:
    pip install youtube-transcript-api yt-dlp
"""

from __future__ import annotations

import argparse
import io
import re
import sys
from datetime import datetime
from pathlib import Path

from profile_runtime import load_runtime_profile

if hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

try:
    from youtube_transcript_api import YouTubeTranscriptApi
    from youtube_transcript_api._errors import NoTranscriptFound, TranscriptsDisabled, VideoUnavailable
except ImportError:
    print("youtube-transcript-api is not installed.\nRun: pip install youtube-transcript-api")
    raise SystemExit(1)


RUNTIME_PROFILE = load_runtime_profile()


def extract_video_id(url: str) -> str:
    match = re.search(r"(?:v=|youtu\.be/|embed/|shorts/)([A-Za-z0-9_-]{11})", url)
    if not match:
        raise ValueError(f"Could not extract a video ID from: {url}")
    return match.group(1)


def get_video_meta(video_id: str) -> dict[str, str]:
    try:
        import yt_dlp
    except ImportError:
        return {"title": "", "channel": "", "date": ""}

    try:
        with yt_dlp.YoutubeDL({"quiet": True, "no_warnings": True, "skip_download": True}) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
    except Exception:
        return {"title": "", "channel": "", "date": ""}

    return {
        "title": info.get("title", ""),
        "channel": info.get("uploader", ""),
        "date": info.get("upload_date", ""),
    }


def get_transcript(video_id: str, lang_priority: list[str]) -> tuple[list[dict[str, object]], str]:
    api = YouTubeTranscriptApi()

    try:
        transcript_list = api.list(video_id)
    except TranscriptsDisabled as exc:
        raise RuntimeError("Transcripts are disabled for this video.") from exc
    except VideoUnavailable as exc:
        raise RuntimeError("The video is unavailable or private.") from exc

    transcript = None
    used_lang = None

    for lang in lang_priority:
        try:
            transcript = transcript_list.find_manually_created_transcript([lang])
            used_lang = lang
            break
        except NoTranscriptFound:
            continue

    if transcript is None:
        for lang in lang_priority:
            try:
                transcript = transcript_list.find_generated_transcript([lang])
                used_lang = f"{lang} (auto)"
                break
            except NoTranscriptFound:
                continue

    if transcript is None:
        available = [item.language_code for item in transcript_list]
        try:
            transcript = transcript_list.find_generated_transcript(available)
            used_lang = "auto"
        except Exception as exc:
            raise RuntimeError("No usable transcript was found for this video.") from exc

    raw_segments = transcript.fetch()
    segments: list[dict[str, object]] = []
    for item in raw_segments:
        if hasattr(item, "text") and hasattr(item, "start"):
            segments.append({"start": round(float(item.start), 2), "text": item.text.strip()})
        elif isinstance(item, dict):
            segments.append({"start": round(float(item.get("start", 0)), 2), "text": str(item.get("text", "")).strip()})

    return segments, str(used_lang)


def segments_to_paragraphs(segments: list[dict[str, object]], gap_threshold: float = 4.0) -> list[dict[str, object]]:
    if not segments:
        return []

    paragraphs: list[dict[str, object]] = []
    current_lines: list[str] = []
    current_start = float(segments[0]["start"])

    for index, segment in enumerate(segments):
        text = str(segment["text"]).strip()
        if not text:
            continue

        if index > 0:
            gap = float(segment["start"]) - float(segments[index - 1]["start"])
            if gap >= gap_threshold and current_lines:
                paragraphs.append({"start": current_start, "text": " ".join(current_lines)})
                current_lines = []
                current_start = float(segment["start"])

        current_lines.append(text)

    if current_lines:
        paragraphs.append({"start": current_start, "text": " ".join(current_lines)})

    return paragraphs


def format_timestamp(seconds: float) -> str:
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"


def slugify(text: str) -> str:
    normalized = text.lower().strip()
    normalized = re.sub(r"[^\w\s가-힣]", "", normalized)
    normalized = re.sub(r"[\s_]+", "-", normalized)
    return normalized[:60] or "untitled"


def make_markdown(video_id: str, url: str, meta: dict[str, str], paragraphs: list[dict[str, object]], lang: str) -> str:
    title = meta.get("title", "")
    channel = meta.get("channel", "")
    raw_date = meta.get("date", "")
    upload_date = f"{raw_date[:4]}-{raw_date[4:6]}-{raw_date[6:]}" if len(raw_date) == 8 else raw_date

    lines = [
        "---",
        "source_type: youtube",
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
        f"**Channel:** {channel}  ",
        f"**URL:** {url}  ",
        f"**Transcript Language:** {lang}",
        "",
        "---",
        "",
        "## Transcript",
        "",
    ]

    for paragraph in paragraphs:
        timestamp = format_timestamp(float(paragraph["start"]))
        lines.append(f"**`{timestamp}`** {paragraph['text']}")
        lines.append("")

    return "\n".join(lines)


def save_to_vault(markdown: str, meta: dict[str, str], date_str: str) -> Path:
    raw_dir = RUNTIME_PROFILE.raw_dir
    raw_dir.mkdir(parents=True, exist_ok=True)

    title_slug = slugify(meta.get("title", "untitled"))
    output_path = raw_dir / f"{date_str}-{title_slug}.md"
    output_path.write_text(markdown, encoding="utf-8")
    return output_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fetch a YouTube transcript and format it as markdown.")
    parser.add_argument("url", help="YouTube URL")
    parser.add_argument("--lang", nargs="+", default=["ko", "en"], help="Transcript language priority. Default: ko en")
    parser.add_argument("--save", action="store_true", help="Save the transcript into the active profile raw/ directory.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    try:
        video_id = extract_video_id(args.url)
    except ValueError as exc:
        print(f"Error: {exc}")
        raise SystemExit(1)

    print(f"Video ID: {video_id}")
    print("Loading metadata...")
    meta = get_video_meta(video_id)
    if meta.get("title"):
        print(f"Title: {meta['title']}")

    print("Fetching transcript...")
    try:
        segments, lang = get_transcript(video_id, args.lang)
    except RuntimeError as exc:
        print(f"Error: {exc}")
        raise SystemExit(1)

    print(f"Transcript language: {lang} / segments: {len(segments)}")
    paragraphs = segments_to_paragraphs(segments)
    print(f"Paragraphs: {len(paragraphs)}")

    date_str = datetime.now().strftime("%Y-%m-%d")
    markdown = make_markdown(video_id, args.url, meta, paragraphs, lang)

    if args.save:
        output_path = save_to_vault(markdown, meta, date_str)
        print(f"\nSaved transcript: {output_path}")
        print(f"RAW_TRANSCRIPT_PATH: {output_path}")
        return

    print("\n" + "=" * 60)
    print(markdown)


if __name__ == "__main__":
    main()
