#!/usr/bin/env node
// Starts patrikaz (MFE + webpack serve + analytics) alongside a backend server at a given path.
// Usage: npm run start:server -- <path-to-server-dir | node|php|java|python> [--host]
//   npm run start:server -- ../server/java
//   npm run start:server -- java
//   npm run start:server -- java --host

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ALIASES = {
  node: "../server/node",
  php: "../server/php",
  java: "../server/java",
  python: "../server/python",
};

const DETECTORS = [
  {
    marker: "pom.xml",
    command: "./mvnw spring-boot:run",
    hostCommand: "./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.address=0.0.0.0",
  },
  {
    marker: "requirements.txt",
    command: ".venv/bin/uvicorn app.main:app --port 8080 --reload",
    hostCommand: ".venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload",
  },
  {
    marker: "index.php",
    command: "php -S localhost:8080",
    hostCommand: "php -S 0.0.0.0:8080",
  },
  {
    marker: "server.js",
    command: "node server.js -w --development",
    hostCommand: "node server.js -w --development",
  },
];

const args = process.argv.slice(2);
const isHostMode = args.includes("--host");
const input = args.find((arg) => arg !== "--host");

if (!input) {
  console.error(
    "Usage: npm run start:server -- <path-to-server-dir | node|php|java|python> [--host]\n" +
      "Examples:\n" +
      "  npm run start:server -- java\n" +
      "  npm run start:server -- ../server/python\n" +
      "  npm run start:server -- java --host"
  );
  process.exit(1);
}

const serverPath = path.resolve(__dirname, "..", ALIASES[input] || input);

if (!fs.existsSync(serverPath) || !fs.statSync(serverPath).isDirectory()) {
  console.error(`Server path not found: ${serverPath}`);
  process.exit(1);
}

const detected = DETECTORS.find((d) => fs.existsSync(path.join(serverPath, d.marker)));

if (!detected) {
  console.error(
    `Could not detect server type in ${serverPath} ` +
      `(expected one of: ${DETECTORS.map((d) => d.marker).join(", ")})`
  );
  process.exit(1);
}

const relativeServerPath = path.relative(process.cwd(), serverPath);
const command = isHostMode ? detected.hostCommand : detected.command;
const serverCommand = `cd ${JSON.stringify(relativeServerPath)} && ${command}`;

const concurrentlyBin = path.join(__dirname, "..", "node_modules", ".bin", "concurrently");

const mfeCommand = isHostMode ? "npm run mfe:start:host" : "npm run mfe:start";
const serveCommand = isHostMode ? "npm run serve:host" : "npm run serve";
const analyticsCommand = isHostMode ? "npm run analytics:dev:host" : "npm run analytics:dev";

const result = spawnSync(
  concurrentlyBin,
  [mfeCommand, serverCommand, serveCommand, analyticsCommand],
  { stdio: "inherit", shell: false }
);

process.exit(result.status ?? 1);
