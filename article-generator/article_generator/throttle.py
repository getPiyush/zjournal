"""A tiny per-domain rate limiter so parallel workers don't hammer one host at once."""

from __future__ import annotations

import threading
import time
from urllib.parse import urlparse


class DomainThrottle:
    def __init__(self, delay: float):
        self._delay = delay
        self._lock = threading.Lock()
        self._last_hit: dict[str, float] = {}

    def wait(self, url: str) -> None:
        if self._delay <= 0:
            return
        domain = urlparse(url).netloc
        with self._lock:
            now = time.monotonic()
            last = self._last_hit.get(domain, 0.0)
            sleep_for = self._delay - (now - last)
            if sleep_for > 0:
                time.sleep(sleep_for)
            self._last_hit[domain] = time.monotonic()
