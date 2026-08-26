# zJournal Python server

A FastAPI rewrite of `server/php`, `server/node`, and `server/java`, exposing the same REST
surface over the same `db.json` shape so it's a drop-in alternative backend for `web-app`.

## Running

Requires Python 3.10+.

```sh
cd server/python
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --port 8080
```

The server starts on **port 8080** (same as the other three backends — stop `server/node`,
`server/php`, or `server/java` first if one is already running there, or override with
`--port <port>`).

To run it in the background instead of holding a terminal:

```sh
.venv/bin/uvicorn app.main:app --port 8080 > /tmp/zjournal-python.log 2>&1 &
```

## Stopping

In the foreground, `Ctrl+C`. If it's running in the background (or you're not sure), kill
whatever is bound to port 8080:

```sh
lsof -nP -iTCP:8080 -sTCP:LISTEN -t | xargs kill
```

## Testing via Swagger

FastAPI's built-in interactive docs need no extra config. With the app running, open:

- **http://localhost:8080/docs** — Swagger UI for every endpoint
- **http://localhost:8080/redoc** — ReDoc alternative
- **http://localhost:8080/openapi.json** — the raw OpenAPI JSON

By default every request/response is wrapped in the encrypted `ezjData` envelope (see below),
which makes "Try it out" unusable without a crypto client. For local Swagger testing, disable
encryption for the run:

```sh
ZJOURNAL_ENCRYPTION_ENABLED=false .venv/bin/uvicorn app.main:app --port 8080
```

Responses are then plain JSON and every endpoint can be exercised directly from Swagger UI.
Leave it unset (or `true`) before testing against a client that expects the encrypted envelope.

## Configuration

All server-facing config is read from environment variables (see `app/config.py`):

| Variable | Default | Meaning |
| --- | --- | --- |
| `ZJOURNAL_PORT` | `8080` | Port to bind (only used when running `python -m app.main` directly — with `uvicorn` pass `--port` instead) |
| `ZJOURNAL_APP_PASSWORD` | `JagaBaliaShreekhetra` | Passphrase for the PBKDF2/AES envelope |
| `ZJOURNAL_DB_FILE` | `db.json` (next to `app/`) | Path to the JSON data file |
| `ZJOURNAL_ENCRYPTION_ENABLED` | `true` | Wrap request/response bodies in the `ezjData` envelope |

> ⚠️ The bundled `ZJOURNAL_APP_PASSWORD` default is a placeholder checked into source for local
> development. Replace it before deploying anywhere reachable from the internet.

## What it replicates

- **Endpoints**: `GET/POST /articles`, `GET/PUT/DELETE /articles/{id}`, `GET/PUT /journal`
  (singleton object, no id), and the same shape for `/contacts` and `/qna`.
- **Query params**: `_sort`/`_order`, `field=value` exact filters, `field_like=value` substring
  filters, and repeated keys (`?id=a&id=b`) OR'd together while distinct keys AND — matching the
  filtering behavior in `server/php/getters.php` and `server/java`'s `QueryEngine`.
- **Encryption envelope**: every request/response body is wrapped as `{"ezjData": "<base64>"}`,
  where the base64 decodes to a `{ciphertext, iv, salt}` JSON encrypted with PBKDF2-HMAC-SHA512
  (999 iterations, 256-bit key) + AES-256-CBC — the exact scheme from `server/php/crypto.php`,
  `server/java`'s `CryptoService`, `server/node/crypto.js`, and `web-app/src/utils/crypto.ts`.
  There is no longer a `serverMode` selector on the frontend — all four backends speak this one
  contract, always. The shared passphrase is `ZJOURNAL_APP_PASSWORD` (same default value as the
  other three servers). Toggle it off locally with `ZJOURNAL_ENCRYPTION_ENABLED=false` — see
  [Testing via Swagger](#testing-via-swagger).
- **CORS**: open to all origins, matching `index.php`'s `Access-Control-Allow-Origin: *`.
- `GET /` and `GET /health` are served **unencrypted**, for quick manual checks without a crypto
  client.

## What's different from server/php

- **Storage**: `db.json` is read once at startup into memory; writes mutate the in-memory copy
  and are flushed back to disk every 60s (and on shutdown) instead of rewriting the whole file on
  every single request — same approach as `server/java`'s `DataStore`.
- No email-backup cron script or file-decrypt debug page (`backupdata.php`/`decryptfile.php`
  equivalents) — this is the core CRUD API only, same scope as `server/java`.

## Project layout

```
app/
├── main.py               # FastAPI app, CORS + encryption middleware wiring, entry point
├── config.py              # env-var backed settings (port/passphrase/db file/encryption toggle)
├── crypto.py               # PBKDF2 + AES-256-CBC encrypt/decrypt
├── middleware.py            # {ezjData} envelope handling for every request/response
├── store.py                 # in-memory db.json, periodic + shutdown flush
├── query_engine.py           # filter/sort query support
└── routers/
    ├── collections.py         # generic CRUD router factory (articles/contacts/qna)
    └── journal.py               # singleton get/replace
```

## Testing

No automated test suite yet (`server/java` has one via `./mvnw test`; this one doesn't). Manual
smoke test:

```sh
ZJOURNAL_ENCRYPTION_ENABLED=false .venv/bin/uvicorn app.main:app --port 8080 &
curl http://localhost:8080/health
curl http://localhost:8080/articles
```
