#!/usr/bin/env python3
"""
Helpers for emitting phase artifacts under the active runtime profile.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from profile_runtime import RuntimeProfile


def slugify(text: str) -> str:
    normalized = text.lower().strip()
    normalized = re.sub(r"[^\w\s가-힣]", "", normalized)
    normalized = re.sub(r"[\s_]+", "-", normalized)
    return normalized[:80] or "untitled"


@dataclass(frozen=True)
class PhaseRun:
    run_id: str
    run_dir: Path


def create_phase_run(profile: RuntimeProfile, title_hint: str) -> PhaseRun:
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    run_id = f"{timestamp}-{slugify(title_hint)}"
    run_dir = profile.head_artifacts_dir / run_id
    run_dir.mkdir(parents=True, exist_ok=True)
    return PhaseRun(run_id=run_id, run_dir=run_dir)


def _write_artifact(path: Path, frontmatter: dict[str, str], sections: list[tuple[str, str]]) -> Path:
    lines = ["---"]
    for key, value in frontmatter.items():
        lines.append(f'{key}: "{value}"')
    lines.extend(["---", ""])
    for heading, body in sections:
        lines.append(f"## {heading}")
        lines.append(body.rstrip())
        lines.append("")
    path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    return path


def write_research_output(
    run: PhaseRun,
    active_profile: str,
    title: str,
    source_kind: str,
    sections: dict[str, str],
    recommendation: str,
) -> Path:
    frontmatter = {
        "artifact_type": "ResearchOutput",
        "phase": "research",
        "active_profile": active_profile,
        "title": title,
        "source_kind": source_kind,
        "status": "complete",
        "recommendation": recommendation,
        "created_at": datetime.now().astimezone().isoformat(),
    }
    ordered_sections = [
        ("Topic", sections["Topic"]),
        ("Research Depth", sections["Research Depth"]),
        ("Source Inventory", sections["Source Inventory"]),
        ("What Happened", sections["What Happened"]),
        ("Usable Points", sections["Usable Points"]),
        ("Direction Cues", sections["Direction Cues"]),
        ("Risks or Gaps", sections["Risks or Gaps"]),
        ("Source Strength", sections["Source Strength"]),
        ("Fact Risk", sections["Fact Risk"]),
        ("Recommendation", recommendation),
    ]
    return _write_artifact(run.run_dir / "research-output.md", frontmatter, ordered_sections)


def write_phase_template(
    run: PhaseRun,
    active_profile: str,
    artifact_type: str,
    phase: str,
    sections: list[str],
    input_artifact: Path,
) -> Path:
    frontmatter = {
        "artifact_type": artifact_type,
        "phase": phase,
        "active_profile": active_profile,
        "status": "template",
        "input_artifact": str(input_artifact),
        "created_at": datetime.now().astimezone().isoformat(),
    }
    ordered_sections = [(section, "_fill this section_") for section in sections]
    return _write_artifact(run.run_dir / f"{phase}-template.md", frontmatter, ordered_sections)


def scaffold_follow_on_templates(run: PhaseRun, active_profile: str, research_artifact: Path) -> dict[str, Path]:
    return {
        "analyze": write_phase_template(
            run,
            active_profile,
            "AnalyzeOutput",
            "analyze",
            [
                "Working Title",
                "Category",
                "Format",
                "User Value",
                "Depth",
                "Timing",
                "Core Thesis",
                "Save Reason",
                "Slide Outline",
                "Selected Angle",
                "Blockers",
                "Angle Status",
            ],
            research_artifact,
        ),
        "write": write_phase_template(
            run,
            active_profile,
            "WriteOutput",
            "write",
            [
                "Working Title",
                "Cover Headline",
                "Slide Copy",
                "Claims",
                "Open Questions",
                "Confidence",
                "Copy Status",
            ],
            research_artifact,
        ),
        "review": write_phase_template(
            run,
            active_profile,
            "ReviewOutput",
            "review",
            [
                "Status",
                "Issues",
                "Severity",
                "Strengths To Preserve",
                "Target Phase",
                "Required Changes",
                "Suggested Patch",
            ],
            research_artifact,
        ),
        "refine": write_phase_template(
            run,
            active_profile,
            "RefineOutput",
            "refine",
            [
                "Target Phase",
                "Patch",
                "Rationale",
                "Preserve Angle",
                "Next Step",
            ],
            research_artifact,
        ),
    }
