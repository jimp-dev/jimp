/* global XMLHttpRequest */

if ((
        process.env.ENVIRONMENT === "BROWSER"
    ) || (
        typeof process.versions.electron !== "undefined" &&
        process.type === 'renderer' &&
        typeof XMLHttpRequest === "function"
    )) {
    // If we run into a browser or the electron renderer process,
    // use XHR method instead of Request node module.

    module.exports = function (url, cb) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "arraybuffer";
        xhr.onload = function () {
            if (xhr.status < 400) {
                try {
                    var data = Buffer.from(this.response);
                } catch (err) {
                    return cb(Error("Response is not a buffer for url " + url +
                                    ". Error: " + err.message));
                }
                cb(null, xhr, data);
            } else cb(Error("HTTP Status " + xhr.status + " for url "+url));
        };
        xhr.onerror = function (e) {
            cb(e);
        };
        xhr.send();
    };
} else {
    module.exports = function (url, cb) {
        var p = require("phin");

        p({
            "url": url,
            "compression": true
        }, function (err, res) {
            if (err === null) {
                cb(null, res, res.body);
            } else {
                cb(err);
            }
        });
    }
}
