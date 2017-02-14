Jimp = (typeof(window)!=="undefined" && window.Jimp) ? window.Jimp : require("..");
var JGD = require("../tools/jgd");

/**
 * Jimp constructor (from a JGD object)
 * @param data a JGD object containing the image data
 * @param cb a function to call when the image is parsed to a bitmap
 */
Jimp.appendConstructorOption(
    'build from JGD object',
    function test(jgd, userCallback, jimpConstructorCallback) {
        return ( "object"   == typeof jgd             ) &&
               ( "number"   == typeof jgd.width       ) &&
               ( "number"   == typeof jgd.height      ) &&
               ( "number"   == typeof jgd.data.length ) &&
               ( "function" == typeof userCallback    ) &&
               jimpConstructorCallback.itIsTheJimpConstructorCallback
    },
    function runner(jgd, userCallback, jimpConstructorCallback) {
        this.bitmap = JGD.decode(jgd);
        jimpConstructorCallback(null, userCallback);
    }
);

/**
 * Converts the image to a JGD object (sync fashion)
 * @returns JGD object
 */
Jimp.prototype.getJGDSync = function () {
    return JGD.encode(this.bitmap);
};

/**
 * Converts the image to a JGD object (async fashion)
 * @param cb a Node-style function to call with the buffer as the second argument
 * @returns this for chaining of methods
 */
Jimp.prototype.getJGD = function (cb) {
    var jgd, error;
    try {
        jgd = this.getJGDSync();
    } catch(err) {
        error = err;
    }
    cb(error, jgd);
    return this;
};

module.exports = Jimp;
