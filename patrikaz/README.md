# Patrikaz

An independent, pluggable reader app for zJournal. It covers the same public
"web" surface as `web-app` — Home, About, single Article, and Article
listings (by category / author / month) — minus Contact and Q&A. It talks to
the same zJournal API that `localhost/web` uses.

This app is **decoupled from the zjournal monorepo on purpose**: it is not an
npm workspace member, and it has no dependency (runtime or type-only) on
`@zjournal/ui-library`. It is meant to be lifted into its own repository at
any time without changes. Instead of importing the library, it consumes it
entirely at runtime as a **Module Federation remote**:

- Every UI component (`Logo`, `SidePanel`, `LoadingPage`, `Article`,
  `Articles`, `TemplateRenderer`) is wrapped in `React.lazy` in
  [`src/remotes/uiLibraryComponents.tsx`](src/remotes/uiLibraryComponents.tsx)
  and only fetched over the network the first time the page that needs it
  renders.
- Non-component exports it needs (`parsex`, `months`,
  `parseTemplateArticleIds`) go through the cached loader in
  [`src/remotes/uiLibraryModule.ts`](src/remotes/uiLibraryModule.ts).
- TypeScript types for the remote's shape live in
  [`src/types/ui-library-remote.d.ts`](src/types/ui-library-remote.d.ts) and
  [`src/types/domain.ts`](src/types/domain.ts) — hand-maintained local copies,
  not imports from the library's source, since a separate repo won't have
  that source available.
- All routed pages (`Home`, `AboutUs`, `ArticleRouteView`,
  `ArticlesRouteView`) are also `React.lazy`-loaded per route in
  [`src/web/Content.tsx`](src/web/Content.tsx).

If the library's exposed API ever changes shape, `src/types/*` needs a manual
update to match — there's no compiler link between the two repos enforcing
it.

## Running locally

Patrikaz needs three things running:

1. The zjournal API server (same one `web-app`/`localhost/web` uses), default `http://localhost:8080`.
2. The `ui-library` Module Federation remote — serves `remoteEntry.js` on
   `http://localhost:3001`.
3. Patrikaz itself.

`npm start` runs all three together (via `concurrently`), assuming this
package still sits next to `ui-library` and `server/node` inside the
zjournal monorepo checkout:

```bash
cd patrikaz
npm install
cp .env.example .env   # adjust PORT / REMOTE_UI_LIBRARY_URL / SERVER_URL if needed
npm start              # http://localhost:3002
```

If patrikaz has been lifted into its own repository (see above), those
sibling paths won't exist any more — start the API server and the
`ui-library` remote however they're hosted for you, then run `npm run serve`
here for just the app itself.

### Host mode (LAN access)

`npm start`/`npm run serve` bind webpack-dev-server to `localhost` only, so nothing but the dev
machine itself can reach it. `npm run start:host` (or `npm run serve:host` for just patrikaz) binds
to `0.0.0.0` instead, so another device on the same network can load it via the dev machine's LAN
IP, e.g. `http://192.168.0.198:3002` — and, per the runtime host-detection in
[properties.ts](src/properties.ts) and [webpack.config.js](webpack.config.js), the API and MFE
remote calls automatically follow that same IP rather than falling back to `localhost`.
`start:host` also runs `ui-library`'s dev server in host mode (`mfe:start:host`); the API server
(`server:dev`) already listens on all interfaces by default, so it needs no separate host variant.

Host mode also skips loading `.env` (see `webpack.config.js`) — otherwise its `localhost`-pinned
`REMOTE_UI_LIBRARY_URL`/`SERVER_URL` would still be baked into the bundle even with `--host
0.0.0.0`, and a remote device's "localhost" is itself, not your dev machine, breaking the app for
that remote device (`ScriptExternalLoadError` loading `remoteEntry.js`, failed API calls, etc).

One known limitation: webpack-dev-server's own live-reload (HMR) client also bakes the `--host`
value into its WebSocket URL, so a remote viewer's browser console may show a WebSocket connection
warning for `ws://0.0.0.0:.../ws`. This doesn't affect the app itself — the API and MFE remote
already resolve correctly per above — it just means that remote viewer won't get automatic
live-reload on code changes and needs to refresh manually.

## Build

```bash
npm run build      # outputs build/
npm run typecheck  # tsc --noEmit
```

`npm run build` deliberately ignores `.env` (that file only applies to `npm start`/`npm run
serve`) and does not bake a `localhost` URL into the bundle for either the API or the
`zjournalUiLibrary` remote. At runtime, in the browser, both default to the page's own host —
`http://<host>:8080` for the API, `http://<host>:3001/remoteEntry.js` for the remote — so a build
served from e.g. `http://192.168.0.198` automatically calls `http://192.168.0.198:8080` and
`http://192.168.0.198:3001/remoteEntry.js`, with no per-deployment configuration needed as long as
the API and the `ui-library` remote (`dist-mfe/`, built via `npm run mfe:build` in that package)
are hosted on those ports on the same host as patrikaz itself.

If either isn't co-located with patrikaz (a different host or port), set `SERVER_URL` and/or
`REMOTE_UI_LIBRARY_URL` as real environment variables when invoking `npm run build` — not via
`.env`, which `npm run build` ignores — e.g. `SERVER_URL=https://api.example.com npm run build`.
