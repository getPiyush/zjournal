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
  serverUrl: process.env.SERVER_URL || "http://localhost:8080",
  disableTextSelect: false,
};
