"""Sync tool: copies the `articles` array from one db.json into others, nothing else.

server/{java,node,php,python}/db.json are meant to be interchangeable backends serving the
same data (see each server's README). Running `python -m article_generator` or `migrate.py`
against one of them (typically server/python/db.json, since that's the one this toolchain
scrapes into) leaves the other three holding a stale, shorter `articles` list. This tool
brings them back in sync by copying just that one array — `journal`, `contacts`, and `qna`
are left completely untouched in every target, since those aren't what this toolchain produces
and may legitimately differ.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import List, Optional, Sequence

KNOWN_BACKENDS = ("java", "node", "php", "python")

# article-generator/article_generator/sync_db.py -> repo root is two levels up.
_REPO_ROOT = Path(__file__).resolve().parent.parent.parent


def resolve_db_path(value: str) -> Path:
    """A known backend name (java/node/php/python) resolves to its server/<name>/db.json;
    anything else is treated as an explicit path."""
    if value in KNOWN_BACKENDS:
        return _REPO_ROOT / "server" / value / "db.json"
    return Path(value)


def sync_articles_into(target_db: dict, source_articles: List[dict]) -> bool:
    """Mutates target_db["articles"] in place. Returns whether it actually changed."""
    changed = target_db.get("articles") != source_articles
    target_db["articles"] = source_articles
    return changed


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="article-generator-sync-db",
        description="Copy the `articles` array from one db.json into one or more others "
                     "(journal/contacts/qna are left untouched in every target).",
    )
    parser.add_argument(
        "--source",
        default="python",
        help="Source db.json: a known backend name (java/node/php/python) or an explicit "
             "path. Its `articles` array is copied into every target. Default: python.",
    )
    parser.add_argument(
        "--targets",
        nargs="+",
        default=["java", "node", "php"],
        help="Target db.json(s) to sync articles into: known backend names or explicit "
             "paths. Default: java node php.",
    )
    parser.add_argument("--dry-run", action="store_true", help="Report what would change without writing any target file.")
    return parser


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = build_parser().parse_args(argv)

    source_path = resolve_db_path(args.source)
    if not source_path.exists():
        print(f"Source {source_path} does not exist.", file=sys.stderr)
        return 1

    source_db = json.loads(source_path.read_text())
    source_articles = source_db.get("articles", [])
    print(f"Source: {source_path} ({len(source_articles)} article(s))")

    exit_code = 0
    for target_name in args.targets:
        target_path = resolve_db_path(target_name)

        if target_path.resolve() == source_path.resolve():
            print(f"{target_path}: skipped (same file as source)")
            continue
        if not target_path.exists():
            print(f"{target_path}: skipped (does not exist)", file=sys.stderr)
            exit_code = 1
            continue

        target_db = json.loads(target_path.read_text())
        before = len(target_db.get("articles", []))
        changed = sync_articles_into(target_db, source_articles)

        if not changed:
            print(f"{target_path}: already in sync ({before} article(s))")
            continue

        verb = "would update" if args.dry_run else "updated"
        print(f"{target_path}: {verb} {before} -> {len(source_articles)} article(s)")
        if not args.dry_run:
            target_path.write_text(json.dumps(target_db, indent=2, ensure_ascii=False) + "\n")

    if args.dry_run:
        print("Dry run: no files written.")

    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
