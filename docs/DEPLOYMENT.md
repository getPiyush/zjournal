# Deployment

This covers taking zJournal from local dev to a running instance on a server you control. For the
overall system shape, see [ARCHITECTURE.md](ARCHITECTURE.md); for local dev setup, see the root
[README.md](../README.md).

## 1. Pick a backend

Any one of `server/node`, `server/php`, `server/java`, `server/python` — they're interchangeable
(see [ARCHITECTURE.md](ARCHITECTURE.md#the-api-contract)). Pick based on what your host already
runs:

| If you have... | Use |
| --- | --- |
| A Node-capable host (most VPS/PaaS) | `server/node` — simplest, fewest moving parts |
| Shared PHP/Apache hosting, no shell access to run long-lived processes | `server/php` |
| A JVM host / you're already running other Spring apps | `server/java` |
| A Python host / you're already running other Python services | `server/python` |

`server/php` is the only one of the four with no `:prod` npm script — PHP's built-in server
(`php -S`) is dev-only by design, so it must run behind Apache + `mod_php` or PHP-FPM + nginx
instead of a standalone process.

## 2. Build the frontend

```sh
npm run build      # builds web-app into web-app/build (production React bundle)
```

You then have two ways to serve it:

- **`npm run prodrun`** (or `npm run prod` to run it together with the API server) — starts
  `web-app/public/server.js`, a minimal Express static server, on port 80. Fine for a quick
  deployment or a small personal instance; it has no TLS, caching headers, or compression
  configured beyond Express defaults.
- **A real web server** (recommended for anything beyond a personal box) — point nginx or Apache
  at `web-app/build` as a static site, with a catch-all rewrite to `index.html` (this is a
  client-side-routed SPA — every path needs to fall through to `index.html`, not 404). See the
  nginx example below.

## 3. Secure the deployment

These are placeholder values checked into source for local development — **all of them** need to
change before the instance is reachable from the internet:

| What | Where |
| --- | --- |
| Node passphrase | `server/node/properties.js` → `appPassword` |
| PHP passphrase | `server/php/propeties.php` → `$passphase` |
| Java passphrase | `server/java/src/main/resources/application.properties` → `zjournal.app-password` |
| Python passphrase | `ZJOURNAL_APP_PASSWORD` env var (see `server/python/README.md`) |
| Admin passphrase hash | `journal.adminDetails` in whichever `db.json` you're serving (Node-shaped) |

All five must agree — the passphrase feeds the PBKDF2/AES-256-CBC `ezjData` envelope every
frontend and backend speaks (see [ARCHITECTURE.md](ARCHITECTURE.md#the-api-contract)), so changing
it on the backend without updating `web-app/src/properties.js` (or vice versa) breaks every
request.

### Securing the admin panel

The admin panel signs in with Google, and **all four backends** check the Google ID token on every
protected request. That covers every write except the public contact form (`POST /contacts`),
plus reading contacts. Setup:

1. In Google Cloud Console → **APIs & Services → Credentials**, create an **OAuth client ID** of type
   *Web application*. Add every origin the admin panel is served from to **Authorized JavaScript
   origins**, e.g. `https://journal.example.com`, and `http://localhost` / `http://localhost:3000`
   for local development. No redirect URI is needed.
2. Frontend (build time, `web-app/.env`):
   - `REACT_APP_GOOGLE_CLIENT_ID=<client id>`
   - `REACT_APP_ADMIN_EMAILS=you@example.com` (optional; only used to show a friendlier error
     message)
3. Backend (runtime environment):
   - `ZJOURNAL_GOOGLE_CLIENT_ID=<same client id>`
   - `ZJOURNAL_ADMIN_EMAILS=you@example.com,other@example.com`

Without those two backend variables, auth may only be off when `ZJOURNAL_ENV=development` is set.
`npm run server` / `npm run dev` set it; `--prod` doesn't. Otherwise:

| Backend | Behaviour when auth isn't configured |
| --- | --- |
| `server/node`, `server/java`, `server/python` | Refuses to start |
| `server/php` | Serves public reads; protected routes return `503 AUTH_NOT_CONFIGURED` |

Backend-specific notes:

- **PHP:** set the variables with `SetEnv` (Apache) or `fastcgi_param` (nginx). The bundled
  `server/php/.htaccess` routes every request through `index.php` and denies direct access to
  `db.json`. Without that routing, Apache would serve the whole database as a static file. For
  nginx, do the equivalent yourself (see [server/php/README.md](../server/php/README.md#admin-auth)).
- **Java:** the variables map to `zjournal.auth.*` / `zjournal.env` (see
  [server/java/README.md](../server/java/README.md#admin-auth)).

**What anonymous visitors can read:** `GET /articles` and `GET /articles/<id>` return only
published articles that aren't on the purge list (a hidden one returns 404). `GET /journal` leaves
out `currentArticle` (the editor's working copy) and the legacy `adminDetails` hashes. A request
carrying a valid admin token sees everything, and one carrying an invalid token gets a 401
rather than the public view. With auth off in development, nothing is filtered.

## 4. Reverse proxy example (nginx)

A typical single-host layout: nginx terminates TLS, serves the built frontend as static files, and
proxies API calls to whichever backend is running on port 8080.

```nginx
server {
    listen 443 ssl;
    server_name journal.example.com;

    # ssl_certificate / ssl_certificate_key here

    root /var/www/zjournal/web-app/build;
    index index.html;

    location / {
        try_files $uri /index.html;   # SPA fallback for client-side routing
    }

    # Optional extra layer on top of Google sign-in. It guards only the UI route, not the API.
    location /admin {
        auth_basic "Admin";
        auth_basic_user_file /etc/nginx/.htpasswd;
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $host;
    }
}
```

If you proxy the API under a path like `/api/` as above, set `REACT_APP_SERVER_URL` (see
`web-app/.env.example`) to that path before building, rather than leaving `serverUrl` at its
default (the page's own hostname on port 8080) — otherwise browsers will hit the backend's own
origin/port directly and you lose the benefit of a single TLS-terminated entry point.

## 5. Keeping the backend running

- **Node / Java / Python** are long-running processes — manage them with `systemd`, `pm2`, or your
  platform's process supervisor. Example `systemd` unit for the Node backend:

  ```ini
  [Unit]
  Description=zJournal API (node)
  After=network.target

  [Service]
  WorkingDirectory=/var/www/zjournal/server/node
  ExecStart=/usr/bin/node server.js --production
  Restart=on-failure
  User=zjournal

  [Install]
  WantedBy=multi-user.target
  ```

  Swap `ExecStart` for `./mvnw ...`/`java -jar target/*.jar` (Java, after `npm run server -- --backend=java --prod`'s
  build step) or `uvicorn app.main:app --port 8080` (Python) as appropriate.

- **PHP** runs inside your existing Apache/PHP-FPM setup — no separate process to supervise, just
  point a vhost/`<Directory>` at `server/php/`.

There's no Dockerfile or container setup in this repo today; the above assumes a plain VM/host.

## 6. Data & backups

Every backend's only persistent state is a single `db.json` file (or the copy of it each
backend's `dbFile`/`ZJOURNAL_DB_FILE` config points at). Back it up like you would any
single-file database:

- A simple cron job copying `db.json` to another location/host on a schedule is sufficient for a
  personal instance.
- `server/php/backupdata.php` is a legacy script that does something like this (encrypt + email a
  copy), but it uses a different, hardcoded crypto scheme and hardcoded recipient addresses — treat
  it as a reference, not something to enable as-is (see
  [server/php/README.md](../server/php/README.md#legacy--debug-scripts--not-part-of-the-api-contract)).
- If you're running `server/java` or `server/python`, remember writes are flushed to disk only
  periodically (every 60s) and on clean shutdown — an unclean process kill (`kill -9`, an OOM, a
  host crash) can lose up to that window's writes. `server/node` and `server/php` write to disk
  synchronously on every request, so they don't have this window but pay for it in per-request
  latency.

## 7. CI

[.github/workflows/node.js.yml](../.github/workflows/node.js.yml) runs `npm ci`, `npm run build`,
and `npm test` on Node 18.x and 20.x for every push/PR to `main`. It verifies the build and test
suite pass — it does not deploy anywhere; wire up your own deploy step (e.g., an additional
workflow that rsyncs `web-app/build` and restarts the backend service) if you want push-to-deploy.
