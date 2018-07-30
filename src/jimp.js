// Browserify hack

if (
    process.env.BABEL_ENV === 'development' &&
    process.env.ENVIRONMENT !== 'BROWSER'
) {
    require('source-map-support').install();
}

// eslint-disable-next-line unicorn/import-index
module.exports = require('./index');
