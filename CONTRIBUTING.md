# Contributing

Thanks for looking at contributing to zJournal. This covers the mechanics of working in this
repo; for how the pieces fit together, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Setup

```sh
npm install
npm run dev
```

See the root [README.md](README.md#quick-start) for the full local dev setup, including running
against the alternate PHP/Java/Python backends.

## Repo layout

This is an npm workspaces monorepo (`web-app`, `ui-library`) plus three directories that sit
outside the workspace on purpose:

- **`patrikaz/`** — deliberately not a workspace member; it has no compile-time dependency on
  `ui-library` (see [patrikaz/README.md](patrikaz/README.md)). Don't add an import from
  `ui-library`'s source into `patrikaz` — that would break the point of it being independently
  deployable. If it needs something new from the library, expose it through the Module Federation
  remote and add the type to `patrikaz/src/types/*` instead.
- **`server/{node,php,java,python}`** — four independent implementations of one API contract. See
  [Touching a backend](#touching-a-backend) below before changing any one of them.
- **`ui-library/`** — has its own `package.json`/`node_modules` but is linked into `web-app` via
  the npm workspace, not published/versioned separately today.

## Conventions

- **TypeScript, functional components.** `web-app` and `ui-library` are React 18 + TypeScript;
  new components should follow the existing functional-component-plus-hooks style, not class
  components.
- **Tests are co-located.** A component's test lives next to it as `ComponentName.test.tsx`, using
  Jest + React Testing Library. Add one for new components/logic rather than a separate `__tests__`
  tree.
- **Comments explain "why," not "what."** Only add a comment for a non-obvious constraint or
  workaround — well-named components and functions should make the "what" self-evident.

## Before opening a PR

```sh
npm run build   # must succeed
npm test        # web-app's Jest suite
```

If you touched `ui-library`, also run its own suite: `cd ui-library && npm test`. CI
([.github/workflows/node.js.yml](.github/workflows/node.js.yml)) runs `npm ci`, `npm run build`,
and `npm test` against Node 18.x and 20.x on every push/PR to `main` — a PR that fails either
matrix leg won't merge.

## Touching a backend

The four backends under `server/` are meant to be interchangeable drop-ins for each other (see
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#the-api-contract)) — same endpoints, same query-param
semantics, same `{ezjData}` encrypted envelope. If you change one backend's behavior in a way a
frontend could observe (a new endpoint, a changed query param, a different response shape), either:

- Make the equivalent change in the other three backends in the same PR, or
- Call out explicitly in the PR description which backends are now out of sync and why, so it's a
  deliberate decision rather than an accidental drift.

The crypto envelope (PBKDF2-HMAC-SHA512, 999 iterations, AES-256-CBC) is implemented five times
independently — once per backend plus once in `web-app/src/utils/crypto.ts` — with no shared
library between them. If you ever need to change the algorithm or its parameters, all five
implementations need to move together, or every backend/frontend combination that isn't upgraded in
lockstep will fail to decrypt each other's payloads.

## Adding a new article content-block type

The Editor's block types (`h2`, `Paragraph`, `Image`, ...) come from `journal.components` in the
data store, not from a hardcoded list in `web-app`. Adding a genuinely new block type (not just a
new category/instance's config) touches:

1. The rendering component in `ui-library` (how the block displays on the public site).
2. The editor's block-edit panel in `web-app` (how the block's content gets authored).
3. Adding the new type name to `journal.components` in `db.json` so the Editor's dropdown offers it.

No backend code changes are needed for this — the backends just store whatever's in `content`
opaquely.

## Questions / issues

Open a GitHub issue on this repo for bugs or feature discussion.
