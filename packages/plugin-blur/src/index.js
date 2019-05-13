import { throwError, isNodePattern } from '@jimp/utils';
import { mulTable, shgTable } from './blur-tables';

/*
    Superfast Blur (0.5)
    http://www.quasimondo.com/BoxBlurForCanvas/FastBlur.js

    Copyright (c) 2011 Mario Klingemann

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.
*/

export default () => ({
  /**
   * A fast blur algorithm that produces similar effect to a Gaussian blur - but MUCH quicker
   * @param {number} r the pixel radius of the blur
   * @param {Object} dim (optional) the object containing the dimensions of the blur area
   * @param {number} dim.x the top left x coordinate of the blur area
   * @param {number} dim.y the top left y coordinate of the blur area
   * @param {number} dim.w the width of the blur area
   * @param {number} dim.h the height of the blur area
   * @param {function(Error, Jimp)} cb (optional) a callback for when complete
   * @returns {Jimp} this for chaining of methods
   */
  blur(r, dim, cb) {
    if (typeof r !== 'number')
      return throwError.call(this, 'r must be a number', cb);
    if (r < 1) return throwError.call(this, 'r must be greater than 0', cb);

    let rsum;
    let gsum;
    let bsum;
    let asum;
    let x;
    let y;
    let i;
    let p;
    let p1;
    let p2;
    let yp;
    let yi;
    let yw;
    let pa;

    const copy = this.cloneQuiet();

    if (typeof dim === 'function') cb = dim;
    const wm = copy.bitmap.width - 1;
    const hm = copy.bitmap.height - 1;

    const rad1 = r + 1;

    const mulSum = mulTable[r];
    const shgSum = shgTable[r];

    const red = [];
    const green = [];
    const blue = [];
    const alpha = [];

    const vmin = [];
    const vmax = [];

    let iterations = 2;

    while (iterations-- > 0) {
      yi = 0;
      yw = 0;

      for (y = 0; y < copy.bitmap.height; y++) {
        rsum = copy.bitmap.data[yw] * rad1;
        gsum = copy.bitmap.data[yw + 1] * rad1;
        bsum = copy.bitmap.data[yw + 2] * rad1;
        asum = copy.bitmap.data[yw + 3] * rad1;

        for (i = 1; i <= r; i++) {
          p = yw + ((i > wm ? wm : i) << 2);
          rsum += copy.bitmap.data[p++];
          gsum += copy.bitmap.data[p++];
          bsum += copy.bitmap.data[p++];
          asum += copy.bitmap.data[p];
        }

        for (x = 0; x < copy.bitmap.width; x++) {
          red[yi] = rsum;
          green[yi] = gsum;
          blue[yi] = bsum;
          alpha[yi] = asum;

          if (y === 0) {
            vmin[x] = ((p = x + rad1) < wm ? p : wm) << 2;
            vmax[x] = (p = x - r) > 0 ? p << 2 : 0;
          }

          p1 = yw + vmin[x];
          p2 = yw + vmax[x];

          rsum += copy.bitmap.data[p1++] - copy.bitmap.data[p2++];
          gsum += copy.bitmap.data[p1++] - copy.bitmap.data[p2++];
          bsum += copy.bitmap.data[p1++] - copy.bitmap.data[p2++];
          asum += copy.bitmap.data[p1] - copy.bitmap.data[p2];

          yi++;
        }
        yw += copy.bitmap.width << 2;
      }

      for (x = 0; x < copy.bitmap.width; x++) {
        yp = x;
        rsum = red[yp] * rad1;
        gsum = green[yp] * rad1;
        bsum = blue[yp] * rad1;
        asum = alpha[yp] * rad1;

        for (i = 1; i <= r; i++) {
          yp += i > hm ? 0 : copy.bitmap.width;
          rsum += red[yp];
          gsum += green[yp];
          bsum += blue[yp];
          asum += alpha[yp];
        }

        yi = x << 2;

        for (y = 0; y < copy.bitmap.height; y++) {
          pa = (asum * mulSum) >>> shgSum;
          copy.bitmap.data[yi + 3] = pa;

          // normalize alpha
          if (pa > 255) {
            copy.bitmap.data[yi + 3] = 255;
          }

          if (pa > 0) {
            pa = 255 / pa;
            copy.bitmap.data[yi] = ((rsum * mulSum) >>> shgSum) * pa;
            copy.bitmap.data[yi + 1] = ((gsum * mulSum) >>> shgSum) * pa;
            copy.bitmap.data[yi + 2] = ((bsum * mulSum) >>> shgSum) * pa;
          } else {
            copy.bitmap.data[yi + 2] = 0;
            copy.bitmap.data[yi + 1] = 0;
            copy.bitmap.data[yi] = 0;
          }

          if (x === 0) {
            vmin[y] = ((p = y + rad1) < hm ? p : hm) * copy.bitmap.width;
            vmax[y] = (p = y - r) > 0 ? p * copy.bitmap.width : 0;
          }

          p1 = x + vmin[y];
          p2 = x + vmax[y];

          rsum += red[p1] - red[p2];
          gsum += green[p1] - green[p2];
          bsum += blue[p1] - blue[p2];
          asum += alpha[p1] - alpha[p2];

          yi += copy.bitmap.width << 2;
        }
      }
    }

    if (typeof dim !== 'function' && typeof dim !== 'undefined') {
      if (dim.x + dim.w > this.bitmap.width)
        return throwError.call(
          this,
          'dimensions must be smaller than image',
          cb
        );
      if (dim.y + dim.h > this.bitmap.height)
        return throwError.call(
          this,
          'dimensions must be smaller than image',
          cb
        );
      this.scanQuiet(dim.x, dim.y, dim.w, dim.h, function(sx, sy, idx) {
        this.bitmap.data[idx] = copy.bitmap.data[idx];
        this.bitmap.data[idx + 1] = copy.bitmap.data[idx + 1];
        this.bitmap.data[idx + 2] = copy.bitmap.data[idx + 2];
        this.bitmap.data[idx + 3] = copy.bitmap.data[idx + 3];
      });
    } else {
      this.bitmap = copy.bitmap;
    }

    if (isNodePattern(cb)) {
      cb.call(this, null, this);
    }

    return this;
  }
});
