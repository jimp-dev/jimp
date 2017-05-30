// Karma configuration
// Generated on Sat Jan 28 2017 19:40:10 GMT-0300 (BRT)

var builder = require("./tools/browser-build.js");

module.exports = function (config) {
    config.set({

        browserDisconnectTimeout: 25000,
        browserNoActivityTimeout: 25000,

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: "",

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ["mocha"],

        // list of files / patterns to load in the browser
        files: [
            "*.js",
            process.env.TEST || "test/*.test.js",
            "test/test-helper.js",
            {pattern: "test/samples/**/*", watched: false, included: false, served: true},
            {pattern: "fonts/open-sans/**/*", watched: false, included: false, served: true}
        ],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            "*": "generic",
            "*/*": "generic"
        },

        genericPreprocessor: {
            rules: [{
                // Default generic processor
                process: function (content, file, done, log) {
                    log.debug("File "+ file.path +" should be in another bundle.");
                    done("/* File "+ file.path +" should be in another bundle */");
                }
            }, {
                match: "index.js",
                process: function (content, file, done, log) {
                    log.debug("Bundle Jimp.");
                    builder.bundleSimple(file.path, {}, done);
                }
            }, {
                match: "test/*.test.js",
                process: function (content, file, done, log) {
                    log.debug("Bundle Test "+ file.path +".");
                    builder.bundleSimple(file.path, {exclude: ["index.js"]}, done);
                }
            }]
        },

        // test results reporter to use
        // possible values: "dots", "progress"
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ["mocha-own"],
        // mochaOwnReporter: { reporter: "nyan" },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ["Firefox", "Chrome"],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    })
}
