#!/usr/bin/env bash
# Copy content-os-* skills from this project into the personal Claude and Codex
# skill directories so they are callable from any working directory.
#
# Re-run this whenever a SKILL.md or references/ file changes.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SKILLS=(
  content-os-news
  content-os-research
  content-os-planner
  content-os-writer
  content-os-reviewer
)

install_set() {
  local src_dir="$1"
  local dst_dir="$2"

  mkdir -p "$dst_dir"

  for s in "${SKILLS[@]}"; do
    if [[ ! -d "$src_dir/$s" ]]; then
      echo "missing source: $src_dir/$s" >&2
      exit 1
    fi
    rm -rf "$dst_dir/$s"
    cp -r "$src_dir/$s" "$dst_dir/$s"
    echo "installed $s -> $dst_dir"
  done
}

purge_legacy_codex_dupes() {
  local legacy_dir="$HOME/.codex/skills"

  if [[ ! -d "$legacy_dir" ]]; then
    return
  fi

  for s in "${SKILLS[@]}"; do
    rm -rf "$legacy_dir/$s"
    echo "removed legacy duplicate $s from $legacy_dir"
  done
}

install_set "$ROOT_DIR/.claude/skills" "$HOME/.claude/skills"
install_set "$ROOT_DIR/.codex/skills" "$HOME/.agents/skills"
purge_legacy_codex_dupes

echo "---"
echo "installed claude skills to $HOME/.claude/skills"
echo "installed codex skills to $HOME/.agents/skills"
