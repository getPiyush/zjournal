"""Turns scraped ArticleMeta into a db.json-shaped article record."""

from __future__ import annotations

import html
import re
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import urlparse

from .ids import generate_id
from .scraper import ArticleMeta


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def _domain_name(url: str) -> str:
    netloc = urlparse(url).netloc.lower()
    return netloc[4:] if netloc.startswith("www.") else netloc


def _clean_site_name(name: Optional[str]) -> Optional[str]:
    """Drops a trailing section qualifier, e.g. "Quanta Magazine (Mathematics)" -> "Quanta Magazine"."""
    if not name:
        return None
    return re.sub(r"\s*\([^)]*\)\s*$", "", name).strip() or None


def resolve_author(
    meta: ArticleMeta, author: Optional[str] = None, site_name: Optional[str] = None
) -> str:
    """Byline on the page, else the explicit fallback author, else the website's own name.

    The website name comes from the configured `site_name` (a curated websites-by-category
    entry) when there is one, then the page itself (publisher / og:site_name — less reliable,
    some sites put a section name there), then the domain.
    Crediting the publication beats crediting an unrelated person for an article they didn't write.
    """
    return (
        meta.author
        or author
        or _clean_site_name(site_name)
        or _clean_site_name(meta.site_name)
        or _domain_name(meta.url)
    )


def build_article(
    meta: ArticleMeta,
    category: str,
    author: Optional[str] = None,
    id_length: int = 15,
    site_name: Optional[str] = None,
) -> dict:
    timestamp = _now_iso()
    content = []

    if meta.image:
        content.append({
            "componentId": generate_id(id_length),
            "componenType": "Image",
            "data": meta.image,
            "numbered": False,
        })

    # The title and the paragraph are rendered as HTML (ui-library's parsex), but everything
    # scraped is plain text written by someone else. Escape it, so markup in a page's title or
    # og:description shows up as text instead of becoming part of the journal's page.
    paragraph = html.escape(meta.snippet, quote=False) if meta.snippet else "No preview available."
    source_url = html.escape(meta.url, quote=True)
    paragraph += (
        f"\n<br/>\n<br/>\nRead the full article\n"
        f'<a target="_blank" href="{source_url}">{source_url}</a>'
    )
    content.append({
        "componentId": generate_id(id_length),
        "componenType": "Paragraph",
        "data": paragraph,
        "numbered": False,
    })

    return {
        "id": generate_id(id_length),
        "author": resolve_author(meta, author, site_name),
        "title": html.escape(meta.title, quote=False),
        "createdAt": meta.published_at or timestamp,
        "updatedAt": timestamp,
        "categryId": category,
        "content": content,
        "origin": "server",
        "published": True,
        "deleteFlag": False,
    }
