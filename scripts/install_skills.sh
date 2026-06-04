#!/usr/bin/env bash
# Copy content-os-* skills from this project into the personal Claude skill
# directory so they are callable from any working directory.
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

install_set "$ROOT_DIR/.claude/skills" "$HOME/.claude/skills"

echo "---"
echo "installed claude skills to $HOME/.claude/skills"
