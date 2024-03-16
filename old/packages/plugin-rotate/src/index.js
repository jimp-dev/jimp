import { isNodePattern, throwError } from "@jimp/utils";

/**
 * Rotates an image counter-clockwise by multiple of 90 degrees. NB: 'this' must be a Jimp object.
 *
 * This function is based on matrix rotation. Check this to get an initial idea how it works: https://stackoverflow.com/a/8664879/10561909
 *
 * @param {number} deg the number of degrees to rotate the image by, it should be a multiple of 90
 */
function matrixRotate(deg) {
  if (Math.abs(deg) % 90 !== 0) {
    throw new Error("Unsupported matrix rotation degree");
  }

  deg %= 360;
  if (Math.abs(deg) === 0) {
    // no rotation for 0, 360, -360, 720, -720, ...
    return;
  }

  const w = this.bitmap.width;
  const h = this.bitmap.height;

  // decide which rotation angle to use
  let angle;
  switch (deg) {
    // 90 degree & -270 degree are same
    case 90:
    case -270:
      angle = 90;
      break;

    case 180:
    case -180:
      angle = 180;
      break;

    case 270:
    case -90:
      angle = -90;
      break;

    default:
      throw new Error("Unsupported matrix rotation degree");
  }
  // After this switch block, angle will be 90, 180 or -90

  // calculate the new width and height
  const nW = angle === 180 ? w : h;
  const nH = angle === 180 ? h : w;

  const dstBuffer = Buffer.alloc(this.bitmap.data.length);

  // function to translate the x, y coordinate to the index of the pixel in the buffer
  function createIdxTranslationFunction(w, h) {
    return function (x, y) {
      return (y * w + x) << 2;
    };
  }

  const srcIdxFunction = createIdxTranslationFunction(w, h);
  const dstIdxFunction = createIdxTranslationFunction(nW, nH);

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const srcIdx = srcIdxFunction(x, y);
      const pixelRGBA = this.bitmap.data.readUInt32BE(srcIdx);

      let dstIdx;
      switch (angle) {
        case 90:
          dstIdx = dstIdxFunction(y, w - x - 1);
          break;
        case -90:
          dstIdx = dstIdxFunction(h - y - 1, x);
          break;
        case 180:
          dstIdx = dstIdxFunction(w - x - 1, h - y - 1);
          break;
        default:
          throw new Error("Unsupported matrix rotation angle");
      }

      dstBuffer.writeUInt32BE(pixelRGBA, dstIdx);
    }
  }

  this.bitmap.data = dstBuffer;
  this.bitmap.width = nW;
  this.bitmap.height = nH;
}

/**
 * Rotates an image counter-clockwise by an arbitrary number of degrees. NB: 'this' must be a Jimp object.
 * @param {number} deg the number of degrees to rotate the image by
 * @param {string|boolean} mode (optional) resize mode or a boolean, if false then the width and height of the image will not be changed
 */
function advancedRotate(deg, mode) {
  deg %= 360;
  const rad = (deg * Math.PI) / 180;
  const cosine = Math.cos(rad);
  const sine = Math.sin(rad);

  // the final width and height will change if resize == true
  let w = this.bitmap.width;
  let h = this.bitmap.height;

  if (mode === true || typeof mode === "string") {
    // resize the image to it maximum dimension and blit the existing image
    // onto the center so that when it is rotated the image is kept in bounds

    // http://stackoverflow.com/questions/3231176/how-to-get-size-of-a-rotated-rectangle
    // Plus 1 border pixel to ensure to show all rotated result for some cases.
    w =
      Math.ceil(
        Math.abs(this.bitmap.width * cosine) +
          Math.abs(this.bitmap.height * sine)
      ) + 1;
    h =
      Math.ceil(
        Math.abs(this.bitmap.width * sine) +
          Math.abs(this.bitmap.height * cosine)
      ) + 1;
    // Ensure destination to have even size to a better result.
    if (w % 2 !== 0) {
      w++;
    }

    if (h % 2 !== 0) {
      h++;
    }

    const c = this.cloneQuiet();
    this.scanQuiet(
      0,
      0,
      this.bitmap.width,
      this.bitmap.height,
      function (x, y, idx) {
        this.bitmap.data.writeUInt32BE(this._background, idx);
      }
    );

    const max = Math.max(w, h, this.bitmap.width, this.bitmap.height);
    this.resize(max, max, mode);

    this.blit(
      c,
      this.bitmap.width / 2 - c.bitmap.width / 2,
      this.bitmap.height / 2 - c.bitmap.height / 2
    );
  }

  const bW = this.bitmap.width;
  const bH = this.bitmap.height;
  const dstBuffer = Buffer.alloc(this.bitmap.data.length);

  function createTranslationFunction(deltaX, deltaY) {
    return function (x, y) {
      return {
        x: x + deltaX,
        y: y + deltaY,
      };
    };
  }

  const translate2Cartesian = createTranslationFunction(-(bW / 2), -(bH / 2));
  const translate2Screen = createTranslationFunction(
    bW / 2 + 0.5,
    bH / 2 + 0.5
  );

  for (let y = 1; y <= bH; y++) {
    for (let x = 1; x <= bW; x++) {
      const cartesian = translate2Cartesian(x, y);
      const source = translate2Screen(
        cosine * cartesian.x - sine * cartesian.y,
        cosine * cartesian.y + sine * cartesian.x
      );
      const dstIdx = (bW * (y - 1) + x - 1) << 2;

      if (source.x >= 0 && source.x < bW && source.y >= 0 && source.y < bH) {
        const srcIdx = ((bW * (source.y | 0) + source.x) | 0) << 2;
        const pixelRGBA = this.bitmap.data.readUInt32BE(srcIdx);
        dstBuffer.writeUInt32BE(pixelRGBA, dstIdx);
      } else {
        // reset off-image pixels
        dstBuffer.writeUInt32BE(this._background, dstIdx);
      }
    }
  }

  this.bitmap.data = dstBuffer;

  if (mode === true || typeof mode === "string") {
    // now crop the image to the final size
    const x = bW / 2 - w / 2;
    const y = bH / 2 - h / 2;
    this.crop(x, y, w, h);
  }
}

export default () => ({
  /**
   * Rotates the image counter-clockwise by a number of degrees. By default the width and height of the image will be resized appropriately.
   * @param {number} deg the number of degrees to rotate the image by
   * @param {string|boolean} mode (optional) resize mode or a boolean, if false then the width and height of the image will not be changed
   * @param {function(Error, Jimp)} cb (optional) a callback for when complete
   * @returns {Jimp} this for chaining of methods
   */
  rotate(deg, mode, cb) {
    // enable overloading
    if (typeof mode === "undefined" || mode === null) {
      // e.g. image.resize(120);
      // e.g. image.resize(120, null, cb);
      // e.g. image.resize(120, undefined, cb);
      mode = true;
    }

    if (typeof mode === "function" && typeof cb === "undefined") {
      // e.g. image.resize(120, cb);
      cb = mode;
      mode = true;
    }

    if (typeof deg !== "number") {
      return throwError.call(this, "deg must be a number", cb);
    }

    if (typeof mode !== "boolean" && typeof mode !== "string") {
      return throwError.call(this, "mode must be a boolean or a string", cb);
    }

    // use matrixRotate if the angle is a multiple of 90 degrees (eg: 180 or -90) and resize is allowed or not needed.
    const matrixRotateAllowed =
      deg % 90 === 0 &&
      (mode || this.bitmap.width === this.bitmap.height || deg % 180 === 0);

    if (matrixRotateAllowed) {
      matrixRotate.call(this, deg);
    } else {
      advancedRotate.call(this, deg, mode, cb);
    }

    if (isNodePattern(cb)) {
      cb.call(this, null, this);
    }

    return this;
  },
});
