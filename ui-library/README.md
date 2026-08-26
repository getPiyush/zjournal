# @zjournal/ui-library

UI component library for zJournal. Includes Storybook stories for local development.

Quick start:

```bash
cd ui-library
npm install
npm run storybook
```

Build:

```bash
cd ui-library
npm run build
```

## Micro-frontend (Module Federation)

Besides the `npm run build` package output that `web-app` consumes at build time, `ui-library`
can also run as a standalone Module Federation **remote**, so a separate host app can load its
components at runtime without adding it as an npm dependency.

Serve it locally:

```bash
cd ui-library
npm run mfe:start   # webpack-dev-server on http://localhost:3001, remoteEntry.js at /remoteEntry.js
```

Build it for deployment:

```bash
cd ui-library
npm run mfe:build   # outputs dist-mfe/, including remoteEntry.js — host anywhere static files are served
```

Remote name: `zjournalUiLibrary`. Exposed module: `./index` (the same barrel export as
`src/index.ts` — every named export listed there, e.g. `Button`, `Article`, `Table`, is
available on it).

`react`, `react-dom`, `react-router-dom`, and `styled-components` are declared as shared
singletons, so the host app should declare the same libraries as shared too (same major
versions) to avoid duplicate copies mounting at runtime.

### Consuming from a webpack host app

In the host's `webpack.config.js`:

```js
const { ModuleFederationPlugin } = require("webpack").container;

new ModuleFederationPlugin({
  name: "host",
  remotes: {
    zjournalUiLibrary: "zjournalUiLibrary@http://localhost:3001/remoteEntry.js",
  },
  shared: {
    react: { singleton: true },
    "react-dom": { singleton: true },
    "react-router-dom": { singleton: true },
    "styled-components": { singleton: true },
  },
});
```

Then, behind the host's own async bootstrap boundary:

```ts
const { Button } = await import("zjournalUiLibrary/index");
```

For TypeScript, add an ambient declaration in the host app (e.g. `src/types/federation.d.ts`):

```ts
declare module "zjournalUiLibrary/index" {
  export * from "@zjournal/ui-library";
}
```

This requires `@zjournal/ui-library` to also be installed as a (type-only) devDependency in the
host, purely so TypeScript can resolve the shape — no runtime code from it is bundled.
