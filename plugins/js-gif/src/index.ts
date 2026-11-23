import { Buffer } from "buffer";
import GIF from "omggif";
import { Format } from "@jimp/types";
import { indexImage } from "./quantize.js";
import { writeGif } from "./writer.js";

export interface JPEGOptions {
  quality?: number;
}

export interface DecodeGifOptions {
  /**
   * Largest image, in megapixels, that will be decoded.
   * Larger images are rejected before any pixel memory is allocated.
   * @default 100
   */
  maxResolutionInMP?: number;
}

/**
 * GIF LZW codes are at most 12 bits, and an n-bit code can only refer to a
 * table entry shorter than 2^n pixels. So one bit of frame data decodes to
 * at most 4096 / 12 pixels.
 */
const MAX_PIXELS_PER_BYTE = (8 * 4096) / 12;

/**
 * omggif's reader only parses the descriptors, but decoding allocates
 * width * height * 4 bytes for the logical screen and width * height bytes
 * for the frame. Check those sizes before decoding.
 */
function validateGif(gif: GIF.GifReader, maxResolutionInMP: number) {
  const { width, height } = gif;
  const maxPixels = maxResolutionInMP * 1_000_000;

  if (width <= 0 || height <= 0) {
    throw new Error(`Invalid GIF dimensions ${width}x${height}`);
  }

  if (width * height > maxPixels) {
    throw new Error(
      `GIF dimensions ${width}x${height} exceed the maximum resolution of ${maxResolutionInMP} megapixels`
    );
  }

  if (gif.numFrames() === 0) {
    throw new Error("Invalid GIF file: no frames found");
  }

  const frame = gif.frameInfo(0);

  if (frame.width * frame.height > maxPixels) {
    throw new Error(
      `GIF frame dimensions ${frame.width}x${frame.height} exceed the maximum resolution of ${maxResolutionInMP} megapixels`
    );
  }

  if (frame.width * frame.height > frame.data_length * MAX_PIXELS_PER_BYTE) {
    throw new Error(
      `GIF data is too short for a frame of ${frame.width}x${frame.height}`
    );
  }
}

/** The logical screen and frame sizes are 16 bit fields */
const MAX_GIF_DIMENSION = 65535;

export default function gif() {
  return {
    mime: "image/gif",
    encode: (bitmap) => {
      const { width, height, data } = bitmap;

      if (width <= 0 || height <= 0) {
        throw new Error(`Invalid GIF dimensions ${width}x${height}`);
      }

      if (width > MAX_GIF_DIMENSION || height > MAX_GIF_DIMENSION) {
        throw new Error(
          `GIF dimensions ${width}x${height} exceed the maximum of ${MAX_GIF_DIMENSION}x${MAX_GIF_DIMENSION}`
        );
      }

      const gif = writeGif(width, height, indexImage(data, width, height));

      return Buffer.from(gif.buffer, gif.byteOffset, gif.byteLength);
    },
    decode: (data, { maxResolutionInMP = 100 }: DecodeGifOptions = {}) => {
      const gifObj = new GIF.GifReader(data);

      validateGif(gifObj, maxResolutionInMP);

      const gifData = Buffer.alloc(gifObj.width * gifObj.height * 4);

      gifObj.decodeAndBlitFrameRGBA(0, gifData);

      return {
        data: gifData,
        width: gifObj.width,
        height: gifObj.height,
      };
    },
  } satisfies Format<"image/gif">;
}
