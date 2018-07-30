// Karma configuration
// Generated on Sat Jan 28 2017 19:40:10 GMT-0300 (BRT)

module.exports = function(config) {
    config.set({
        browserDisconnectTimeout: 25000,
        browserNoActivityTimeout: 25000,

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['browserify', 'mocha'],

        browserify: {
            debug: true,
            transform: ['babelify']
        },

        preprocessors: {
            '*': 'browserify',
            '*/*': 'browserify'
        },

        // list of files / patterns to load in the browser
        files: [
            'test/*.js',
            {
                pattern: 'test/samples/**/*',
                watched: false,
                included: false,
                served: true
            },
            {
                pattern: 'fonts/open-sans/**/*',
                watched: false,
                included: false,
                served: true
            }
        ],

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Firefox', 'Chrome'],

        reporters: ['mocha']
    });
};
