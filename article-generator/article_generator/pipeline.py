"""Parallel orchestration: fetch homepages, discover article links, fetch + build articles."""

from __future__ import annotations

import logging
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple

from .builder import build_article
from .categorize import categorize
from .db_profile import DbProfile
from .scraper import extract_article, extract_article_links, fetch
from .throttle import DomainThrottle

logger = logging.getLogger("article_generator.pipeline")


@dataclass
class RunResult:
    articles: List[dict] = field(default_factory=list)
    invalid_sites: Set[str] = field(default_factory=set)
    valid_sites: Set[str] = field(default_factory=set)


def parse_websites(raw: str) -> List[str]:
    """Split a free-form string of websites (comma/space/newline separated) into URLs."""
    parts = re.split(r"[\s,]+", raw.strip())
    websites = []
    for part in parts:
        if not part:
            continue
        websites.append(part if part.startswith(("http://", "https://")) else f"https://{part}")
    return websites


def _process_article(
    url: str,
    profile: DbProfile,
    author: str,
    throttle: DomainThrottle,
    forced_category: Optional[str] = None,
) -> Optional[dict]:
    html, _ = fetch(url, throttle)
    if not html:
        return None
    meta = extract_article(url, html)
    if not meta.is_article:
        logger.info("Skipping %s: doesn't look like an article page", url)
        return None
    category = forced_category or categorize(
        meta.title, meta.snippet, profile.categories, default=profile.categories[0]
    )
    return build_article(meta, category, author, profile.id_length)


def run(
    websites: List[str],
    profile: DbProfile,
    author: str,
    max_per_site: int = 5,
    workers: int = 6,
    delay: float = 0.5,
    site_categories: Optional[Dict[str, str]] = None,
    seen_urls: Optional[Set[str]] = None,
) -> RunResult:
    """Browse `websites` in parallel and build articles.

    `site_categories`, if given, maps a homepage URL to a known category id (e.g. loaded from
    a websites-by-category file). Articles found on that site are tagged with that category
    directly instead of being run through the keyword classifier.

    `seen_urls`, if given, is a set of article URLs already generated in a prior run (or
    already present in the target db.json) — candidates matching it are skipped before ever
    being fetched, and it is mutated in place with every new article's URL as it succeeds, so
    the caller can persist it for the next run.

    The returned RunResult also reports which homepages were confidently non-navigable this
    run (robots.txt disallowed, or a connection-level failure) vs. reachable, so the caller
    can persist that back onto a websites-by-category file (see
    category_map.update_site_status). A merely transient failure (HTTP error status, read
    timeout) shows up in neither set — it's logged but not treated as a verdict on the site.
    """
    if seen_urls is None:
        seen_urls = set()
    throttle = DomainThrottle(delay)

    with ThreadPoolExecutor(max_workers=min(workers, max(1, len(websites)))) as pool:
        homepages = dict(zip(websites, pool.map(lambda site: fetch(site, throttle), websites)))

    article_links: List[Tuple[str, Optional[str]]] = []
    seen_this_run = set()
    skipped_duplicates = 0
    invalid_sites: Set[str] = set()
    valid_sites: Set[str] = set()
    for site, (html, non_navigable) in homepages.items():
        if not html:
            logger.warning("Could not browse %s", site)
            if non_navigable:
                invalid_sites.add(site)
            continue
        valid_sites.add(site)
        forced_category = site_categories.get(site) if site_categories else None
        links = extract_article_links(site, html, max_per_site)
        logger.info("Found %d candidate article(s) on %s", len(links), site)
        for link in links:
            if link in seen_urls or link in seen_this_run:
                skipped_duplicates += 1
                continue
            seen_this_run.add(link)
            article_links.append((link, forced_category))

    if skipped_duplicates:
        logger.info("Skipped %d already-seen article link(s)", skipped_duplicates)

    articles: List[dict] = []
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {
            pool.submit(_process_article, url, profile, author, throttle, forced_category): url
            for url, forced_category in article_links
        }
        for future in as_completed(futures):
            url = futures[future]
            try:
                result = future.result()
            except Exception:
                logger.exception("Failed to process %s", url)
                continue
            if result:
                articles.append(result)
                seen_urls.add(url)

    return RunResult(articles=articles, invalid_sites=invalid_sites, valid_sites=valid_sites)
