import { throwError, isNodePattern } from '@jimp/utils';

import Sharpen from './modules/sharpen';

export default () => ({
  class: {
    /**
     * Sharpen the images with a specific factor
     * @param {number} mix factor of sharpen
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp} this for chaining of methods
     */
    sharpen(mix, cb) {
      Sharpen.simpleSharpen(this.bitmap, this.bitmap, mix);

      if (isNodePattern(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
  }
});
