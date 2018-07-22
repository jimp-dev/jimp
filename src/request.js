/* global XMLHttpRequest */

if (
    process.env.ENVIRONMENT === 'BROWSER' ||
    (typeof process.versions.electron !== 'undefined' &&
        process.type === 'renderer' &&
        typeof XMLHttpRequest === 'function')
) {
    // If we run into a browser or the electron renderer process,
    // use XHR method instead of Request node module.

    module.exports = function(url, cb) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.addEventListener('load', function() {
            if (xhr.status < 400) {
                try {
                    const data = Buffer.from(this.response);
                    cb(null, xhr, data);
                } catch (err) {
                    return cb(
                        new Error(
                            'Response is not a buffer for url ' +
                                url +
                                '. Error: ' +
                                err.message
                        )
                    );
                }
            } else {
                cb(new Error('HTTP Status ' + xhr.status + ' for url ' + url));
            }
        });
        xhr.addEventListener('error', e => {
            cb(e);
        });
        xhr.send();
    };
} else {
    module.exports = function(url, cb) {
        const p = require('phin');

        p(
            {
                url,
                compression: true
            },
            (err, res) => {
                if (err === null) {
                    cb(null, res, res.body);
                } else {
                    cb(err);
                }
            }
        );
    };
}
