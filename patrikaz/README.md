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
2. The `ui-library` Module Federation remote (`npm run mfe:start` from the
   `ui-library` package in the zjournal monorepo — serves `remoteEntry.js` on
   `http://localhost:3001`).
3. Patrikaz itself.

```bash
cd patrikaz
npm install
cp .env.example .env   # adjust PORT / REMOTE_UI_LIBRARY_URL / SERVER_URL if needed
npm start              # http://localhost:3002
```

## Build

```bash
npm run build      # outputs build/
npm run typecheck  # tsc --noEmit
```

At build/deploy time, point `REMOTE_UI_LIBRARY_URL` at wherever `ui-library`'s
`dist-mfe/` (built via `npm run mfe:build` in that package) is hosted.
