// Karma configuration
// Generated on Sat Jan 28 2017 19:40:10 GMT-0300 (BRT)
const { execSync } = require("child_process");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const allowed = `?(${execSync("ls packages", { encoding: "utf8" })
  .trim()
  .split("\n")
  .join("|")})`;

module.exports = function (config) {
  config.set({
    browserDisconnectTimeout: 25000,
    browserNoActivityTimeout: 25000,

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["mocha", "webpack"],

    plugins: [
      "karma-webpack",
      "karma-mocha",
      "karma-mocha-reporter",
      "karma-chrome-launcher",
      "karma-firefox-launcher",
    ],

    logLevel: config.DEBUG,

    colors: true,

    webpack: {
      // For configuration
      // https://www.npmjs.com/package/karma-webpack
      target: "web",
      devtool: "inline-source-map",
      mode: "development",
      resolve: {
        fallback: {
          fs: false,
          path: require.resolve("path-browserify"),
        },
      },
      plugins: [new NodePolyfillPlugin()],
    },

    preprocessors: {
      [`packages/${allowed}/test/**/*.js`]: ["webpack"],
    },

    // list of files / patterns to load in the browser
    files: [
      `./packages/${allowed}/test/**/*.test.js`,
      {
        pattern: "packages/**/test/images/**/*",
        watched: false,
        included: false,
        served: true,
      },
      {
        pattern: "packages/plugin-print/fonts/**/*",
        watched: false,
        included: false,
        served: true,
      },
    ],

    proxies: {
      "/packages/plugin-print/fonts/": "/base/packages/plugin-print/fonts/",
    },

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ["Chrome", "Firefox"],
  });
};
