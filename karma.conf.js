// Karma configuration
// Generated on Sat Jan 28 2017 19:40:10 GMT-0300 (BRT)

const builder = require('./tools/browser-build.js');

module.exports = function(config) {
    config.set({
        browserDisconnectTimeout: 25000,
        browserNoActivityTimeout: 25000,

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha'],

        // list of files / patterns to load in the browser
        files: [
            '*.js',
            process.env.TEST || 'test/*.test.js',
            'test/test-helper.js',
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

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            '*': 'generic',
            '*/*': 'generic'
        },

        genericPreprocessor: {
            rules: [
                {
                    // Default generic processor
                    process(content, file, done, log) {
                        log.debug(
                            'File ' +
                                file.path +
                                ' should be in another bundle.'
                        );
                        done(
                            '/* File ' +
                                file.path +
                                ' should be in another bundle */'
                        );
                    }
                },
                {
                    match: 'index.js',
                    process(content, file, done, log) {
                        log.debug('Bundle Jimp.');
                        builder.bundleSimple(file.path, {}, done);
                    }
                },
                {
                    match: 'test/*.test.js',
                    process(content, file, done, log) {
                        log.debug('Bundle Test ' + file.path + '.');
                        builder.bundleSimple(
                            file.path,
                            { exclude: ['index.js'] },
                            done
                        );
                    }
                }
            ]
        },

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Firefox', 'Chrome']
    });
};
