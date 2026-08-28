"""Loads a websites-by-category input file (see websites_by_category.json) into a flat list.

Unlike the free-form `--websites` string, every site here already carries a known category,
so articles scraped from it are tagged with that category directly instead of being run
through the keyword classifier in categorize.py.

Sites that turn out to be non-navigable (fetch failure, blocked by robots.txt, etc.) get an
`"invalid": true` property written back onto their entry after a run (see update_site_status),
so future runs can skip the wasted request by default.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Set


@dataclass
class CategorySite:
    category_id: str
    name: str
    url: str
    invalid: bool = False


def load_categorized_websites(
    path: Path,
    only_categories: Optional[List[str]] = None,
    sites_per_category: Optional[int] = None,
    include_invalid: bool = False,
) -> List[CategorySite]:
    payload = json.loads(Path(path).read_text())
    wanted = {c.strip() for c in only_categories} if only_categories else None

    sites: List[CategorySite] = []
    for entry in payload.get("categories", []):
        category_id = entry.get("categoryId")
        if not category_id:
            continue
        if wanted and category_id not in wanted:
            continue

        usable = []
        for site in entry.get("websites", []):
            url = site.get("url")
            if not url:
                continue
            invalid = bool(site.get("invalid", False))
            if invalid and not include_invalid:
                continue
            usable.append(CategorySite(category_id=category_id, name=site.get("name", url), url=url, invalid=invalid))

        if sites_per_category is not None:
            usable = usable[:sites_per_category]
        sites.extend(usable)

    return sites


def count_invalid(path: Path, only_categories: Optional[List[str]] = None) -> int:
    """Counts sites already marked invalid, matching the given category filter."""
    payload = json.loads(Path(path).read_text())
    wanted = {c.strip() for c in only_categories} if only_categories else None
    count = 0
    for entry in payload.get("categories", []):
        if wanted and entry.get("categoryId") not in wanted:
            continue
        count += sum(1 for site in entry.get("websites", []) if site.get("invalid"))
    return count


def update_site_status(path: Path, invalid_urls: Set[str], valid_urls: Set[str]) -> int:
    """Marks sites as invalid/valid in-place in a websites-by-category file.

    `invalid_urls` are homepages that couldn't be browsed this run (robots.txt disallowed,
    fetch failure, etc.) and get `"invalid": true` added. `valid_urls` are homepages that
    succeeded — if one was previously marked invalid, the flag is cleared (sites can come
    back online). Returns the number of entries changed; the file is only rewritten if
    something actually changed.
    """
    payload = json.loads(Path(path).read_text())
    changed = 0

    for entry in payload.get("categories", []):
        for site in entry.get("websites", []):
            url = site.get("url")
            if not url:
                continue
            if url in invalid_urls and not site.get("invalid"):
                site["invalid"] = True
                changed += 1
            elif url in valid_urls and site.get("invalid"):
                del site["invalid"]
                changed += 1

    if changed:
        Path(path).write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")

    return changed
