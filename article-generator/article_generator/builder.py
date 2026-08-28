"""Turns scraped ArticleMeta into a db.json-shaped article record."""

from __future__ import annotations

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

    paragraph = meta.snippet or "No preview available."
    paragraph += (
        f"\n<br/>\n<br/>\nRead the full article\n"
        f'<a target="_blank" href="{meta.url}">{meta.url}</a>'
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
        "title": meta.title,
        "createdAt": meta.published_at or timestamp,
        "updatedAt": timestamp,
        "categryId": category,
        "content": content,
        "origin": "server",
        "published": True,
        "deleteFlag": False,
    }
