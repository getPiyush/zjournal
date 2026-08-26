const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
require("dotenv").config();

module.exports = (_env, argv) => {
  const isProduction = argv.mode === "production";

  const remoteUiLibraryUrl = process.env.REMOTE_UI_LIBRARY_URL || "http://localhost:3001";
  const serverUrl = process.env.SERVER_URL || "http://localhost:8080";

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
          zjournalUiLibrary: `zjournalUiLibrary@${remoteUiLibraryUrl}/remoteEntry.js`,
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
