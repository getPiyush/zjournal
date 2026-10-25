"""GET /articles/search: the same search, filters and paging as the other three backends.
The rules are in server/SEARCH.md and pinned down by server/search_cases.json.
"""

import re
from typing import Any, Mapping

from app.auth import _is_true, is_public_article

DEFAULT_LIMIT = 20
MAX_LIMIT = 100
_FIELDS = {"all", "title", "author", "content", "id"}
_TAG = re.compile(r"<[^>]*>")
_DAY = re.compile(r"^\d{4}-\d{2}-\d{2}")


def _text(value: Any) -> str:
    return "" if value is None else str(value)


def _content_text(article: dict) -> str:
    parts = []
    for component in article.get("content") or []:
        if not isinstance(component, dict) or component.get("componenType") == "Image":
            continue
        data = component.get("data")
        parts.append(" ".join(_text(item) for item in data) if isinstance(data, list) else _text(data))
    return _TAG.sub(" ", " ".join(parts))


def _searchable(article: dict, field: str) -> str:
    if field == "content":
        return _content_text(article)
    if field in ("title", "author", "id"):
        return _text(article.get(field))
    return " ".join([_text(article.get("title")), _text(article.get("author")), _text(article.get("id")), _content_text(article)])


def _day(article: dict) -> str | None:
    created = _text(article.get("createdAt"))
    return created[:10] if _DAY.match(created) else None


def _int_param(value: str | None, default: int, low: int, high: int) -> int:
    try:
        number = int(value) if value is not None else default
    except ValueError:
        number = default
    return max(low, min(high, number))


def _sorted(items: list[dict], sort: str) -> list[dict]:
    by_id = sorted(items, key=lambda a: _text(a.get("id")))
    if sort in ("title-asc", "title-desc"):
        return sorted(by_id, key=lambda a: _text(a.get("title")).lower(), reverse=sort == "title-desc")
    # Undated articles go last in both directions; dated ones sort by their createdAt string.
    dated = [a for a in by_id if _day(a) is not None]
    undated = [a for a in by_id if _day(a) is None]
    dated = sorted(dated, key=lambda a: _text(a.get("createdAt")), reverse=sort != "oldest")
    return dated + undated


def search(articles: list[dict], params: Mapping[str, str], public: bool) -> dict:
    public = public or params.get("view") == "public"
    words = _text(params.get("q")).lower().split()
    field = params.get("in") if params.get("in") in _FIELDS else "all"
    start, end = params.get("from") or "", params.get("to") or ""
    if start and end and start > end:
        start, end = end, start
    status = params.get("status") or "any"
    category = (params.get("categryId") or "").lower()
    author = (params.get("author") or "").lower()

    def matches(article: dict) -> bool:
        if public and not is_public_article(article):
            return False
        if status == "published" and not _is_true(article.get("published")):
            return False
        if status == "draft" and _is_true(article.get("published")):
            return False
        if category and _text(article.get("categryId")).lower() != category:
            return False
        if author and _text(article.get("author")).lower() != author:
            return False
        if start or end:
            day = _day(article)
            if day is None or (start and day < start) or (end and day > end):
                return False
        if words:
            text = _searchable(article, field).lower()
            return all(word in text for word in words)
        return True

    found = _sorted([a for a in articles if isinstance(a, dict) and matches(a)], params.get("sort") or "newest")
    page = _int_param(params.get("page"), 1, 1, 1_000_000)
    limit = _int_param(params.get("limit"), DEFAULT_LIMIT, 1, MAX_LIMIT)
    offset = (page - 1) * limit
    return {"items": found[offset : offset + limit], "total": len(found), "page": page, "limit": limit}
