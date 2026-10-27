# Article search: `GET /articles/search`

All four backends (`node`, `python`, `php`, `java`) implement this endpoint the same way. Its
rules are pinned down by [search_cases.json](search_cases.json), which every backend's test
suite runs. Change the rules there first, then make all four pass.

The public site's article list uses this endpoint, so the server filters and pages articles
instead of sending every article to the browser.

## Query parameters

All are optional.

| Param | Meaning |
| --- | --- |
| `q` | Words to find. Split on whitespace; **every** word has to appear (case-insensitive substring) in the searched text. |
| `in` | Where to look: `all` (default), `title`, `author`, `content` or `id`. Anything else means `all`. |
| `from`, `to` | Inclusive `YYYY-MM-DD` bounds, compared with the first 10 characters of `createdAt`. A reversed pair is swapped. With either set, articles whose `createdAt` doesn't start with a date are left out. |
| `status` | `published`, `draft` or `any` (default). Anonymous readers only ever see published articles, so `draft` finds nothing for them. |
| `view` | `public` applies the public view (below) even to a signed-in admin. The public site always sends it, since the admin's token rides along on every request. |
| `categryId` | Exact category, ignoring case. |
| `author` | Exact author, ignoring case. |
| `sort` | `newest` (default), `oldest`, `title-asc` or `title-desc`. |
| `page` | 1-based page number. Default 1, at least 1. |
| `limit` | Page size. Default 20, clamped to 1–100. |

A `page` or `limit` that isn't an integer falls back to its default.

**Searched text.**
- `title`, `author` and `id` search that field.
- `content` searches every content component except `Image`. List items are joined with spaces, and HTML tags are replaced with spaces.
- `all` searches all four, joined with spaces.

**Sorting.**
- Date sorts compare the `createdAt` strings. Articles without a date always sort last, in both directions.
- Title sorts compare lowercased titles by code point.
- Ties are broken by `id`, ascending, so every backend returns the same order.

**Visibility.** Anonymous callers and `view=public` requests (the "public view", same rule as `GET /articles`) only see
articles that are published and not on the purge list (`deleteFlag`). This filter runs before
paging, so `total` and the pages are right. Booleans may be stored as `true`/`1`/`"true"`/`"1"`.

## Response

```json
{ "items": [ /* articles */ ], "total": 42, "page": 2, "limit": 20 }
```

`total` counts every match, not just this page. A page past the end returns no `items` but
still gives the `total`. The body is wrapped in the usual `ezjData` envelope when encryption is
on.
