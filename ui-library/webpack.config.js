const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const pkg = require("./package.json");

const sharedVersions = { ...pkg.dependencies, ...pkg.peerDependencies };

module.exports = (_env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./src/mfe/index.ts",
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "eval-source-map",
    devServer: {
      port: 3001,
      historyApiFallback: true,
      headers: { "Access-Control-Allow-Origin": "*" },
    },
    output: {
      path: path.resolve(__dirname, "dist-mfe"),
      publicPath: "auto",
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
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: "zjournalUiLibrary",
        filename: "remoteEntry.js",
        exposes: {
          "./index": "./src/index.ts",
        },
        shared: {
          react: { singleton: true, requiredVersion: sharedVersions.react },
          "react-dom": { singleton: true, requiredVersion: sharedVersions["react-dom"] },
          "react-router-dom": { singleton: true, requiredVersion: sharedVersions["react-router-dom"] },
          "styled-components": { singleton: true, requiredVersion: sharedVersions["styled-components"] },
        },
      }),
      new HtmlWebpackPlugin({ template: "./public/index.html" }),
    ],
  };
};
