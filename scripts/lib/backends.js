"use strict";

const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..", "..");

// Builds the { cwd, command, args } for one backend/mode combo, and throws a
// readable error for combos the underlying server doesn't actually support
// (e.g. PHP's built-in server has no production mode).
function backendCommand({ backend, host, prod }) {
  switch (backend) {
    case "node":
      return {
        cwd: path.join(REPO_ROOT, "server", "node"),
        command: "node",
        args: ["server.js", "-w", prod ? "--production" : "--development"],
      };

    case "php":
      if (prod) {
        throw new Error(
          "PHP has no production mode: its built-in server (`php -S`) is dev-only. " +
            "Deploy it behind Apache/PHP-FPM for production instead."
        );
      }
      return {
        cwd: path.join(REPO_ROOT, "server", "php"),
        command: "php",
        args: ["-S", host ? "0.0.0.0:8080" : "localhost:8080"],
      };

    case "java":
      if (prod) {
        if (host) {
          throw new Error("The Java production jar does not support --host binding yet.");
        }
        return {
          cwd: path.join(REPO_ROOT, "server", "java"),
          command: "java",
          args: ["-jar", "target/zjournal-server-0.0.1-SNAPSHOT.jar"],
          build: { command: "./mvnw", args: ["-q", "-DskipTests", "clean", "package"] },
        };
      }
      return {
        cwd: path.join(REPO_ROOT, "server", "java"),
        command: "./mvnw",
        args: [
          "spring-boot:run",
          ...(host ? ["-Dspring-boot.run.arguments=--server.address=0.0.0.0"] : []),
        ],
      };

    case "python":
      if (prod && host) {
        throw new Error("The Python production server does not support --host binding yet.");
      }
      return {
        cwd: path.join(REPO_ROOT, "server", "python"),
        command: ".venv/bin/uvicorn",
        args: [
          "app.main:app",
          ...(host ? ["--host", "0.0.0.0"] : []),
          "--port",
          "8080",
          ...(prod ? [] : ["--reload"]),
        ],
      };

    default:
      throw new Error(`Unknown --backend "${backend}". Choose one of: node, php, java, python.`);
  }
}

function parseFlags(argv) {
  const backendArg = argv.find((a) => a.startsWith("--backend="));
  return {
    backend: backendArg ? backendArg.split("=")[1] : "node",
    host: argv.includes("--host"),
    prod: argv.includes("--prod"),
  };
}

module.exports = { backendCommand, parseFlags, REPO_ROOT };
