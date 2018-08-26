import { throwError, isNodePattern } from '@jimp/utils';

export default () => ({
  /**
   * Blits a source image on to this image
   * @param {Jimp} src the source Jimp instance
   * @param {number} x the x position to blit the image
   * @param {number} y the y position to blit the image
   * @param {number} srcx (optional) the x position from which to crop the source image
   * @param {number} srcy (optional) the y position from which to crop the source image
   * @param {number} srcw (optional) the width to which to crop the source image
   * @param {number} srch (optional) the height to which to crop the source image
   * @param {function(Error, Jimp)} cb (optional) a callback for when complete
   * @returns {Jimp} this for chaining of methods
   */
  blit(src, x, y, srcx, srcy, srcw, srch, cb) {
    if (!(src instanceof this.constructor)) {
      return throwError.call(this, 'The source must be a Jimp image', cb);
    }

    if (typeof x !== 'number' || typeof y !== 'number') {
      return throwError.call(this, 'x and y must be numbers', cb);
    }

    if (typeof srcx === 'function') {
      cb = srcx;
      srcx = 0;
      srcy = 0;
      srcw = src.bitmap.width;
      srch = src.bitmap.height;
    } else if (
      typeof srcx === typeof srcy &&
      typeof srcy === typeof srcw &&
      typeof srcw === typeof srch
    ) {
      srcx = srcx || 0;
      srcy = srcy || 0;
      srcw = srcw || src.bitmap.width;
      srch = srch || src.bitmap.height;
    } else {
      return throwError.call(
        this,
        'srcx, srcy, srcw, srch must be numbers',
        cb
      );
    }

    // round input
    x = Math.round(x);
    y = Math.round(y);

    // round input
    srcx = Math.round(srcx);
    srcy = Math.round(srcy);
    srcw = Math.round(srcw);
    srch = Math.round(srch);

    const maxw = this.bitmap.width;
    const maxh = this.bitmap.height;
    const baseImage = this;

    src.scanQuiet(srcx, srcy, srcw, srch, function(sx, sy, idx) {
      if (
        x + sx >= 0 &&
        y + sy >= 0 &&
        maxw - x - sx > 0 &&
        maxh - y - sy > 0
      ) {
        const dstIdx = baseImage.getPixelIndex(x + sx - srcx, y + sy - srcy);
        baseImage.bitmap.data[dstIdx] = this.bitmap.data[idx];
        baseImage.bitmap.data[dstIdx + 1] = this.bitmap.data[idx + 1];
        baseImage.bitmap.data[dstIdx + 2] = this.bitmap.data[idx + 2];
        baseImage.bitmap.data[dstIdx + 3] = this.bitmap.data[idx + 3];
      }
    });

    if (isNodePattern(cb)) {
      cb.call(this, null, this);
    }

    return this;
  }
});
