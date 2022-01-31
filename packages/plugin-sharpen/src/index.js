import { isNodePattern } from '@jimp/utils';

import Util from './modules/util';

export default () => ({
  class: {
    /**
     * Sharpen an image with a specific factor
     * @param {number} factor (optional) factor of sharpen, default 3, min 1, max 10
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp} this for chaining of methods
     */
    sharpen(factor, cb) {
      factor = Number(factor) || 3;

      Util.convolution(this.bitmap, 3, 3, [
        -factor / 16,
        -factor / 8,
        -factor / 16,
        -factor / 8,
        factor * 0.75 + 1,
        -factor / 8,
        -factor / 16,
        -factor / 8,
        -factor / 16
      ]);

      if (isNodePattern(cb)) {
        cb.call(this, null, this);
      }

      return this;
    }
  }
});
