# article-generator

A standalone Python tool that browses a list of websites in parallel and turns what it finds
into article entries shaped exactly like the ones in zJournal's `db.json`
(`server/{java,node,php,python}/db.json` all share this schema).

## What it does

1. **Analyzes an existing `db.json`** (`--db`) to learn the conventions already in use: the
   set of categories, the most common author (used as a fallback), and the id length/style.
2. **Takes a string of websites** (comma/space/newline separated), either via `--websites` or
   typed in when prompted.
3. **Browses each website in parallel** (a thread pool fetches every homepage at once, then
   every discovered article page at once), while staying polite: it checks `robots.txt` before
   fetching anything and rate-limits requests per domain (`--delay`).
4. For each site, finds candidate article links, then for each article page collects:
   - **title** (JSON-LD `headline` / `og:title` / `<title>` / first `<h1>`)
   - **author** (JSON-LD `author` / meta tags / a "By <Name>" byline pattern)
   - **published date** (JSON-LD `datePublished` / meta tags / `<time datetime>`)
   - **a snippet** — the meta description if present, otherwise the first few real paragraphs
     of the article body
   - **a hero image**, if one is tagged with `og:image`
5. Builds the `content` array in the same `Image`/`Paragraph` component shape already used in
   `db.json`, with the snippet followed by a "Read the full article" link back to the source —
   matching the pattern already present in the sample data.
6. **Categorizes** each article with a keyword scorer (see `categorize.py`) run against the
   category list learned from `--db` — no external API needed.
7. **Avoids duplicates across runs**: before fetching, every candidate article URL is checked
   against `--seen-file` (a small JSON list persisted between runs) and against the article
   links already embedded in `--db` and any existing `--output` file. Only genuinely new
   articles are fetched and built; `--seen-file` is updated with their URLs on success.
8. Writes the results either to a standalone JSON file (`--output`, default — new articles are
   merged into whatever's already there) or appends them straight into `--db` (`--append`).
9. **With `--categories-file`, tracks broken sites**: any site confidently non-navigable this
   run (disallowed by `robots.txt`, or a DNS/connection-level failure) gets `"invalid": true`
   written onto its entry in that file. A generic HTTP error status or a timeout is treated as
   transient (likely anti-bot throttling from repeated runs) and is *not* persisted — only a
   policy-level or connection-level signal is reliable enough to blacklist a site. Sites
   already marked invalid are skipped on later runs (no wasted request) unless
   `--retry-invalid` is passed; a site that starts working again has the flag cleared
   automatically.
10. **A separate migration tool** (`python -m article_generator.migrate`) merges a
    `generated_articles.json` batch into a target `db.json`: appends the new articles (deduped
    by source URL against what's already in `--db`), adds any category the batch introduced to
    `journal.categories`, and rebuilds `journal.templateData` with a fresh random selection of
    published articles for the homepage. See "Migrating into db.json" below.
11. **A separate sync tool** (`python -m article_generator.sync_db`) copies just the
    `articles` array from one `db.json` to the other three backends, since migrating only
    touches one at a time and `server/{java,node,php,python}/db.json` are meant to serve
    identical data. See "Syncing articles across backends" below.

## Setup

Requires Python 3.10+.

```sh
cd article-generator
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

## Usage

```sh
# Prompts for the websites string interactively:
.venv/bin/python -m article_generator --db ../server/python/db.json

# Or pass it directly, and append straight into db.json:
.venv/bin/python -m article_generator \
  --websites "https://www.nasa.gov/news/, https://www.smithsonianmag.com/science-nature/" \
  --db ../server/python/db.json \
  --append \
  --max-per-site 5 \
  --workers 6

# Or browse a websites-by-category file (see websites_by_category.json), re-running safely —
# already-generated articles (tracked in ./seen_urls.json and whatever's in --db/--output)
# are skipped automatically, so each run only adds new ones:
.venv/bin/python -m article_generator \
  --categories-file websites_by_category.json \
  --db ../server/python/db.json \
  --max-per-site 8 \
  --workers 16
```

### Options

| Flag | Default | Meaning |
| --- | --- | --- |
| `--websites` | *(prompted)* | Comma/space/newline separated website URLs to browse |
| `--categories-file` | *(none)* | Path to a websites-by-category JSON file; takes precedence over `--websites` and tags articles with each site's known category instead of auto-classifying |
| `--categories` | all | With `--categories-file`, only browse these comma-separated category ids |
| `--sites-per-category` | all | With `--categories-file`, cap how many sites per category to browse |
| `--retry-invalid` | off | With `--categories-file`, also (re-)browse sites already marked `"invalid"` instead of skipping them |
| `--db` | *(none)* | Path to an existing `db.json` to analyze conventions from, seed duplicate-avoidance from, and to write into with `--append` |
| `--append` | off | Append generated articles into `--db` instead of writing `--output` |
| `--output` | `./generated_articles.json` | Where to write generated articles when not using `--append` (merged into whatever's already there) |
| `--author` | most common author in `--db`, else `"Article Generator"` | Fallback author for articles with no detected byline |
| `--max-per-site` | `5` | Max articles to pull per website |
| `--workers` | `6` | Parallel worker threads |
| `--delay` | `0.5` | Polite per-domain delay, in seconds, between requests |
| `--seen-file` | `./seen_urls.json` | Tracks article URLs already generated across runs, to avoid duplicates |
| `--no-dedupe` | off | Disable duplicate avoidance against `--seen-file`, `--db`, and an existing `--output` |
| `-v` / `--verbose` | off | Info-level logging (which links were found, fetch failures, etc.) |

## Migrating into db.json

`python -m article_generator` (without `--append`) writes to a standalone
`generated_articles.json` so you can review a batch before it touches the real journal. Once
you're happy with it, `migrate.py` folds that batch into a target `db.json` properly — not just
appending the `articles` array, but also keeping `journal.categories` and
`journal.templateData` (the homepage's featured-article layout) in sync:

```sh
# See what would change without writing anything:
.venv/bin/python -m article_generator.migrate \
  --db ../server/python/db.json \
  --input generated_articles.json \
  --dry-run

# Apply it for real:
.venv/bin/python -m article_generator.migrate \
  --db ../server/python/db.json \
  --input generated_articles.json
```

It's safe to re-run against the same `--db`: articles already present (matched by source URL,
the same rule the generator itself uses) are skipped rather than duplicated, though
`journal.templateData` is re-randomized every run since that's the point of running it again.

| Flag | Default | Meaning |
| --- | --- | --- |
| `--db` | *(required)* | Target `db.json` to update in place |
| `--input` | `./generated_articles.json` | The batch to migrate in |
| `--template-shape` | `1,1,2,3` | Comma-separated row widths for `journal.templateData` — the first row must stay `1` (it renders as the homepage hero article; see `ui-library`'s `TemplateRenderer.tsx`) |
| `--seed` | random | Fix this for a reproducible `journal.templateData` pick (used by tests) |
| `--dry-run` | off | Report what would change without writing `--db` |

## Syncing articles across backends

`server/{java,node,php,python}/db.json` are meant to be interchangeable — same schema, same
data — but `migrate.py` only updates whichever one file you point `--db` at. `sync_db.py` brings
the other three back in line by copying **just** the `articles` array; `journal`, `contacts`,
and `qna` are left completely untouched in every target, since those can legitimately differ
per backend and this toolchain doesn't produce them.

```sh
# Defaults to source=python, targets=java node php (this repo's actual layout):
.venv/bin/python -m article_generator.sync_db --dry-run
.venv/bin/python -m article_generator.sync_db

# Or be explicit / use a different source:
.venv/bin/python -m article_generator.sync_db --source node --targets java php python
```

`--source`/`--targets` accept either a known backend name (`java`/`node`/`php`/`python`,
resolved to `server/<name>/db.json`) or an explicit path. Safe to re-run — a target already
matching the source's articles is reported as "already in sync" and left untouched.

## Notes / limitations

- Article-link discovery is heuristic (prefers `<article>` tags and headline elements, falls
  back to any same-domain link with a slug-like path). Sites with unusual markup may need a
  higher `--max-per-site` to compensate for false positives, or won't yield good results at all.
- This respects `robots.txt` and rate-limits per domain — it does not try to bypass any access
  restrictions a site has in place.
- No LLM/network call is used for categorization; it's a keyword scorer over the categories
  already present in your `--db`. Extend `CATEGORY_KEYWORDS` in `categorize.py` if you add a
  new category that doesn't classify well.
- The `"invalid"` flag is homepage-level only (can the site be browsed at all). A site with a
  working homepage can still fail on individual article pages (e.g. a login-walled link) —
  that's normal and doesn't mark the site itself invalid.

## Testing

Pure-logic unit tests (no network) live in `tests/`:

```sh
.venv/bin/python -m unittest discover -s tests -v
```
