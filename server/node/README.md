# zJournal Node server

The default dev backend for `web-app`. A thin wrapper around
[`json-server`](https://github.com/typicode/json-server) that serves `db.json` as a REST API,
with middleware implementing the shared PBKDF2/AES-256-CBC `ezjData` envelope that all four
zJournal backends (`node`, `php`, `java`, `python`) speak.

## Running

Requires Node.js 18.x or 20.x (same as the rest of the monorepo).

```sh
cd server/node
node server.js -w --development
```

The server starts on **port 8080** (same as the other three backends — stop `server/php`,
`server/java`, or `server/python` first if one is already running there, or change `port` in
`properties.js`).

From the repo root, the equivalent scripts are `npm run server` (dev/watch mode) and
`npm run server -- --prod` (production mode) — see root [package.json](../../package.json).

## Stopping

In the foreground, `Ctrl+C`. If it's running in the background, `npm run stop` (from the repo
root) kills it along with anything else bound to the ports the monorepo's scripts use, or kill
just this one directly:

```sh
lsof -nP -iTCP:8080 -sTCP:LISTEN -t | xargs kill
```

## What it does

- **Endpoints**: standard `json-server` REST routes over the four top-level collections in
  `db.json` — `GET/POST /articles`, `GET/PUT/DELETE /articles/:id`, `GET/PUT /journal` (singleton,
  no id), and the same shape for `/contacts` and `/qna`.
- **Query params**: `json-server`'s built-in support for `_sort`/`_order`, exact `field=value`
  filters, `field_like=value` substring filters, and full-text `q=` search — see the
  [json-server README](https://github.com/typicode/json-server#routes) for the complete set. This
  is the richest query surface of the four backends since it comes from the library itself, rather
  than the hand-rolled subset the other three backends reimplement to match it.
- **Encryption envelope**: by default, every `PUT`/`POST` request body and every response body is
  wrapped as `{"ezjData": "<base64>"}`, where the base64 decodes to a `{ciphertext, iv, salt}` JSON
  encrypted with PBKDF2-HMAC-SHA512 (999 iterations) + AES-256-CBC — implemented in
  [crypto.js](crypto.js), the same scheme every other backend and `web-app/src/utils/crypto.ts`
  speak. `GET`/`DELETE` requests carry no body to decrypt; every response (including from those) is
  still encrypted. Set `encryptionEnabled: false` in `properties.js` to disable this (matching the
  `zjournal.encryption-enabled` / `ZJOURNAL_ENCRYPTION_ENABLED` toggle on `server/java` /
  `server/python`) — there's no unencrypted `GET /health` route here to fall back on either way,
  since this server doesn't define one.
- **CORS**: handled by `json-server`'s default middleware (`jsonServer.defaults()`), open to all
  origins.
- **Errors**: `GET`/`PUT`/`DELETE` by an unknown id return HTTP `404` with
  `{"error": {"code": "NOT_FOUND", "message": "..."}}` (json-server's own behavior — an empty `{}`
  body — is overridden in `router.render` to match). `POST` already returns `201` on success via
  `json-server`'s default `create` handler. Same shape on `server/java`/`server/php`/`server/python`.

## Configuration

Server-facing configuration lives in [properties.js](properties.js):

```js
exports.properties = {
  port: 8080,
  encryptionKey: "JagaBaliaShreekhetra",
  dbFile: "db.json",
  encryptionEnabled: true,
};
```

> ⚠️ The bundled `encryptionKey` is a placeholder checked into source for local development.
> Replace it before deploying anywhere reachable from the internet, and keep it in sync with
> whatever `properties.serverUrl` in `web-app` is pointed at.

## What's different from the other backends

- **Storage**: unlike `server/java`/`server/python` (in-memory store, periodic flush), `json-server`
  reads and writes `db.json` directly on every request — there's no in-memory copy to fall out of
  sync, but also no batching of disk writes.
- No Swagger/OpenAPI docs endpoint (that's `server/java` and `server/python` only) — inspect the
  routes via the [json-server docs](https://github.com/typicode/json-server) or `db.json` itself.
- No email-backup cron script or file-decrypt debug page — those only exist in `server/php`
  (`backupdata.php`/`decryptfile.php`).

## Testing

No automated test suite for this server (`server/java` has one via `./mvnw test`; this one
doesn't). Manual smoke test — since every response is encrypted, the simplest check is that the
server responds at all:

```sh
node server.js -w --development &
curl -i http://localhost:8080/articles   # expect a 200 with an {"ezjData": "..."} body
```

Decrypting the response requires a matching crypto client (see `web-app/src/utils/crypto.ts` or
`crypto.js` in this directory), unless `encryptionEnabled: false` is set in `properties.js`.
