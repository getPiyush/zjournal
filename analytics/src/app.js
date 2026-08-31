'use strict';

const path = require('path');
const express = require('express');
const { extractIp, locate } = require('./geo');

const REQUIRED_FIELDS = ['application', 'articleId', 'articleTitle', 'category', 'author'];

function createApp(store) {
  const app = express();

  // Called directly from the browser (web-app, patrikaz), which usually runs on a different
  // origin/port than this service - without these headers the browser's CORS preflight blocks
  // the request before it ever reaches the routes below. No cookies/credentials are involved,
  // so a wildcard origin is fine for this fire-and-forget beacon endpoint.
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/events', (req, res) => {
    const body = req.body || {};
    const missing = REQUIRED_FIELDS.filter((field) => !body[field]);
    if (missing.length) {
      res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}` });
      return;
    }

    const ip = extractIp(req);
    const location = locate(ip);
    const event = store.recordView({
      application: body.application,
      articleId: body.articleId,
      articleTitle: body.articleTitle,
      category: body.category,
      author: body.author,
      ip,
      location,
    });

    res.status(201).json(event);
  });

  app.get('/api/applications/:application/stats', (req, res) => {
    const stats = store.getApplicationStats(req.params.application);
    if (!stats) {
      res.status(404).json({ error: 'No views recorded for this application' });
      return;
    }
    res.json(stats);
  });

  app.get('/api/applications/:application/articles/:articleId', (req, res) => {
    const stats = store.getArticleStats(req.params.application, req.params.articleId);
    if (!stats) {
      res.status(404).json({ error: 'No views recorded for this article' });
      return;
    }
    res.json(stats);
  });

  app.get('/api/applications/:application/authors/:author', (req, res) => {
    const stats = store.getAuthorStats(req.params.application, req.params.author);
    if (!stats) {
      res.status(404).json({ error: 'No views recorded for this author' });
      return;
    }
    res.json(stats);
  });

  // --- Dashboard read endpoints -------------------------------------------------

  app.get('/api/applications', (req, res) => {
    res.json(store.listApplications());
  });

  app.get('/api/overview', (req, res) => {
    const { application } = req.query;
    if (application) {
      const stats = store.getApplicationStats(application);
      if (!stats) {
        res.status(404).json({ error: 'No views recorded for this application' });
        return;
      }
      res.json(stats);
      return;
    }
    res.json(store.getCombinedStats());
  });

  app.get('/api/timeseries', (req, res) => {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
    res.json(store.getTimeSeries({ application: req.query.application, days }));
  });

  app.get('/api/locations', (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    res.json(store.getLocationBreakdown({ application: req.query.application, limit }));
  });

  app.get('/api/events', (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 500);
    res.json(store.getRecentEvents({ application: req.query.application, limit }));
  });

  // --- Dashboard static assets ---------------------------------------------------

  app.use(
    '/vendor/chartjs',
    express.static(path.join(__dirname, '..', 'node_modules', 'chart.js', 'dist')),
  );
  app.use(express.static(path.join(__dirname, '..', 'public')));

  return app;
}

module.exports = { createApp };
