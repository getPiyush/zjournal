"""Learns the conventions (categories, authors, id length) already in use in a db.json.

This is the "analyze db.json" step: rather than hard-coding the category list or a
default author, the generator reads an existing db.json (any of server/{java,node,php,python}/db.json
all share the same shape) and derives what it needs from the real data.
"""

from __future__ import annotations

import json
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

DEFAULT_CATEGORIES = [
    "Science",
    "Space",
    "Technology",
    "History",
    "Mathematics",
    "Art",
    "Software Development",
    "Physics",
    "Philosophy",
    "Medicine",
    "Psychology",
    "Engineering",
]


@dataclass
class DbProfile:
    categories: List[str] = field(default_factory=lambda: list(DEFAULT_CATEGORIES))
    authors: List[str] = field(default_factory=list)
    default_author: Optional[str] = None
    id_length: int = 15

    @classmethod
    def analyze(cls, db_path: Path) -> "DbProfile":
        try:
            payload = json.loads(Path(db_path).read_text())
        except (OSError, json.JSONDecodeError):
            return cls()

        articles = payload.get("articles", [])
        if not articles:
            return cls()

        categories = Counter(a.get("categryId") for a in articles if a.get("categryId"))
        authors = Counter(a.get("author") for a in articles if a.get("author"))
        id_lengths = Counter(len(a.get("id", "")) for a in articles if a.get("id"))

        return cls(
            categories=[c for c, _count in categories.most_common()] or list(DEFAULT_CATEGORIES),
            authors=[a for a, _count in authors.most_common()],
            default_author=authors.most_common(1)[0][0] if authors else None,
            id_length=id_lengths.most_common(1)[0][0] if id_lengths else 15,
        )
