#!/usr/bin/env node
"use strict";

// Serves the production build + an API backend together, in production mode.
// Usage: npm run prod -- --backend=node|java|python   (php has no production mode)
const { spawn } = require("child_process");
const { backendCommand, parseFlags } = require("./lib/backends");

const { backend } = parseFlags(process.argv.slice(2));

try {
  backendCommand({ backend, host: false, prod: true }); // validate before spawning concurrently
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const commands = ["npm run prodrun", `npm run server -- --backend=${backend} --prod`];

const child = spawn("npx", ["concurrently", ...commands], { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));
child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
