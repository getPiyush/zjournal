// Falls back to the page's own host (e.g. patrikaz served from http://192.168.0.198 talks to
// http://192.168.0.198:8080) rather than a hardcoded "localhost", since "localhost" would resolve
// to the *viewer's* machine instead of whatever host actually served the bundle. Overridable at
// build time via SERVER_URL (see webpack.config.js) for setups where the API isn't co-located.
const defaultServerUrl =
  typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:8080` : "http://localhost:8080";

// Same reasoning as defaultServerUrl above, pointed at the analytics service's default port
// instead. Overridable at build time via ANALYTICS_URL (see webpack.config.js).
const defaultAnalyticsUrl =
  typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:4400` : "http://localhost:4400";

export const properties = {
  title: "Patrikaz",
  author: "Piyush Praharaj",
  startDate: "2025-02-01",
  appPassword: "JagaBaliaShreekhetra",
  fonts: [
    {
      font: "Source Serif 4",
      weights: [200, "200i", 300, "300i", 400, "400i", 500, "500i", 600, "600i", 700, "700i", 800, "800i", 900, "900i"],
    },
    {
      font: "Public Sans",
      weights: [200, "200i", 300, "300i", 400, "400i", 500, "500i", 600, "600i", 700, "700i", 800, "800i", 900, "900i"],
    },
    {
      font: "Noto Serif Display",
      weights: [200, "200i", 300, "300i", 400, "400i", 500, "500i", 600, "600i", 700, "700i", 800, "800i", 900, "900i"],
    },
    {
      font: "Merriweather",
      weights: [200, "200i", 300, "300i", 400, "400i", 500, "500i", 600, "600i", 700, "700i", 800, "800i", 900, "900i"],
    },
  ],
  // Same backend web-app (localhost/web) talks to; overridable via SERVER_URL at build time.
  serverUrl: process.env.SERVER_URL || defaultServerUrl,
  disableTextSelect: false,
  // Identifies this app as the "parent entity" when reporting article views to the
  // analytics service - keep this stable even if `title` above changes.
  applicationName: "patrikaz",
  analyticsUrl: process.env.ANALYTICS_URL || defaultAnalyticsUrl,
};
