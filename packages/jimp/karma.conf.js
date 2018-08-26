// Karma configuration
// Generated on Sat Jan 28 2017 19:40:10 GMT-0300 (BRT)

module.exports = function(config) {
  config.set({
    basePath: '../..',

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
      'packages/jimp/**/*.js': 'browserify'
    },

    // list of files / patterns to load in the browser
    files: [
      'packages/jimp/test/*.js',
      {
        pattern: 'packages/jimp/test/samples/**/*',
        watched: false,
        included: false,
        served: true
      },
      {
        pattern: 'packages/plugin-print/fonts/**/*',
        watched: false,
        included: false,
        served: true
      }
    ],

    proxies: {
      '/node_modules/@jimp/plugin-print/fonts/':
        '/base/packages/plugin-print/fonts/'
    },

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Firefox', 'Chrome'],

    reporters: ['mocha']
  });
};
