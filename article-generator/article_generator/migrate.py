"""Migration tool: merges a generated_articles.json batch into a target db.json.

`db.json` (the shape shared by server/{java,node,php,python}/db.json) holds more than the
flat `articles` list — the `journal` object drives the homepage: `journal.categories` is the
category filter list shown in the UI, and `journal.templateData` is the string that lays out
which articles the homepage features (see ui-library's TemplateRenderer.parseTemplateArticleIds
and TemplateRenderer.tsx: rows are `\n`-separated, columns within a row are `|`-separated
article ids, and a lone id in row 0 renders as the hero article).

Running this against a batch from `python -m article_generator`:
  1. Appends the genuinely new articles (by source URL — an article already in `db.json`
     under a different id, e.g. from an earlier migration, is skipped rather than duplicated).
  2. Adds any category used by an article but missing from `journal.categories`, leaving
     existing entries (and their order) untouched.
  3. Rebuilds `journal.templateData` with a fresh, random, non-repeating selection of
     published articles, so the homepage doesn't keep featuring the same handful forever.
"""

from __future__ import annotations

import argparse
import json
import random
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional, Sequence, Tuple

from .dedupe import extract_urls_from_articles

# Matches the row/column shape already baked into the sample db.json: a single hero article,
# then a single article, then a row of 2, then a row of 3.
DEFAULT_TEMPLATE_SHAPE: Tuple[int, ...] = (1, 1, 2, 3)


def _article_url(article: dict) -> Optional[str]:
    urls = extract_urls_from_articles([article])
    return next(iter(urls), None)


@dataclass
class MigrationResult:
    added: int = 0
    skipped_duplicates: int = 0
    new_categories: List[str] = field(default_factory=list)
    template_data: str = ""
    total_articles: int = 0


def merge_categories(existing: List[str], articles: List[dict]) -> Tuple[List[str], List[str]]:
    """Returns (merged_list, newly_added) — `existing`'s entries and order are preserved."""
    merged = list(existing) if existing else []
    if "All" not in merged:
        merged.insert(0, "All")

    used = sorted({a["categryId"] for a in articles if a.get("categryId")})
    added = [category for category in used if category not in merged]
    merged.extend(added)
    return merged, added


def build_template_data(
    articles: List[dict],
    shape: Sequence[int] = DEFAULT_TEMPLATE_SHAPE,
    rng: Optional[random.Random] = None,
) -> str:
    """Picks random, distinct published articles into a `id\\nid|id\\n...` layout.

    Row 0 must stay a single id for the frontend to render it as the hero article — see
    TemplateRenderer.tsx's `index === 0 && columnData.length === 1` check.
    """
    rng = rng or random.Random()
    eligible = [
        a["id"] for a in articles
        if a.get("id") and a.get("published", True) and not a.get("deleteFlag", False)
    ]
    if not eligible:
        return ""

    total_slots = sum(shape)
    picks = list(eligible)
    rng.shuffle(picks)
    while len(picks) < total_slots:
        picks.extend(eligible)
    picks = picks[:total_slots]

    rows = []
    cursor = 0
    for width in shape:
        rows.append("|".join(picks[cursor:cursor + width]))
        cursor += width
    return "\n".join(rows)


def migrate(
    db: dict,
    incoming_articles: List[dict],
    shape: Sequence[int] = DEFAULT_TEMPLATE_SHAPE,
    seed: Optional[int] = None,
) -> MigrationResult:
    """Mutates `db` in place (articles + journal.categories + journal.templateData)."""
    existing_urls = extract_urls_from_articles(db.get("articles", []))

    new_articles = []
    skipped = 0
    for article in incoming_articles:
        url = _article_url(article)
        if url and url in existing_urls:
            skipped += 1
            continue
        new_articles.append(article)
        if url:
            existing_urls.add(url)

    db.setdefault("articles", []).extend(new_articles)

    journal = db.setdefault("journal", {})
    merged_categories, added_categories = merge_categories(journal.get("categories", []), db["articles"])
    journal["categories"] = merged_categories

    journal["templateData"] = build_template_data(db["articles"], shape, random.Random(seed))

    return MigrationResult(
        added=len(new_articles),
        skipped_duplicates=skipped,
        new_categories=added_categories,
        template_data=journal["templateData"],
        total_articles=len(db["articles"]),
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="article-generator-migrate",
        description="Merge a generated_articles.json batch into a zJournal db.json: adds new "
                     "articles, updates journal.categories, and rebuilds journal.templateData "
                     "with a fresh random selection.",
    )
    parser.add_argument("--db", type=Path, required=True, help="Target db.json to update in place.")
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("generated_articles.json"),
        help="generated_articles.json to migrate in (default: ./generated_articles.json).",
    )
    parser.add_argument(
        "--template-shape",
        default=",".join(str(n) for n in DEFAULT_TEMPLATE_SHAPE),
        help=f"Comma-separated row widths for journal.templateData "
             f"(default: {','.join(str(n) for n in DEFAULT_TEMPLATE_SHAPE)} — a single hero "
             f"article, then rows of 1/2/3, matching the existing db.json convention). "
             f"The first number must be 1 for the homepage to show a hero article.",
    )
    parser.add_argument("--seed", type=int, default=None, help="Random seed, for reproducible template picks (default: random).")
    parser.add_argument("--dry-run", action="store_true", help="Report what would change without writing --db.")
    return parser


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = build_parser().parse_args(argv)

    if not args.db.exists():
        print(f"{args.db} does not exist.", file=sys.stderr)
        return 1
    if not args.input.exists():
        print(f"{args.input} does not exist.", file=sys.stderr)
        return 1

    try:
        shape = tuple(int(n) for n in args.template_shape.split(","))
    except ValueError:
        print(f"--template-shape must be comma-separated integers, got {args.template_shape!r}", file=sys.stderr)
        return 1
    if not shape or shape[0] != 1:
        print("--template-shape's first row must be 1 (that's what renders as the hero article).", file=sys.stderr)
        return 1

    db = json.loads(args.db.read_text())
    incoming = json.loads(args.input.read_text()).get("articles", [])

    result = migrate(db, incoming, shape=shape, seed=args.seed)

    print(f"Added {result.added} new article(s) ({result.skipped_duplicates} already present, skipped).")
    if result.new_categories:
        label = "category" if len(result.new_categories) == 1 else "categories"
        print(f"Added {label} to journal.categories: {', '.join(result.new_categories)}")
    print(f"Rebuilt journal.templateData with {sum(shape)} article(s) across {len(shape)} row(s).")
    print(f"db now has {result.total_articles} total article(s).")

    if args.dry_run:
        print("Dry run: no changes written.")
        return 0

    args.db.write_text(json.dumps(db, indent=2, ensure_ascii=False) + "\n")
    print(f"Wrote {args.db}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
