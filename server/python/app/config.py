"""Server-facing configuration, equivalent to com.zjournal.config.AppProperties (Java) /
server/node/properties.js / server/php/properties.php.

Reads from environment variables so the defaults (matching the other three backends, which
always encrypt) can be overridden without editing code, e.g. for local Swagger testing:

    ZJOURNAL_ENCRYPTION_ENABLED=false uvicorn app.main:app --port 8080
"""

import os
from pathlib import Path

PORT = int(os.environ.get("ZJOURNAL_PORT", "8080"))
ENCRYPTION_KEY = os.environ.get("ZJOURNAL_ENCRYPTION_KEY", "JagaBaliaShreekhetra")
DB_FILE = Path(os.environ.get("ZJOURNAL_DB_FILE", str(Path(__file__).resolve().parent.parent / "db.json")))
ENCRYPTION_ENABLED = os.environ.get("ZJOURNAL_ENCRYPTION_ENABLED", "true").lower() == "true"
