"""Fetching and HTML extraction: homepage -> candidate article links -> per-article metadata."""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass
from typing import List, Optional, Tuple
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from dateutil import parser as dateparser

from .robots import USER_AGENT, allowed
from .throttle import DomainThrottle

logger = logging.getLogger("article_generator.scraper")

REQUEST_TIMEOUT = 10
HEADERS = {"User-Agent": USER_AGENT}

_SKIP_PATH_PATTERNS = re.compile(
    r"(^#|/tag/|/tags/|/category/|/categories/|/author/|/about|/contact|/privacy|"
    r"/terms|/login|/signup|/subscribe|/search|/rss|/careers|/jobs|/advertise|"
    r"/sitemap|/help|/faq|/my-account|/account|/newsletter|/shop|/store|"
    r"\.(jpg|jpeg|png|gif|svg|pdf|css|js)$)",
    re.IGNORECASE,
)

# Bare section/index pages that otherwise pass the slug-length check but aren't articles.
_STOP_SLUGS = {
    "articles", "news", "topics", "index", "home", "exploration", "coverage",
    "videos", "video", "podcast", "podcasts", "latest", "trending", "popular",
    "backscatter", "recently-published",
}


@dataclass
class ArticleMeta:
    url: str
    title: str
    author: Optional[str]
    published_at: Optional[str]
    snippet: str
    image: Optional[str]
    is_article: bool = True


def fetch(url: str, throttle: Optional[DomainThrottle] = None) -> Tuple[Optional[str], bool]:
    """Returns (html_or_None, non_navigable).

    `non_navigable` is True only for a confident "this site can't be reached at all" signal:
    disallowed by robots.txt, or a connection-level failure (DNS resolution, refused
    connection, connect timeout — the server never even responded). A generic HTTP error
    status (403, 429, 503, ...) or a read timeout is treated as transient — those are the
    signature of anti-bot throttling or a momentary blip, especially likely if this same
    site has just been hit by a previous run, and retrying later often succeeds. Only the
    confident signal should ever get persisted as a permanent "invalid" site.
    """
    if not allowed(url):
        logger.warning("Skipping %s: disallowed by robots.txt", url)
        return None, True
    if throttle:
        throttle.wait(url)
    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        return resp.text, False
    except requests.ConnectionError as exc:
        logger.warning("Failed to fetch %s: %s", url, exc)
        return None, True
    except requests.RequestException as exc:
        logger.warning("Failed to fetch %s: %s", url, exc)
        return None, False


def extract_article_links(homepage_url: str, html: str, max_links: int) -> List[str]:
    soup = BeautifulSoup(html, "html.parser")
    domain = urlparse(homepage_url).netloc

    candidates: List[str] = []
    seen = set()

    def consider(href: Optional[str]) -> None:
        if not href:
            return
        absolute = urljoin(homepage_url, href)
        parsed = urlparse(absolute)
        if parsed.netloc != domain:
            return
        if _SKIP_PATH_PATTERNS.search(parsed.path or "") or _SKIP_PATH_PATTERNS.search(absolute):
            return
        # Heuristic: article URLs usually have a long, hyphenated slug — a real headline
        # rarely compresses into one short bare word the way section/nav pages do.
        segments = [s for s in parsed.path.split("/") if s]
        if not segments:
            return
        last = segments[-1].lower()
        if last in _STOP_SLUGS:
            return
        if "-" not in last and len(last) < 20:
            return
        if len(last) < 12:
            return
        clean = absolute.split("#")[0]
        if clean in seen:
            return
        seen.add(clean)
        candidates.append(clean)

    # Prefer links that live inside <article> tags or headline-ish elements first.
    for article_tag in soup.find_all("article"):
        for a in article_tag.find_all("a", href=True):
            consider(a["href"])
            if len(candidates) >= max_links:
                return candidates[:max_links]

    for heading in soup.find_all(["h1", "h2", "h3"]):
        a = heading.find("a", href=True)
        if a:
            consider(a["href"])
        if len(candidates) >= max_links:
            return candidates[:max_links]

    # Top off with any same-domain, slug-shaped link if the targeted tiers above didn't
    # fill the quota. This used to be gated on `not candidates` (only run when the good
    # tiers found nothing) because a URL-shape match alone was often a nav/hub page — but
    # extract_article() now verifies real article signals (Article schema, a publish date,
    # etc.) after fetching, so a wider net here just improves yield without hurting quality.
    if len(candidates) < max_links:
        for a in soup.find_all("a", href=True):
            consider(a["href"])
            if len(candidates) >= max_links:
                break

    return candidates[:max_links]


def _find_ld_json(soup: BeautifulSoup) -> dict:
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
        except (json.JSONDecodeError, TypeError):
            continue
        items = data if isinstance(data, list) else [data]
        for item in items:
            if isinstance(item, dict) and item.get("@type") in (
                "NewsArticle", "Article", "BlogPosting", "Report",
            ):
                return item
    return {}


def _meta(soup: BeautifulSoup, *names: str) -> Optional[str]:
    for name in names:
        tag = soup.find("meta", attrs={"property": name}) or soup.find("meta", attrs={"name": name})
        if tag and tag.get("content"):
            return tag["content"].strip()
    return None


def _name_from_profile_url(value: str) -> Optional[str]:
    """Some sites put an author profile URL in article:author instead of a plain name."""
    slug = urlparse(value).path.rstrip("/").rsplit("/", 1)[-1]
    if not slug:
        return None
    words = [w for w in re.split(r"[-_]+", slug) if w and not w.isdigit()]
    if not words:
        return None
    return " ".join(w.capitalize() for w in words)


def _extract_author(soup: BeautifulSoup, ld: dict) -> Optional[str]:
    author = ld.get("author")
    if isinstance(author, dict):
        name = author.get("name")
        return _name_from_profile_url(author["url"]) if not name and author.get("url") else name
    if isinstance(author, list) and author:
        first = author[0]
        return first.get("name") if isinstance(first, dict) else str(first)
    if isinstance(author, str) and author:
        return _name_from_profile_url(author) if author.startswith("http") else author

    meta_author = _meta(soup, "author", "article:author", "byl")
    if meta_author:
        return _name_from_profile_url(meta_author) if meta_author.startswith("http") else meta_author

    byline = soup.find(class_=re.compile("byline|author", re.IGNORECASE))
    if byline:
        text = byline.get_text(" ", strip=True)
        match = re.search(r"By\s+([A-Z][\w.'-]+(?:\s+[A-Z][\w.'-]+){0,3})", text)
        if match:
            return match.group(1)
    return None


def _extract_date(soup: BeautifulSoup, ld: dict) -> Optional[str]:
    raw = ld.get("datePublished") or ld.get("dateCreated")
    if not raw:
        raw = _meta(soup, "article:published_time", "og:published_time", "datePublished", "date")
    if not raw:
        time_tag = soup.find("time")
        if time_tag:
            raw = time_tag.get("datetime") or time_tag.get_text(strip=True)
    if not raw:
        return None
    try:
        return dateparser.parse(raw).isoformat()
    except (ValueError, OverflowError):
        return None


def _extract_snippet(soup: BeautifulSoup, ld: dict, max_chars: int = 400) -> str:
    description = ld.get("description") or _meta(soup, "og:description", "description")
    if description:
        return description.strip()[:max_chars]

    container = soup.find("article") or soup.find("main") or soup.body
    if not container:
        return ""

    boilerplate = re.compile(r"cookie|subscribe|sign up|privacy policy|advertisement", re.IGNORECASE)
    lines: List[str] = []
    for p in container.find_all("p"):
        text = p.get_text(" ", strip=True)
        if len(text) < 40 or boilerplate.search(text):
            continue
        lines.append(text)
        if sum(len(line) for line in lines) >= max_chars:
            break

    snippet = " ".join(lines)[:max_chars]
    return snippet


def _looks_like_article(soup: BeautifulSoup, ld: dict) -> bool:
    """Distinguishes a real article page from a hub/index/section page.

    A long, hyphenated-looking URL slug (the signal extract_article_links uses) can still
    point at a section front (e.g. "/space-exploration/launches-spacecraft"). Those pages
    lack the markup an actual article carries, so require at least one real signal here.
    """
    if ld:
        return True
    if (_meta(soup, "og:type") or "").lower() == "article":
        return True
    if _meta(soup, "article:published_time"):
        return True
    # A bare <article> wrapper alone is too weak on its own — many CMS hub/section
    # templates wrap the whole listing in <article> too. Require a date alongside it.
    if soup.find("article") is not None and soup.find("time") is not None:
        return True
    return False


def _strip_site_suffix(title: str, url: str) -> str:
    """Drops a "Headline | SiteName" / "Headline - SiteName" suffix from a <title> tag.

    A literal " | " is almost never part of a genuine headline, so that delimiter is always
    stripped. " - " is far more likely to be real headline punctuation, so it's only stripped
    when the trailing segment plausibly names the site (shares the domain's root word) —
    otherwise a real headline like "Fed Raises Rates - What It Means" would get mangled.
    """
    match = re.match(r"^(.*?)\s*\|\s*[^|]{1,60}$", title)
    if match:
        return match.group(1).strip()

    match = re.match(r"^(.*?)\s*-\s*([^-]{1,40})$", title)
    if match:
        main, suffix = match.groups()
        domain_root = urlparse(url).netloc.lower().removeprefix("www.").split(".")[0]
        suffix_norm = re.sub(r"[^a-z0-9]", "", suffix.lower())
        if domain_root and len(domain_root) > 2 and domain_root in suffix_norm:
            return main.strip()

    return title


def extract_article(url: str, html: str) -> ArticleMeta:
    soup = BeautifulSoup(html, "html.parser")
    ld = _find_ld_json(soup)

    title = (
        ld.get("headline")
        or _meta(soup, "og:title", "twitter:title")
        or (soup.title.get_text(strip=True) if soup.title else None)
        or (soup.find("h1").get_text(strip=True) if soup.find("h1") else url)
    )

    title = _strip_site_suffix(title.strip(), url)
    # Some sites' section/hub pages carry article-like markup but are titled e.g.
    # "Launches & Spacecraft Coverage | Space" — a real headline essentially never ends
    # this way once the "| SiteName" / "- SiteName" suffix common in <title> is stripped.
    is_hub_titled = bool(re.search(r"\bcoverage\b\s*(?:[|\-–—].*)?$", title, re.IGNORECASE))

    return ArticleMeta(
        url=url,
        title=title,
        author=_extract_author(soup, ld),
        published_at=_extract_date(soup, ld),
        snippet=_extract_snippet(soup, ld),
        image=_meta(soup, "og:image", "twitter:image"),
        is_article=_looks_like_article(soup, ld) and not is_hub_titled,
    )
