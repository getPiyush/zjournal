"""In-memory replica of db.json (same shape/fields as server/php/db.json, server/node/db.json,
and server/java's DataStore: articles/contacts/qna arrays plus a journal singleton). Loaded once
at startup, mutated in memory, and flushed back to disk periodically and on shutdown rather than
on every write.
"""

import asyncio
import json
import threading
import uuid
from typing import Any, Optional

from app import config

_FLUSH_INTERVAL_SECONDS = 60


class DataStore:
    def __init__(self, db_file=config.DB_FILE):
        self._db_file = db_file
        self._lock = threading.RLock()
        self._dirty = False
        with open(self._db_file, "r", encoding="utf-8") as f:
            self._root: dict[str, Any] = json.load(f)

    def get_collection(self, name: str) -> list[dict[str, Any]]:
        with self._lock:
            return list(self._raw_collection(name))

    def find_by_id(self, collection_name: str, item_id: str) -> Optional[dict[str, Any]]:
        with self._lock:
            for item in self._raw_collection(collection_name):
                if str(item.get("id")) == item_id:
                    return item
            return None

    def get_journal(self) -> dict[str, Any]:
        with self._lock:
            return self._root.get("journal", {})

    def set_journal(self, journal: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            self._root["journal"] = journal
            self._mark_dirty()
            return journal

    def add_to_collection(self, collection_name: str, item: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            item["id"] = self._generate_id()
            self._raw_collection(collection_name).append(item)
            self._mark_dirty()
            return item

    def update_in_collection(self, collection_name: str, item_id: str, item: dict[str, Any]) -> Optional[dict[str, Any]]:
        with self._lock:
            collection = self._raw_collection(collection_name)
            for i, existing in enumerate(collection):
                if str(existing.get("id")) == item_id:
                    item.setdefault("id", existing.get("id"))
                    collection[i] = item
                    self._mark_dirty()
                    return item
            return None

    def delete_from_collection(self, collection_name: str, item_id: str) -> Optional[dict[str, Any]]:
        with self._lock:
            collection = self._raw_collection(collection_name)
            for i, item in enumerate(collection):
                if str(item.get("id")) == item_id:
                    del collection[i]
                    self._mark_dirty()
                    return item
            return None

    def _raw_collection(self, name: str) -> list[dict[str, Any]]:
        return self._root.setdefault(name, [])

    def _generate_id(self) -> str:
        return uuid.uuid4().hex

    def _mark_dirty(self) -> None:
        self._dirty = True

    def flush_if_dirty(self) -> None:
        with self._lock:
            if not self._dirty:
                return
            self._dirty = False
            with open(self._db_file, "w", encoding="utf-8") as f:
                json.dump(self._root, f, indent=2)

    async def run_periodic_flush(self) -> None:
        while True:
            await asyncio.sleep(_FLUSH_INTERVAL_SECONDS)
            self.flush_if_dirty()


data_store = DataStore()
