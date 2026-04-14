#!/usr/bin/env python3
"""
Thin Head runner for the current active-profile stack.

This script does not replace agent-led phases.
It orchestrates the existing leaf scripts, prints the planned public phase path,
and keeps memory snapshot and refresh around the run.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

from phase_artifacts import create_phase_run, scaffold_follow_on_templates, write_research_output
from profile_runtime import RuntimeProfile, load_runtime_profile

if hasattr(sys.stdout, "buffer"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", buffering=1, closefd=False)
if hasattr(sys.stderr, "buffer"):
    sys.stderr = open(sys.stderr.fileno(), mode="w", encoding="utf-8", buffering=1, closefd=False)


REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = Path(__file__).resolve().parent
PUBLIC_PHASES = ["research", "analyze", "write", "review", "refine(if needed)"]
DISCOVERY_RUN_MODE = "signals"
DISCOVERY_UTILITY = "morning-brew"
LEGACY_MODE_ALIASES = {"brew": DISCOVERY_RUN_MODE}


def resolve_active_profile() -> str:
    return load_runtime_profile(REPO_ROOT).active_profile


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the thin Head dispatcher for the active profile.")
    parser.add_argument("--source-ref", help="Source reference such as a URL or memo label.")
    parser.add_argument(
        "--source-kind",
        default="auto",
        choices=["auto", "youtube", "article", "x", "memo", "text", "idea"],
        help="Input kind for direct mode.",
    )
    parser.add_argument(
        "--mode",
        default="auto",
        choices=["auto", DISCOVERY_RUN_MODE, "direct", "brew"],
        help="Signals runs optional latest-signals discovery; brew is the legacy alias; direct routes a specific source.",
    )
    parser.add_argument("--manual", action="store_true", help="Stop after the initial routed step.")
    parser.add_argument(
        "--handoff",
        default="none",
        choices=["none", "design"],
        help="Whether design handoff is requested after approval.",
    )
    parser.add_argument("--save-transcript", action="store_true", help="Persist YouTube transcript to raw/.")
    parser.add_argument("--lang", nargs="*", default=["ko", "en"], help="Transcript language preference.")
    parser.add_argument("--json", action="store_true", help="Emit the phase plan in a JSON-like plain-text block.")
    return parser.parse_args()


def resolve_run_mode(requested_mode: str, source_ref: str | None) -> str:
    if requested_mode == "auto":
        return DISCOVERY_RUN_MODE if not source_ref else "direct"
    return LEGACY_MODE_ALIASES.get(requested_mode, requested_mode)


def detect_source_kind(source_ref: str | None, explicit_kind: str) -> str:
    if explicit_kind != "auto":
        return explicit_kind
    if not source_ref:
        return "idea"
    lowered = source_ref.lower()
    if "youtu.be/" in lowered or "youtube.com/" in lowered:
        return "youtube"
    if lowered.startswith("http://") or lowered.startswith("https://"):
        if "x.com/" in lowered or "twitter.com/" in lowered:
            return "x"
        return "article"
    return "memo"


def build_phase_plan(mode: str, source_kind: str, handoff: str) -> list[str]:
    phases = PUBLIC_PHASES.copy()
    if handoff == "design":
        phases.append("design handoff")
    return phases


def run_step(label: str, command: list[str]) -> subprocess.CompletedProcess[str]:
    print(f"[{label}] {' '.join(command)}")
    env = dict(os.environ)
    env["PYTHONIOENCODING"] = "utf-8"
    completed = subprocess.run(
        command,
        cwd=REPO_ROOT,
        text=True,
        capture_output=True,
        env=env,
        encoding="utf-8",
        errors="replace",
    )
    if completed.stdout:
        print(completed.stdout.rstrip())
    if completed.stderr:
        print(completed.stderr.rstrip(), file=sys.stderr)
    return completed


def run_memory_step(command_name: str) -> subprocess.CompletedProcess[str]:
    return run_step(
        f"memory:{command_name}",
        [sys.executable, str(SCRIPTS_DIR / "editorial_memory.py"), command_name],
    )


def log_phase_event(
    stage: str,
    title: str,
    notes: str = "",
    route: str = "",
    verdict: str = "captured",
) -> subprocess.CompletedProcess[str]:
    command = [
        sys.executable,
        str(SCRIPTS_DIR / "editorial_memory.py"),
        "log",
        "--title",
        title,
        "--stage",
        stage,
        "--verdict",
        verdict,
    ]
    if notes:
        command.extend(["--notes", notes])
    if route:
        command.extend(["--route", route])
    return run_step(f"memory:log:{stage}", command)


def run_leaf_automation(args: argparse.Namespace, run_mode: str, source_kind: str) -> subprocess.CompletedProcess[str] | None:
    if run_mode == DISCOVERY_RUN_MODE:
        return run_step(f"discovery:{DISCOVERY_UTILITY}", [sys.executable, str(SCRIPTS_DIR / "fetch_and_curate.py")])

    if run_mode == "direct" and source_kind == "youtube" and args.source_ref:
        command = [sys.executable, str(SCRIPTS_DIR / "get_transcript.py"), args.source_ref]
        if args.lang:
            command.extend(["--lang", *args.lang])
        if args.save_transcript or not args.manual:
            command.append("--save")
        return run_step("research:youtube", command)

    return None


def emit_plan(requested_mode: str, run_mode: str, source_kind: str, phases: list[str], as_json: bool) -> None:
    active_profile = resolve_active_profile()
    if as_json:
        print("{")
        print(f'  "active_profile": "{active_profile}",')
        print(f'  "requested_mode": "{requested_mode}",')
        print(f'  "run_mode": "{run_mode}",')
        print(f'  "source_kind": "{source_kind}",')
        print('  "phases": [')
        for index, phase in enumerate(phases):
            suffix = "," if index < len(phases) - 1 else ""
            print(f'    "{phase}"{suffix}')
        print("  ]")
        print("}")
        return

    print("Head phase plan:")
    print(f"- active profile: {active_profile}")
    print(f"- requested mode: {requested_mode}")
    print(f"- run mode: {run_mode}")
    print(f"- source kind: {source_kind}")
    if run_mode == DISCOVERY_RUN_MODE:
        print(f"- discovery utility: {DISCOVERY_UTILITY} (optional pre-loop scan)")
    print(f"- phases: {' -> '.join(phases)}")


def extract_artifact_paths(text: str) -> list[str]:
    artifacts: list[str] = []
    for line in text.splitlines():
        candidate = line.strip()
        match = re.search(r"([A-Za-z]:[\\/][^\r\n]+?\.(?:md|json))", candidate)
        if match:
            artifacts.append(match.group(1))
            continue
        for marker in ("LATEST_SIGNALS_JSON_PATH:", "RAW_TRANSCRIPT_PATH:"):
            if candidate.startswith(marker):
                artifacts.append(candidate.split(":", 1)[1].strip())
                break

    deduped: list[str] = []
    seen: set[str] = set()
    for path in artifacts:
        if path not in seen:
            seen.add(path)
            deduped.append(path)
    return deduped


def summarize_snapshot_output(text: str) -> list[str]:
    return [line.strip() for line in text.splitlines() if line.strip()][:4]


def extract_json_block(text: str, start_marker: str, end_marker: str) -> list[dict[str, Any]]:
    pattern = re.compile(re.escape(start_marker) + r"\s*(.*?)\s*" + re.escape(end_marker), re.S)
    match = pattern.search(text)
    if not match:
        return []
    try:
        payload = json.loads(match.group(1))
    except json.JSONDecodeError:
        return []
    return payload if isinstance(payload, list) else []


def extract_shortlisted_articles(text: str) -> list[dict[str, Any]]:
    return extract_json_block(text, "--- NEW_ARTICLES_START ---", "--- NEW_ARTICLES_END ---")


def _parse_markdown_frontmatter(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8", errors="replace")
    if not text.startswith("---"):
        return {}
    values: dict[str, str] = {}
    for line in text.splitlines()[1:]:
        if line.strip() == "---":
            break
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        values[key.strip()] = value.strip().strip('"')
    return values


def _extract_transcript_excerpts(path: Path, limit: int = 5) -> list[str]:
    excerpts: list[str] = []
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        if line.startswith("**`"):
            excerpt = re.sub(r"^\*\*`[^`]+`\*\*\s*", "", line).strip()
            if excerpt:
                excerpts.append(excerpt)
        if len(excerpts) >= limit:
            break
    return excerpts


def synthesize_research_artifacts(
    profile: RuntimeProfile,
    run_mode: str,
    source_kind: str,
    completed: subprocess.CompletedProcess[str] | None,
) -> tuple[Path | None, dict[str, Path]]:
    if completed is None or completed.returncode != 0:
        return None, {}

    artifact_paths = extract_artifact_paths(completed.stdout or "")

    if run_mode == DISCOVERY_RUN_MODE:
        return None, {}

    if source_kind == "youtube":
        transcript_path = next((Path(path) for path in artifact_paths if path.lower().endswith(".md")), None)
        if transcript_path is None or not transcript_path.exists():
            return None, {}

        frontmatter = _parse_markdown_frontmatter(transcript_path)
        excerpts = _extract_transcript_excerpts(transcript_path)
        title = frontmatter.get("title", transcript_path.stem)
        url = frontmatter.get("url", "")
        channel = frontmatter.get("channel", "")
        run = create_phase_run(profile, title)
        source_inventory = "\n".join(
            item
            for item in [
                f"- youtube: {title}",
                f"- channel: {channel}" if channel else "",
                f"- url: {url}" if url else "",
                f"- raw transcript: {transcript_path}",
            ]
            if item
        )
        usable_points = "\n".join(f"- {excerpt}" for excerpt in excerpts) or "- transcript captured but no usable excerpt was parsed"
        research_artifact = write_research_output(
            run,
            profile.active_profile,
            title,
            "youtube",
            {
                "Topic": title,
                "Research Depth": "shallow",
                "Source Inventory": source_inventory,
                "What Happened": f"A transcript was captured from `{title}` and normalized into markdown paragraphs.",
                "Usable Points": usable_points,
                "Direction Cues": "- long-form primary material exists; extract one sharp angle instead of summarizing the whole source",
                "Risks or Gaps": "- transcript capture is not the same as deep normalization; important claims still need judgment before drafting",
                "Source Strength": "primary source available",
                "Fact Risk": "medium",
            },
            recommendation="hand off to analyze",
        )
        return research_artifact, scaffold_follow_on_templates(run, profile.active_profile, research_artifact)

    return None, {}


def extract_research_title(research_artifact: Path | None) -> str:
    if research_artifact is None or not research_artifact.exists():
        return "research"
    text = research_artifact.read_text(encoding="utf-8", errors="replace")
    match = re.search(r"## Topic\s*(.+?)(?:\n## |\Z)", text, re.S)
    if not match:
        return research_artifact.stem
    return " ".join(line.strip() for line in match.group(1).splitlines() if line.strip())


def research_contract_complete(research_artifact: Path | None) -> bool:
    return research_artifact is not None


def next_manual_phase(research_artifact: Path | None) -> str:
    return "analyze" if research_contract_complete(research_artifact) else "research"


def remaining_public_path(phases: list[str], next_phase: str) -> list[str]:
    try:
        start_index = phases.index(next_phase)
    except ValueError:
        return phases
    return phases[start_index:]


def print_handoff_summary(
    run_mode: str,
    source_kind: str,
    phases: list[str],
    snapshot_output: str,
    completed: subprocess.CompletedProcess[str] | None,
    research_artifact: Path | None,
    phase_templates: dict[str, Path],
) -> None:
    active_profile = resolve_active_profile()
    artifact_paths = extract_artifact_paths(completed.stdout) if completed and completed.stdout else []
    shortlisted_articles = extract_shortlisted_articles(completed.stdout) if completed and completed.stdout else []
    next_phase = next_manual_phase(research_artifact)
    contract_complete = research_contract_complete(research_artifact)

    print("Head handoff summary:")
    print(f"- active profile: {active_profile}")
    print(f"- run mode: {run_mode}")
    print(f"- source kind: {source_kind}")
    if run_mode == DISCOVERY_RUN_MODE:
        print(f"- discovery utility: {DISCOVERY_UTILITY}")
    print(f"- next manual phase: {next_phase}")
    print(f"- research contract complete: {'yes' if contract_complete else 'no'}")

    if snapshot_output:
        summary = summarize_snapshot_output(snapshot_output)
        if summary:
            print("- memory snapshot:")
            for line in summary:
                print(f"  - {line}")

    if artifact_paths:
        print("- emitted artifacts:")
        for path in artifact_paths:
            print(f"  - {path}")
    else:
        print("- emitted artifacts: none")

    if research_artifact is not None:
        print(f"- ResearchOutput: {research_artifact}")
    if phase_templates:
        print("- phase templates:")
        for phase, path in phase_templates.items():
            print(f"  - {phase}: {path}")

    if run_mode == DISCOVERY_RUN_MODE:
        if shortlisted_articles:
            print(f"- discovery shortlist: {len(shortlisted_articles)} candidate signal(s) ready for selection")
            print("- next step guidance: choose one shortlisted signal, then rerun Head or research with that signal as the source")
            print("- ownership note: morning-brew discovers candidates; the user picks the editorial priority; Head owns the loop after selection")
        else:
            print("- discovery shortlist: no strong candidate signals returned")

    print(f"- remaining public path: {' -> '.join(remaining_public_path(phases, next_phase))}")


def main() -> int:
    args = parse_args()
    profile = load_runtime_profile(REPO_ROOT)
    run_mode = resolve_run_mode(args.mode, args.source_ref)
    source_kind = detect_source_kind(args.source_ref, args.source_kind)
    phase_plan = build_phase_plan(args.mode, source_kind, args.handoff)

    emit_plan(args.mode, run_mode, source_kind, phase_plan, args.json)

    snapshot = run_memory_step("snapshot")
    if snapshot.returncode != 0:
        return snapshot.returncode

    completed = run_leaf_automation(args, run_mode, source_kind)
    if completed is None:
        print(
            "Head routed this run to agent-owned execution.\n"
            "- starting phase: research\n"
            f"- source kind: {source_kind}\n"
            "- no script automation exists for this source kind yet\n"
            "- continue through analyze -> write -> review under Head"
        )
    elif completed.returncode != 0:
        return completed.returncode

    research_artifact, phase_templates = synthesize_research_artifacts(profile, run_mode, source_kind, completed)
    if research_artifact is not None:
        title = extract_research_title(research_artifact)
        logged = log_phase_event(
            "research",
            title,
            notes=f"artifact: {research_artifact}",
            route=next_manual_phase(research_artifact),
            verdict="captured",
        )
        if logged.returncode != 0:
            return logged.returncode

    if args.manual:
        print("Manual mode requested. Stopping after the initial routed step.")
    else:
        print("Head runner completed the initial automation step and kept the public phase path intact.")

    print_handoff_summary(
        run_mode,
        source_kind,
        phase_plan,
        snapshot.stdout,
        completed,
        research_artifact,
        phase_templates,
    )

    refresh = run_memory_step("refresh")
    return refresh.returncode


if __name__ == "__main__":
    raise SystemExit(main())
