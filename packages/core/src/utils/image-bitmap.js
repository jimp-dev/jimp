import fileType from 'file-type';

import EXIFParser from 'exif-parser';
import { throwError } from '@jimp/utils';

import * as constants from '../constants';
import * as MIME from './mime';
import promisify from './promisify';

function getMIMEFromBuffer(buffer, path) {
  const fileTypeFromBuffer = fileType(buffer);

  if (fileTypeFromBuffer) {
    // If fileType returns something for buffer, then return the mime given
    return fileTypeFromBuffer.mime;
  }

  if (path) {
    // If a path is supplied, and fileType yields no results, then retry with MIME
    // Path can be either a file path or a url
    return MIME.getType(path);
  }

  return null;
}

/*
 * Obtains image orientation from EXIF metadata.
 *
 * @param img {Jimp} a Jimp image object
 * @returns {number} a number 1-8 representing EXIF orientation,
 *          in particular 1 if orientation tag is missing
 */
function getExifOrientation(img) {
  return (img._exif && img._exif.tags && img._exif.tags.Orientation) || 1;
}

/**
 * Returns a function which translates EXIF-rotated coordinates into
 * non-rotated ones.
 *
 * Transformation reference: http://sylvana.net/jpegcrop/exif_orientation.html.
 *
 * @param img {Jimp} a Jimp image object
 * @returns {function} transformation function for transformBitmap().
 */
function getExifOrientationTransformation(img) {
  const w = img.getWidth();
  const h = img.getHeight();

  switch (getExifOrientation(img)) {
    case 1: // Horizontal (normal)
      // does not need to be supported here
      return null;

    case 2: // Mirror horizontal
      return function(x, y) {
        return [w - x - 1, y];
      };

    case 3: // Rotate 180
      return function(x, y) {
        return [w - x - 1, h - y - 1];
      };

    case 4: // Mirror vertical
      return function(x, y) {
        return [x, h - y - 1];
      };

    case 5: // Mirror horizontal and rotate 270 CW
      return function(x, y) {
        return [y, x];
      };

    case 6: // Rotate 90 CW
      return function(x, y) {
        return [y, h - x - 1];
      };

    case 7: // Mirror horizontal and rotate 90 CW
      return function(x, y) {
        return [w - y - 1, h - x - 1];
      };

    case 8: // Rotate 270 CW
      return function(x, y) {
        return [w - y - 1, x];
      };

    default:
      return null;
  }
}

/*
 * Transforms bitmap in place (moves pixels around) according to given
 * transformation function.
 *
 * @param img {Jimp} a Jimp image object, which bitmap is supposed to
 *        be transformed
 * @param width {number} bitmap width after the transformation
 * @param height {number} bitmap height after the transformation
 * @param transformation {function} transformation function which defines pixel
 *        mapping between new and source bitmap. It takes a pair of coordinates
 *        in the target, and returns a respective pair of coordinates in
 *        the source bitmap, i.e. has following form:
 *        `function(new_x, new_y) { return [src_x, src_y] }`.
 */
function transformBitmap(img, width, height, transformation) {
  // Underscore-prefixed values are related to the source bitmap
  // Their counterparts with no prefix are related to the target bitmap
  const _data = img.bitmap.data;
  const _width = img.bitmap.width;

  const data = Buffer.alloc(_data.length);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const [_x, _y] = transformation(x, y);

      const idx = (width * y + x) << 2;
      const _idx = (_width * _y + _x) << 2;

      const pixel = _data.readUInt32BE(_idx);
      data.writeUInt32BE(pixel, idx);
    }
  }

  img.bitmap.data = data;
  img.bitmap.width = width;
  img.bitmap.height = height;
}

/*
 * Automagically rotates an image based on its EXIF data (if present).
 * @param img {Jimp} a Jimp image object
 */
function exifRotate(img) {
  if (getExifOrientation(img) < 2) return;

  const transformation = getExifOrientationTransformation(img);
  const swapDimensions = getExifOrientation(img) > 4;

  const newWidth = swapDimensions ? img.bitmap.height : img.bitmap.width;
  const newHeight = swapDimensions ? img.bitmap.width : img.bitmap.height;

  transformBitmap(img, newWidth, newHeight, transformation);
}

// parses a bitmap from the constructor to the JIMP bitmap property
export function parseBitmap(data, path, cb) {
  const mime = getMIMEFromBuffer(data, path);

  if (typeof mime !== 'string') {
    return cb(new Error('Could not find MIME for Buffer <' + path + '>'));
  }

  this._originalMime = mime.toLowerCase();

  try {
    const mime = this.getMIME();

    if (this.constructor.decoders[mime]) {
      this.bitmap = this.constructor.decoders[mime](data);
    } else {
      return throwError.call(this, 'Unsupported MIME type: ' + mime, cb);
    }
  } catch (error) {
    return cb.call(this, error, this);
  }

  try {
    this._exif = EXIFParser.create(data).parse();
    exifRotate(this); // EXIF data
  } catch (error) {
    /* meh */
  }

  cb.call(this, null, this);

  return this;
}

function compositeBitmapOverBackground(Jimp, image) {
  return new Jimp(
    image.bitmap.width,
    image.bitmap.height,
    image._background
  ).composite(image, 0, 0).bitmap;
}

/**
 * Converts the image to a buffer
 * @param {string} mime the mime type of the image buffer to be created
 * @param {function(Error, Jimp)} cb a Node-style function to call with the buffer as the second argument
 * @returns {Jimp} this for chaining of methods
 */
export function getBuffer(mime, cb) {
  if (mime === constants.AUTO) {
    // allow auto MIME detection
    mime = this.getMIME();
  }

  if (typeof mime !== 'string') {
    return throwError.call(this, 'mime must be a string', cb);
  }

  if (typeof cb !== 'function') {
    return throwError.call(this, 'cb must be a function', cb);
  }

  mime = mime.toLowerCase();

  if (this._rgba && this.constructor.hasAlpha[mime]) {
    this.bitmap.data = Buffer.from(this.bitmap.data);
  } else {
    // when format doesn't support alpha
    // composite onto a new image so that the background shows through alpha channels
    this.bitmap.data = compositeBitmapOverBackground(
      this.constructor,
      this
    ).data;
  }

  if (this.constructor.encoders[mime]) {
    const buffer = this.constructor.encoders[mime](this);
    cb.call(this, null, buffer);
  } else {
    cb.call(this, 'Unsupported MIME type: ' + mime);
  }

  return this;
}

export function getBufferAsync(mime) {
  return promisify(getBuffer, this, mime);
}
