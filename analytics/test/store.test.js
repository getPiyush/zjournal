'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { AnalyticsStore } = require('../src/store');

async function tmpFile() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'analytics-store-test-'));
  return path.join(dir, 'analytics.json');
}

test('recordView aggregates views by article, author and category', async () => {
  const store = new AnalyticsStore(await tmpFile());
  await store.load();

  store.recordView({ application: 'web-app', articleId: 'a1', category: 'science', author: 'Jane Doe', ip: '8.8.8.8', location: null });
  store.recordView({ application: 'web-app', articleId: 'a1', category: 'science', author: 'Jane Doe', ip: '8.8.8.8', location: null });
  store.recordView({ application: 'web-app', articleId: 'a2', category: 'tech', author: 'John Roe', ip: '8.8.8.8', location: null });
  await store.flush();

  const stats = store.getApplicationStats('web-app');
  assert.equal(stats.totalViews, 3);

  const a1 = stats.articles.find((a) => a.articleId === 'a1');
  assert.equal(a1.views, 2);
  assert.equal(a1.author, 'Jane Doe');

  const jane = stats.authors.find((a) => a.author === 'Jane Doe');
  assert.equal(jane.views, 2);
  assert.deepEqual(jane.articles, ['a1']);

  const science = stats.categories.find((c) => c.category === 'science');
  assert.equal(science.views, 2);
});

test('recordView stores and keeps the article title, defaulting missing titles to null', async () => {
  const store = new AnalyticsStore(await tmpFile());
  await store.load();

  const event = store.recordView({ application: 'web-app', articleId: 'a1', articleTitle: 'A Science Piece', category: 'science', author: 'Jane Doe', ip: null, location: null });
  assert.equal(event.articleTitle, 'A Science Piece');
  store.recordView({ application: 'web-app', articleId: 'a2', category: 'tech', author: 'John Roe', ip: null, location: null });
  await store.flush();

  const stats = store.getApplicationStats('web-app');
  const a1 = stats.articles.find((a) => a.articleId === 'a1');
  assert.equal(a1.title, 'A Science Piece');
  const a2 = stats.articles.find((a) => a.articleId === 'a2');
  assert.equal(a2.title, null);
});

test('separate applications keep independent aggregates', async () => {
  const store = new AnalyticsStore(await tmpFile());
  await store.load();

  store.recordView({ application: 'web-app', articleId: 'a1', category: 'science', author: 'Jane Doe', ip: null, location: null });
  store.recordView({ application: 'patrikaz', articleId: 'a1', category: 'science', author: 'Jane Doe', ip: null, location: null });
  await store.flush();

  assert.equal(store.getApplicationStats('web-app').totalViews, 1);
  assert.equal(store.getApplicationStats('patrikaz').totalViews, 1);
});

test('store persists to disk and reloads with the same aggregates', async () => {
  const file = await tmpFile();
  const store = new AnalyticsStore(file);
  await store.load();
  store.recordView({ application: 'patrikaz', articleId: 'x1', category: 'news', author: 'A. Writer', ip: null, location: null });
  await store.flush();

  const raw = await fs.readFile(file, 'utf8');
  assert.doesNotThrow(() => JSON.parse(raw));

  const reloaded = new AnalyticsStore(file);
  await reloaded.load();
  const stats = reloaded.getApplicationStats('patrikaz');
  assert.equal(stats.totalViews, 1);
  assert.equal(stats.articles[0].articleId, 'x1');
});

test('unknown application/article/author lookups return null', async () => {
  const store = new AnalyticsStore(await tmpFile());
  await store.load();

  assert.equal(store.getApplicationStats('nope'), null);
  assert.equal(store.getArticleStats('nope', 'a1'), null);
  assert.equal(store.getAuthorStats('nope', 'A'), null);
});

test('listApplications sorts by total views descending', async () => {
  const store = new AnalyticsStore(await tmpFile());
  await store.load();

  store.recordView({ application: 'web-app', articleId: 'a1', category: 'science', author: 'Jane Doe', ip: null, location: null });
  store.recordView({ application: 'patrikaz', articleId: 'a1', category: 'science', author: 'Jane Doe', ip: null, location: null });
  store.recordView({ application: 'patrikaz', articleId: 'a2', category: 'tech', author: 'John Roe', ip: null, location: null });
  await store.flush();

  assert.deepEqual(store.listApplications(), [
    { application: 'patrikaz', totalViews: 2 },
    { application: 'web-app', totalViews: 1 },
  ]);
});

test('getCombinedStats merges aggregates across every application', async () => {
  const store = new AnalyticsStore(await tmpFile());
  await store.load();

  store.recordView({ application: 'web-app', articleId: 'a1', category: 'science', author: 'Jane Doe', ip: null, location: null });
  store.recordView({ application: 'patrikaz', articleId: 'a1', category: 'science', author: 'Jane Doe', ip: null, location: null });
  store.recordView({ application: 'patrikaz', articleId: 'a2', category: 'tech', author: 'John Roe', ip: null, location: null });
  await store.flush();

  const combined = store.getCombinedStats();
  assert.equal(combined.totalViews, 3);
  assert.equal(combined.applicationCount, 2);

  // Same articleId in both apps is summed into one row rather than duplicated.
  const a1 = combined.articles.find((a) => a.articleId === 'a1');
  assert.equal(a1.views, 2);
  const jane = combined.authors.find((a) => a.author === 'Jane Doe');
  assert.equal(jane.views, 2);
  const science = combined.categories.find((c) => c.category === 'science');
  assert.equal(science.views, 2);
});

test('getTimeSeries fills every day in the window with 0 when there are no views', async () => {
  const store = new AnalyticsStore(await tmpFile());
  await store.load();

  store.recordView({ application: 'web-app', articleId: 'a1', category: 'science', author: 'Jane Doe', ip: null, location: null });
  await store.flush();

  const { days, series } = store.getTimeSeries({ application: 'web-app', days: 3 });
  assert.equal(days, 3);
  assert.equal(series.length, 1);
  assert.equal(series[0].points.length, 3);
  const todayKey = new Date().toISOString().slice(0, 10);
  const today = series[0].points.find((p) => p.date === todayKey);
  assert.equal(today.views, 1);
  const totalOtherDays = series[0].points.filter((p) => p.date !== todayKey).reduce((sum, p) => sum + p.views, 0);
  assert.equal(totalOtherDays, 0);
});

test('getTimeSeries without an application returns one series per known application', async () => {
  const store = new AnalyticsStore(await tmpFile());
  await store.load();

  store.recordView({ application: 'web-app', articleId: 'a1', category: 'science', author: 'Jane Doe', ip: null, location: null });
  store.recordView({ application: 'patrikaz', articleId: 'a1', category: 'science', author: 'Jane Doe', ip: null, location: null });
  await store.flush();

  const { series } = store.getTimeSeries({ days: 1 });
  assert.deepEqual(series.map((s) => s.application).sort(), ['patrikaz', 'web-app']);
});

test('getLocationBreakdown counts by country and falls back to Unknown', async () => {
  const store = new AnalyticsStore(await tmpFile());
  await store.load();

  store.recordView({ application: 'web-app', articleId: 'a1', category: 'science', author: 'Jane Doe', ip: '8.8.8.8', location: { country: 'US' } });
  store.recordView({ application: 'web-app', articleId: 'a2', category: 'tech', author: 'John Roe', ip: '8.8.8.8', location: { country: 'US' } });
  store.recordView({ application: 'web-app', articleId: 'a3', category: 'tech', author: 'John Roe', ip: '127.0.0.1', location: null });
  await store.flush();

  assert.deepEqual(store.getLocationBreakdown({ application: 'web-app' }), [
    { country: 'US', views: 2 },
    { country: 'Unknown', views: 1 },
  ]);
});

test('getRecentEvents returns newest first and respects the limit', async () => {
  const store = new AnalyticsStore(await tmpFile());
  await store.load();

  store.recordView({ application: 'web-app', articleId: 'a1', category: 'science', author: 'Jane Doe', ip: null, location: null });
  store.recordView({ application: 'web-app', articleId: 'a2', category: 'tech', author: 'John Roe', ip: null, location: null });
  await store.flush();

  const events = store.getRecentEvents({ limit: 1 });
  assert.equal(events.length, 1);
  assert.equal(events[0].articleId, 'a2');
});
