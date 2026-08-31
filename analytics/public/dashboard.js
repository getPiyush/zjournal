(() => {
  'use strict';

  const CATEGORICAL = {
    light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'],
    dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
  };

  function isDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function theme() {
    const dark = isDark();
    return {
      dark,
      accent: dark ? '#3987e5' : '#2a78d6',
      categorical: dark ? CATEGORICAL.dark : CATEGORICAL.light,
      textSecondary: dark ? '#c3c2b7' : '#52514e',
      textMuted: '#898781',
      gridline: dark ? '#2c2c2a' : '#e1e0d9',
      surface: dark ? '#1a1a19' : '#fcfcfb',
      border: dark ? 'rgba(255,255,255,0.10)' : 'rgba(11,11,11,0.10)',
    };
  }

  // Stable color-per-application assignment, in first-seen order, so the same app is always
  // the same color across the "views by application" chart and the multi-line time series.
  const appColorOrder = [];
  function colorForApp(application) {
    let idx = appColorOrder.indexOf(application);
    if (idx === -1) {
      idx = appColorOrder.length;
      appColorOrder.push(application);
    }
    const palette = theme().categorical;
    return palette[idx % palette.length];
  }

  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    return res.json();
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [key, value] of Object.entries(attrs)) {
        if (key === 'class') node.className = value;
        else node.setAttribute(key, value);
      }
    }
    (children || []).forEach((child) => node.appendChild(child));
    return node;
  }

  function text(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = content;
    return node;
  }

  function formatDay(dateStr) {
    return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
  }

  function formatDateTime(iso) {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }

  function formatLocation(location) {
    if (!location) return 'Unknown';
    const parts = [location.city, location.country].filter(Boolean);
    return parts.length ? parts.join(', ') : 'Unknown';
  }

  function tooltipTheme(t) {
    return {
      backgroundColor: t.surface,
      titleColor: t.textSecondary,
      bodyColor: t.textSecondary,
      borderColor: t.border,
      borderWidth: 1,
      padding: 8,
      cornerRadius: 6,
      displayColors: false,
    };
  }

  const charts = {};
  function renderChart(id, config) {
    const canvas = document.getElementById(id);
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(canvas, config);
  }

  function truncate(str, max = 24) {
    return str && str.length > max ? `${str.slice(0, max - 1)}…` : str;
  }

  function rankingBarChart(id, fullLabels, values, cardId) {
    const t = theme();
    const card = cardId && document.getElementById(cardId);
    if (card) card.style.display = fullLabels.length ? '' : 'none';
    if (!fullLabels.length) {
      if (charts[id]) { charts[id].destroy(); delete charts[id]; }
      return;
    }
    renderChart(id, {
      type: 'bar',
      data: {
        labels: fullLabels.map((label) => truncate(label)),
        datasets: [{ data: values, backgroundColor: t.accent, borderRadius: 4, maxBarThickness: 22 }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { ...tooltipTheme(t), callbacks: { title: (items) => fullLabels[items[0].dataIndex] } },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { color: t.textMuted, precision: 0 },
            grid: { color: t.gridline },
            border: { color: t.gridline },
          },
          y: {
            ticks: { color: t.textSecondary },
            grid: { display: false },
            border: { color: t.gridline },
          },
        },
      },
    });
  }

  function timeSeriesChart(series) {
    const t = theme();
    if (!series.length || !series[0].points.length) {
      if (charts['chart-timeseries']) { charts['chart-timeseries'].destroy(); delete charts['chart-timeseries']; }
      return;
    }
    const labels = series[0].points.map((p) => formatDay(p.date));
    const multi = series.length > 1;
    const datasets = series.map((s) => {
      const color = multi ? colorForApp(s.application) : t.accent;
      return {
        label: s.application,
        data: s.points.map((p) => p.views),
        borderColor: color,
        backgroundColor: multi ? color : `${color}1A`,
        fill: !multi,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: color,
        tension: 0,
      };
    });

    renderChart('chart-timeseries', {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: multi, position: 'top', labels: { color: t.textSecondary, boxWidth: 12, usePointStyle: true } },
          tooltip: tooltipTheme(t),
        },
        scales: {
          x: {
            ticks: { color: t.textMuted, maxRotation: 0, autoSkip: true },
            grid: { display: false },
            border: { color: t.gridline },
          },
          y: {
            beginAtZero: true,
            ticks: { color: t.textMuted, precision: 0 },
            grid: { color: t.gridline },
            border: { color: t.gridline },
          },
        },
      },
    });
  }

  function byApplicationChart(applications, applicationFilter) {
    const card = document.getElementById('card-by-app');
    if (applicationFilter || applications.length < 2) {
      card.style.display = 'none';
      if (charts['chart-by-app']) { charts['chart-by-app'].destroy(); delete charts['chart-by-app']; }
      return;
    }
    card.style.display = '';
    const t = theme();
    renderChart('chart-by-app', {
      type: 'bar',
      data: {
        labels: applications.map((a) => a.application),
        datasets: [{
          data: applications.map((a) => a.totalViews),
          backgroundColor: applications.map((a) => colorForApp(a.application)),
          borderRadius: 4,
          maxBarThickness: 40,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: tooltipTheme(t) },
        scales: {
          x: { ticks: { color: t.textSecondary }, grid: { display: false }, border: { color: t.gridline } },
          y: { beginAtZero: true, ticks: { color: t.textMuted, precision: 0 }, grid: { color: t.gridline }, border: { color: t.gridline } },
        },
      },
    });
  }

  function renderStatTiles(stats, applicationCount) {
    const root = document.getElementById('stat-tiles');
    root.innerHTML = '';
    const tiles = [
      ['Total views', stats.totalViews],
      ['Articles tracked', stats.articles.length],
      ['Authors', stats.authors.length],
      ['Categories', stats.categories.length],
    ];
    if (applicationCount != null) tiles.push(['Applications', applicationCount]);
    for (const [label, value] of tiles) {
      root.appendChild(el('div', { class: 'stat-tile' }, [
        text('div', 'label', label),
        text('div', 'value', value.toLocaleString()),
      ]));
    }
  }

  function fillTable(tableId, rows, emptyColSpan, rowRenderer) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = '';
    if (!rows.length) {
      const tr = el('tr', { class: 'table-empty' }, [el('td', { colspan: String(emptyColSpan) }, [document.createTextNode('No data yet')])]);
      tbody.appendChild(tr);
      return;
    }
    rows.forEach((row) => tbody.appendChild(rowRenderer(row)));
  }

  function articleLabel(a) {
    return a.title || a.articleTitle || `(untitled - ${a.articleId})`;
  }

  function renderArticlesTable(articles) {
    fillTable('table-articles', articles.slice(0, 25), 6, (a) => el('tr', null, [
      text('td', '', articleLabel(a)),
      text('td', '', a.articleId),
      text('td', '', a.category || '-'),
      text('td', '', a.author || '-'),
      text('td', 'num', a.views.toLocaleString()),
      text('td', '', formatDateTime(a.lastViewedAt)),
    ]));
  }

  function renderAuthorsTable(authors) {
    fillTable('table-authors', authors.slice(0, 25), 3, (a) => el('tr', null, [
      text('td', '', a.author),
      text('td', 'num', a.views.toLocaleString()),
      text('td', 'num', String(a.articles.length)),
    ]));
  }

  function renderEventsTable(events) {
    fillTable('table-events', events, 6, (e) => el('tr', null, [
      text('td', '', formatDateTime(e.timestamp)),
      text('td', '', e.application),
      text('td', '', e.articleTitle || `(untitled - ${e.articleId})`),
      text('td', '', e.category || '-'),
      text('td', '', e.author || '-'),
      text('td', '', formatLocation(e.location)),
    ]));
  }

  let hasAnyData = false;

  async function refresh() {
    const application = document.getElementById('app-select').value;
    const days = Number(document.getElementById('days-select').value);

    const [applications, stats, timeseries, locations, events] = await Promise.all([
      fetchJSON('/api/applications'),
      fetchJSON(`/api/overview${application ? `?application=${encodeURIComponent(application)}` : ''}`),
      fetchJSON(`/api/timeseries?days=${days}${application ? `&application=${encodeURIComponent(application)}` : ''}`),
      fetchJSON(`/api/locations${application ? `?application=${encodeURIComponent(application)}` : ''}`),
      fetchJSON(`/api/events?limit=50${application ? `&application=${encodeURIComponent(application)}` : ''}`),
    ]);

    hasAnyData = applications.length > 0;
    document.getElementById('empty-state').hidden = hasAnyData;
    document.getElementById('app-root').style.display = 'block';
    document.querySelectorAll('.stat-tiles, .charts-grid, .tables-grid').forEach((section) => {
      section.style.display = hasAnyData ? '' : 'none';
    });
    if (!hasAnyData) return;

    // Keep the application selector in sync without clobbering the user's current choice.
    const select = document.getElementById('app-select');
    const previousValue = select.value;
    select.innerHTML = '';
    select.appendChild(el('option', { value: '' }, [document.createTextNode('All applications')]));
    applications.forEach((a) => {
      select.appendChild(el('option', { value: a.application }, [document.createTextNode(`${a.application} (${a.totalViews})`)]));
    });
    select.value = applications.some((a) => a.application === previousValue) ? previousValue : '';

    renderStatTiles(stats, application ? null : stats.applicationCount);
    timeSeriesChart(timeseries.series);
    byApplicationChart(applications, application);
    rankingBarChart('chart-top-articles', stats.articles.slice(0, 8).map((a) => articleLabel(a)), stats.articles.slice(0, 8).map((a) => a.views));
    rankingBarChart('chart-top-authors', stats.authors.slice(0, 8).map((a) => a.author), stats.authors.slice(0, 8).map((a) => a.views));
    rankingBarChart('chart-categories', stats.categories.slice(0, 8).map((c) => c.category), stats.categories.slice(0, 8).map((c) => c.views));
    rankingBarChart('chart-locations', locations.map((l) => l.country), locations.map((l) => l.views));

    renderArticlesTable(stats.articles);
    renderAuthorsTable(stats.authors);
    renderEventsTable(events);

    document.getElementById('last-updated').textContent = `Updated ${new Date().toLocaleTimeString()}`;
  }

  function init() {
    document.getElementById('app-select').addEventListener('change', refresh);
    document.getElementById('days-select').addEventListener('change', refresh);
    document.getElementById('refresh-btn').addEventListener('click', refresh);

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refresh);
    }

    refresh().catch((err) => console.error('analytics dashboard: failed to load', err));

    setInterval(() => {
      if (document.visibilityState === 'visible') {
        refresh().catch((err) => console.error('analytics dashboard: refresh failed', err));
      }
    }, 30000);
  }

  init();
})();
