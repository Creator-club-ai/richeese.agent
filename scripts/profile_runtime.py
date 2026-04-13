#!/usr/bin/env python3
"""
Resolve the active profile and storage overlay for the editorial runtime.
"""

from __future__ import annotations

import os
import re
from dataclasses import dataclass
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]


def _parse_markdown_assignments(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8", errors="replace")
    values: dict[str, str] = {}
    for line in text.splitlines():
        match = re.match(r"-\s*([a-zA-Z0-9_]+):\s*`([^`]+)`", line.strip())
        if match:
            values[match.group(1)] = match.group(2)
    return values


def _default_vault_path(default_vault_name: str) -> Path:
    onedrive = os.environ.get("OneDrive", "")
    if onedrive:
        return Path(onedrive) / "문서" / "Obsidian Vault" / default_vault_name
    return Path.home() / "OneDrive" / "문서" / "Obsidian Vault" / default_vault_name


@dataclass(frozen=True)
class RuntimeProfile:
    active_profile: str
    profile_root: Path
    runtime_profile: Path
    brand_guide: Path
    content_strategy: Path
    vault_path: Path
    raw_dir: Path
    latest_signals_dir: Path
    wiki_dir: Path
    editorial_memory_dir: Path
    working_cards_dir: Path
    head_artifacts_dir: Path


def load_runtime_profile(repo_root: Path = REPO_ROOT) -> RuntimeProfile:
    active_profile_path = repo_root / "ACTIVE_PROFILE.md"
    active_values = _parse_markdown_assignments(active_profile_path)

    active_profile = active_values.get("active_profile", "richesse-club")
    profile_root = repo_root / active_values.get("profile_root", "brands/richesse-club/")
    runtime_profile = repo_root / active_values.get("runtime_profile", "brands/richesse-club/RUNTIME_PROFILE.md")
    brand_guide = repo_root / active_values.get("brand_guide", "brands/richesse-club/BRAND_GUIDE.md")
    content_strategy = repo_root / active_values.get("content_strategy", "brands/richesse-club/CONTENT_STRATEGY.md")

    runtime_values = _parse_markdown_assignments(runtime_profile)
    default_vault_name = runtime_values.get("default_vault_name", "richesse-content-os")
    vault_env = runtime_values.get("vault_env", "RICHESSE_VAULT_PATH")

    env_vault = os.environ.get(vault_env, "")
    vault_path = Path(env_vault) if env_vault else _default_vault_path(default_vault_name)

    raw_dir = vault_path / runtime_values.get("raw_dir", "raw/")
    latest_signals_dir = vault_path / runtime_values.get("latest_signals_dir", "오늘의 뉴스/")
    wiki_dir = vault_path / runtime_values.get("wiki_dir", "wiki/")
    editorial_memory_dir = vault_path / runtime_values.get("editorial_memory_dir", "wiki/editorial-memory/")
    working_cards_dir = vault_path / runtime_values.get("working_cards_dir", "content/instagram/")
    head_artifacts_dir = editorial_memory_dir / "head-artifacts"

    return RuntimeProfile(
        active_profile=active_profile,
        profile_root=profile_root,
        runtime_profile=runtime_profile,
        brand_guide=brand_guide,
        content_strategy=content_strategy,
        vault_path=vault_path,
        raw_dir=raw_dir,
        latest_signals_dir=latest_signals_dir,
        wiki_dir=wiki_dir,
        editorial_memory_dir=editorial_memory_dir,
        working_cards_dir=working_cards_dir,
        head_artifacts_dir=head_artifacts_dir,
    )
