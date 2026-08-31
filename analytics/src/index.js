'use strict';

const { AnalyticsStore } = require('./store');
const { createApp } = require('./app');

const PORT = process.env.PORT || 4400;
// Defaults to localhost-only, matching patrikaz's dev-server convention (plain `start`/`serve`
// vs `:host` variants) - set HOST=0.0.0.0 (see the `:host` npm scripts) to accept LAN traffic
// from other devices running web-app/patrikaz.
const HOST = process.env.HOST || '127.0.0.1';

async function main() {
  const store = new AnalyticsStore();
  await store.load();

  const app = createApp(store);
  app.listen(PORT, HOST, () => {
    console.log(`zjournal-analytics listening on http://${HOST}:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start analytics service', err);
  process.exit(1);
});
