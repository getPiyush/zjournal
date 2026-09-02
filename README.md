# zJournal

### _Journalism made simple_

zJournal is a self-hostable application for running a personal journal, blog, or news digest. It ships with a public reading site (home feed, categories, article pages, Q&A, contact form) and an admin panel for writing and managing content — no CMS or database server required to get started.

Built with React 18 + TypeScript, structured as an npm workspaces monorepo, and backed by a small JSON-file API server for local development.

## Table of contents

- [Quick start](#quick-start)
- [Project structure](#project-structure)
- [How it works](#how-it-works)
- [Configuration](#configuration)
- [Available scripts](#available-scripts)
- [User guide](#user-guide)
  - [Reading site](#reading-site)
  - [Admin panel](#admin-panel)
- [Data model](#data-model)
- [Backend servers](#backend-servers)
- [Testing & Storybook](#testing--storybook)
- [Building for production](#building-for-production)
- [Further documentation](#further-documentation)
- [Roadmap](#roadmap)

## Quick start

Requires Node.js 18.x or 20.x (see [.github/workflows/node.js.yml](.github/workflows/node.js.yml)).

```sh
npm install
npm run dev
```

`npm run dev` starts the React app and the local JSON-server API together (via `concurrently`).

| Module | URL |
| ------ | ------ |
| Journal (public site) | http://localhost:80/ |
| Journal Admin | http://localhost:80/admin/ |
| API server | http://localhost:8080/ |

> The dev server runs on port 80 (`cross-env PORT=80 react-scripts start` in `web-app/package.json`), so on macOS/Linux you may need to grant permission to bind to it, or change `PORT` if you'd rather use something like 3000. The `:host` variants (see below) sidestep this by defaulting `web-app` to port 3000 instead of 80, since privileged ports need elevated permissions to bind on any interface, not just `0.0.0.0`.

## Project structure

This is an **npm workspaces monorepo** (see root [package.json](package.json)):

```
zjournal/
├── web-app/          # React + TypeScript app (public site + admin panel)
├── ui-library/        # Shared component library (@zjournal/ui-library) + Storybook
├── server/
│   ├── node/          # Local JSON-server based API (default dev backend)
│   ├── php/            # Alternative PHP backend (flat-file, same db.json shape)
│   ├── java/            # Alternative Spring Boot backend (same db.json shape)
│   └── python/           # Alternative FastAPI backend (same db.json shape)
└── docs/              # Design/architecture notes
```

- **`web-app/`** (`zjoutnal-react-ts`) — the app shell, routing, state (React Context + reducers under `datastore/`), and the two route trees: `src/web/*` (public reader) and `src/admin/*` (content management).
- **`ui-library/`** (`@zjournal/ui-library`) — presentational components shared by both zones: `Article`, `Articles`, `ArticleScroller`, `Table`, `List`, editor components (`ArticleEditor`, `TableEditor`, `ListEditor`, ...), `Logo`, `Spinner`, `Loader`, etc. Has its own Storybook and Jest suite. Consumed at **build time** by `web-app` via the workspace link (`"@zjournal/ui-library": "*"`) — not a runtime micro-frontend. See [docs/micro-frontend-readiness.md](docs/micro-frontend-readiness.md) for a detailed analysis of what that would take.
- **`server/node/`** — a thin wrapper around [`json-server`](https://github.com/typicode/json-server) that serves `db.json` as a REST API, with optional AES request/response encryption and a shared-secret header check.
- **`server/php/`** — a PHP equivalent of the same API, for hosting on plain PHP/Apache stacks without Node.

All `npm run <script>` commands work from the repo root and delegate into the relevant workspace via `--workspace=`. `patrikaz` isn't a workspace (see [patrikaz/README.md](patrikaz/README.md)), so its scripts are instead reachable via the `patrikaz` passthrough script — `npm run patrikaz -- <script>`.

## How it works

1. **`AppRoot.tsx`** lazily mounts one of two route trees based on the URL prefix: `/web/*` for the public reader (`LandingPage`), `/admin/*` for the admin panel. `/` redirects to `/web/home`.
2. Both trees read/write state through React Context providers in `web-app/src/datastore/contexts/*` (`JournalContext`, `ArticleContext`, `ContactContext`, `QnAContext`), backed by reducer-style `*Actions.tsx` files.
3. Actions call `datastore/http-client.ts` / `datastore/api.ts`, which talk to whichever backend is configured (see `properties.serverUrl`), always encrypting payloads with `utils/crypto.ts` — the same PBKDF2/AES-256-CBC scheme every backend speaks.
4. The API server (`server/node`, `server/php`, `server/java`, or `server/python` — pick one via `serverUrl`) reads/writes a single JSON file (`db.json`) with four top-level collections: `articles`, `journal`, `contacts`, `qna`.
5. `ui-library` components render the data — the same `Article`/`Articles`/`ArticlePreviewWeb` components back both the public reader and the admin's article list/preview.

## Configuration

App-facing configuration lives in [web-app/src/properties.js](web-app/src/properties.js):

```js
export const properties = {
  title: "My Journey by Piyush Praharaj",
  author: "Piyush Praharaj",
  startDate: "2025-02-01",
  appPassword: "...",
  fonts: [ /* Google Fonts to load, with weights */ ],
  serverUrl: process.env.REACT_APP_SERVER_URL || defaultServerUrl,
  disableTextSelect: false,
};
```

`serverUrl` and `analyticsUrl` (below) default to the page's own hostname on ports 8080/4400 rather than
a hardcoded `localhost` — e.g. `web-app` served from `http://192.168.0.198` talks to
`http://192.168.0.198:8080` and `:4400`, not `localhost`, so it works when accessed from another
device on the LAN (see `npm run dev -- --host`). Set `REACT_APP_SERVER_URL` /
`REACT_APP_ANALYTICS_URL` (`web-app/.env.example`) to override this when the API/analytics service
isn't co-located with `web-app`.

There's no `serverMode` any more — every backend (`node`/`php`/`java`/`python`) speaks the same `ezjData` envelope and PBKDF2/AES-256-CBC encryption, always on, so switching backends is just a `serverUrl` change.

Server-facing configuration lives in [server/node/properties.js](server/node/properties.js) (port, `dbFile`, admin passphrase seed).

> ⚠️ The bundled `appPassword` / passphrase values are placeholders checked into source for local development. Replace them before deploying anywhere reachable from the internet.

Environment variables (`web-app/.env.example`): `REACT_APP_SERVER_URL` / `REACT_APP_ANALYTICS_URL` (both
optional, see above), plus stubs for a **future** Google OAuth admin gate — unused today:

```
REACT_APP_GOOGLE_CLIENT_ID=
REACT_APP_ADMIN_EMAILS=
```

As of now `/admin` has **no login gate** — anyone who can reach the route lands in the panel (see `web-app/src/admin/index.tsx` and `web-app/src/admin/authConfig.ts`). Keep this in mind before exposing an instance publicly.

## Available scripts

Run from the repo root:

`dev`, `server`, and `prod` are backed by small dispatcher scripts (`scripts/dev.js`, `scripts/server.js`,
`scripts/prod.js`) that take a `--backend` flag instead of each backend/mode/host combo having its own
script name.

| Script | What it does |
| --- | --- |
| `npm start` / `npm run dev` | Starts `web-app` (port 80) + `server/node` + the [analytics](analytics/README.md) service, all in dev mode, together — identical scripts, `start` is just the npm-idiomatic name |
| `npm start -- --host` | Same, with `web-app` and analytics bound to `0.0.0.0` so other devices on the LAN can reach them — `web-app` runs on port 3000 instead of 80 here, since binding a privileged port needs elevated permissions even on `0.0.0.0` |
| `npm start -- --backend=php\|java\|python` | Same as `start`, against the PHP/Java/Python API server instead of Node |
| `npm start -- --backend=php\|java\|python --host` | Host-bound (`0.0.0.0`) variant of the above — also binds the PHP/Java/Python server itself, since (unlike the Node server) those default to localhost-only |
| `npm run start --workspace=web-app` / `npm run start:host --workspace=web-app` | Starts only `web-app`, without the API server or analytics — port 80 localhost-only, or port 3000 bound to `0.0.0.0` |
| `npm run server` | Starts the Node API server in watch/dev mode |
| `npm run server -- --prod` | Starts the Node API server in production mode |
| `npm run server -- --backend=php` / `--backend=php --host` | Starts the PHP API server (`php -S` in `server/php`), localhost-only or bound to `0.0.0.0` — PHP's built-in server is dev-only, so `--prod` isn't supported for it; deploy it behind Apache/PHP-FPM for production instead |
| `npm run server -- --backend=java` / `--backend=java --host` | Starts the Java API server from source (`./mvnw spring-boot:run` in `server/java`), localhost-only or bound to `0.0.0.0` |
| `npm run server -- --backend=java --prod` | Builds the Spring Boot jar and runs it (`./mvnw package && java -jar target/*.jar`) |
| `npm run server -- --backend=python` / `--backend=python --host` | Starts the Python API server with auto-reload (`uvicorn --reload` in `server/python`), localhost-only or bound to `0.0.0.0` |
| `npm run server -- --backend=python --prod` | Starts the Python API server without auto-reload |
| `npm run build` | Production build of `web-app` |
| `npm run prod` | Runs the production build's server + the Node API server in production mode, together |
| `npm run prod -- --backend=java\|python` | Same, against the Java/Python API server's production mode instead of Node |
| `npm run stop` | Kills anything listening on the ports any of the above use (web-app, all four API backends, analytics, module federation dev servers) |
| `npm test` | Runs `web-app`'s test suite |
| `npm run analytics:dev` / `npm run analytics:start` | Starts the standalone [analytics](analytics/README.md) service on its own (port 4400, localhost only) in dev/watch or production mode |
| `npm run analytics:dev:host` / `npm run analytics:start:host` | Same, bound to `0.0.0.0` so other devices on the LAN can reach it |

Inside `ui-library/`:

| Script | What it does |
| --- | --- |
| `npm run build` | Compiles TypeScript to `dist/` and copies CSS |
| `npm run storybook` | Starts Storybook on port 6006 for isolated component development |
| `npm run build:storybook` | Builds a static Storybook site to `storybook-static/` |
| `npm test` | Runs the Jest suite |

### Patrikaz

Run from the repo root via `npm run patrikaz -- <script>` (or `cd patrikaz && npm run <script>` directly — see [patrikaz/README.md](patrikaz/README.md)):

| Script | What it does |
| --- | --- |
| `start` | Starts patrikaz + the `ui-library` MFE remote + the Node API server + the [analytics](analytics/README.md) service together (`http://localhost:3002`) |
| `start:host` | Same as `start`, bound to `0.0.0.0` so other devices on the LAN can reach it |
| `serve` | Starts only patrikaz's webpack-dev-server (assumes the API, MFE remote, and analytics are already running elsewhere) |
| `serve:host` | Same as `serve`, bound to `0.0.0.0` |
| `start:php` / `start:java` / `start:python` | Starts patrikaz + the MFE remote + analytics against the PHP/Java/Python API server instead of Node |
| `start:php:host` / `start:java:host` / `start:python:host` | Host-bound (`0.0.0.0`) variants of the above |
| `mfe:start` / `mfe:start:host` | Starts `ui-library`'s Module Federation remote dev server on its own (`http://localhost:3001`) |
| `analytics:dev` / `analytics:dev:host` | Starts the analytics service on its own (`http://localhost:4400`), localhost-only or bound to `0.0.0.0` |
| `server:dev` (alias `server:node:dev`) | Starts the Node API server in dev/watch mode |
| `server:php:dev` | Starts the PHP API server |
| `server:java:dev` | Starts the Java API server from source (`./mvnw spring-boot:run`) |
| `server:python:dev` | Starts the Python API server with auto-reload |
| `build` | Production webpack build to `patrikaz/build` |
| `typecheck` | Type-checks with `tsc --noEmit` |

Example: `npm run patrikaz -- start:java:host` starts patrikaz, the `ui-library` MFE remote, and the Java API server, all bound to `0.0.0.0` for LAN access.

## User guide

### Reading site

Public routes live under `/web/*`:

- **Home** (`/web/home`) — hero article + article cards feed.
- **Categories** — opened from the header's "Categories" link (offcanvas panel); filters the feed by category.
- **More** — offcanvas panel listing recent/all blogs (`Panel/Blogs`).
- **Article view** — click any article card to read the full piece.
- **About** (`/web/aboutus`) — editable "About" page, content managed from the admin **Templates** tab.
- **Contact** (`/web/contactus`) — a form that writes a new entry into the `contacts` collection.
- **Q&A** (`/web/iqa`) — published question/answer entries.

### Admin panel

Navigate to `/admin` (redirects to `/admin/categories`). The nav bar exposes five sections:

**Categories** — the default landing page. Lists all articles, filterable by category (dropdown) and free-text search, sortable by newest/oldest/title. Click an article's edit icon to open it in the **Editor**.

**Editor** (`/admin/editor`) — create or edit an article:
1. Set the **title** and pick a **category** from the dropdown (categories come from `journal.categories` in the data store).
2. Use the element dropdown to add content blocks in order — available types (from `journal.components`): `h2`, `h3`, `h4`, `h5` headings, `Paragraph` (supports inline HTML, e.g. links), `Image` (URL-based), `List`, and `Table`.
3. Click a block on the canvas to open its edit panel (offcanvas) and change its content, or delete it.
4. Toggle **Published** to control whether the article appears on the public site, and use **Reset** to clear the draft back to a blank article.
5. Click **Preview** to see the rendered article before saving, then **Save** to persist it (creates a new article or updates the existing one depending on whether it already has an `id`).

**Templates** (`/admin/templates`) — edit the structured content for the **Home**, **About**, and **QnA** pages via a radio toggle between the three template editors. The Home editor's `templateData` is a plain string: one row per line, article ids within a row separated by `|` — a lone id on a row renders as the hero article, multiple ids render as a column of cards (see `TemplateRenderer` in `ui-library`). Its **Auto generate** button builds this for you: it ranks articles by view count from the [analytics](analytics/README.md) service (`GET /api/applications/:application/stats`, already sorted most-viewed first) and lays out the top 14 as hero (1) + row (3) + row (5) + row (5), so you don't have to hand-assemble ids or know the `|`/newline syntax. It requires analytics to already have recorded views for this application — a fresh instance with no traffic yet will show an error instead. Auto generate only fills in the textarea; nothing is saved until you click **Preview** then **Save Template**, same as a manual edit.

The same ranking/layout is also available as a standalone script, `npm run template:auto-generate` (`scripts/auto_generate_template.py`), for batch/cron use outside the admin UI. Unlike the button, it writes `journal.templateData` straight into **every** backend's `db.json` (`server/node`, `server/php`, `server/java`, `server/python`) — no preview step — so all four stay in sync with whichever one the site is actually running. It starts the analytics service itself if one isn't already running (and stops it again when done), or reuses one that's already up. Options: `--application <name>` (default `web-app`), `--dry-run` (print the generated template without writing), `--db-json <path>` (repeatable, to target a subset of backends).

**Contacts** (`/admin/contacts`) — view messages submitted through the public Contact Us form.

**Purge** (`/admin/purge`) — articles are soft-deleted first (`deleteFlag: true`) rather than removed immediately; this page lists them and lets you permanently purge each one, with a confirmation prompt since the action can't be undone.

## Data model

The API (whichever backend you use) serves four collections, all defined in `db.json` / `server/php/db.json`:

- **`articles`** — `{ id, author, title, createdAt, updatedAt, categryId, content: ComponentObject[], origin, published, deleteFlag }`. `content` is an ordered array of typed blocks (`componentId`, `componenType`, `data`, `numbered`) — this is what the article editor manipulates.
- **`journal`** — singleton document holding site-wide state: `title`, `categories[]`, `components[]` (the block types the editor offers), `templateArticles`, `templateData`, `aboutUs`, plus (Node server only) `adminDetails` with the hashed admin id/passphrase.
- **`contacts`** — `{ id, name, createdAt, email, phone, comment }` entries from the Contact Us form.
- **`qna`** — `{ id, question, answer, published, createdAt }` entries shown on the Q&A page.

All three collections use a string `id` and a `createdAt` ISO-8601 timestamp — `articles` additionally tracks `updatedAt` since it's the only collection with an edit flow.

## Backend servers

Four interchangeable backend implementations exist, all speaking the **same wire contract**: every
request/response body is wrapped as `{"ezjData": "<base64>"}`, encrypted with PBKDF2-HMAC-SHA512
(999 iterations) + AES-256-CBC (salt/iv carried in the payload), on by default and toggleable per
backend (see each server's README). There's no mode selector on the frontend any more (the old
`properties.serverMode` flag is gone) — switching backends is purely a `properties.serverUrl`
change. All four also share the same error shape: a `GET`/`PUT`/`DELETE` against an unknown id
returns HTTP `404` with `{"error": {"code": "NOT_FOUND", "message": "..."}}`, and `POST` returns
`201` on success:

- **`server/node`** (default) — [`json-server`](https://www.npmjs.com/package/json-server) wrapping `db.json`, with middleware (`crypto.js`) implementing the shared PBKDF2/AES-256-CBC `ezjData` envelope.
  - Run directly: `cd server/node && node server.js -w --development` (or `--production`).
- **`server/php`** — equivalent REST-ish endpoints (`getters.php`, `setters.php`, `index.php`) plus `crypto.php` and `backupdata.php`, for deployment on a plain PHP/Apache host instead of Node.
- **`server/java`** — a Spring Boot rewrite of the same REST surface (articles/journal/contacts/qna, filter/sort query params, `{ezjData}` envelope). In-memory store seeded from `db.json`, flushed back to disk periodically and on shutdown. See [server/java/README.md](server/java/README.md).
- **`server/python`** — a FastAPI rewrite of the same REST surface, same `{ezjData}` envelope and filter/sort query semantics as `server/java`, with the same in-memory-store-plus-periodic-flush approach. Interactive docs via FastAPI's built-in Swagger UI (`/docs`). See [server/python/README.md](server/python/README.md).

All four read/write the same `db.json` shape and speak the same encrypted envelope, so you can point `web-app` at any of them by changing only `serverUrl`.

## Analytics service

**[`analytics/`](analytics/README.md)** is a separate standalone Node service (its own `package.json`, not one of the four `db.json`-backed backends above) that tracks article views: which article, by which author, viewed how many times, per application. `web-app` and `patrikaz` each call it directly from the browser — a fire-and-forget `POST` fired whenever an article view resolves (see `src/analytics/trackArticleView.ts` in each app) — so a dropped or unreachable analytics call never affects the reading experience. Views are aggregated by article/author/category per application, plus a full timestamped (and best-effort geolocated) event log, all persisted to a single JSON file. See [analytics/README.md](analytics/README.md) for the API, the data file's structure, and `npm run analytics:dev` / `:start` (`:host` variants too) to run it.

## Testing & Storybook

- `web-app` and `ui-library` both use Jest + React Testing Library; most components ship with a co-located `*.test.tsx`.
- Run everything: `npm test` (root, `web-app` only) or `cd ui-library && npm test`.
- `ui-library` has Storybook stories (`*.stories.tsx`) for nearly every component — `cd ui-library && npm run storybook` to browse and develop components in isolation, independent of `web-app`.
- CI ([.github/workflows/node.js.yml](.github/workflows/node.js.yml)) runs `npm ci`, `npm run build`, and `npm test` on Node 18.x and 20.x for every push/PR to `main`.

## Building for production

```sh
npm run build      # builds web-app into web-app/build
npm run prod        # serves the build (web-app/public/server.js, an Express static server) + the Node API together
```

`prodrun` serves the built app with a minimal Express server (`web-app/public/server.js`) on port 80; pair it with `npm run server` (the API server in `--production` mode) — `npm run prod` runs both together.

## Further documentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — how `web-app`, `patrikaz`, `ui-library`, and the four backends fit together, the shared API/encryption contract, and known architectural gaps.
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — taking this from local dev to a server you control: picking a backend, building, securing it (including the admin login gap), a reverse-proxy example, and backups.
- **[docs/USER_GUIDE.md](docs/USER_GUIDE.md)** — a guide for people reading or writing content on a running instance (as opposed to developing the app itself).
- **[docs/micro-frontend-readiness.md](docs/micro-frontend-readiness.md)** — analysis of what it would take to make `ui-library` a true runtime micro-frontend for `web-app` (it already is one for `patrikaz`).
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — repo conventions, what to check before opening a PR, and rules for changing code shared across the four backends.
- Per-module READMEs: [ui-library](ui-library/README.md), [patrikaz](patrikaz/README.md), [analytics](analytics/README.md), [server/node](server/node/README.md), [server/php](server/php/README.md), [server/java](server/java/README.md), [server/python](server/python/README.md).

## Roadmap

- Admin password change
- Feature flags (enable/disable features)
- Web integration
- Author accounts via OAuth
- Template options (choose template / sort order) for the Home page

<details>
<summary>Already shipped</summary>

- `<Table>` article component
- Publish/unpublish article
- HTML parsing in article content (inline HTML in text blocks)
- Article-by-ID URLs
- Admin login (passphrase-based; OAuth gate still pending — see [Configuration](#configuration))
- Templates (Home / About / QnA)
- Contact Us (web + admin)
- QnA (web + admin)
- Self-hosted analytics (article/author view tracking) — see [analytics](analytics/README.md)
- Auto generate the Home template from analytics (rank the most-read articles into a hero + 3/5/5 row layout)

</details>
