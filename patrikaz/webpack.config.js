const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

module.exports = (_env, argv) => {
  const isProduction = argv.mode === "production";
  // `serve:host`/`start:host` pass --host explicitly (see package.json); plain `serve`/`start`
  // don't, so argv.host is only set in host mode.
  const isHostMode = Boolean(argv.host);

  // .env (see .env.example) pins REMOTE_UI_LIBRARY_URL/SERVER_URL to localhost for the
  // all-on-one-machine `npm start` dev workflow, where the page and both dev servers all really
  // are on localhost. Skip it for production builds (deployable anywhere) and for host mode
  // (the page is loaded by a *different* device, for which "localhost" means itself, not this
  // machine) — both cases should fall through to the runtime host-detection below instead.
  if (!isProduction && !isHostMode) {
    require("dotenv").config();
  }

  // No build-time "http://localhost:..." fallback for either remote on purpose: baking one in
  // would point every deployment at the *build machine's* localhost instead of wherever the
  // bundle actually ends up served from. REMOTE_UI_LIBRARY_URL/SERVER_URL still work as explicit
  // build-time overrides (e.g. for a remote that isn't co-located with patrikaz); otherwise both
  // fall back at runtime to the page's own host.
  const remoteUiLibraryUrl = process.env.REMOTE_UI_LIBRARY_URL;
  const serverUrl = process.env.SERVER_URL;

  // Module Federation resolves `remotes` at container-init time, so the URL has to be known
  // before any React code (and therefore properties.ts) runs. Without an explicit override, use
  // webpack's documented "promise remote" form to fetch remoteEntry.js from the page's own host
  // at runtime instead of a host baked in at build time.
  const zjournalUiLibraryRemote = remoteUiLibraryUrl
    ? `zjournalUiLibrary@${remoteUiLibraryUrl}/remoteEntry.js`
    : `promise new Promise(resolve => {
        const remoteUrl = window.location.protocol + "//" + window.location.hostname + ":3001/remoteEntry.js";
        const script = document.createElement("script");
        script.src = remoteUrl;
        script.onload = () => {
          const proxy = {
            get: (request) => window.zjournalUiLibrary.get(request),
            init: (arg) => {
              try {
                return window.zjournalUiLibrary.init(arg);
              } catch (e) {
                console.error("zjournalUiLibrary remote container already initialized", e);
              }
            },
          };
          resolve(proxy);
        };
        document.head.appendChild(script);
      })`;

  return {
    entry: "./src/index.tsx",
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "eval-source-map",
    devServer: {
      port: Number(process.env.PORT) || 3002,
      historyApiFallback: true,
      static: { directory: path.resolve(__dirname, "public") },
    },
    output: {
      path: path.resolve(__dirname, "build"),
      publicPath: "/",
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: "babel-loader",
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      new webpack.container.ModuleFederationPlugin({
        name: "patrikaz",
        remotes: {
          zjournalUiLibrary: zjournalUiLibraryRemote,
        },
        shared: {
          react: { singleton: true, requiredVersion: "18.3.1" },
          "react-dom": { singleton: true, requiredVersion: "18.3.1" },
          "react-router-dom": { singleton: true, requiredVersion: "6.21.2" },
          "styled-components": { singleton: true },
        },
      }),
      new webpack.DefinePlugin({
        "process.env.SERVER_URL": JSON.stringify(serverUrl),
      }),
      new HtmlWebpackPlugin({ template: "./public/index.html" }),
      new CopyWebpackPlugin({
        patterns: [{ from: "public/images", to: "images" }],
      }),
    ],
  };
};
