from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Optional, Sequence

from .category_map import count_invalid, load_categorized_websites, update_site_status
from .db_profile import DbProfile
from .dedupe import extract_urls_from_articles_file, load_seen_urls, save_seen_urls
from .pipeline import parse_websites, run


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="article-generator",
        description="Browse websites in parallel and generate zJournal-shaped article JSON entries.",
    )
    parser.add_argument(
        "--websites",
        help="Comma/space/newline separated list of website URLs to browse. "
             "If omitted (and --categories-file isn't used), you'll be prompted for it.",
    )
    parser.add_argument(
        "--categories-file",
        type=Path,
        default=None,
        help="Path to a websites-by-category JSON file (see websites_by_category.json). "
             "Takes precedence over --websites; articles are tagged with each site's known "
             "category instead of being auto-classified.",
    )
    parser.add_argument(
        "--categories",
        default=None,
        help="With --categories-file, only browse these comma-separated category ids "
             "(default: all categories in the file).",
    )
    parser.add_argument(
        "--sites-per-category",
        type=int,
        default=None,
        help="With --categories-file, cap how many sites per category to browse (default: all).",
    )
    parser.add_argument(
        "--retry-invalid",
        action="store_true",
        help="With --categories-file, also (re-)browse sites already marked \"invalid\" "
             "instead of skipping them.",
    )
    parser.add_argument(
        "--db",
        type=Path,
        default=None,
        help="Existing db.json to analyze (categories/authors/id style) and, with --append, write into.",
    )
    parser.add_argument(
        "--append",
        action="store_true",
        help="Append generated articles into --db instead of writing a separate --output file.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("generated_articles.json"),
        help="Where to write generated articles when not using --append (default: ./generated_articles.json).",
    )
    parser.add_argument(
        "--author",
        default=None,
        help="Fallback author name for articles with no detected byline "
             "(default: most common author found in --db, else 'Article Generator').",
    )
    parser.add_argument("--max-per-site", type=int, default=5, help="Max articles to pull per website (default: 5).")
    parser.add_argument("--workers", type=int, default=6, help="Parallel worker threads (default: 6).")
    parser.add_argument("--delay", type=float, default=0.5, help="Polite per-domain delay in seconds (default: 0.5).")
    parser.add_argument(
        "--seen-file",
        type=Path,
        default=Path("seen_urls.json"),
        help="Tracks article URLs already generated across runs, so a re-run doesn't "
             "regenerate the same articles (default: ./seen_urls.json).",
    )
    parser.add_argument(
        "--no-dedupe",
        action="store_true",
        help="Disable duplicate avoidance against --seen-file, --db, and an existing --output file.",
    )
    parser.add_argument("-v", "--verbose", action="store_true", help="Enable info-level logging.")
    return parser


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = build_parser().parse_args(argv)
    logging.basicConfig(level=logging.INFO if args.verbose else logging.WARNING, format="%(levelname)s %(message)s")

    site_categories = None
    if args.categories_file:
        only_categories = [c.strip() for c in args.categories.split(",")] if args.categories else None
        sites = load_categorized_websites(
            args.categories_file, only_categories, args.sites_per_category, include_invalid=args.retry_invalid
        )
        if not sites:
            print(f"No websites found in {args.categories_file} matching the given filters.", file=sys.stderr)
            return 1
        if not args.retry_invalid:
            skipped_invalid = count_invalid(args.categories_file, only_categories)
            if skipped_invalid:
                print(f"Skipping {skipped_invalid} site(s) already marked invalid (use --retry-invalid to recheck).")
        websites = [s.url for s in sites]
        site_categories = {s.url: s.category_id for s in sites}
    else:
        websites_raw = args.websites or input("Enter website(s) to browse (comma/space/newline separated): ")
        websites = parse_websites(websites_raw)
        if not websites:
            print("No websites provided.", file=sys.stderr)
            return 1

    profile = DbProfile.analyze(args.db) if args.db and args.db.exists() else DbProfile()
    author = args.author or profile.default_author or "Article Generator"

    seen_urls = set()
    if not args.no_dedupe:
        seen_urls |= load_seen_urls(args.seen_file)
        if args.db:
            seen_urls |= extract_urls_from_articles_file(args.db)
        if not args.append:
            seen_urls |= extract_urls_from_articles_file(args.output)
        if seen_urls:
            print(f"Loaded {len(seen_urls)} previously-seen article URL(s) to avoid duplicating.")

    print(f"Browsing {len(websites)} website(s) with {args.workers} parallel workers...")
    result = run(
        websites,
        profile,
        author,
        max_per_site=args.max_per_site,
        workers=args.workers,
        delay=args.delay,
        site_categories=site_categories,
        seen_urls=seen_urls,
    )
    articles = result.articles
    print(f"Generated {len(articles)} new article(s).")

    if not args.no_dedupe:
        save_seen_urls(args.seen_file, seen_urls)

    if args.categories_file:
        if result.invalid_sites:
            print(f"{len(result.invalid_sites)} site(s) were not navigable this run: {', '.join(sorted(result.invalid_sites))}")
        changed = update_site_status(args.categories_file, result.invalid_sites, result.valid_sites)
        if changed:
            print(f"Updated {args.categories_file} ({changed} \"invalid\" flag(s) added/cleared).")

    if not articles:
        return 0

    if args.append:
        if not args.db:
            print("--append requires --db to point at the db.json to update.", file=sys.stderr)
            return 1
        db = json.loads(args.db.read_text()) if args.db.exists() else {"articles": []}
        db.setdefault("articles", []).extend(articles)
        args.db.write_text(json.dumps(db, indent=2, ensure_ascii=False) + "\n")
        print(f"Appended {len(articles)} article(s) into {args.db}")
    else:
        existing = json.loads(args.output.read_text()) if args.output.exists() else {"articles": []}
        existing.setdefault("articles", []).extend(articles)
        args.output.write_text(json.dumps(existing, indent=2, ensure_ascii=False) + "\n")
        print(f"Wrote {len(articles)} new article(s) to {args.output} (total {len(existing['articles'])}).")

    return 0
