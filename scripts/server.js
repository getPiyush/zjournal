#!/usr/bin/env node
"use strict";

// Runs a single API backend on its own.
// Usage: npm run server -- --backend=node|php|java|python [--host] [--prod]
const { spawn, spawnSync } = require("child_process");
const { backendCommand, parseFlags } = require("./lib/backends");

const { backend, host, prod } = parseFlags(process.argv.slice(2));

let cmd;
try {
  cmd = backendCommand({ backend, host, prod });
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

if (cmd.build) {
  const build = spawnSync(cmd.build.command, cmd.build.args, { cwd: cmd.cwd, stdio: "inherit" });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

const child = spawn(cmd.command, cmd.args, { cwd: cmd.cwd, stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));
child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
