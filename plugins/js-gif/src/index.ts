import { Buffer } from "buffer";
import { DecodedFrames, DecodeFramesOptions, Format } from "@jimp/types";
import { indexImage } from "./quantize.js";
import { drawFrames, readGif } from "./reader.js";
import { writeGif } from "./writer.js";

export interface DecodeGifOptions {
  /**
   * Largest image, in megapixels, that will be decoded.
   * Larger images are rejected before any pixel memory is allocated.
   * @default 100
   */
  maxResolutionInMP?: number;
}

/** The logical screen and frame sizes are 16 bit fields */
const MAX_GIF_DIMENSION = 65535;

/**
 * Decode frames and draw each over the previous ones, following their
 * disposal methods, so every frame is the full image shown at that point.
 */
function decodeGifFrames(
  data: Buffer,
  maxResolutionInMP: number,
  maxFrames: number
): DecodedFrames {
  const gif = readGif(data, maxFrames);
  const { width, height, frames } = gif;
  const maxPixels = maxResolutionInMP * 1_000_000;

  if (width <= 0 || height <= 0) {
    throw new Error(`Invalid GIF dimensions ${width}x${height}`);
  }

  for (const frame of frames) {
    if (frame.width * frame.height > maxPixels) {
      throw new Error(
        `GIF frame dimensions ${frame.width}x${frame.height} exceed the maximum resolution of ${maxResolutionInMP} megapixels`
      );
    }
  }

  if (width * height > maxPixels) {
    throw new Error(
      `GIF dimensions ${width}x${height} exceed the maximum resolution of ${maxResolutionInMP} megapixels`
    );
  }

  if (frames.length === 0) {
    throw new Error("Invalid GIF file: no frames found");
  }

  if (frames.length * width * height > maxPixels) {
    throw new Error(
      `GIF has ${frames.length} frames of ${width}x${height}, which together exceed the maximum resolution of ${maxResolutionInMP} megapixels. Decode fewer frames with maxFrames, or raise maxResolutionInMP`
    );
  }

  const decoded: DecodedFrames["frames"] = [];

  for (const image of drawFrames(data, gif)) {
    const frame = frames[decoded.length]!;
    const isLast = decoded.length === frames.length - 1;

    decoded.push({
      bitmap: {
        // Nothing draws on the last frame, so it can keep the image
        data: isLast
          ? Buffer.from(image.buffer, image.byteOffset, image.byteLength)
          : Buffer.from(image),
        width,
        height,
      },
      // GIF delays are in hundredths of a second
      delay: frame.delay * 10,
    });
  }

  return { frames: decoded, loop: gif.loop };
}

/** Throw for sizes a GIF can't store */
function validateDimensions(width: number, height: number) {
  if (width <= 0 || height <= 0) {
    throw new Error(`Invalid GIF dimensions ${width}x${height}`);
  }

  if (width > MAX_GIF_DIMENSION || height > MAX_GIF_DIMENSION) {
    throw new Error(
      `GIF dimensions ${width}x${height} exceed the maximum of ${MAX_GIF_DIMENSION}x${MAX_GIF_DIMENSION}`
    );
  }
}

/** Default time each frame of an animation is shown, in milliseconds */
const DEFAULT_DELAY = 100;

export interface EncodeGifFramesOptions {
  /**
   * How many times the animation repeats after it first plays, from 0 to
   * 65535. 0 repeats forever, `null` leaves out the loop extension, so the
   * animation plays once. Takes the `loop` that reading a GIF returns.
   * @default 0
   */
  loop?: number | null | undefined;
}

export default function gif() {
  return {
    mime: "image/gif",
    encode: (bitmap) => {
      const { width, height, data } = bitmap;

      validateDimensions(width, height);

      const gif = writeGif(
        width,
        height,
        [{ image: indexImage(data, width, height), delay: 8 }],
        0
      );

      return Buffer.from(gif.buffer, gif.byteOffset, gif.byteLength);
    },
    decode: (data, { maxResolutionInMP = 100 }: DecodeGifOptions = {}) =>
      decodeGifFrames(data, maxResolutionInMP, 1).frames[0]!.bitmap,
    /**
     * Decode every frame of an animated GIF. Each frame is the full image
     * shown at that point: frames that only cover part of the image are drawn
     * over the previous ones, following their disposal methods.
     * `maxResolutionInMP` limits the size of all frames together.
     */
    decodeFrames: (
      data,
      { maxResolutionInMP = 100 }: DecodeGifOptions = {},
      { maxFrames = Infinity }: DecodeFramesOptions = {}
    ) => decodeGifFrames(data, maxResolutionInMP, maxFrames),
    /**
     * Encode an animated GIF. Every frame must be the same size. Each one gets
     * its own palette of up to 256 colors, and is shown for its `delay`,
     * rounded to hundredths of a second (default 100ms).
     */
    encodeFrames: (frames, { loop = 0 }: EncodeGifFramesOptions = {}) => {
      const first = frames[0];

      if (!first) {
        throw new Error("Can't encode a GIF without frames");
      }

      const { width, height } = first.bitmap;

      validateDimensions(width, height);

      if (loop !== null && (typeof loop !== "number" || Number.isNaN(loop))) {
        throw new Error("loop must be a number, or null to play once");
      }

      const gifFrames = frames.map(({ bitmap, delay = DEFAULT_DELAY }, i) => {
        if (bitmap.width !== width || bitmap.height !== height) {
          throw new Error(
            `Every frame of a GIF must be the same size, but frame ${i} is ${bitmap.width}x${bitmap.height} and frame 0 is ${width}x${height}`
          );
        }

        return {
          image: indexImage(bitmap.data, width, height),
          delay: clamp(Math.round(delay / 10), 0, 65535),
        };
      });
      const gif = writeGif(
        width,
        height,
        gifFrames,
        loop === null ? null : clamp(Math.round(loop), 0, 65535)
      );

      return Buffer.from(gif.buffer, gif.byteOffset, gif.byteLength);
    },
  } satisfies Format<
    "image/gif",
    undefined,
    DecodeGifOptions,
    EncodeGifFramesOptions
  >;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
