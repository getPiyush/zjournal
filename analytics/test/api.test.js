'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { AnalyticsStore } = require('../src/store');
const { createApp } = require('../src/app');

async function startServer() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'analytics-api-test-'));
  const store = new AnalyticsStore(path.join(dir, 'analytics.json'));
  await store.load();

  const server = createApp(store).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

test('responds to a CORS preflight so browser POSTs from another origin are allowed', async () => {
  const { server, baseUrl } = await startServer();
  try {
    const res = await fetch(`${baseUrl}/api/events`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3050',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('access-control-allow-origin'), '*');
    assert.match(res.headers.get('access-control-allow-methods') || '', /POST/);
  } finally {
    server.close();
  }
});

test('POST /api/events records a view and GET stats reflects it', async () => {
  const { server, baseUrl } = await startServer();
  try {
    const postRes = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application: 'web-app', articleId: 'a1', articleTitle: 'A Science Piece', category: 'science', author: 'Jane Doe' }),
    });
    assert.equal(postRes.status, 201);
    const event = await postRes.json();
    assert.ok(event.id);
    assert.ok(event.timestamp);
    assert.equal(event.articleTitle, 'A Science Piece');

    const statsRes = await fetch(`${baseUrl}/api/applications/web-app/stats`);
    assert.equal(statsRes.status, 200);
    const stats = await statsRes.json();
    assert.equal(stats.totalViews, 1);
    assert.equal(stats.articles[0].articleId, 'a1');
    assert.equal(stats.articles[0].title, 'A Science Piece');
  } finally {
    server.close();
  }
});

test('POST /api/events rejects missing required fields', async () => {
  const { server, baseUrl } = await startServer();
  try {
    const res = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application: 'web-app' }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /articleId/);
  } finally {
    server.close();
  }
});

test('GET stats/article/author for unknown keys return 404', async () => {
  const { server, baseUrl } = await startServer();
  try {
    const stats = await fetch(`${baseUrl}/api/applications/unknown/stats`);
    assert.equal(stats.status, 404);

    const article = await fetch(`${baseUrl}/api/applications/unknown/articles/a1`);
    assert.equal(article.status, 404);

    const author = await fetch(`${baseUrl}/api/applications/unknown/authors/a`);
    assert.equal(author.status, 404);
  } finally {
    server.close();
  }
});

test('dashboard read endpoints: applications, overview, timeseries, locations, events', async () => {
  const { server, baseUrl } = await startServer();
  try {
    await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application: 'web-app', articleId: 'a1', articleTitle: 'A Science Piece', category: 'science', author: 'Jane Doe' }),
    });
    await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application: 'patrikaz', articleId: 'a1', articleTitle: 'A Science Piece', category: 'science', author: 'Jane Doe' }),
    });

    const apps = await (await fetch(`${baseUrl}/api/applications`)).json();
    assert.equal(apps.length, 2);

    const overviewAll = await (await fetch(`${baseUrl}/api/overview`)).json();
    assert.equal(overviewAll.totalViews, 2);
    assert.equal(overviewAll.applicationCount, 2);

    const overviewOne = await (await fetch(`${baseUrl}/api/overview?application=web-app`)).json();
    assert.equal(overviewOne.totalViews, 1);

    const overviewUnknown = await fetch(`${baseUrl}/api/overview?application=nope`);
    assert.equal(overviewUnknown.status, 404);

    const timeseries = await (await fetch(`${baseUrl}/api/timeseries?days=1`)).json();
    assert.equal(timeseries.series.length, 2);
    assert.equal(timeseries.series[0].points.length, 1);

    const locations = await (await fetch(`${baseUrl}/api/locations`)).json();
    assert.deepEqual(locations, [{ country: 'Unknown', views: 2 }]);

    const events = await (await fetch(`${baseUrl}/api/events?limit=1`)).json();
    assert.equal(events.length, 1);
    assert.equal(events[0].application, 'patrikaz');
  } finally {
    server.close();
  }
});

test('dashboard static assets are served', async () => {
  const { server, baseUrl } = await startServer();
  try {
    const index = await fetch(`${baseUrl}/`);
    assert.equal(index.status, 200);
    assert.match(index.headers.get('content-type') || '', /html/);

    const script = await fetch(`${baseUrl}/dashboard.js`);
    assert.equal(script.status, 200);

    const chartLib = await fetch(`${baseUrl}/vendor/chartjs/chart.umd.min.js`);
    assert.equal(chartLib.status, 200);
  } finally {
    server.close();
  }
});
