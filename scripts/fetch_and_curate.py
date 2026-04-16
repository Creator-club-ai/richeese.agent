#!/usr/bin/env python3
"""
Fetch configured signal feeds, filter candidates, and persist a daily shortlist.

This script does not produce a ResearchOutput. It only emits a SignalShortlist
for optional discovery before research.
"""

from __future__ import annotations

import io
import json
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from profile_runtime import load_runtime_profile
from signal_adapters.catalog import SourceGroup, build_source_groups
from signal_adapters.common import SignalArticle, article_keys, count_cross_sources, deduplicate, is_relevant
from signal_adapters.runtime import lookback_days, run_date

if hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")


RUNTIME_PROFILE = load_runtime_profile()
VAULT_PATH = RUNTIME_PROFILE.vault_path
DEFAULT_MAX_SHORTLIST = 20


@dataclass(frozen=True)
class FilterConfig:
    include_keywords: tuple[str, ...] = ()
    exclude_keywords: tuple[str, ...] = ()
    allowed_categories: tuple[str, ...] = ()
    max_items: int = DEFAULT_MAX_SHORTLIST
    lookback_days: int = 3


def _parse_csv(value: str) -> tuple[str, ...]:
    return tuple(item.strip().lower() for item in value.split(",") if item.strip())


def _read_runtime_value(key: str) -> str:
    path = RUNTIME_PROFILE.runtime_profile
    if not path.exists():
        return ""
    prefix = f"- {key}:"
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        stripped = line.strip()
        if stripped.startswith(prefix):
            return stripped.split(":", 1)[1].strip().strip("`").strip()
    return ""


def load_filter_config() -> FilterConfig:
    max_items_raw = _read_runtime_value("signal_max_items")
    try:
        max_items = int(max_items_raw) if max_items_raw else DEFAULT_MAX_SHORTLIST
    except ValueError:
        max_items = DEFAULT_MAX_SHORTLIST

    return FilterConfig(
        include_keywords=_parse_csv(_read_runtime_value("signal_include_keywords")),
        exclude_keywords=_parse_csv(_read_runtime_value("signal_exclude_keywords")),
        allowed_categories=_parse_csv(_read_runtime_value("signal_allowed_categories")),
        max_items=max(1, max_items),
        lookback_days=lookback_days(),
    )


def load_existing(date_str: str) -> list[SignalArticle]:
    json_path = RUNTIME_PROFILE.latest_signals_dir / f"{date_str}.json"
    if not json_path.exists():
        return []
    try:
        payload = json.loads(json_path.read_text(encoding="utf-8"))
    except Exception:
        return []
    return payload if isinstance(payload, list) else []


def render_signal_note(articles: list[SignalArticle], date_str: str) -> str:
    lines = [
        f"# Latest Signals - {date_str}",
        "",
        f"- profile: {RUNTIME_PROFILE.active_profile}",
        f"- total items: {len(articles)}",
        "",
        "## Editorial Radar",
        "",
    ]
    if not articles:
        lines += ["- none", ""]
    else:
        for article in articles:
            source_count = article.get("source_count", 1)
            source_signal = f" | source_count {source_count}" if source_count and int(source_count) > 1 else ""
            lines.append(f"### {article.get('title', 'Untitled')}")
            lines.append(f"- source: {article.get('source', 'unknown')}")
            lines.append(f"- url: {article.get('url', '')}")
            lines.append(f"- category: {article.get('category', 'unknown')}")
            lines.append(f"- published: {article.get('published', '')}{source_signal}")
            lines.append(f"- summary: {article.get('summary', '')}")
            lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def save(articles: list[SignalArticle], date_str: str) -> Path:
    output_dir = RUNTIME_PROFILE.latest_signals_dir
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{date_str}.json"
    output_path.write_text(json.dumps(articles, ensure_ascii=False, indent=2), encoding="utf-8")
    note_path = output_dir / f"{date_str}.md"
    note_path.write_text(render_signal_note(articles, date_str), encoding="utf-8")
    return output_path


def print_scan_plan(groups: list[SourceGroup], filter_config: FilterConfig) -> None:
    total_sources = sum(len(group.items) for group in groups)
    summary = ", ".join(f"{group.summary_label}: {len(group.items)}" for group in groups)
    print(f"\nSignal scan - {run_date()}")
    print(f"Sources: {total_sources} ({summary})")
    print(f"Lookback: {filter_config.lookback_days} days")
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


def article_text(article: SignalArticle) -> str:
    fields = (
        article.get("title", ""),
        article.get("title_en", ""),
        article.get("summary", ""),
        article.get("source", ""),
        article.get("category", ""),
    )
    return " ".join(str(field).lower() for field in fields if field)


def keyword_hits(article: SignalArticle, keywords: tuple[str, ...]) -> int:
    text = article_text(article)
    return sum(1 for keyword in keywords if keyword in text)


def passes_filter(article: SignalArticle, config: FilterConfig) -> bool:
    title = str(article.get("title", ""))
    summary = str(article.get("summary", ""))
    if not is_relevant(title, summary):
        return False
    if config.exclude_keywords and keyword_hits(article, config.exclude_keywords):
        return False
    category = str(article.get("category", "")).lower()
    if config.allowed_categories and category not in config.allowed_categories:
        return False
    if config.include_keywords and not keyword_hits(article, config.include_keywords):
        return False
    return True


def filter_score(article: SignalArticle, config: FilterConfig) -> tuple[int, int, int, int]:
    priority = int(article.get("priority", 99))
    source_count = int(article.get("source_count", 1) or 1)
    has_summary = 1 if article.get("summary") else 0
    include_hits = keyword_hits(article, config.include_keywords)
    return (-source_count, -include_hits, -has_summary, priority)


def filter_shortlist(articles: list[SignalArticle], config: FilterConfig | None = None) -> list[SignalArticle]:
    active_config = config or FilterConfig()
    filtered = [article for article in articles if passes_filter(article, active_config)]
    return sorted(filtered, key=lambda article: filter_score(article, active_config))[: active_config.max_items]


def build_new_shortlist(
    articles: list[SignalArticle],
    existing_keys: set[str],
    config: FilterConfig | None = None,
) -> tuple[list[SignalArticle], int]:
    active_config = config or FilterConfig()
    unique_new = [article for article in deduplicate(articles) if passes_filter(article, active_config)]
    if existing_keys:
        unique_new = [article for article in unique_new if not any(key in existing_keys for key in article_keys(article))]
    unique_new = sorted(unique_new, key=lambda article: filter_score(article, active_config))[: active_config.max_items]
    removed = len(articles) - len(unique_new)
    return unique_new, removed


def main() -> None:
    date_str = run_date()
    filter_config = load_filter_config()
    groups = build_source_groups()
    print_scan_plan(groups, filter_config)

    existing = filter_shortlist(load_existing(date_str), filter_config)
    existing_keys = existing_article_keys(existing)
    if existing:
        print(f"Loaded {len(existing)} existing shortlisted items for duplicate checks\n")

    all_articles = collect_all_articles(groups)
    annotate_cross_source_counts(all_articles)

    unique_new, removed = build_new_shortlist(all_articles, existing_keys, filter_config)
    print(f"\nCollected {len(all_articles)} items, filtered/removed {removed}, new shortlist {len(unique_new)} items")

    merged = filter_shortlist(existing + unique_new, filter_config)
    output_path = save(merged, date_str)
    print(f"Saved filtered shortlist ({len(merged)} items): {output_path}")
    print(f"LATEST_SIGNALS_JSON_PATH: {output_path}")

    if unique_new:
        print("\n--- NEW_ARTICLES_START ---")
        print(json.dumps(unique_new, ensure_ascii=False, indent=2))
        print("--- NEW_ARTICLES_END ---")
        return

    print("\nNo new shortlisted articles.")


if __name__ == "__main__":
    main()
