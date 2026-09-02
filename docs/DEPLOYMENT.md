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

**`/admin` currently has no login gate** — anyone who can reach the route can create, edit,
publish, and permanently purge content (see
[ARCHITECTURE.md](ARCHITECTURE.md#known-architectural-gaps)). The stubbed Google OAuth gate
(`web-app/src/admin/authConfig.ts`) is not wired up yet. Until it is, if you're deploying somewhere
more than one person can reach, put `/admin` behind something else:

- A reverse-proxy `location /admin { auth_basic ...; }` block (nginx) or equivalent Apache
  `<Location>` directive with HTTP basic auth.
- Restrict `/admin` to a VPN or an IP allowlist at the proxy/firewall level.
- Don't expose the instance publicly at all if it's just for personal use — bind it to
  `localhost`/a private network.

This applies regardless of which of the four backends you run — none of them add their own admin
auth; the gate (or its absence) lives entirely in `web-app`.

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
