# zJournal Python server

A FastAPI rewrite of `server/php`, `server/node`, and `server/java`, exposing the same REST
surface over the same `db.json` shape so it's a drop-in alternative backend for `web-app`.

## Running

Requires Python 3.10+.

```sh
cd server/python
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
ZJOURNAL_ENV=development .venv/bin/uvicorn app.main:app --port 8080
```

`ZJOURNAL_ENV=development` lets the app start with admin auth unconfigured (see the table below).
`npm run server -- --backend=python` sets it for you.

The server starts on **port 8080** (same as the other three backends — stop `server/node`,
`server/php`, or `server/java` first if one is already running there, or override with
`--port <port>`).

To run it in the background instead of holding a terminal:

```sh
ZJOURNAL_ENV=development .venv/bin/uvicorn app.main:app --port 8080 > /tmp/zjournal-python.log 2>&1 &
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
| `ZJOURNAL_ENCRYPTION_KEY` | `JagaBaliaShreekhetra` | Passphrase for the PBKDF2/AES envelope |
| `ZJOURNAL_DB_FILE` | `db.json` (next to `app/`) | Path to the JSON data file |
| `ZJOURNAL_ENCRYPTION_ENABLED` | `true` | Wrap request/response bodies in the `ezjData` envelope |
| `ZJOURNAL_GOOGLE_CLIENT_ID` | *(empty)* | Google OAuth client id that admin ID tokens must be issued for (same value as `REACT_APP_GOOGLE_CLIENT_ID` in `web-app`) |
| `ZJOURNAL_ADMIN_EMAILS` | *(empty)* | Comma-separated admin allowlist |
| `ZJOURNAL_ENV` | `production` | `development` allows starting with the two auth variables unset. Otherwise the app refuses to start without them |

**Admin auth** ([app/auth.py](app/auth.py)): every request except `GET`/`HEAD` on `/`,
`/health`, `/articles`, `/journal`, `/qna` and the Swagger routes, and `POST /contacts` (the
public contact form), needs `Authorization: Bearer <Google ID token>`. The token is verified
against Google's signing keys with PyJWT (audience, issuer and expiry are checked too), and its
verified email must be in `ZJOURNAL_ADMIN_EMAILS`. Failures return `401 UNAUTHORIZED` or
`403 FORBIDDEN` as plain JSON: the auth middleware sits outside the encryption one. With auth on,
Swagger's **Try it out** only works for the public routes.

> ⚠️ The bundled `ZJOURNAL_ENCRYPTION_KEY` default is a placeholder checked into source for local
> development. Replace it before deploying anywhere reachable from the internet.

**Public view:** anonymous `GET /articles` and `/articles/<id>` return only published articles
that aren't flagged for deletion (hidden ones return 404). Anonymous `GET /journal` omits
`currentArticle` and `adminDetails`. A request with an `Authorization` header must be a valid admin
(401/403 otherwise) and then sees everything.

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
  contract, always. The shared passphrase is `ZJOURNAL_ENCRYPTION_KEY` (same default value as the
  other three servers). Toggle it off locally with `ZJOURNAL_ENCRYPTION_ENABLED=false` — see
  [Testing via Swagger](#testing-via-swagger).
- **CORS**: open to all origins, matching `index.php`'s `Access-Control-Allow-Origin: *`.
- `GET /` and `GET /health` are served **unencrypted**, for quick manual checks without a crypto
  client.
- **Errors**: `GET`/`PUT`/`DELETE` by an unknown id return HTTP `404` with
  `{"error": {"code": "NOT_FOUND", "message": "..."}}`. `POST` returns `201` on success. Same shape
  on `server/node`/`server/php`/`server/java`.

## What's different from server/php

- **Storage**: `db.json` is read once at startup into memory; writes mutate the in-memory copy
  and are flushed back to disk every 60s (and on shutdown) instead of rewriting the whole file on
  every single request — same approach as `server/java`'s `DataStore`.
- No email-backup cron script or file-decrypt debug page (`backupdata.php`/`decryptfile.php`
  equivalents) — this is the core CRUD API only, same scope as `server/java`.

## Project layout

```
app/
├── main.py               # FastAPI app, CORS + auth + encryption middleware wiring, entry point
├── auth.py                # admin gate: Google ID token check + allowlist
├── config.py              # env-var backed settings (port/passphrase/db file/encryption/auth)
├── crypto.py               # PBKDF2 + AES-256-CBC encrypt/decrypt
├── middleware.py            # {ezjData} envelope handling for every request/response
├── store.py                 # in-memory db.json, periodic + shutdown flush
├── query_engine.py           # filter/sort query support
└── routers/
    ├── collections.py         # generic CRUD router factory (articles/contacts/qna)
    └── journal.py               # singleton get/replace
```

## Testing

The admin-auth logic has unit tests (`tests/test_auth.py`). Run `.venv/bin/python -m unittest`
here, or `npm run test:server:python` from the repo root. Manual smoke test:

```sh
ZJOURNAL_ENV=development ZJOURNAL_ENCRYPTION_ENABLED=false .venv/bin/uvicorn app.main:app --port 8080 &
curl http://localhost:8080/health
curl http://localhost:8080/articles
```
