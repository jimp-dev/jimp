import fileType from 'file-type';

import { PNG } from 'pngjs';
import JPEG from 'jpeg-js';
import BMP from 'bmp-js';
import UTIF from 'utif';
import EXIFParser from 'exif-parser';

import * as constants from '../constants';

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
export function parseBitmap(data, path, resolve, reject) {
    const mime = getMIMEFromBuffer(data, path);

    if (typeof mime !== 'string') {
        return reject(
            new Error('Could not find MIME for Buffer <' + path + '>')
        );
    }

    this._originalMime = mime.toLowerCase();

    switch (this.getMIME()) {
        case constants.MIME_PNG: {
            const png = new PNG();
            png.parse(data, (err, data) => {
                if (err) {
                    return reject(err);
                }

                this.bitmap = {
                    data: Buffer.from(data.data),
                    width: data.width,
                    height: data.height
                };

                return resolve(this);
            });
            break;
        }

        case constants.MIME_JPEG:
            try {
                this.bitmap = JPEG.decode(data);

                try {
                    this._exif = EXIFParser.create(data).parse();
                    exifRotate(this); // EXIF data
                } catch (err) {
                    /* meh */
                }

                return resolve(this);
            } catch (err) {
                return reject(err);
            }

        case constants.MIME_TIFF: {
            const ifds = UTIF.decode(data);
            const page = ifds[0];
            UTIF.decodeImages(data, ifds);
            const rgba = UTIF.toRGBA8(page);

            this.bitmap = {
                data: Buffer.from(rgba),
                width: page.t256[0],
                height: page.t257[0]
            };

            return resolve(this);
        }

        case constants.MIME_BMP:
        case constants.MIME_X_MS_BMP:
            this.bitmap = BMP.decode(data);
            return resolve(this);

        case constants.MIME_GIF:
            this.bitmap = getBitmapFromGIF(data);
            return resolve(this);

        default:
            return reject(new Error('Unsupported MIME type: ' + mime));
    }
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
 * @param mime the mime type of the image buffer to be created
 * @param cb a Node-style function to call with the buffer as the second argument
 * @returns this for chaining of methods
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

    console.log(mime, constants.MIME_PNG);
    switch (mime.toLowerCase()) {
        case constants.MIME_PNG: {
            const png = new PNG({
                width: this.bitmap.width,
                height: this.bitmap.height,
                bitDepth: 8,
                deflateLevel: this._deflateLevel,
                deflateStrategy: this._deflateStrategy,
                filterType: this._filterType,
                colorType: this._rgba ? 6 : 2,
                inputHasAlpha: true
            });

            if (this._rgba) {
                png.data = Buffer.from(this.bitmap.data);
            } else {
                // when PNG doesn't support alpha
                png.data = compositeBitmapOverBackground(
                    this.constructor,
                    this
                ).data;
            }

            const buffer = PNG.sync.write(png);
            return cb.call(this, null, buffer);
        }

        case constants.MIME_JPEG: {
            // composite onto a new image so that the background shows through alpha channels
            const jpeg = JPEG.encode(
                compositeBitmapOverBackground(this.constructor, this),
                this._quality
            );
            return cb.call(this, null, jpeg.data);
        }

        case constants.MIME_BMP:
        case constants.MIME_X_MS_BMP: {
            // composite onto a new image so that the background shows through alpha channels
            const bmp = BMP.encode(
                compositeBitmapOverBackground(this.constructor, this)
            );
            return cb.call(this, null, bmp.data);
        }

        case constants.MIME_TIFF: {
            const c = compositeBitmapOverBackground(this.constructor, this);
            const tiff = UTIF.encodeImage(c.data, c.width, c.height);
            return cb.call(this, null, Buffer.from(tiff));
        }

        default:
            return cb.call(this, 'Unsupported MIME type: ' + mime);
    }
}
