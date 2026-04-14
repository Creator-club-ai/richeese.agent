#!/usr/bin/env python3
"""
Fetch profile-owned signal feeds, apply a light pre-filter, and persist a daily JSON shortlist.

This script does not produce a ResearchOutput.
It only emits a raw shortlist for optional discovery ahead of the core editorial loop.

Usage:
    python fetch_and_curate.py

Dependency:
    pip install feedparser requests yt-dlp
"""

from __future__ import annotations

import io
import json
import sys
from datetime import datetime
from pathlib import Path

from profile_runtime import load_runtime_profile
from signal_adapters.catalog import SourceGroup, build_source_groups
from signal_adapters.common import SignalArticle, article_keys, count_cross_sources, deduplicate

if hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")


RUNTIME_PROFILE = load_runtime_profile()
VAULT_PATH = RUNTIME_PROFILE.vault_path


def load_existing(date_str: str) -> list[SignalArticle]:
    json_path = RUNTIME_PROFILE.latest_signals_dir / f"{date_str}.json"
    if not json_path.exists():
        return []
    try:
        payload = json.loads(json_path.read_text(encoding="utf-8"))
    except Exception:
        return []
    return payload if isinstance(payload, list) else []


def save(articles: list[SignalArticle], date_str: str) -> Path:
    output_dir = RUNTIME_PROFILE.latest_signals_dir
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{date_str}.json"
    output_path.write_text(json.dumps(articles, ensure_ascii=False, indent=2), encoding="utf-8")
    return output_path


def print_scan_plan(groups: list[SourceGroup]) -> None:
    total_sources = sum(len(group.items) for group in groups)
    summary = ", ".join(f"{group.summary_label}: {len(group.items)}" for group in groups)
    print(f"\nFetch & Curate - {datetime.now().strftime('%Y-%m-%d')}")
    print(f"Scanning {total_sources} sources ({summary})")
    print(f"Vault: {VAULT_PATH}\n")


def collect_group_articles(group: SourceGroup) -> list[SignalArticle]:
    print(group.label)
    articles: list[SignalArticle] = []
    for config in group.items:
        articles.extend(group.fetcher(config))
    return articles


def collect_all_articles(groups: list[SourceGroup]) -> list[SignalArticle]:
    articles: list[SignalArticle] = []
    for index, group in enumerate(groups):
        if index:
            print()
        articles.extend(collect_group_articles(group))
    return articles


def existing_article_keys(existing: list[SignalArticle]) -> set[str]:
    keys: set[str] = set()
    for article in existing:
        keys.update(article_keys(article))
    return keys


def annotate_cross_source_counts(articles: list[SignalArticle]) -> None:
    for article, count in zip(articles, count_cross_sources(articles)):
        article["source_count"] = count


def build_new_shortlist(articles: list[SignalArticle], existing_keys: set[str]) -> tuple[list[SignalArticle], int]:
    unique_new = deduplicate(articles)
    if existing_keys:
        unique_new = [article for article in unique_new if not any(key in existing_keys for key in article_keys(article))]
    removed = len(articles) - len(unique_new)
    return unique_new, removed


def main() -> None:
    date_str = datetime.now().strftime("%Y-%m-%d")
    groups = build_source_groups()
    print_scan_plan(groups)

    existing = load_existing(date_str)
    existing_keys = existing_article_keys(existing)
    if existing:
        print(f"Loaded {len(existing)} existing articles for duplicate filtering.\n")

    all_articles = collect_all_articles(groups)
    annotate_cross_source_counts(all_articles)

    unique_new, removed = build_new_shortlist(all_articles, existing_keys)
    print(f"\nCollected {len(all_articles)} items. Removed {removed}. New shortlist: {len(unique_new)}")

    merged = existing + unique_new
    output_path = save(merged, date_str)
    print(f"Saved JSON ({len(merged)} total items): {output_path}")
    print(f"LATEST_SIGNALS_JSON_PATH: {output_path}")

    if unique_new:
        print("\n--- NEW_ARTICLES_START ---")
        print(json.dumps(unique_new, ensure_ascii=False, indent=2))
        print("--- NEW_ARTICLES_END ---")
        return

    print("\nNo new shortlisted articles.")


if __name__ == "__main__":
    main()
