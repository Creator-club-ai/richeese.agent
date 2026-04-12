#!/usr/bin/env python3
"""
Build and maintain richesse.club editorial memory in the Obsidian vault.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable


def get_vault_path() -> Path:
    env = os.environ.get("RICHESSE_VAULT_PATH")
    if env:
        return Path(env)
    onedrive = os.environ.get("OneDrive", "")
    if onedrive:
        return Path(onedrive) / "문서" / "Obsidian Vault" / "richesse-content-os"
    return Path.home() / "OneDrive" / "문서" / "Obsidian Vault" / "richesse-content-os"


@dataclass
class Card:
    path: Path
    frontmatter: dict[str, object]
    sections: dict[str, str]

    @property
    def title(self) -> str:
        value = self.frontmatter.get("working_title") or self.path.stem
        return str(value).strip()

    @property
    def category(self) -> str:
        return str(self.frontmatter.get("category") or "unknown").strip()

    @property
    def pattern(self) -> str:
        value = self.frontmatter.get("content_pattern") or self.frontmatter.get("format") or "unknown"
        return str(value).strip()

    @property
    def ig_reach(self) -> int | None:
        return parse_int(self.frontmatter.get("ig_reach"))

    @property
    def ig_saves(self) -> int | None:
        return parse_int(self.frontmatter.get("ig_saves"))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="richesse.club editorial memory")
    subparsers = parser.add_subparsers(dest="command", required=True)

    snapshot = subparsers.add_parser("snapshot", help="print current editorial memory snapshot")
    snapshot.add_argument("--limit", type=int, default=5)

    refresh = subparsers.add_parser("refresh", help="rebuild editorial memory artifacts")
    refresh.add_argument("--limit", type=int, default=5)

    log = subparsers.add_parser("log", help="append one decision event")
    log.add_argument("--title", required=True)
    log.add_argument("--stage", required=True, choices=["brew", "intake", "planner", "editor", "designer", "publish"])
    log.add_argument("--verdict", required=True, choices=["approved", "revise", "rejected", "published"])
    log.add_argument("--score", type=float, default=None)
    log.add_argument("--category", default="")
    log.add_argument("--pattern", default="")
    log.add_argument("--tags", default="")
    log.add_argument("--notes", default="")
    log.add_argument("--route", default="")
    return parser.parse_args()


def parse_int(value: object) -> int | None:
    if value is None:
        return None
    text = str(value).strip().replace(",", "")
    if text and re.fullmatch(r"-?\d+", text):
        return int(text)
    return None


def split_frontmatter(text: str) -> tuple[dict[str, object], str]:
    if not text.startswith("---"):
        return {}, text

    lines = text.splitlines()
    fm_lines: list[str] = []
    end_index = None
    for idx in range(1, len(lines)):
        if lines[idx].strip() == "---":
            end_index = idx
            break
        fm_lines.append(lines[idx])

    if end_index is None:
        return {}, text

    body = "\n".join(lines[end_index + 1 :]).lstrip("\n")
    return parse_simple_yaml(fm_lines), body


def parse_simple_yaml(lines: Iterable[str]) -> dict[str, object]:
    data: dict[str, object] = {}
    current_key: str | None = None

    for raw_line in lines:
        line = raw_line.rstrip()
        if not line.strip():
            current_key = None
            continue

        stripped = line.strip()
        if stripped.startswith("- ") and current_key:
            items = data.setdefault(current_key, [])
            if isinstance(items, list):
                items.append(stripped[2:].strip().strip('"').strip("'"))
            continue

        if ":" not in line:
            current_key = None
            continue

        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip()
        if not value:
            data[key] = []
            current_key = key
            continue

        current_key = None
        if value.lower() == "true":
            data[key] = True
        elif value.lower() == "false":
            data[key] = False
        else:
            data[key] = value.strip('"').strip("'")

    return data


def parse_sections(body: str) -> dict[str, str]:
    sections: dict[str, str] = {}
    heading: str | None = None
    buffer: list[str] = []

    for line in body.splitlines():
        if line.startswith("## "):
            if heading is not None:
                sections[heading] = "\n".join(buffer).strip()
            heading = line[3:].strip()
            buffer = []
            continue
        buffer.append(line)

    if heading is not None:
        sections[heading] = "\n".join(buffer).strip()
    return sections


def load_cards(vault: Path) -> list[Card]:
    content_dir = vault / "content" / "instagram"
    if not content_dir.exists():
        return []

    cards: list[Card] = []
    for path in sorted(content_dir.glob("*.md")):
        text = path.read_text(encoding="utf-8", errors="replace")
        frontmatter, body = split_frontmatter(text)
        if path.stem == "캐러셀 기획서 템플릿":
            continue
        if not frontmatter.get("working_title") and not frontmatter.get("category"):
            continue
        cards.append(Card(path=path, frontmatter=frontmatter, sections=parse_sections(body)))
    return cards


def memory_dir(vault: Path) -> Path:
    return vault / "wiki" / "editorial-memory"


def log_path(vault: Path) -> Path:
    return memory_dir(vault) / "log.jsonl"


def ensure_memory_dir(vault: Path) -> Path:
    target = memory_dir(vault)
    target.mkdir(parents=True, exist_ok=True)
    return target


def append_log(vault: Path, args: argparse.Namespace) -> dict[str, object]:
    ensure_memory_dir(vault)
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "title": args.title.strip(),
        "stage": args.stage,
        "verdict": args.verdict,
        "score": args.score,
        "category": args.category.strip(),
        "pattern": args.pattern.strip(),
        "tags": [tag.strip() for tag in args.tags.split(",") if tag.strip()],
        "notes": args.notes.strip(),
        "route": args.route.strip(),
    }
    with log_path(vault).open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(entry, ensure_ascii=False) + "\n")
    return entry


def load_logs(vault: Path) -> list[dict[str, object]]:
    path = log_path(vault)
    if not path.exists():
        return []

    entries: list[dict[str, object]] = []
    with path.open("r", encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line:
                continue
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return entries


def top_counter(counter: Counter[str], limit: int) -> list[tuple[str, int]]:
    return [(key, count) for key, count in counter.most_common(limit) if key]


def build_snapshot(cards: list[Card], logs: list[dict[str, object]], limit: int) -> str:
    category_counter = Counter(card.category for card in cards if card.category and card.category != "unknown")
    pattern_counter = Counter(card.pattern for card in cards if card.pattern and card.pattern != "unknown")
    verdict_counter = Counter(str(log.get("verdict") or "") for log in logs if log.get("verdict"))

    approved_tags = Counter()
    rejected_tags = Counter()
    route_counter = Counter()
    for entry in logs:
        tags = [str(tag).strip() for tag in entry.get("tags") or [] if str(tag).strip()]
        route = str(entry.get("route") or "").strip()
        if route:
            route_counter[route] += 1
        if entry.get("verdict") in {"approved", "published"}:
            approved_tags.update(tags)
        elif entry.get("verdict") in {"rejected", "revise"}:
            rejected_tags.update(tags)

    ranked_cards = [card for card in cards if card.ig_saves is not None or card.ig_reach is not None]
    ranked_cards.sort(key=lambda card: ((card.ig_saves or -1), (card.ig_reach or -1)), reverse=True)

    lines = [
        "# Editorial Memory Snapshot",
        "",
        f"- cards scanned: {len(cards)}",
        f"- logged decisions: {len(logs)}",
    ]
    if verdict_counter:
        verdict_summary = ", ".join(f"{key} {value}" for key, value in verdict_counter.items())
        lines.append(f"- verdict mix: {verdict_summary}")

    sections = [
        ("Category Patterns", top_counter(category_counter, limit), "not enough data"),
        ("Format Patterns", top_counter(pattern_counter, limit), "not enough data"),
        ("Approval Signals", top_counter(approved_tags, limit), "no approval tags logged yet"),
        ("Rejection Signals", top_counter(rejected_tags, limit), "no rejection tags logged yet"),
        ("Routing Pressure", top_counter(route_counter, limit), "no routed revisions logged yet"),
    ]

    for title, items, empty_message in sections:
        lines.extend(["", f"## {title}"])
        if items:
            lines.extend(f"- {key}: {value}" for key, value in items)
        else:
            lines.append(f"- {empty_message}")

    lines.extend(["", "## Top Outcome Signals"])
    if ranked_cards:
        for card in ranked_cards[:limit]:
            saves = card.ig_saves if card.ig_saves is not None else "-"
            reach = card.ig_reach if card.ig_reach is not None else "-"
            lines.append(f"- {card.title}: saves {saves}, reach {reach}, {card.category} / {card.pattern}")
    else:
        lines.append("- no reach or saves data yet")

    recent_logs = sorted(logs, key=lambda entry: str(entry.get("timestamp") or ""), reverse=True)[:limit]
    lines.extend(["", "## Recent Decisions"])
    if recent_logs:
        for entry in recent_logs:
            detail_parts = []
            tags = ", ".join(entry.get("tags") or [])
            route = str(entry.get("route") or "").strip()
            if tags:
                detail_parts.append(f"tags: {tags}")
            if route:
                detail_parts.append(f"route: {route}")
            suffix = f" ({'; '.join(detail_parts)})" if detail_parts else ""
            lines.append(
                f"- {entry.get('timestamp', '')}: [{entry.get('stage', '')}] {entry.get('verdict', '')} — {entry.get('title', '')}{suffix}"
            )
    else:
        lines.append("- no decisions logged yet")

    return "\n".join(lines).strip() + "\n"


def write_patterns(vault: Path, snapshot: str) -> None:
    (ensure_memory_dir(vault) / "patterns.md").write_text(snapshot, encoding="utf-8")


def write_outcomes(vault: Path, cards: list[Card], limit: int) -> None:
    target = ensure_memory_dir(vault) / "outcomes.md"
    ranked = [card for card in cards if card.ig_saves is not None or card.ig_reach is not None]
    ranked.sort(key=lambda card: ((card.ig_saves or -1), (card.ig_reach or -1)), reverse=True)

    lines = ["# Outcome Signals", ""]
    if not ranked:
        lines.append("- no performance data yet")
        target.write_text("\n".join(lines) + "\n", encoding="utf-8")
        return

    lines.append("## Top Cards")
    for card in ranked[:limit]:
        saves = card.ig_saves if card.ig_saves is not None else "-"
        reach = card.ig_reach if card.ig_reach is not None else "-"
        lines.append(f"- {card.title}: saves {saves}, reach {reach}, {card.category} / {card.pattern}")

    by_category: dict[str, list[int]] = defaultdict(list)
    for card in ranked:
        if card.ig_saves is not None:
            by_category[card.category].append(card.ig_saves)

    if by_category:
        lines.extend(["", "## Average Saves by Category"])
        for category, values in sorted(by_category.items(), key=lambda item: sum(item[1]) / len(item[1]), reverse=True):
            lines.append(f"- {category}: {sum(values) / len(values):.1f}")

    target.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_profile(vault: Path, cards: list[Card], logs: list[dict[str, object]], limit: int) -> None:
    snapshot = build_snapshot(cards, logs, limit)
    target = ensure_memory_dir(vault) / "PROFILE.md"
    lines = [
        "---",
        f'updated_at: "{datetime.now().astimezone().isoformat()}"',
        f'cards_scanned: "{len(cards)}"',
        f'logged_decisions: "{len(logs)}"',
        "---",
        "",
        "# Editorial Memory Profile",
        "",
        "This is the adaptive memory layer for richesse.club automation.",
        "Always read it after `BRAND_GUIDE.md` and `CONTENT_STRATEGY.md`.",
        "If this file conflicts with the brand guide, the brand guide wins.",
        "",
        snapshot.strip(),
        "",
    ]
    target.write_text("\n".join(lines), encoding="utf-8")


def write_log_markdown(vault: Path, logs: list[dict[str, object]], limit: int) -> None:
    target = ensure_memory_dir(vault) / "log.md"
    recent_logs = sorted(logs, key=lambda entry: str(entry.get("timestamp") or ""), reverse=True)
    lines = ["# Editorial Memory Log", ""]
    if not recent_logs:
        lines.append("- no decisions logged yet")
        target.write_text("\n".join(lines) + "\n", encoding="utf-8")
        return

    for entry in recent_logs[: max(limit * 4, 20)]:
        lines.append(f"- {entry.get('timestamp', '')} | {entry.get('stage', '')} | {entry.get('verdict', '')} | {entry.get('title', '')}")
        tags = ", ".join(entry.get("tags") or [])
        if tags:
            lines.append(f"  - tags: {tags}")
        if entry.get("route"):
            lines.append(f"  - route: {entry.get('route')}")
        if entry.get("notes"):
            lines.append(f"  - notes: {entry.get('notes')}")
    target.write_text("\n".join(lines) + "\n", encoding="utf-8")


def command_snapshot(vault: Path, limit: int) -> int:
    sys.stdout.write(build_snapshot(load_cards(vault), load_logs(vault), limit))
    return 0


def command_refresh(vault: Path, limit: int) -> int:
    cards = load_cards(vault)
    logs = load_logs(vault)
    snapshot = build_snapshot(cards, logs, limit)
    write_patterns(vault, snapshot)
    write_outcomes(vault, cards, limit)
    write_profile(vault, cards, logs, limit)
    write_log_markdown(vault, logs, limit)
    sys.stdout.write(snapshot)
    return 0


def command_log(vault: Path, args: argparse.Namespace) -> int:
    sys.stdout.write(json.dumps(append_log(vault, args), ensure_ascii=False, indent=2) + "\n")
    return 0


def main() -> int:
    args = parse_args()
    vault = get_vault_path()
    if args.command == "snapshot":
        return command_snapshot(vault, args.limit)
    if args.command == "refresh":
        return command_refresh(vault, args.limit)
    if args.command == "log":
        return command_log(vault, args)
    raise ValueError(f"Unsupported command: {args.command}")


if __name__ == "__main__":
    raise SystemExit(main())
