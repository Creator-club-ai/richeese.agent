from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone


DEFAULT_LOOKBACK_DAYS = 3
MAX_LOOKBACK_DAYS = 4


def _read_runtime_value(key: str) -> str:
    try:
        from profile_runtime import load_runtime_profile

        path = load_runtime_profile().runtime_profile
    except Exception:
        return ""

    if not path.exists():
        return ""
    prefix = f"- {key}:"
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        stripped = line.strip()
        if stripped.startswith(prefix):
            return stripped.split(":", 1)[1].strip().strip("`").strip()
    return ""


def lookback_days() -> int:
    raw = os.environ.get("CONTENT_OS_LOOKBACK_DAYS") or _read_runtime_value("signal_lookback_days")
    try:
        days = int(raw) if raw else DEFAULT_LOOKBACK_DAYS
    except ValueError:
        days = DEFAULT_LOOKBACK_DAYS
    return max(1, min(days, MAX_LOOKBACK_DAYS))


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def cutoff_utc() -> datetime:
    return now_utc() - timedelta(days=lookback_days())


def run_date() -> str:
    return os.environ.get("CONTENT_OS_RUN_DATE") or now_utc().astimezone().strftime("%Y-%m-%d")
