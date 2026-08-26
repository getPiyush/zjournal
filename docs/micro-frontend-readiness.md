# Making `@zjournal/ui-library` a Micro-Frontend — Analysis

## 1. What it is today

`ui-library` is **not** a micro-frontend — it's a shared component library consumed at **build time**:

- npm workspaces monorepo (`package.json:workspaces`) — `ui-library` and `web-app` are sibling packages linked via a symlink in `node_modules`, not a published/versioned artifact.
- `ui-library` builds with plain `tsc` (`ui-library/package.json:6` — `tsc -p tsconfig.json && copyfiles ... dist`). No bundler, no `remoteEntry.js`, no runtime manifest.
- `web-app` is CRA (`react-scripts@5`, not ejected, no CRACO/webpack override files present). Its webpack build statically bundles `ui-library`'s compiled output into the single app bundle.
- `web-app` depends on `"@zjournal/ui-library": "*"` — any change to `ui-library` requires rebuilding and redeploying `web-app`. There is no independent release or runtime composition.

So today, "micro-frontend" and "shared component library" are being used interchangeably. Worth confirming which one is actually wanted before investing — see §5.

## 2. Coupling audit (what would break isolation)

| Coupling point | Finding |
|---|---|
| App state / context | ✅ Clean. `ui-library/src` has zero references to `JournalContext`, `JournalActions`, or anything under `web-app/`. Editor components (`ArticleEditor`, `TableEditor`, etc.) receive data via props, not via importing host state. |
| Runtime globals | ✅ Clean. No `localStorage`/`fetch`/`axios` calls inside `ui-library` — components are presentational, not data-fetching. |
| React/ReactDOM/Router | ✅ Already peer dependencies (`ui-library/package.json` — `react >=18`, `react-dom >=18`, `react-router-dom >=6`), not bundled. This is the right foundation for avoiding duplicate-React issues under either a library or a federation model. |
| **CSS** | ❌ Coupled. Only 2 components ship their own CSS (`Button/button.css`, `Loader/LoadingPage.css`). Everything else (`.blog-header-logo`, `.logo-image`, `.admin`, `.sub-header`, etc.) is defined in `web-app/src/styles.css` and only reaches the DOM because `App.tsx` imports it. A `ui-library` component rendered outside `web-app` today would be unstyled. |
| **Bootstrap** | ❌ Coupled. ~10 components use Bootstrap classes/attributes (`btn`, `nav`, `data-bs-toggle`, etc. — e.g. `ArticleScroller.tsx`, `ArticleEditor.tsx`, `Blogs.tsx`). Bootstrap CSS/JS is loaded via CDN `<link>`/`<script>` tags in `web-app/public/index.html`, not shipped with the library. Any standalone consumer of `ui-library` must independently know to load Bootstrap 5.1.3. |
| Public API surface | ⚠️ Wide and mixed. `ui-library/src/index.ts` exports ~30 symbols spanning two unrelated domains in one flat namespace: public-reader components (`ArticleScroller`, `Logo`, `Table`) and admin/editor internals (`ArticleEditor`, `TableEditor`, `SidePanelContainer`, `ConfirmationButton`), plus shared `Types` and utility functions. A micro-frontend needs a deliberately small, versioned contract — this is currently "export everything." |

## 3. What's actually required, by category

### Build tooling
- `ui-library` needs a real bundler (Webpack 5, Rspack, or Vite) to produce a loadable runtime artifact — `tsc` output alone can't expose a Module Federation `remoteEntry.js` or an equivalent dynamic-import manifest.
- `web-app` on plain `react-scripts@5` **cannot** configure Module Federation without one of: ejecting, adopting CRACO (`@craco/craco` + a federation plugin), or migrating the host off CRA entirely (e.g., to Vite). This is the single biggest blocker to a Webpack Module Federation approach.

### Runtime dependency sharing
- Peer deps are already correct; federation config still needs explicit `shared: { react: { singleton: true }, "react-dom": { singleton: true }, "react-router-dom": { singleton: true } }` to guarantee one React instance across host + remote.
- MF requires the async-boundary bootstrap pattern (`import('./bootstrap')`) so the shared scope initializes before any remote renders.

### Style isolation
- Move component-owned styles into `ui-library` itself (co-located CSS/CSS Modules, or CSS-in-JS) instead of relying on `web-app/src/styles.css`.
- Decide the Bootstrap story: either bundle/scope Bootstrap inside `ui-library`, or make it an explicit documented peer requirement of the remote (current de-facto state, just undocumented and CDN-pinned).
- Without one of the above, the remote is not self-contained — it silently depends on whatever the host happens to load first.

### Versioning & deployment
- `ui-library` needs to be built and hosted somewhere network-reachable at runtime (static host/CDN), not just symlinked via npm workspaces.
- Needs an independent CI pipeline: build → version (semver) → publish artifact/deploy static assets, decoupled from `web-app`'s release cycle.
- Versioned, cache-busted URLs for the remote entry; a documented deprecation/compat policy since host and remote can now be out of sync in production.

### Contract stability
- Split the flat `index.ts` into explicit, minimal entry points that match real consumption boundaries — e.g. a "web/reader" surface vs. an "admin/editor" surface — instead of one export list mixing both. This matters more than the transport mechanism: it's what makes the library safe to version independently.

### Routing
- The app already has two logical zones (`/web/*`, `/admin/*` — see root `README.md`). A true app-level micro-frontend split would hang off this existing seam: either the host lazy-loads each zone as a separate remote (Module Federation + `React.lazy` per route), or the two zones become fully separate deployments composed by a reverse proxy on path prefix.

### Testing/tooling
- Storybook already exists for `ui-library` — good, this already supports independent component development/preview and is a natural home for visual-regression coverage on the "contract."
- Still missing: contract tests between host and remote (prop-shape guarantees), and a CI trigger structure where `ui-library` deploys don't require a `web-app` rebuild.

## 4. Recommended path

Given the current setup (small monorepo, CRA host not ejected, one deploy target), going straight to runtime Module Federation is a large jump. A two-phase approach de-risks it:

**Phase 1 — decouple, no runtime change (low risk, mostly done already):**
1. Move all component-required CSS into `ui-library` (co-located/scoped).
2. Make Bootstrap an explicit, documented dependency of `ui-library` rather than an ambient host assumption.
3. Split `index.ts` into two clear entry points (`@zjournal/ui-library/web`, `@zjournal/ui-library/admin`, or two packages) mirroring the existing `/web` vs `/admin` split.
4. Publish `ui-library` as a real versioned artifact (npm registry or GitHub Packages) instead of a workspace symlink, so `web-app` pins a version instead of building against source.

**Phase 2 — true runtime micro-frontend (higher effort, only if independent *runtime* deployment is the actual goal):**
1. Migrate `web-app` off plain CRA (Vite, or webpack via CRACO/eject) to unlock federation tooling.
2. Give `ui-library` (or the `/admin` zone specifically) a bundler-based build that exposes a remote entry.
3. Stand up static hosting/CDN + versioned deploy pipeline for the remote.
4. Configure shared singleton deps and add per-remote error boundaries in the host shell.

## 5. Open question worth resolving before starting

The term "micro-frontend" was used, but the coupling issues found (§2) are exactly what would also need fixing to simply make `ui-library` a well-behaved **independently-versioned package** — which is a much smaller project than runtime federation. Worth confirming which outcome is actually wanted:
- *Independent release cadence for the component library* → Phase 1 alone is sufficient.
- *Independently deployable running UI (e.g., admin deployed/updated without touching the reader app)* → needs Phase 2, and doubles as justification for splitting `/web` and `/admin` given they're already logically separate.
