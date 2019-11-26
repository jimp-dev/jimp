// Karma configuration
// Generated on Sat Jan 28 2017 19:40:10 GMT-0300 (BRT)
const { execSync } = require('child_process');

const allowed = `?(${execSync('ls packages', { encoding: 'utf8' })
  .trim()
  .split('\n')
  .join('|')})`;

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
      [`packages/${allowed}/test/**/*.js`]: 'browserify'
    },

    // list of files / patterns to load in the browser
    files: [
      `./packages/${allowed}/test/**/*.test.js`,
      {
        pattern: 'packages/**/test/images/**/*',
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
      '/packages/plugin-print/fonts/': '/base/packages/plugin-print/fonts/'
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
