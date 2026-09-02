// Falls back to the page's own host (e.g. web-app served from http://192.168.0.198 talks to
// http://192.168.0.198:8080) rather than a hardcoded "localhost", since "localhost" would resolve
// to the *viewer's* machine instead of whatever host actually served the bundle. Overridable at
// build time via REACT_APP_SERVER_URL for setups where the API isn't co-located.
const defaultServerUrl =
  typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:8080` : "http://localhost:8080";

// Same reasoning as defaultServerUrl above, pointed at the analytics service's default port
// instead. Overridable at build time via REACT_APP_ANALYTICS_URL.
const defaultAnalyticsUrl =
  typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:4400` : "http://localhost:4400";

export const properties = {
    title: "My Journey by Piyush Praharaj",
    author: "Piyush Praharaj",
    startDate: "2025-02-01",
    appPassword: "JagaBaliaShreekhetra",
    fonts: [
      {
        font: "Source Serif 4",
        weights: [
          200,
          "200i",
          300,
          "300i",
          400,
          "400i",
          500,
          "500i",
          600,
          "600i",
          700,
          "700i",
          800,
          "800i",
          900,
          "900i",
        ],
      },
      {
        font: "Public Sans",
        weights: [
          200,
          "200i",
          300,
          "300i",
          400,
          "400i",
          500,
          "500i",
          600,
          "600i",
          700,
          "700i",
          800,
          "800i",
          900,
          "900i",
        ],
      },
      {
        font: "Noto Serif Display",
        weights: [
          200,
          "200i",
          300,
          "300i",
          400,
          "400i",
          500,
          "500i",
          600,
          "600i",
          700,
          "700i",
          800,
          "800i",
          900,
          "900i",
        ],
      },
      {
        font: "Merriweather",
        weights: [
          200,
          "200i",
          300,
          "300i",
          400,
          "400i",
          500,
          "500i",
          600,
          "600i",
          700,
          "700i",
          800,
          "800i",
          900,
          "900i",
        ],
      },
    ],
    // Same backend patrikaz (localhost/web) talks to; overridable via REACT_APP_SERVER_URL at build time.
    serverUrl: process.env.REACT_APP_SERVER_URL || defaultServerUrl,
    disableTextSelect: false,
    // Identifies this app as the "parent entity" when reporting article views to the
    // analytics service - keep this stable even if `title` above changes.
    applicationName: "web-app",
    analyticsUrl: process.env.REACT_APP_ANALYTICS_URL || defaultAnalyticsUrl,
  };