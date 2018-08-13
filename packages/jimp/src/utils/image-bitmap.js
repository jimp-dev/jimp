import fileType from 'file-type';

import EXIFParser from 'exif-parser';
import GIF from 'omggif';

import * as constants from '../constants';
import { toAGBR, fromAGBR } from './abgr';
import { throwError } from './error-checking';
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

// gets image data from a GIF buffer
function getBitmapFromGIF(data) {
    const gifObj = new GIF.GifReader(data);
    const gifData = Buffer.alloc(gifObj.width * gifObj.height * 4);

    gifObj.decodeAndBlitFrameRGBA(0, gifData);

    return {
        data: gifData,
        width: gifObj.width,
        height: gifObj.height
    };
}

/*
 * Automagically rotates an image based on its EXIF data (if present)
 * @param img a constants object
*/
function exifRotate(img) {
    const exif = img._exif;

    if (exif && exif.tags && exif.tags.Orientation) {
        switch (img._exif.tags.Orientation) {
            case 1: // Horizontal (normal)
                // do nothing
                break;
            case 2: // Mirror horizontal
                img.mirror(true, false);
                break;
            case 3: // Rotate 180
                img.rotate(180, false);
                break;
            case 4: // Mirror vertical
                img.mirror(false, true);
                break;
            case 5: // Mirror horizontal and rotate 270 CW
                img.rotate(-90, false).mirror(true, false);
                break;
            case 6: // Rotate 90 CW
                img.rotate(-90, false);
                break;
            case 7: // Mirror horizontal and rotate 90 CW
                img.rotate(90, false).mirror(true, false);
                break;
            case 8: // Rotate 270 CW
                img.rotate(-270, false);
                break;
            default:
                break;
        }
    }

    return img;
}

// parses a bitmap from the constructor to the JIMP bitmap property
export function parseBitmap(data, path, cb) {
    const mime = getMIMEFromBuffer(data, path);

    if (typeof mime !== 'string') {
        return cb(new Error('Could not find MIME for Buffer <' + path + '>'));
    }

    this._originalMime = mime.toLowerCase();

    try {
        switch (this.getMIME()) {
            case constants.MIME_PNG: {
                this.bitmap = this.constructor.decoders[constants.MIME_PNG](
                    data
                );

                break;
            }

            case constants.MIME_JPEG:
                this.bitmap = this.constructor.decoders[constants.MIME_JPEG](
                    data
                );

                try {
                    this._exif = EXIFParser.create(data).parse();
                    exifRotate(this); // EXIF data
                } catch (err) {
                    /* meh */
                }

                break;

            case constants.MIME_TIFF: {
                this.bitmap = this.constructor.decoders[constants.MIME_TIFF](
                    data
                );

                break;
            }

            case constants.MIME_BMP:
            case constants.MIME_X_MS_BMP:
                this.bitmap = this.constructor.decoders[constants.MIME_BMP](
                    data
                );

                break;

            case constants.MIME_GIF:
                this.bitmap = getBitmapFromGIF(data);
                break;

            default:
                return throwError.call(
                    this,
                    'Unsupported MIME type: ' + mime,
                    cb
                );
        }
    } catch (error) {
        cb.call(this, error, this);
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

    if (this._rgba) {
        this.bitmap.data = Buffer.from(this.bitmap.data);
    } else {
        // when format doesn't support alpha
        // composite onto a new image so that the background shows through alpha channels
        this.bitmap.data = compositeBitmapOverBackground(
            this.constructor,
            this
        ).data;
    }

    switch (mime.toLowerCase()) {
        case constants.MIME_PNG: {
            const buffer = this.constructor.encoders[constants.MIME_PNG](this);
            cb.call(this, null, buffer);
            break;
        }

        case constants.MIME_JPEG: {
            const buffer = this.constructor.encoders[constants.MIME_JPEG](this);
            cb.call(this, null, buffer);
            break;
        }

        case constants.MIME_BMP:
        case constants.MIME_X_MS_BMP: {
            const buffer = this.constructor.encoders[constants.MIME_BMP](this);
            cb.call(this, null, buffer);
            break;
        }

        case constants.MIME_TIFF: {
            const buffer = this.constructor.encoders[constants.MIME_TIFF](this);
            cb.call(this, null, buffer);
            break;
        }

        default:
            cb.call(this, 'Unsupported MIME type: ' + mime);
            break;
    }

    return this;
}

export function getBufferAsync(mime) {
    return promisify(getBuffer, this, mime);
}
