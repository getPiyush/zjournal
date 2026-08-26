# zJournal PHP server

An alternative backend for `web-app`, for hosting on plain PHP/Apache stacks without Node — no
`json-server`, no build step, just PHP files served by any PHP 7+ web server. Exposes the same
REST surface over the same `db.json` shape as `server/node`, `server/java`, and `server/python`.

## Running

Requires PHP 7.4+ (uses `str_contains`, available from PHP 8.0, so PHP 8.0+ is recommended).

```sh
cd server/php
php -S localhost:8080
```

From the repo root, the equivalent script is `npm run server:php:dev`.

The server starts on **port 8080** (same as the other three backends — stop `server/node`,
`server/java`, or `server/python` first if one is already running there, or pass a different
`host:port` to `php -S`).

PHP's built-in server is dev-only, so there's no `:prod` npm script — deploy this directory behind
Apache + `mod_php` or PHP-FPM + nginx for production instead (see
[docs/DEPLOYMENT.md](../../docs/DEPLOYMENT.md)).

## Stopping

`Ctrl+C` in the foreground. If it's running in the background, kill whatever is bound to port
8080:

```sh
lsof -nP -iTCP:8080 -sTCP:LISTEN -t | xargs kill
```

## What it does

All requests go through [index.php](index.php), which dispatches by HTTP method:

- **`GET`** → [getters.php](getters.php)`::processGetters()` — reads `db.json`, resolves the
  collection from the first URL path segment (`articles`, `journal`, `contacts`, `qna`), an
  optional id from the second segment (`/articles/<id>`), and a hand-rolled subset of `json-server`
  style query params: `_sort`/`_order`, exact `field=value` filters, and `field_like=value`
  substring filters.
- **`POST`/`PUT`/`DELETE`** → [setters.php](setters.php)`::processSetters()` — `POST` appends a new
  record (with a generated `id`) to the named collection, `PUT` replaces an existing record (or, for
  the `journal` singleton, the whole document) by id, `DELETE` removes a record by id. Every write
  rewrites the entire `db.json` file.
- **Encryption envelope**: every request/response body is wrapped as `{"ezjData": "<base64>"}`,
  where the base64 decodes to a `{ciphertext, iv, salt}` JSON encrypted with PBKDF2-HMAC-SHA512
  (999 iterations) + AES-256-CBC — implemented in [crypto.php](crypto.php)
  (`CryptoJSAesEncrypt`/`CryptoJSAesDecrypt`), the same scheme `server/node`, `server/java`,
  `server/python`, and `web-app/src/utils/crypto.ts` all speak. Unlike the other three backends,
  there's no unencrypted `GET /` or `GET /health` — hitting the root path just returns the plain
  string `"Welcome to zjournal Feeder"`.
- **CORS**: open to all origins (`Access-Control-Allow-Origin: *` in `index.php`).

## Configuration

The passphrase lives in [propeties.php](propeties.php) (filename typo preserved from the original
source — don't "fix" it without also updating the `include` in `getters.php`/`setters.php`):

```php
$passphase = "JagaBaliaShreekhetra";
```

> ⚠️ This is a placeholder checked into source for local development. Replace it before deploying
> anywhere reachable from the internet, and keep it in sync with whatever `properties.serverUrl` in
> `web-app` is pointed at.

## Legacy / debug scripts — not part of the API contract

Two files predate the shared `ezjData` envelope and are **not** used by `web-app` or covered by the
"same wire contract" guarantee the four backends otherwise share:

- **[backupdata.php](backupdata.php)** — a standalone script (meant to be run via cron, not called
  by the frontend) that encrypts the current `db.json` with a *different*, hardcoded
  AES-256-CBC scheme (`encrypt_decrypt()` in `crypto.php`, distinct from the PBKDF2/`ezjData`
  scheme above) and emails it as an attachment via PHP's `mail()`. The sender/recipient addresses
  and secret key are hardcoded in the file. Treat it as a reference/legacy artifact, not something
  to wire into a new deployment as-is — write your own backup process instead (see
  [docs/DEPLOYMENT.md](../../docs/DEPLOYMENT.md)).
- **[decryptfile.php](decryptfile.php)** — a manual debug page: upload a `.txt` file and it runs
  the same legacy `encrypt_decrypt()` scheme in reverse. Has no auth of its own — don't deploy it
  to a publicly reachable host.

## What's different from the other backends

- **Storage**: every write rewrites all of `db.json` from disk, in full, synchronously — no
  in-memory cache (unlike `server/java`/`server/python`, which read once and flush periodically).
  Fine for a single-writer local/personal setup; a poor fit for concurrent writers.
- Query support is a hand-rolled subset of what `server/node`'s `json-server` gives you for free —
  `server/java` and `server/python` were built to match *this* file's behavior (see their READMEs'
  "What it replicates" sections), not the other way around.
- Has the email-backup/debug scripts described above; none of the other three backends do.

## Testing

No automated test suite. Manual smoke test:

```sh
php -S localhost:8080 &
curl http://localhost:8080/           # expect "Welcome to zjournal Feeder"
curl http://localhost:8080/articles   # expect a 200 with an {"ezjData": "..."} body
```

Decrypting the response requires a matching crypto client (see `web-app/src/utils/crypto.ts` or
`crypto.php` in this directory).
