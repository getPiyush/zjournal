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

> The dev server runs on port 80 (`cross-env PORT=80 react-scripts start` in `web-app/package.json`), so on macOS/Linux you may need to grant permission to bind to it, or change `PORT` if you'd rather use something like 3000.

## Project structure

This is an **npm workspaces monorepo** (see root [package.json](package.json)):

```
zjournal/
├── web-app/          # React + TypeScript app (public site + admin panel)
├── ui-library/        # Shared component library (@zjournal/ui-library) + Storybook
├── server/
│   ├── node/          # Local JSON-server based API (default dev backend)
│   ├── php/            # Alternative PHP backend (flat-file, same db.json shape)
│   └── java/            # Alternative Spring Boot backend (same db.json shape)
└── docs/              # Design/architecture notes
```

- **`web-app/`** (`zjoutnal-react-ts`) — the app shell, routing, state (React Context + reducers under `datastore/`), and the two route trees: `src/web/*` (public reader) and `src/admin/*` (content management).
- **`ui-library/`** (`@zjournal/ui-library`) — presentational components shared by both zones: `Article`, `Articles`, `ArticleScroller`, `Table`, `List`, editor components (`ArticleEditor`, `TableEditor`, `ListEditor`, ...), `Logo`, `Spinner`, `Loader`, etc. Has its own Storybook and Jest suite. Consumed at **build time** by `web-app` via the workspace link (`"@zjournal/ui-library": "*"`) — not a runtime micro-frontend. See [docs/micro-frontend-readiness.md](docs/micro-frontend-readiness.md) for a detailed analysis of what that would take.
- **`server/node/`** — a thin wrapper around [`json-server`](https://github.com/typicode/json-server) that serves `db.json` as a REST API, with optional AES request/response encryption and a shared-secret header check.
- **`server/php/`** — a PHP equivalent of the same API, for hosting on plain PHP/Apache stacks without Node.

All `npm run <script>` commands work from the repo root and delegate into the relevant workspace via `--workspace=`.

## How it works

1. **`AppRoot.tsx`** lazily mounts one of two route trees based on the URL prefix: `/web/*` for the public reader (`LandingPage`), `/admin/*` for the admin panel. `/` redirects to `/web/home`.
2. Both trees read/write state through React Context providers in `web-app/src/datastore/contexts/*` (`JournalContext`, `ArticleContext`, `ContactContext`, `QnAContext`), backed by reducer-style `*Actions.tsx` files.
3. Actions call `datastore/http-client.ts` / `datastore/api.ts`, which talk to whichever backend is configured (see `properties.serverUrl`), optionally encrypting payloads with `utils/crypto.ts` when `enableEncryption` is on.
4. The API server (`server/node` or `server/php`) reads/writes a single JSON file (`db.json`) with four top-level collections: `articles`, `journal`, `contacts`, `qna`.
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
  serverMode: "node",              // "node" | "php"
  serverUrl: "http://localhost:8080",
  enableEncryption: false,          // AES-encrypt request/response bodies
  disableTextSelect: false,
};
```

Server-facing configuration lives in [server/node/properties.js](server/node/properties.js) (port, `dbFile`, `encrypted` flag, admin passphrase seed).

> ⚠️ The bundled `appPassword` / passphrase values are placeholders checked into source for local development. Replace them before deploying anywhere reachable from the internet.

Environment variables (`web-app/.env.example`) currently only stub out a **future** Google OAuth admin gate — unused today:

```
REACT_APP_GOOGLE_CLIENT_ID=
REACT_APP_ADMIN_EMAILS=
```

As of now `/admin` has **no login gate** — anyone who can reach the route lands in the panel (see `web-app/src/admin/index.tsx` and `web-app/src/admin/authConfig.ts`). Keep this in mind before exposing an instance publicly.

## Available scripts

Run from the repo root:

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts `web-app` (port 80) + `server/node` in dev mode, together |
| `npm start` | Starts only `web-app` |
| `npm run server:dev` | Starts only the Node API server in watch/dev mode |
| `npm run build` | Production build of `web-app` |
| `npm run prod` | Runs the production build's server + the API server in production mode, together |
| `npm test` | Runs `web-app`'s test suite |

Inside `ui-library/`:

| Script | What it does |
| --- | --- |
| `npm run build` | Compiles TypeScript to `dist/` and copies CSS |
| `npm run storybook` | Starts Storybook on port 6006 for isolated component development |
| `npm run build:storybook` | Builds a static Storybook site to `storybook-static/` |
| `npm test` | Runs the Jest suite |

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

**Templates** (`/admin/templates`) — edit the structured content for the **Home**, **About**, and **QnA** pages via a radio toggle between the three template editors.

**Contacts** (`/admin/contacts`) — view messages submitted through the public Contact Us form.

**Purge** (`/admin/purge`) — articles are soft-deleted first (`deleteFlag: true`) rather than removed immediately; this page lists them and lets you permanently purge each one, with a confirmation prompt since the action can't be undone.

## Data model

The API (whichever backend you use) serves four collections, all defined in `db.json` / `server/php/db.json`:

- **`articles`** — `{ id, author, title, dateCreated, dateModified, categryId, content: ComponentObject[], origin, published, deleteFlag }`. `content` is an ordered array of typed blocks (`componentId`, `componenType`, `data`, `numbered`) — this is what the article editor manipulates.
- **`journal`** — singleton document holding site-wide state: `title`, `categories[]`, `components[]` (the block types the editor offers), `templateArticles`, `templateData`, `aboutUs`, plus (Node server only) `adminDetails` with the hashed admin id/passphrase.
- **`contacts`** — `{ name, dateContacted, email, phone, comment }` entries from the Contact Us form.
- **`qna`** — `{ id, question, answer, published, dateCreated }` entries shown on the Q&A page.

## Backend servers

Two interchangeable backend implementations exist, selected via `properties.serverMode` in `web-app/src/properties.js`:

- **`server/node`** (default) — [`json-server`](https://www.npmjs.com/package/json-server) wrapping `db.json`, with middleware for:
  - optional AES encryption of request/response bodies (`crypto.js`) when `properties.encrypted` is true, using a Base64-encoded `ezjData` envelope.
  - a shared-secret check via the `Zjournal-Secure-Token` header (`authenticator.js`) when encryption is enabled.
  - Run directly: `cd server/node && node server.js -w --development` (or `--production`).
- **`server/php`** — equivalent REST-ish endpoints (`getters.php`, `setters.php`, `index.php`) plus `crypto.php` and `backupdata.php`, for deployment on a plain PHP/Apache host instead of Node.
- **`server/java`** — a Spring Boot rewrite of the same REST surface (articles/journal/contacts/qna, filter/sort query params, `{ezjData}` envelope), using the PHP side's PBKDF2-HMAC-SHA512 + AES-256-CBC encryption scheme. In-memory store seeded from `db.json`, flushed back to disk periodically and on shutdown. See [server/java/README.md](server/java/README.md).

All three read/write the same `db.json` shape, so you can point `web-app` at any of them by changing `serverMode`/`serverUrl`.

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

## Roadmap

- Admin password change
- Feature flags (enable/disable features)
- Web integration
- Author accounts via OAuth
- Analytics (Google or self-hosted)
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

</details>
