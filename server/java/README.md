# zJournal Java server

A Spring Boot rewrite of `server/php` and `server/node`, exposing the same REST surface over
the same `db.json` shape so it's a drop-in alternative backend for `web-app`.

## Running

Requires Java 17+. No local Maven install needed — use the wrapper:

```sh
cd server/java
./mvnw spring-boot:run
```

The server starts on **port 8080** (same as the other two backends — stop `server/node` or
`server/php` first if one is already running there, or override with `--server.port=<port>`).

To run it in the background instead of holding a terminal:

```sh
./mvnw -q spring-boot:run > /tmp/zjournal-java.log 2>&1 &
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
  (999 iterations, 256-bit key) + AES-256-CBC — the exact scheme from `server/php/crypto.php`
  and `web-app/src/utils/crypto.ts` (used when `serverMode === "php"`). The shared passphrase is
  `zjournal.app-password` in `application.properties` (same default value as the PHP/Node
  servers). Toggle it on/off with `zjournal.encryption-enabled` (default `true`) — see
  [Testing via Swagger](#testing-via-swagger).
- **CORS**: open to all origins, matching `index.php`'s `Access-Control-Allow-Origin: *`.
- `GET /` and `GET /health` are served **unencrypted**, for quick manual checks without a crypto
  client.

## What's different from server/php

- **Storage**: `db.json` is read once at startup into memory; writes mutate the in-memory copy
  and are flushed back to disk every 60s (and on shutdown) instead of rewriting the whole file on
  every single request.
- No email-backup cron script or file-decrypt debug page (`backupdata.php`/`decryptfile.php`
  equivalents) — this is the core CRUD API only.
- Doesn't implement the Node-mode encryption (OpenSSL `EVP_BytesToKey`/MD5-derived AES) or its
  rotating-HMAC auth token header — only the PHP-mode PBKDF2 scheme, since it's self-contained
  (salt/iv travel with the ciphertext) and needs no legacy KDF quirks.

## Project layout

```
src/main/java/com/zjournal/
├── ZJournalApplication.java     # entry point
├── config/                       # AppProperties (port/passphrase/db file), CORS
├── crypto/CryptoService.java      # PBKDF2 + AES-256-CBC encrypt/decrypt
├── filter/EncryptionFilter.java    # {ezjData} envelope handling for every request/response
├── store/DataStore.java            # in-memory db.json, periodic + shutdown flush
└── web/                            # controllers + the filter/sort QueryEngine
```
