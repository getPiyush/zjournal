"""Reimplements com.zjournal.web.QueryEngine (Java), itself a reimplementation of the ad-hoc
query engine in server/php/getters.php: repeated query keys (e.g. ?id=a&id=b) OR their matches
together, distinct keys AND across each other, "field_like=value" does a substring match, and
"_sort"/"_order" sort the final result.
"""

from typing import Any

_LIKE_SUFFIX = "_like"


def apply(items: list[dict[str, Any]], params: list[tuple[str, str]]) -> list[dict[str, Any]]:
    result = items
    sort_field: str | None = None
    descending = False

    grouped: dict[str, list[str]] = {}
    order: list[str] = []
    for key, value in params:
        if key not in grouped:
            grouped[key] = []
            order.append(key)
        grouped[key].append(value)

    for key in order:
        values = grouped[key]
        if not values:
            continue

        if key == "_sort":
            sort_field = values[0]
            continue
        if key == "_order":
            descending = "desc" in values[0].lower()
            continue

        like = key.endswith(_LIKE_SUFFIX)
        field = key[: -len(_LIKE_SUFFIX)] if like else key

        matches = []
        seen_ids = set()
        for value in values:
            for item in result:
                if id(item) in seen_ids:
                    continue
                if _matches(item, field, value, like):
                    matches.append(item)
                    seen_ids.add(id(item))
        result = matches

    if sort_field is not None:
        result = sorted(result, key=lambda item: str(item.get(sort_field)), reverse=descending)

    return result


def _matches(item: dict[str, Any], field: str, value: str, like: bool) -> bool:
    field_value = item.get(field)
    if field_value is None:
        return False
    string_value = str(field_value)
    return value in string_value if like else string_value.lower() == value.lower()
