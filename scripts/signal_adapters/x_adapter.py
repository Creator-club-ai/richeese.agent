from __future__ import annotations

import html as html_mod
import json
import re

import requests

from .common import MAX_PER_FEED, REQUEST_TIMEOUT, SignalArticle, SourceConfig, is_relevant, parse_datetime_string
from .runtime import cutoff_utc


def fetch_twitter(config: SourceConfig) -> list[SignalArticle]:
    handle = str(config["handle"])
    articles: list[SignalArticle] = []
    cutoff = cutoff_utc()

    url = f"https://syndication.twitter.com/srv/timeline-profile/screen-name/{handle}"
    try:
        response = requests.get(url, timeout=REQUEST_TIMEOUT)
        if response.status_code != 200:
            print(f"  - X/@{handle}: HTTP {response.status_code}")
            return articles
    except Exception as exc:
        print(f"  - X/@{handle}: request failed ({exc})")
        return articles

    match = re.search(r"__NEXT_DATA__.*?>(.*?)</script>", response.text)
    if not match:
        print(f"  - X/@{handle}: __NEXT_DATA__ not found")
        return articles

    try:
        data = json.loads(match.group(1))
        entries = data["props"]["pageProps"]["timeline"]["entries"]
    except (json.JSONDecodeError, KeyError) as exc:
        print(f"  - X/@{handle}: parse error ({exc})")
        return articles

    raw_count = 0
    missing_dates = 0
    for entry in entries:
        if len(articles) >= MAX_PER_FEED:
            break
        if entry.get("type") != "tweet":
            continue

        tweet = entry.get("content", {}).get("tweet", {})
        full_text = html_mod.unescape(str(tweet.get("full_text", "")))
        if not full_text:
            continue

        published_at = parse_datetime_string(str(tweet.get("created_at", "")))
        if not published_at:
            missing_dates += 1
            continue
        if published_at < cutoff:
            continue

        raw_count += 1
        tweet_id = tweet.get("id_str", "")
        screen_name = tweet.get("user", {}).get("screen_name", handle)
        tweet_url = f"https://x.com/{screen_name}/status/{tweet_id}" if tweet_id else ""
        likes = tweet.get("favorite_count", 0)
        rts = tweet.get("retweet_count", 0)

        title = full_text[:120].replace("\n", " ")
        summary = f"{full_text[:280]} | Likes: {likes} | RTs: {rts}"
        if not is_relevant(title, summary):
            continue

        articles.append(
            {
                "title": title,
                "url": tweet_url,
                "source": f"X/@{screen_name}",
                "category": config["category"],
                "priority": config["priority"],
                "type": "x_syndication",
                "published": published_at.strftime("%Y-%m-%d"),
                "summary": summary,
            }
        )

    filtered_out = raw_count - len(articles)
    extras: list[str] = []
    if filtered_out:
        extras.append(f"filtered out {filtered_out}")
    if missing_dates:
        extras.append(f"missing date {missing_dates}")
    suffix = f" ({', '.join(extras)})" if extras else ""
    print(f"  - X/@{handle}: kept {len(articles)}{suffix}")
    return articles
