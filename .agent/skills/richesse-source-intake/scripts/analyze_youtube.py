#!/usr/bin/env python3
"""
Subtitle-first YouTube intake helper for richesse-source-intake.

Pulls metadata and captions with yt-dlp, prefers official chapters when present,
otherwise generates chapter candidates from caption timing. The script never
downloads the full video.
"""

from __future__ import annotations

import argparse
import html
import io
import json
import re
import sys
import tempfile
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.error import HTTPError

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

try:
    from yt_dlp import YoutubeDL
except ImportError:
    print("yt-dlp is not installed.\nRun: pip install yt-dlp")
    sys.exit(1)


PREFERRED_EXTS = ("vtt", "json3", "srv3", "ttml", "srv1", "srv2")
TRANSITION_MARKERS = (
    "이제",
    "다음",
    "그다음",
    "정리하면",
    "반대로",
    "한편",
    "첫째",
    "둘째",
    "셋째",
    "마지막으로",
    "next",
    "now",
    "moving on",
    "to sum up",
    "in summary",
    "finally",
    "on the other hand",
)
TAG_RE = re.compile(r"<[^>]+>")
WHITESPACE_RE = re.compile(r"\s+")
BRACKET_ONLY_RE = re.compile(r"^\s*(\[[^\]]+\]|\([^)]+\)|♪+)\s*$")
TIMESTAMP_RE = re.compile(r"(?:(\d{1,2}):)?(\d{2}):(\d{2})(?:[.,](\d{1,3}))?")
PROJECT_ROOT = Path(__file__).resolve().parents[4]
PROJECT_OUTPUT_DIR = PROJECT_ROOT / ".agent" / "skills" / "richesse-source-intake" / "output"


class SilentLogger:
    def debug(self, message: str) -> None:
        return None

    def warning(self, message: str) -> None:
        return None

    def error(self, message: str) -> None:
        return None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Analyze a YouTube URL via subtitles.")
    parser.add_argument("url", help="YouTube URL")
    parser.add_argument(
        "--languages",
        default="ko,en",
        help="Comma-separated subtitle language priority, default: ko,en",
    )
    parser.add_argument(
        "--output-dir",
        help="Optional directory for saved outputs. Defaults to a temp folder.",
    )
    parser.add_argument(
        "--stdout",
        choices=("summary", "json"),
        default="summary",
        help="Print a short summary or the full JSON payload.",
    )
    parser.add_argument(
        "--cookies-from-browser",
        help="Optional browser name for yt-dlp cookie import, for example: edge or chrome",
    )
    parser.add_argument(
        "--cookie-file",
        help="Optional Netscape cookie file path for subtitle requests that need auth.",
    )
    parser.add_argument(
        "--project-final-output",
        default=str(PROJECT_OUTPUT_DIR / "latest_youtube_summary.md"),
        help="Markdown path for the concise final output inside the project.",
    )
    return parser.parse_args()


def parse_timestamp(raw: str) -> float:
    match = TIMESTAMP_RE.search(raw.strip())
    if not match:
        raise ValueError(f"Unsupported timestamp: {raw}")
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2))
    seconds = int(match.group(3))
    millis = int((match.group(4) or "0").ljust(3, "0"))
    return hours * 3600 + minutes * 60 + seconds + millis / 1000.0


def parse_xml_clock(raw: str) -> float:
    value = raw.strip()
    if value.endswith("ms"):
        return float(value[:-2]) / 1000.0
    if value.endswith("s") and value[:-1].replace(".", "", 1).isdigit():
        return float(value[:-1])
    return parse_timestamp(value)


def format_timestamp(seconds: float) -> str:
    total = max(0, int(round(seconds)))
    hours, remainder = divmod(total, 3600)
    minutes, secs = divmod(remainder, 60)
    if hours:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"


def normalize_text(text: str) -> str:
    text = html.unescape(text or "")
    text = TAG_RE.sub("", text)
    text = text.replace("\u200b", " ").replace("\ufeff", " ")
    text = WHITESPACE_RE.sub(" ", text).strip()
    return text


def should_drop_text(text: str) -> bool:
    return not text or BRACKET_ONLY_RE.match(text) is not None


def looks_like_boundary(text: str) -> bool:
    lowered = text.lower().strip()
    return any(lowered.startswith(marker) for marker in TRANSITION_MARKERS)


def looks_like_sentence_end(text: str) -> bool:
    stripped = text.strip()
    return stripped.endswith((".", "?", "!", "다", "요", "죠"))


def choose_output_dir(raw_dir: str | None) -> Path:
    if raw_dir:
        output_dir = Path(raw_dir).expanduser().resolve()
        output_dir.mkdir(parents=True, exist_ok=True)
        return output_dir
    return Path(tempfile.mkdtemp(prefix="richesse-youtube-"))


def fetch_url_text(url: str) -> str:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36"
            )
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8", errors="replace")


def load_video_info(url: str, args: argparse.Namespace) -> dict:
    options = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "extract_flat": False,
        "logger": SilentLogger(),
    }
    if args.cookies_from_browser:
        options["cookiesfrombrowser"] = (args.cookies_from_browser, None, None, None)
    if args.cookie_file:
        options["cookiefile"] = args.cookie_file
    with YoutubeDL(options) as ydl:
        return ydl.extract_info(url, download=False)


def download_subtitle_payload(
    video_url: str,
    track: dict,
    output_dir: Path,
    args: argparse.Namespace,
) -> str:
    subtitle_root = output_dir / "_raw_subtitles"
    subtitle_root.mkdir(parents=True, exist_ok=True)

    attempts = []
    if args.cookie_file:
        attempts.append(("cookie_file", {"cookiefile": args.cookie_file}))
    if args.cookies_from_browser:
        attempts.append(
            (
                args.cookies_from_browser,
                {"cookiesfrombrowser": (args.cookies_from_browser, None, None, None)},
            )
        )
    attempts.extend(
        [
            ("no_cookies", {}),
            ("edge", {"cookiesfrombrowser": ("edge", None, None, None)}),
            ("chrome", {"cookiesfrombrowser": ("chrome", None, None, None)}),
            ("firefox", {"cookiesfrombrowser": ("firefox", None, None, None)}),
        ]
    )
    errors = []

    for attempt_name, extra_options in attempts:
        subtitle_dir = subtitle_root / attempt_name
        subtitle_dir.mkdir(parents=True, exist_ok=True)
        options = {
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
            "writesubtitles": track["source"] == "manual",
            "writeautomaticsub": track["source"] == "auto",
            "subtitleslangs": [track["language"]],
            "subtitlesformat": track["ext"] or "best",
            "paths": {"home": str(subtitle_dir)},
            "outtmpl": {"default": "subtitle"},
            "logger": SilentLogger(),
        }
        options.update(extra_options)

        before = {path.name for path in subtitle_dir.iterdir()}
        try:
            with YoutubeDL(options) as ydl:
                ydl.download([video_url])
        except Exception as exc:  # pragma: no cover - depends on local browser state
            errors.append(f"{attempt_name}: {exc}")
            continue

        candidates = [path for path in subtitle_dir.iterdir() if path.is_file() and path.name not in before]
        if not candidates:
            candidates = [path for path in subtitle_dir.iterdir() if path.is_file()]
        if not candidates:
            errors.append(f"{attempt_name}: no subtitle file was written")
            continue

        candidates.sort(key=lambda item: (item.suffix.lower() != f".{track['ext']}", len(item.name)))
        return candidates[0].read_text(encoding="utf-8", errors="replace")

    raise RuntimeError("Unable to download subtitles via yt-dlp. Attempts: " + " | ".join(errors))


def choose_format(formats: list[dict]) -> dict | None:
    if not formats:
        return None
    for wanted in PREFERRED_EXTS:
        for item in formats:
            if (item.get("ext") or "").lower() == wanted and item.get("url"):
                return item
    for item in formats:
        if item.get("url"):
            return item
    return None


def matching_language_keys(keys: list[str], preferred: str) -> list[str]:
    preferred = preferred.lower()
    exact = []
    prefix = []
    for key in keys:
        lowered = key.lower()
        if lowered in {"live_chat", "comments"}:
            continue
        if lowered == preferred:
            exact.append(key)
        elif lowered.startswith(preferred + "-") or lowered.startswith(preferred + "_"):
            prefix.append(key)
    return exact + prefix


def choose_subtitle_track(info: dict, preferred_languages: list[str]) -> dict | None:
    sources = (
        ("manual", info.get("subtitles") or {}),
        ("auto", info.get("automatic_captions") or {}),
    )

    for preferred in preferred_languages:
        for source_name, track_map in sources:
            keys = matching_language_keys(list(track_map.keys()), preferred)
            for key in keys:
                chosen = choose_format(track_map.get(key) or [])
                if chosen:
                    return {
                        "language": key,
                        "source": source_name,
                        "ext": (chosen.get("ext") or "").lower(),
                        "url": chosen["url"],
                    }

    for source_name, track_map in sources:
        for key in sorted(track_map.keys()):
            if key.lower() in {"live_chat", "comments"}:
                continue
            chosen = choose_format(track_map.get(key) or [])
            if chosen:
                return {
                    "language": key,
                    "source": source_name,
                    "ext": (chosen.get("ext") or "").lower(),
                    "url": chosen["url"],
                }
    return None


def parse_vtt(payload: str) -> list[dict]:
    cues = []
    blocks = re.split(r"\r?\n\r?\n+", payload)
    for block in blocks:
        lines = [line.strip() for line in block.splitlines() if line.strip()]
        if not lines or lines[0].startswith("WEBVTT"):
            continue
        time_index = 0 if "-->" in lines[0] else 1
        if time_index >= len(lines) or "-->" not in lines[time_index]:
            continue
        start_raw, end_raw = lines[time_index].split("-->", 1)
        end_raw = end_raw.strip().split()[0]
        start = parse_timestamp(start_raw)
        end = parse_timestamp(end_raw)
        text = normalize_text(" ".join(lines[time_index + 1 :]))
        if should_drop_text(text):
            continue
        cues.append({"start": start, "end": end, "text": text})
    return cues


def parse_json3(payload: str) -> list[dict]:
    data = json.loads(payload)
    cues = []
    events = data.get("events") or []
    for event in events:
        segments = event.get("segs") or []
        if not segments:
            continue
        text = normalize_text("".join(segment.get("utf8", "") for segment in segments))
        if should_drop_text(text):
            continue
        start = (event.get("tStartMs") or 0) / 1000.0
        duration = (event.get("dDurationMs") or 1500) / 1000.0
        end = start + max(duration, 0.5)
        cues.append({"start": start, "end": end, "text": text})
    return cues


def parse_ttml(payload: str) -> list[dict]:
    cues = []
    root = ET.fromstring(payload)
    namespaces = {"tt": "http://www.w3.org/ns/ttml"}
    for element in root.findall(".//tt:p", namespaces):
        begin = element.attrib.get("begin")
        end = element.attrib.get("end")
        if not begin or not end:
            continue
        text = normalize_text("".join(element.itertext()))
        if should_drop_text(text):
            continue
        cues.append(
            {
                "start": parse_timestamp(begin),
                "end": parse_timestamp(end),
                "text": text,
            }
        )
    return cues


def parse_timedtext_xml(payload: str) -> list[dict]:
    cues = []
    root = ET.fromstring(payload)
    for element in root.iter():
        tag_name = element.tag.split("}")[-1]
        if tag_name != "p":
            continue

        start_raw = element.attrib.get("t") or element.attrib.get("begin")
        if not start_raw:
            continue

        if "d" in element.attrib:
            start = parse_xml_clock(start_raw)
            end = start + float(element.attrib["d"]) / 1000.0
        elif "end" in element.attrib:
            start = parse_xml_clock(start_raw)
            end = parse_xml_clock(element.attrib["end"])
        else:
            continue

        text = normalize_text("".join(element.itertext()))
        if should_drop_text(text):
            continue
        cues.append({"start": start, "end": end, "text": text})
    return cues


def parse_subtitle_payload(
    track: dict,
    video_url: str,
    output_dir: Path,
    args: argparse.Namespace,
) -> list[dict]:
    try:
        payload = fetch_url_text(track["url"])
    except HTTPError as exc:
        if exc.code != 429:
            raise
        payload = download_subtitle_payload(video_url, track, output_dir, args)
    except Exception:
        payload = download_subtitle_payload(video_url, track, output_dir, args)

    ext = track["ext"]
    parsers = []
    if ext == "json3":
        parsers = [parse_json3, parse_vtt, parse_ttml, parse_timedtext_xml]
    elif ext == "ttml":
        parsers = [parse_ttml, parse_timedtext_xml, parse_vtt]
    elif ext in {"srv1", "srv2", "srv3"}:
        parsers = [parse_timedtext_xml, parse_json3, parse_vtt]
    else:
        parsers = [parse_vtt, parse_json3, parse_ttml, parse_timedtext_xml]

    last_error = None
    for parser in parsers:
        try:
            cues = parser(payload)
            if cues:
                return cues
        except Exception as exc:  # pragma: no cover - best-effort fallback
            last_error = exc
    if last_error:
        raise last_error
    raise RuntimeError("Could not parse subtitle payload.")


def normalize_cues(cues: list[dict]) -> list[dict]:
    cleaned = []
    for cue in sorted(cues, key=lambda item: item["start"]):
        text = normalize_text(cue.get("text", ""))
        if should_drop_text(text):
            continue
        start = max(0.0, float(cue["start"]))
        end = max(start + 0.2, float(cue.get("end", start + 1.5)))
        if cleaned and text == cleaned[-1]["text"] and start - cleaned[-1]["end"] <= 1.0:
            cleaned[-1]["end"] = max(cleaned[-1]["end"], end)
            continue
        cleaned.append({"start": start, "end": end, "text": text})

    for index, cue in enumerate(cleaned[:-1]):
        next_start = cleaned[index + 1]["start"]
        cue["end"] = min(max(cue["end"], cue["start"] + 0.2), max(next_start, cue["start"] + 0.2))
    return cleaned


def join_cue_text(cues: list[dict]) -> str:
    parts = []
    last_text = None
    for cue in cues:
        text = cue["text"]
        if text == last_text:
            continue
        parts.append(text)
        last_text = text
    return " ".join(parts).strip()


def build_title_hint(text: str, fallback_index: int) -> str:
    cleaned = normalize_text(text)
    if not cleaned:
        return f"Chapter {fallback_index}"

    for marker in (". ", "? ", "! "):
        if marker in cleaned:
            cleaned = cleaned.split(marker, 1)[0].strip()
            break

    words = cleaned.split()
    if len(words) > 10:
        cleaned = " ".join(words[:10]).strip()
    return cleaned[:70] or f"Chapter {fallback_index}"


def chapter_from_cues(
    cues: list[dict],
    index: int,
    source: str,
    boundary_reason: str,
    title: str | None = None,
) -> dict:
    transcript = join_cue_text(cues)
    start = cues[0]["start"]
    end = cues[-1]["end"]
    title_hint = title or build_title_hint(transcript, index)
    return {
        "index": index,
        "source": source,
        "title": title or title_hint,
        "title_hint": title_hint,
        "start_seconds": round(start, 3),
        "end_seconds": round(end, 3),
        "start": format_timestamp(start),
        "end": format_timestamp(end),
        "duration_seconds": round(end - start, 3),
        "boundary_reason": boundary_reason,
        "text_preview": transcript[:240],
        "transcript": transcript,
    }


def cues_in_range(cues: list[dict], start: float, end: float) -> list[dict]:
    return [cue for cue in cues if cue["end"] > start and cue["start"] < end]


def build_official_chapters(cues: list[dict], info: dict) -> list[dict]:
    raw = info.get("chapters") or []
    if not raw:
        return []

    duration = float(info.get("duration") or (cues[-1]["end"] if cues else 0))
    chapters = []
    for idx, item in enumerate(raw, start=1):
        start = float(item.get("start_time") or 0)
        if item.get("end_time") is not None:
            end = float(item["end_time"])
        elif idx < len(raw):
            end = float(raw[idx]["start_time"])
        else:
            end = duration

        chapter_cues = cues_in_range(cues, start, end) or [{"start": start, "end": end, "text": ""}]
        chapters.append(
            chapter_from_cues(
                chapter_cues,
                index=idx,
                source="official",
                boundary_reason="official_chapter",
                title=normalize_text(item.get("title") or f"Chapter {idx}"),
            )
        )
    return chapters


def chapter_window(duration: float) -> tuple[float, float, float]:
    if duration and duration <= 600:
        return 45.0, 90.0, 150.0
    if duration and duration <= 1800:
        return 60.0, 120.0, 180.0
    return 75.0, 150.0, 240.0


def build_generated_chapters(cues: list[dict], duration: float) -> list[dict]:
    if not cues:
        return []

    min_window, target_window, max_window = chapter_window(duration)
    chapters = []
    start_index = 0

    for index, cue in enumerate(cues):
        chapter_start = cues[start_index]["start"]
        chapter_end = cue["end"]
        span = chapter_end - chapter_start
        next_cue = cues[index + 1] if index + 1 < len(cues) else None
        gap = (next_cue["start"] - cue["end"]) if next_cue else 0.0

        boundary_reason = ""
        if next_cue is None:
            boundary_reason = "end_of_transcript"
        elif span >= max_window:
            boundary_reason = "max_window"
        elif span >= min_window and gap >= 8.0:
            boundary_reason = "long_pause"
        elif span >= min_window and looks_like_boundary(next_cue["text"]):
            boundary_reason = "topic_shift"
        elif span >= target_window and looks_like_sentence_end(cue["text"]):
            boundary_reason = "target_window"

        if boundary_reason:
            chapter_cues = cues[start_index : index + 1]
            chapters.append(
                chapter_from_cues(
                    chapter_cues,
                    index=len(chapters) + 1,
                    source="generated",
                    boundary_reason=boundary_reason,
                )
            )
            start_index = index + 1

    return chapters


def transcript_word_count(text: str) -> int:
    return len([token for token in text.split() if token.strip()])


def save_outputs(output_dir: Path, summary: dict, cues: list[dict]) -> dict:
    summary_path = output_dir / "summary.json"
    notes_path = output_dir / "chapter_notes.md"
    transcript_path = output_dir / "full_transcript.txt"

    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    notes_lines = [
        f"# {summary['video']['title']}",
        "",
        f"- URL: {summary['video']['url']}",
        f"- Channel: {summary['video'].get('channel') or 'Unknown'}",
        f"- Duration: {summary['video']['duration']}",
        (
            f"- Subtitle Track: {summary['subtitle_track']['source']} / "
            f"{summary['subtitle_track']['language']} / {summary['subtitle_track']['ext']}"
        ),
        f"- Chapter Source: {summary['transcript_stats']['chapter_source']}",
        "",
        "## Chapters",
        "",
    ]
    for chapter in summary["chapters"]:
        notes_lines.extend(
            [
                f"### {chapter['index']}. {chapter['title']}",
                f"- Range: {chapter['start']} - {chapter['end']}",
                f"- Source: {chapter['source']}",
                f"- Boundary: {chapter['boundary_reason']}",
                f"- Preview: {chapter['text_preview'] or '(empty)'}",
                "",
                chapter["transcript"] or "(no transcript text)",
                "",
            ]
        )
    notes_path.write_text("\n".join(notes_lines), encoding="utf-8")

    transcript_lines = []
    for cue in cues:
        transcript_lines.append(f"[{format_timestamp(cue['start'])} - {format_timestamp(cue['end'])}] {cue['text']}")
    transcript_path.write_text("\n".join(transcript_lines), encoding="utf-8")

    return {
        "summary_json": str(summary_path),
        "chapter_notes": str(notes_path),
        "full_transcript": str(transcript_path),
    }


def write_project_final_output(summary: dict, target_path: Path) -> str:
    target_path.parent.mkdir(parents=True, exist_ok=True)

    lines = [
        f"# {summary['video']['title']}",
        "",
        f"- URL: {summary['video']['url']}",
        f"- Channel: {summary['video'].get('channel') or 'Unknown'}",
        f"- Duration: {summary['video']['duration']}",
        (
            f"- Subtitle Track: {summary['subtitle_track']['source']} / "
            f"{summary['subtitle_track']['language']} / {summary['subtitle_track']['ext']}"
        ),
        f"- Chapter Count: {summary['transcript_stats']['chapter_count']}",
        f"- Chapter Source: {summary['transcript_stats']['chapter_source']}",
        "",
    ]

    if summary.get("notes"):
        lines.extend(["## Notes", ""])
        for note in summary["notes"]:
            lines.append(f"- {note}")
        lines.append("")

    lines.extend(["## Chapter Snapshot", ""])
    for chapter in summary["chapters"]:
        lines.extend(
            [
                f"### {chapter['index']}. {chapter['title']}",
                f"- Range: {chapter['start']} - {chapter['end']}",
                f"- Preview: {chapter['text_preview'] or '(empty)'}",
                "",
            ]
        )

    files = summary.get("files") or {}
    if files:
        lines.extend(
            [
                "## Raw Files",
                "",
                f"- summary.json: {files.get('summary_json', '')}",
                f"- chapter_notes.md: {files.get('chapter_notes', '')}",
                f"- full_transcript.txt: {files.get('full_transcript', '')}",
                "",
            ]
        )

    target_path.write_text("\n".join(lines), encoding="utf-8")
    return str(target_path)


def description_preview(text: str) -> str:
    cleaned = normalize_text(text or "")
    return cleaned[:280]


def main() -> None:
    args = parse_args()
    output_dir = choose_output_dir(args.output_dir)
    preferred_languages = [item.strip() for item in args.languages.split(",") if item.strip()]

    try:
        info = load_video_info(args.url, args)
        track = choose_subtitle_track(info, preferred_languages)
        if not track:
            print("No subtitle track was found. Manual fallback transcription is required.")
            sys.exit(2)

        cues = normalize_cues(parse_subtitle_payload(track, args.url, output_dir, args))
        if not cues:
            print("Subtitle track was found, but no usable cues could be parsed.")
            sys.exit(3)

        official_chapters = build_official_chapters(cues, info)
        chapters = official_chapters or build_generated_chapters(cues, float(info.get("duration") or 0))
        chapter_source = "official" if official_chapters else "generated"

        transcript_text = join_cue_text(cues)
        summary = {
            "video": {
                "title": normalize_text(info.get("title") or "Untitled video"),
                "url": info.get("webpage_url") or args.url,
                "channel": normalize_text(info.get("channel") or info.get("uploader") or ""),
                "duration": format_timestamp(float(info.get("duration") or cues[-1]["end"])),
                "duration_seconds": float(info.get("duration") or cues[-1]["end"]),
                "upload_date": info.get("upload_date") or "",
                "description_preview": description_preview(info.get("description") or ""),
            },
            "subtitle_track": track,
            "transcript_stats": {
                "cue_count": len(cues),
                "chapter_count": len(chapters),
                "chapter_source": chapter_source,
                "word_count": transcript_word_count(transcript_text),
            },
            "chapters": chapters,
            "notes": [],
        }

        if track["source"] == "auto":
            summary["notes"].append("Automatic captions were used. Proper nouns or numbers may need verification.")
        if chapter_source == "generated":
            summary["notes"].append("Chapters were generated from subtitle timing and transition cues.")

        files = save_outputs(output_dir, summary, cues)
        summary["files"] = files
        project_final_output = write_project_final_output(summary, Path(args.project_final_output).expanduser().resolve())
        summary["project_final_output"] = project_final_output
        Path(files["summary_json"]).write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

        if args.stdout == "json":
            print(json.dumps(summary, ensure_ascii=False, indent=2))
            return

        print(f"Output directory: {output_dir}")
        print(f"Video: {summary['video']['title']}")
        print(
            "Subtitle Track: "
            f"{track['source']} / {track['language']} / {track['ext']}"
        )
        print(
            "Chapters: "
            f"{summary['transcript_stats']['chapter_count']} ({summary['transcript_stats']['chapter_source']})"
        )
        print(f"summary.json: {files['summary_json']}")
        print(f"chapter_notes.md: {files['chapter_notes']}")
        print(f"full_transcript.txt: {files['full_transcript']}")
        print(f"project_final_output.md: {project_final_output}")
        if summary["notes"]:
            print("Notes:")
            for note in summary["notes"]:
                print(f"- {note}")
    except Exception as exc:
        print("YouTube subtitle extraction failed.")
        print(str(exc))
        print("Suggestions:")
        print("- Retry later if YouTube is rate-limiting subtitle requests.")
        print("- Close the browser and rerun with --cookies-from-browser edge or chrome.")
        print("- Pass --cookie-file with an exported Netscape cookies file if needed.")
        print("- Fall back to audio transcription only if subtitles remain unavailable.")
        sys.exit(4)


if __name__ == "__main__":
    main()
