import configure from '@jimp/custom';
import { PNG } from 'pngjs';

import JGD from './jgd';

function configureJimp() {
  return configure({
    types: [
      () => ({
        mime: { 'image/png': ['png'] },

        constants: {
          MIME_PNG: 'image/png'
        },

        hasAlpha: { 'image/png': true },
        decoders: { 'image/png': PNG.sync.read },
        encoders: {
          'image/png': data => {
            const png = new PNG({
              width: data.bitmap.width,
              height: data.bitmap.height,
              bitDepth: 8,
              deflateLevel: data._deflateLevel,
              deflateStrategy: data._deflateStrategy,
              filterType: data._filterType,
              colorType: data._rgba ? 6 : 2,
              inputHasAlpha: true
            });

            png.data = data.bitmap.data;

            return PNG.sync.write(png);
          }
        }
      })
    ]
  });
}

const Jimp =
  typeof window !== 'undefined' && window.Jimp ? window.Jimp : configureJimp();

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
    } catch (error) {
      return reject(error);
    }
  });
};

export default Jimp;
