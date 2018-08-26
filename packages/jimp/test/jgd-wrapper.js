import JGD from '../tools/jgd';

const Jimp =
  typeof window !== 'undefined' && window.Jimp
    ? window.Jimp
    : require('../src');

/**
 * Jimp constructor (from a JGD object)
 * @param data a JGD object containing the image data
 * @param cb a function to call when the image is parsed to a bitmap
 */
Jimp.appendConstructorOption(
  'build from JGD object',
  jgd =>
    typeof jgd === 'object' &&
    typeof jgd.width === 'number' &&
    typeof jgd.height === 'number' &&
    typeof jgd.data.length === 'number',
  function(resolve, reject, jgd) {
    // `this` points to a Jimp instance
    this.bitmap = JGD.decode(jgd);
    resolve();
  }
);

/**
 * Converts the image to a JGD object (sync fashion)
 * @returns {JGD}  JGD object
 */
Jimp.prototype.getJGDSync = function() {
  return JGD.encode(this.bitmap);
};

/**
 * Converts the image to a JGD object (async fashion)
 * @param {function(Error, Jimp)} cb a Node-style function to call with the buffer as the second argument
 * @returns {Jimp}  this for chaining of methods
 */
Jimp.prototype.getJGD = function() {
  return new Promise((resolve, reject) => {
    try {
      resolve(this.getJGDSync());
    } catch (err) {
      return reject(err);
    }
  });
};

module.exports = Jimp;
