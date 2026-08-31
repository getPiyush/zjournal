'use strict';

const crypto = require('crypto');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'analytics.json');

function emptyStore() {
  const now = new Date().toISOString();
  return {
    meta: { version: 1, createdAt: now, updatedAt: now },
    applications: {},
    events: [],
  };
}

function emptyApplication() {
  return { totalViews: 0, articles: {}, authors: {}, categories: {} };
}

/**
 * Keeps the whole store in memory and persists it as a single JSON file.
 * Writes are chained on `writeChain` so concurrent recordView() calls never
 * race each other to disk, and each write lands via a temp-file rename so a
 * crash mid-write can't leave analytics.json truncated or invalid JSON.
 */
class AnalyticsStore {
  constructor(filePath = DATA_FILE) {
    this.filePath = filePath;
    this.data = null;
    this.writeChain = Promise.resolve();
  }

  async load() {
    try {
      const raw = await fsp.readFile(this.filePath, 'utf8');
      this.data = raw.trim() ? JSON.parse(raw) : emptyStore();
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      this.data = emptyStore();
    }
    return this.data;
  }

  _ensureApplication(appName) {
    if (!this.data.applications[appName]) {
      this.data.applications[appName] = emptyApplication();
    }
    return this.data.applications[appName];
  }

  recordView({ application, articleId, articleTitle, category, author, ip, location }) {
    if (!this.data) throw new Error('Store not loaded - call load() first');

    const timestamp = new Date().toISOString();
    const event = {
      id: crypto.randomUUID(),
      timestamp,
      application,
      articleId,
      articleTitle: articleTitle || null,
      category,
      author,
      ip: ip || null,
      location: location || null,
    };
    this.data.events.push(event);

    const app = this._ensureApplication(application);
    app.totalViews += 1;

    const article = app.articles[articleId] || (app.articles[articleId] = {
      views: 0,
      title: articleTitle || null,
      category,
      author,
      firstViewedAt: timestamp,
      lastViewedAt: timestamp,
    });
    article.views += 1;
    article.title = articleTitle || article.title || null;
    article.category = category;
    article.author = author;
    article.lastViewedAt = timestamp;

    const authorEntry = app.authors[author] || (app.authors[author] = { views: 0, articles: [] });
    authorEntry.views += 1;
    if (!authorEntry.articles.includes(articleId)) authorEntry.articles.push(articleId);

    const categoryEntry = app.categories[category] || (app.categories[category] = { views: 0 });
    categoryEntry.views += 1;

    this.data.meta.updatedAt = timestamp;

    this._scheduleSave();
    return event;
  }

  getApplicationStats(appName) {
    const app = this.data.applications[appName];
    if (!app) return null;
    return {
      application: appName,
      totalViews: app.totalViews,
      articles: Object.entries(app.articles)
        .map(([articleId, v]) => ({ articleId, ...v }))
        .sort((a, b) => b.views - a.views),
      authors: Object.entries(app.authors)
        .map(([author, v]) => ({ author, ...v }))
        .sort((a, b) => b.views - a.views),
      categories: Object.entries(app.categories)
        .map(([category, v]) => ({ category, ...v }))
        .sort((a, b) => b.views - a.views),
    };
  }

  getArticleStats(appName, articleId) {
    const app = this.data.applications[appName];
    const article = app && app.articles[articleId];
    if (!article) return null;
    return { application: appName, articleId, ...article };
  }

  getAuthorStats(appName, author) {
    const app = this.data.applications[appName];
    const authorEntry = app && app.authors[author];
    if (!authorEntry) return null;
    return { application: appName, author, ...authorEntry };
  }

  /** One row per known application, most-viewed first - powers the app selector and the "views by application" chart. */
  listApplications() {
    return Object.entries(this.data.applications)
      .map(([application, app]) => ({ application, totalViews: app.totalViews }))
      .sort((a, b) => b.totalViews - a.totalViews);
  }

  /**
   * Merges every application's aggregates into one combined view, for the "All applications"
   * dashboard state. Articles/authors/categories are summed across apps when the same key
   * (e.g. an author byline) appears in more than one - a reasonable simplification since this
   * is a read-only rollup, not the source of truth (that's the per-application data).
   */
  getCombinedStats() {
    const combined = { totalViews: 0, articles: {}, authors: {}, categories: {} };

    for (const app of Object.values(this.data.applications)) {
      combined.totalViews += app.totalViews;

      for (const [articleId, v] of Object.entries(app.articles)) {
        const existing = combined.articles[articleId];
        combined.articles[articleId] = existing
          ? { ...existing, views: existing.views + v.views, lastViewedAt: v.lastViewedAt > existing.lastViewedAt ? v.lastViewedAt : existing.lastViewedAt }
          : { ...v };
      }

      for (const [author, v] of Object.entries(app.authors)) {
        const existing = combined.authors[author];
        combined.authors[author] = existing
          ? { views: existing.views + v.views, articles: Array.from(new Set([...existing.articles, ...v.articles])) }
          : { ...v };
      }

      for (const [category, v] of Object.entries(app.categories)) {
        const existing = combined.categories[category];
        combined.categories[category] = existing ? { views: existing.views + v.views } : { ...v };
      }
    }

    return {
      application: null,
      applicationCount: Object.keys(this.data.applications).length,
      totalViews: combined.totalViews,
      articles: Object.entries(combined.articles).map(([articleId, v]) => ({ articleId, ...v })).sort((a, b) => b.views - a.views),
      authors: Object.entries(combined.authors).map(([author, v]) => ({ author, ...v })).sort((a, b) => b.views - a.views),
      categories: Object.entries(combined.categories).map(([category, v]) => ({ category, ...v })).sort((a, b) => b.views - a.views),
    };
  }

  /**
   * Daily view counts for a trend line, one series per application (or just the requested one),
   * over a fixed trailing window. Every day in the window is present with 0 for no views, so a
   * quiet day is a dip in the line rather than a skipped point that misstates the slope.
   */
  getTimeSeries({ application, days = 30 } = {}) {
    const dayKeys = [];
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - (days - 1));
    for (let i = 0; i < days; i += 1) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      dayKeys.push(d.toISOString().slice(0, 10));
    }

    const targetApps = application ? [application] : Object.keys(this.data.applications);
    const counts = new Map(); // `${application}|${dayKey}` -> count

    for (const event of this.data.events) {
      if (application && event.application !== application) continue;
      const dayKey = event.timestamp.slice(0, 10);
      const mapKey = `${event.application}|${dayKey}`;
      counts.set(mapKey, (counts.get(mapKey) || 0) + 1);
    }

    return {
      days,
      series: targetApps.map((app) => ({
        application: app,
        points: dayKeys.map((date) => ({ date, views: counts.get(`${app}|${date}`) || 0 })),
      })),
    };
  }

  /** Top countries by view count (from geoip-resolved events), optionally scoped to one application. */
  getLocationBreakdown({ application, limit = 10 } = {}) {
    const counts = new Map();
    for (const event of this.data.events) {
      if (application && event.application !== application) continue;
      const country = (event.location && event.location.country) || 'Unknown';
      counts.set(country, (counts.get(country) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([country, views]) => ({ country, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  /** Most recent raw events (newest first), optionally scoped to one application. */
  getRecentEvents({ application, limit = 50 } = {}) {
    const filtered = application
      ? this.data.events.filter((event) => event.application === application)
      : this.data.events;
    return filtered.slice(-limit).reverse();
  }

  _scheduleSave() {
    this.writeChain = this.writeChain.then(() => this._save()).catch((err) => {
      console.error('analytics: failed to persist store', err);
    });
    return this.writeChain;
  }

  async _save() {
    const tmpFile = path.join(
      path.dirname(this.filePath),
      `.${path.basename(this.filePath)}.${process.pid}.tmp`,
    );
    await fsp.mkdir(path.dirname(this.filePath), { recursive: true });
    await fsp.writeFile(tmpFile, JSON.stringify(this.data, null, 2));
    await fsp.rename(tmpFile, this.filePath);
  }

  /** Awaits any in-flight/queued disk writes - mainly useful in tests. */
  async flush() {
    await this.writeChain;
  }
}

module.exports = { AnalyticsStore, DATA_FILE, emptyStore };
