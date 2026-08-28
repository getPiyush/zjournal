"""Cross-run duplicate avoidance, keyed on the article's source URL.

Two sources feed the "already have this" set:
  1. `--seen-file` — a small JSON list of every URL a previous run turned into an article,
     persisted across runs regardless of where the articles were written.
  2. `--db` (and any pre-existing `--output` file, which shares the same db.json shape) —
     the "Read the full article" link embedded in each article's Paragraph content is
     pulled back out, so articles already sitting in the journal are never regenerated.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import List, Set

_HREF_RE = re.compile(r'href="([^"]+)"', re.IGNORECASE)


def extract_urls_from_articles(articles: List[dict]) -> Set[str]:
    """Pulls every article source link already embedded in a list of db.json-shaped articles."""
    urls: Set[str] = set()
    for article in articles:
        for component in article.get("content", []):
            data = component.get("data", "")
            urls.update(_HREF_RE.findall(data))
    return urls


def load_seen_urls(path: Path) -> Set[str]:
    if not path.exists():
        return set()
    try:
        return set(json.loads(path.read_text()))
    except (OSError, json.JSONDecodeError):
        return set()


def save_seen_urls(path: Path, urls: Set[str]) -> None:
    path.write_text(json.dumps(sorted(urls), indent=2) + "\n")


def extract_urls_from_articles_file(path: Path) -> Set[str]:
    """Pulls every article source link already embedded in a db.json-shaped file."""
    if not path.exists():
        return set()
    try:
        payload = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError):
        return set()

    return extract_urls_from_articles(payload.get("articles", []))
