# zJournal PHP server

An alternative backend for `web-app`, for hosting on plain PHP/Apache stacks without Node — no
`json-server`, no build step, just PHP files served by any PHP 7+ web server. Exposes the same
REST surface over the same `db.json` shape as `server/node`, `server/java`, and `server/python`.

## Running

Requires PHP 7.4+ (uses `str_contains`, available from PHP 8.0, so PHP 8.0+ is recommended).

```sh
cd server/php
ZJOURNAL_ENV=development php -S localhost:8080 index.php
```

Passing `index.php` as the router script sends every request through it, including the admin
check. Without it, `php -S` serves files in this directory directly, so `GET /db.json` would hand
out the whole database, contacts included. `ZJOURNAL_ENV=development` lets the server run with
admin auth unconfigured (see [Admin auth](#admin-auth)).

From the repo root, the equivalent script is `npm run server -- --backend=php`.

The server starts on **port 8080** (same as the other three backends — stop `server/node`,
`server/java`, or `server/python` first if one is already running there, or pass a different
`host:port` to `php -S`).

PHP's built-in server is dev-only, so `--prod` isn't supported for it — deploy this directory behind
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
  `server/python`, and `web-app/src/utils/crypto.ts` all speak. `GET /` and `GET /health` are
  always served unencrypted, matching the other three backends — hitting the root path returns the
  plain string `"Welcome to zjournal Feeder"`, and `/health` returns plain `{"status": "ok"}`.
- **Errors**: `GET`/`PUT`/`DELETE` by an unknown id return HTTP `404` with
  `{"error": {"code": "NOT_FOUND", "message": "..."}}` (encrypted like any other response, unless
  encryption is disabled) instead of silently returning `200` with `null`/an unchanged record.
  `POST` returns `201` on success. This matches `server/java`/`server/python`.
- **CORS**: open to all origins (`Access-Control-Allow-Origin: *` in `index.php`). `OPTIONS`
  preflights are answered with `204` and allow the `Authorization` header.
- **Admin auth**: see [Admin auth](#admin-auth).

## Configuration

The passphrase lives in [propeties.php](propeties.php) (filename typo preserved from the original
source — don't "fix" it without also updating the `include` in `getters.php`/`setters.php`):

```php
$passphase = "JagaBaliaShreekhetra";
$encryptionEnabled = true;
```

Set `$encryptionEnabled = false;` to serve plain, unencrypted JSON — matching the
`zjournal.encryption-enabled` / `ZJOURNAL_ENCRYPTION_ENABLED` toggle on `server/java` /
`server/python`. Both `$passphase` and `$encryptionEnabled` are function-local via `global`
declarations in `getters.php`/`setters.php`, not superglobals — keep that in mind if you add another
file that needs them.

> ⚠️ This is a placeholder checked into source for local development. Replace it before deploying
> anywhere reachable from the internet, and keep it in sync with whatever `properties.serverUrl` in
> `web-app` is pointed at.

## Admin auth

[auth.php](auth.php) runs before every request is dispatched. Every request except `GET`/`HEAD` on
`/`, `/health`, `/articles`, `/journal` and `/qna`, and `POST /contacts` (the public contact form),
needs `Authorization: Bearer <Google ID token>`. These are the same rules as the other three
backends. The token's RS256 signature is checked against Google's published certificates, which
are cached in `.google-certs-cache.json` next to `db.json`. Its audience must be
`ZJOURNAL_GOOGLE_CLIENT_ID`, and its verified email must be in `ZJOURNAL_ADMIN_EMAILS`
(comma-separated). Failures return `401 UNAUTHORIZED` or `403 FORBIDDEN` as plain (unencrypted)
JSON. This needs only the `openssl` extension and `allow_url_fopen`, no Composer.

**Public view:** anonymous `GET /articles` and `/articles/<id>` return only published articles
that aren't flagged for deletion (hidden ones return 404). Anonymous `GET /journal` omits
`currentArticle` and `adminDetails`. A request with an `Authorization` header must be a valid admin
(401/403 otherwise) and then sees everything.

If either variable is missing, protected routes answer `503 AUTH_NOT_CONFIGURED`, unless
`ZJOURNAL_ENV=development` is set (`npm run server -- --backend=php` sets it). Public reads keep
working either way.

**Apache:** the bundled [.htaccess](.htaccess) routes every request through `index.php`, copies
the `Authorization` header through to PHP (Apache drops it under CGI/PHP-FPM), and denies direct
access to `db.json`, `error_log`, the cert cache and the legacy scripts. It needs `mod_rewrite` and
`AllowOverride FileInfo`. Set the variables with `SetEnv ZJOURNAL_GOOGLE_CLIENT_ID ...` and
`SetEnv ZJOURNAL_ADMIN_EMAILS ...` in the vhost.
**nginx + PHP-FPM:** route everything to `index.php` (`try_files $uri /index.php;` plus a `location`
that denies `db.json` and the other files above), and pass the variables with `fastcgi_param`.
nginx forwards `Authorization` by default.

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

Since every HTTP request now goes through `index.php` (router script / `.htaccess`), neither script
can be reached over HTTP any more. Run `backupdata.php` from cron with `php backupdata.php`.

## What's different from the other backends

- **Storage**: every write rewrites all of `db.json` from disk, in full, synchronously — no
  in-memory cache (unlike `server/java`/`server/python`, which read once and flush periodically).
  Fine for a single-writer local/personal setup; a poor fit for concurrent writers.
- Query support is a hand-rolled subset of what `server/node`'s `json-server` gives you for free —
  `server/java` and `server/python` were built to match *this* file's behavior (see their READMEs'
  "What it replicates" sections), not the other way around.
- Has the email-backup/debug scripts described above; none of the other three backends do.

## Testing

The admin-auth checks have tests. They sign tokens with a throwaway RSA key, so signature
checking is real. Run `npm run test:server:php` from the repo root. Manual smoke test:

```sh
ZJOURNAL_ENV=development php -S localhost:8080 index.php &
curl http://localhost:8080/           # expect "Welcome to zjournal Feeder"
curl http://localhost:8080/health     # expect {"status": "ok"}
curl http://localhost:8080/articles   # expect a 200 with an {"ezjData": "..."} body
```

Decrypting the response requires a matching crypto client (see `web-app/src/utils/crypto.ts` or
`crypto.php` in this directory).
