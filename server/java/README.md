# zJournal Java server

A Spring Boot rewrite of `server/php` and `server/node`, exposing the same REST surface over
the same `db.json` shape so it's a drop-in alternative backend for `web-app`.

## Running

Requires Java 17+. No local Maven install needed — use the wrapper:

```sh
cd server/java
ZJOURNAL_ENV=development ./mvnw spring-boot:run
```

`ZJOURNAL_ENV=development` lets the app start with admin auth unconfigured (see
[Admin auth](#admin-auth)). `npm run server -- --backend=java` sets it for you.

The server starts on **port 8080** (same as the other two backends — stop `server/node` or
`server/php` first if one is already running there, or override with `--server.port=<port>`).

To run it in the background instead of holding a terminal:

```sh
ZJOURNAL_ENV=development ./mvnw -q spring-boot:run > /tmp/zjournal-java.log 2>&1 &
```

## Stopping

In the foreground, `Ctrl+C`. If it's running in the background (or you're not sure), kill
whatever is bound to port 8080:

```sh
lsof -nP -iTCP:8080 -sTCP:LISTEN -t | xargs kill
```

## Testing

```sh
./mvnw test
```

The tests include the admin gate: route rules, the allowlist, Google token verification against
locally signed RS256 tokens, and a MockMvc test checking that 401s still carry CORS headers. They
only read the shared `db.json`, never write it.

## Admin auth

`com.zjournal.auth.AdminAuthInterceptor` checks every request except `GET`/`HEAD` on `/`,
`/health`, `/articles`, `/journal`, `/qna` and the Swagger routes, and `POST /contacts` (the
public contact form). Those requests need `Authorization: Bearer <Google ID token>`. These are
the same rules as the other three backends. The token is verified with nimbus-jose-jwt against
Google's signing keys (signature, audience, issuer and expiry), and its verified email must be on
the allowlist. Failures return `401 UNAUTHORIZED` or `403 FORBIDDEN`. The interceptor runs inside
`EncryptionFilter`, so the error body is encrypted like any other response; clients should go by
the status code.

| Property | Env var | Meaning |
| --- | --- | --- |
| `zjournal.auth.google-client-id` | `ZJOURNAL_GOOGLE_CLIENT_ID` | Client id the tokens must be issued for (same as `REACT_APP_GOOGLE_CLIENT_ID` in `web-app`) |
| `zjournal.auth.admin-emails` | `ZJOURNAL_ADMIN_EMAILS` | Comma-separated admin allowlist |
| `zjournal.env` | `ZJOURNAL_ENV` | Defaults to `production`, where the app refuses to start without the two values above. `development` allows it, with a warning |

**Public view:** anonymous `GET /articles` and `/articles/<id>` return only published articles
that aren't flagged for deletion (hidden ones return 404). Anonymous `GET /journal` omits
`currentArticle` and `adminDetails`. A request with an `Authorization` header must be a valid admin
(401/403 otherwise) and then sees everything.

With auth on, Swagger's **Try it out** only works for the public routes.

## Testing via Swagger

Swagger UI ([springdoc-openapi](https://springdoc.org/)) is on the classpath and needs no extra
config. With the app running, open:

- **http://localhost:8080/swagger-ui/index.html** — interactive UI for every endpoint
- **http://localhost:8080/v3/api-docs** — the raw OpenAPI JSON

By default every request/response is wrapped in the encrypted `ezjData` envelope (see below),
which makes "Try it out" unusable without a crypto client. For local Swagger testing, disable
encryption for the run:

```sh
./mvnw spring-boot:run -Dspring-boot.run.arguments=--zjournal.encryption-enabled=false
```

or set `zjournal.encryption-enabled=false` in `application.properties`. Responses are then plain
JSON and every endpoint can be exercised directly from Swagger UI. Revert to `true` (or remove
the override) before testing against a client that expects the encrypted envelope.

## What it replicates

- **Endpoints**: `GET/POST /articles`, `GET/PUT/DELETE /articles/{id}`, `GET/PUT /journal`
  (singleton object, no id), and the same shape for `/contacts` and `/qna`.
- **Query params**: `_sort`/`_order`, `field=value` exact filters, `field_like=value` substring
  filters, and repeated keys (`?id=a&id=b`) OR'd together while distinct keys AND — matching the
  filtering behavior in `server/php/getters.php`.
- **Encryption envelope**: every request/response body is wrapped as `{"ezjData": "<base64>"}`,
  where the base64 decodes to a `{ciphertext, iv, salt}` JSON encrypted with PBKDF2-HMAC-SHA512
  (999 iterations, 256-bit key) + AES-256-CBC — the exact scheme from `server/php/crypto.php`,
  `server/node/crypto.js`, and `web-app/src/utils/crypto.ts`. There is no `serverMode` selector
  on the frontend any more — all four backends speak this one contract, always. The shared
  passphrase is `zjournal.encryption-key` in `application.properties` (same default value as the
  other servers). Toggle encryption off locally with `zjournal.encryption-enabled=false` — see
  [Testing via Swagger](#testing-via-swagger).
- **CORS**: open to all origins, matching `index.php`'s `Access-Control-Allow-Origin: *`.
- `GET /` and `GET /health` are served **unencrypted**, for quick manual checks without a crypto
  client.
- **Errors**: `GET`/`PUT`/`DELETE` by an unknown id return HTTP `404` with
  `{"error": {"code": "NOT_FOUND", "message": "..."}}`. `POST` returns `201` on success. Same shape
  on `server/node`/`server/php`/`server/python`.

## What's different from server/php

- **Storage**: `db.json` is read once at startup into memory; writes mutate the in-memory copy
  and are flushed back to disk every 60s (and on shutdown) instead of rewriting the whole file on
  every single request.
- No email-backup cron script or file-decrypt debug page (`backupdata.php`/`decryptfile.php`
  equivalents) — this is the core CRUD API only.

## Project layout

```
src/main/java/com/zjournal/
├── ZJournalApplication.java     # entry point
├── auth/                         # admin gate: interceptor, Google token verifier, route rules
├── config/                       # AppProperties (port/passphrase/db file/auth), CORS
├── crypto/CryptoService.java      # PBKDF2 + AES-256-CBC encrypt/decrypt
├── filter/EncryptionFilter.java    # {ezjData} envelope handling for every request/response
├── store/DataStore.java            # in-memory db.json, periodic + shutdown flush
└── web/                            # controllers + the filter/sort QueryEngine
```
