"""Entry point for the zJournal Python backend — a FastAPI rewrite of the PHP, Node, and Java
zJournal servers, serving the same db.json-shaped data.

Run with:
    uvicorn app.main:app --host 0.0.0.0 --port 8080
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import PlainTextResponse

from app import config
from app.middleware import EncryptionMiddleware
from app.routers.collections import build_collection_router
from app.routers.journal import router as journal_router
from app.store import data_store

_DESCRIPTION = """
Python/FastAPI rewrite of the PHP, Node, and Java zJournal backends, serving the same
`db.json`-shaped data.

### Resources
- **Articles**, **Contacts**, **QnA** — full CRUD collections
- **Journal** — a single settings object (get/replace only)

### Encryption
By default every request/response body is wrapped in an encrypted `ezjData` envelope
(PBKDF2 + AES-256-CBC, keyed by `ZJOURNAL_APP_PASSWORD`), which makes **Try it out** below
unusable as-is. To test interactively, start the app with encryption disabled:
```
ZJOURNAL_ENCRYPTION_ENABLED=false uvicorn app.main:app --port 8080
```
`GET /` and `GET /health` are always unencrypted, regardless of that setting.
"""


@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio

    flush_task = asyncio.create_task(data_store.run_periodic_flush())
    try:
        yield
    finally:
        flush_task.cancel()
        data_store.flush_if_dirty()


app = FastAPI(title="zJournal API", description=_DESCRIPTION, version="v1", lifespan=lifespan)

# Starlette's add_middleware() inserts at the front of the stack, so the LAST middleware
# added ends up OUTERMOST. EncryptionMiddleware is added first so CORSMiddleware ends up
# outermost: CORS headers apply even to the encrypted envelope responses, and preflight
# OPTIONS requests never hit the encryption layer.
app.add_middleware(EncryptionMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"], summary="Welcome message", response_class=PlainTextResponse)
async def welcome() -> str:
    return "Welcome to zjournal Feeder"


@app.get("/health", tags=["Health"], summary="Health check")
async def health() -> dict:
    return {"status": "ok"}


app.include_router(build_collection_router("articles", "Articles"))
app.include_router(build_collection_router("contacts", "Contacts"))
app.include_router(build_collection_router("qna", "QnA"))
app.include_router(journal_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=config.PORT)
