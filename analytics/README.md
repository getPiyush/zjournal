# analytics

A standalone Node.js API that tracks article views across every zJournal front end
(`web-app`, `patrikaz`, or any other consumer). Each front end fires a "view" event with the
article id, category, author and its own application name; this service timestamps it,
resolves a best-effort location from the request IP, and persists everything to a single JSON
file.

It runs as its own process, independent of `server/{java,node,php,python}` (which serve journal
content) — same pattern as `article-generator`, just a Node app instead of a Python one. Node
was chosen over Python here because this is a small, I/O-bound ingestion API (parse a JSON
body, append a record, write a file) — Node's non-blocking I/O handles that kind of workload
with less overhead than a comparable sync Python stack, and `geoip-lite`'s bundled offline
database means every request resolves location from memory with no outbound network call.

## Setup

```sh
cd analytics
npm install
```

## Running

```sh
npm start             # production, localhost only
npm run dev           # same, but auto-restarts on file changes (node --watch)
npm run start:host    # production, bound to 0.0.0.0 (reachable from other devices on the LAN)
npm run dev:host      # dev + auto-restart, bound to 0.0.0.0
```

Also runnable from the repo root: `npm run analytics:start` / `npm run analytics:dev` /
`npm run analytics:start:host` / `npm run analytics:dev:host`.

Listens on `PORT` (default `4400`) and `HOST` (default `127.0.0.1`; the `:host` scripts set this
to `0.0.0.0` for you) — same localhost-by-default/`:host`-opts-in convention patrikaz's dev
server uses.

## Front-end integration

`web-app` and `patrikaz` each call this service directly from the browser (not through their own
API server) whenever an article view resolves — see `web-app/src/analytics/trackArticleView.ts`
and `patrikaz/src/analytics/trackArticleView.ts`, wired into each app's `ArticleRouteView.tsx`.
The call is fire-and-forget (`fetch(...).catch(() => {})`): a dropped or unreachable analytics
request never blocks or breaks the reading experience. Because the request is cross-origin
(the reading apps run on a different host/port than this service), CORS is enabled with a
wildcard origin (see `src/app.js`) — safe here since the endpoint takes no cookies/credentials
and everything it accepts is already public article metadata.

Each app points at this service via its own env var (`REACT_APP_ANALYTICS_URL` for `web-app`,
`ANALYTICS_URL` for `patrikaz` — see each app's `.env.example`), defaulting to
`http://localhost:4400` (patrikaz falls back to the page's own host at runtime, same as its
`SERVER_URL`). Run this service in `:host` mode alongside `patrikaz`'s own `:host` scripts when
testing from another device on the LAN.

## Dashboard

A detailed analytics UI is served by this same process at `/` (e.g.
[http://localhost:4400](http://localhost:4400)) — no separate build step or process. It's a
static page (`public/index.html` + `public/dashboard.js`, Chart.js self-hosted from
`node_modules` via `/vendor/chartjs`, no CDN) that reads the API below and adds:

- **Stat tiles** — total views, articles tracked, authors, categories (plus an applications
  count when viewing "All applications").
- **Views over time** — a daily trend line; one line per application when "All applications" is
  selected (with a legend), a single line for one selected application.
- **Views by application** — only shown for "All applications" with 2+ apps recording views;
  each application keeps the same color across this chart and the multi-line trend above it.
- **Top articles / top authors / views by category / top locations** — ranking bar charts. Top
  articles is labeled by title (truncated to fit, full title on hover; falls back to
  `(untitled - <id>)` for events recorded before `articleTitle` existed).
- **Articles / Authors / Recent activity** tables — the full detail behind the charts, including
  the article title, raw per-event timestamp, and resolved location.
- An application selector and a day-range selector (7/30/90 days) filter everything at once;
  the page auto-refreshes every 30s while the tab is visible, or on demand via **Refresh**.
- Light/dark follow the OS/browser's `prefers-color-scheme` automatically.

## API

### `POST /api/events`

Records one article view.

Request body — all five fields are required:

```json
{
  "application": "web-app",
  "articleId": "art-123",
  "articleTitle": "How the paradox of touch works",
  "category": "science",
  "author": "Jane Doe"
}
```

The server fills in the rest: a generated event id, an ISO timestamp, and (when resolvable) a
location derived from the request's IP address.

```json
{
  "id": "ed9eb4f7-3115-4dd5-8434-e708c0efe3aa",
  "timestamp": "2026-08-29T04:19:36.102Z",
  "application": "web-app",
  "articleId": "art-123",
  "articleTitle": "How the paradox of touch works",
  "category": "science",
  "author": "Jane Doe",
  "ip": "203.0.113.42",
  "location": { "country": "US", "region": "CA", "city": "", "timezone": "America/Los_Angeles", "ll": [37.77, -122.42] }
}
```

`location` is `null` when the IP is local/private or isn't in `geoip-lite`'s database (e.g.
requests made during local development). `articleTitle` on an event recorded before this field
existed reads back as `null` — the dashboard falls back to showing the id in that case.

Example call from a front end, fired without blocking the page render:

```js
fetch('http://localhost:4400/api/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ application: 'web-app', articleId, articleTitle, category, author }),
}).catch(() => {}); // best-effort — a dropped analytics event shouldn't break the page
```

### `GET /api/applications/:application/stats`

Aggregate view counts for one application: total views, plus per-article, per-author and
per-category breakdowns, each sorted by views descending.

### `GET /api/applications/:application/articles/:articleId`

View count and metadata for a single article within an application.

### `GET /api/applications/:application/authors/:author`

View count and the list of article ids for a single author within an application.

### `GET /api/applications`

`[{ "application": "web-app", "totalViews": 14 }, ...]`, sorted by views descending. Powers the
dashboard's application selector and its "views by application" chart.

### `GET /api/overview`

Same shape as `GET /api/applications/:application/stats`. With `?application=<name>`, it's
just that endpoint under a query-string form; without it, returns stats merged across every
application (`application: null`, plus an `applicationCount`) — same key summed across apps if
it appears in more than one (e.g. an author who writes for both `web-app` and `patrikaz`).

### `GET /api/timeseries?application=<optional>&days=<1-365, default 30>`

`{ "days": 30, "series": [{ "application": "web-app", "points": [{ "date": "2026-08-01", "views": 3 }, ...] }, ...] }`.
Every day in the window is present (0 for no views) so a quiet day is a dip, not a gap that
skews the slope. One series per known application when `application` is omitted.

### `GET /api/locations?application=<optional>&limit=<1-100, default 10>`

`[{ "country": "US", "views": 9 }, ...]`, sorted by views descending. Events with no resolved
location count toward `"Unknown"`.

### `GET /api/events?application=<optional>&limit=<1-500, default 50>`

The most recent raw events, newest first — same shape as a `POST /api/events` response.

### `GET /health`

Liveness check, returns `{ "status": "ok" }`.

## Data file

Everything is stored in [`data/analytics.json`](data/analytics.json), structured to answer
"how many views" without scanning raw events, while still keeping the full detail:

```json
{
  "meta": { "version": 1, "createdAt": "...", "updatedAt": "..." },
  "applications": {
    "<applicationName>": {
      "totalViews": 0,
      "articles": { "<articleId>": { "views": 0, "title": "...", "category": "...", "author": "...", "firstViewedAt": "...", "lastViewedAt": "..." } },
      "authors": { "<author>": { "views": 0, "articles": ["<articleId>", "..."] } },
      "categories": { "<category>": { "views": 0 } }
    }
  },
  "events": [
    { "id": "...", "timestamp": "...", "application": "...", "articleId": "...", "articleTitle": "...", "category": "...", "author": "...", "ip": "...", "location": { "country": "...", "region": "...", "city": "...", "timezone": "...", "ll": [0, 0] } }
  ]
}
```

- **`applications`** is the parent entity requested per event — every article/author/category
  key nests under the application that reported it, so `web-app` and `patrikaz` views for the
  same article id never mix.
- **`articles` / `authors` / `categories`** are running counters, updated in memory on every
  `recordView()` call — reading "how many times was article X viewed" is an O(1) lookup, not a
  scan.
- **`events`** is the full append-only log (one row per view, with timestamp and location) for
  anything the aggregates don't capture — auditing, time-based analysis, etc.

The whole file is kept in memory and only serialized to disk after each write, via a queued,
temp-file-then-rename save so concurrent requests can't interleave writes or leave the file
truncated if the process is killed mid-write.

## Testing

```sh
npm test
```

Runs on Node's built-in test runner (`node --test`) — unit tests for the aggregation/rollup logic
in `store.js` (including the dashboard's timeseries/locations/combined-stats methods), plus
integration tests that boot the Express app on an ephemeral port and hit it with `fetch`
(API responses, CORS, and that the dashboard's static assets are actually served). No network
access or external services required.

## Notes / limitations

- This is a lightweight JSON-file store meant for a small/medium volume of view events (same
  tradeoff `db.json` and `generated_articles.json` make elsewhere in this repo). For high-volume
  production traffic, swap `AnalyticsStore` for a real database — the `recordView` /
  `getApplicationStats` / `getArticleStats` / `getAuthorStats` methods are the seam to replace.
- Location is resolved from `geoip-lite`'s bundled offline database, which is approximate
  (city-level at best, often just country) and has no data for private/loopback IPs.
