#!/usr/bin/env node
"use strict";

// Runs web-app + an API backend + analytics together, in dev mode.
// Usage: npm run dev -- --backend=node|php|java|python [--host]
const { spawn } = require("child_process");
const { backendCommand, parseFlags } = require("./lib/backends");

const { backend, host } = parseFlags(process.argv.slice(2));

try {
  backendCommand({ backend, host, prod: false }); // validate before spawning concurrently
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

// Talks to the web-app workspace directly (not the root "start" script) since
// root "start" itself runs this file - going through "start" here would recurse.
const serverFlags = `--backend=${backend}${host ? " --host" : ""}`;
const commands = [
  `npm run ${host ? "start:host" : "start"} --workspace=web-app`,
  `npm run server -- ${serverFlags}`,
  `npm run ${host ? "analytics:dev:host" : "analytics:dev"}`,
];

const child = spawn("npx", ["concurrently", ...commands], { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));
child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
