"""Turns scraped ArticleMeta into a db.json-shaped article record."""

from __future__ import annotations

import html
from datetime import datetime, timezone
from typing import Optional

from .ids import generate_id
from .scraper import ArticleMeta


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def build_article(meta: ArticleMeta, category: str, author: str, id_length: int = 15) -> dict:
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
        "author": meta.author or author,
        "title": html.escape(meta.title, quote=False),
        "createdAt": meta.published_at or timestamp,
        "updatedAt": timestamp,
        "categryId": category,
        "content": content,
        "origin": "server",
        "published": True,
        "deleteFlag": False,
    }
