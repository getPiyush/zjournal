#!/usr/bin/env python3
"""Auto-generate the Home template from analytics and push it to every backend's db.json.

Same layout as the "Auto generate" button in web-app's admin Templates page
(web-app/src/admin/pages/templates/HomeTemplate.tsx): ranks articles by view
count via the analytics service, then lays out the top 14 as one hero article
followed by rows of 3, 5, and 5 more, "|"-separated within a row and
newline-separated between rows.

Unlike the button (which only fills in a textarea for review before Save),
this script writes `journal.templateData` directly into every backend's
db.json - server/node, server/php, server/java, server/python - so it's meant
for batch/cron use, not as a substitute for the admin UI's preview step.

Usage:
    python3 scripts/auto_generate_template.py
    python3 scripts/auto_generate_template.py --application patrikaz
    python3 scripts/auto_generate_template.py --dry-run
"""

import argparse
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

REPO_ROOT = Path(__file__).resolve().parents[1]
ANALYTICS_DIR = REPO_ROOT / "analytics"
DEFAULT_DB_JSON_PATHS = [
    REPO_ROOT / "server" / "node" / "db.json",
    REPO_ROOT / "server" / "php" / "db.json",
    REPO_ROOT / "server" / "java" / "db.json",
    REPO_ROOT / "server" / "python" / "db.json",
]

# Row layout for the generated template: 1 hero article, then rows of 3/5/5
# bar-separated articles, ranked by analytics view count (most-read first).
ROW_SIZES = [1, 3, 5, 5]
ARTICLE_COUNT = sum(ROW_SIZES)

TEMPLATE_DATA_PATTERN = re.compile(r'"templateData"\s*:\s*"(?:[^"\\]|\\.)*"')


def is_healthy(analytics_url: str) -> bool:
    try:
        with urlopen(f"{analytics_url}/health", timeout=2) as resp:
            return resp.status == 200
    except (URLError, OSError):
        return False


def wait_until_healthy(analytics_url: str, timeout: float) -> None:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if is_healthy(analytics_url):
            return
        time.sleep(0.5)
    raise SystemExit(f"analytics service never became healthy at {analytics_url} (waited {timeout}s)")


def start_analytics(port: int) -> subprocess.Popen:
    print(f"Starting analytics service on port {port} ...")
    env_overrides = {"PORT": str(port)}
    process = subprocess.Popen(
        ["node", "src/index.js"],
        cwd=ANALYTICS_DIR,
        env={**os.environ, **env_overrides},
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return process


def fetch_top_article_ids(analytics_url: str, application: str, count: int) -> list:
    url = f"{analytics_url}/api/applications/{application}/stats"
    try:
        with urlopen(url, timeout=10) as resp:
            stats = json.loads(resp.read().decode("utf-8"))
    except HTTPError as err:
        if err.code == 404:
            raise SystemExit(
                f"No analytics data recorded yet for application '{application}' - "
                "read some articles first."
            )
        raise
    articles = stats.get("articles", [])
    if not articles:
        raise SystemExit(f"Analytics has no article view data for application '{application}'.")
    return [article["articleId"] for article in articles[:count]]


def build_template_data(article_ids: list) -> str:
    rows = []
    cursor = 0
    for size in ROW_SIZES:
        row = article_ids[cursor : cursor + size]
        cursor += size
        if row:
            rows.append("|".join(row))
    return "\n".join(rows)


def update_db_json(path: Path, template_data: str, dry_run: bool) -> None:
    text = path.read_text(encoding="utf-8")
    match = TEMPLATE_DATA_PATTERN.search(text)
    if not match:
        raise SystemExit(f'{path}: no "templateData" field found - is this a zjournal db.json?')

    replacement = f'"templateData": {json.dumps(template_data)}'
    updated = text[: match.start()] + replacement + text[match.end() :]

    if dry_run:
        print(f"[dry-run] would update {path}")
        return

    path.write_text(updated, encoding="utf-8")
    print(f"Updated {path}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument(
        "--application",
        default="web-app",
        help="Analytics application to rank articles by (default: web-app).",
    )
    parser.add_argument(
        "--analytics-port",
        type=int,
        default=4400,
        help="Port to run/reach the analytics service on (default: 4400).",
    )
    parser.add_argument(
        "--db-json",
        action="append",
        type=Path,
        help="db.json path to update; repeatable. Defaults to all four backends' db.json.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the generated template and which files would change, without writing anything.",
    )
    args = parser.parse_args()

    db_json_paths = args.db_json or DEFAULT_DB_JSON_PATHS
    for path in db_json_paths:
        if not path.is_file():
            raise SystemExit(f"{path}: not found")

    analytics_url = f"http://localhost:{args.analytics_port}"
    started_process = None
    try:
        if is_healthy(analytics_url):
            print(f"Using already-running analytics service at {analytics_url}")
        else:
            started_process = start_analytics(args.analytics_port)
            wait_until_healthy(analytics_url, timeout=30)
            print(f"analytics service is up at {analytics_url}")

        article_ids = fetch_top_article_ids(analytics_url, args.application, ARTICLE_COUNT)
        template_data = build_template_data(article_ids)

        print(f"Generated template ({len(article_ids)} articles):")
        print(template_data)
        print()

        for path in db_json_paths:
            update_db_json(path, template_data, args.dry_run)
    finally:
        if started_process is not None:
            print("Stopping analytics service ...")
            started_process.terminate()
            try:
                started_process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                started_process.kill()
                started_process.wait()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
