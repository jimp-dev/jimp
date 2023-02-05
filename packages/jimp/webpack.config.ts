import webpack from "webpack";
import path from "path";

const isProd = process.env.NODE_ENV === "production";

export default {
  mode: isProd ? "production" : "development",
  devtool: isProd ? "source-map" : "eval-cheap-module-source-map",
  entry: "./src/index.js",
  target: "web",
  resolve: {
    alias: {
      pngjs: "pngjs/browser",
    },
    fallback: {
      path: require.resolve("path-browserify"),
      fs: false,
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.browser": JSON.stringify("true"),
      "process.env.ENVIRONMENT": JSON.stringify("BROWSER"),
      "process.env.DIRNAME": JSON.stringify(""),
    }),
    new webpack.ProvidePlugin({
      process: "process/browser.js",
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ],
  output: {
    path: path.join(__dirname, "browser/lib"),
    filename: "jimp.js",
  },
} as webpack.Configuration;
