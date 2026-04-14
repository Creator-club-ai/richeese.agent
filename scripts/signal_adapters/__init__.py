"""Reusable signal collection adapters for discovery and research intake."""

from .common import SignalArticle, SourceConfig, article_keys, deduplicate, normalize_title, normalize_url

__all__ = [
    "SignalArticle",
    "SourceConfig",
    "article_keys",
    "deduplicate",
    "normalize_title",
    "normalize_url",
]
