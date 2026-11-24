import { Buffer } from "buffer";
import GIF from "omggif";
import { DecodedFrames, DecodeFramesOptions, Format } from "@jimp/types";
import { indexImage } from "./quantize.js";
import { writeGif } from "./writer.js";

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
 * for each frame. Check those sizes before decoding.
 */
function readGif(data: Buffer, maxResolutionInMP: number) {
  const gif = new GIF.GifReader(data);
  const { width, height } = gif;

  if (width <= 0 || height <= 0) {
    throw new Error(`Invalid GIF dimensions ${width}x${height}`);
  }

  if (width * height > maxResolutionInMP * 1_000_000) {
    throw new Error(
      `GIF dimensions ${width}x${height} exceed the maximum resolution of ${maxResolutionInMP} megapixels`
    );
  }

  if (gif.numFrames() === 0) {
    throw new Error("Invalid GIF file: no frames found");
  }

  return gif;
}

function validateFrame(frame: GIF.Frame, maxResolutionInMP: number) {
  if (frame.width * frame.height > maxResolutionInMP * 1_000_000) {
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

/** GIF disposal methods: what happens to a frame before the next is drawn */
const DISPOSE_TO_BACKGROUND = 2;
const DISPOSE_TO_PREVIOUS = 3;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Copy a rectangle out of an RGBA canvas */
function readRect(canvas: Buffer, canvasWidth: number, rect: Rect) {
  const rowBytes = rect.width * 4;
  const pixels = Buffer.alloc(rowBytes * rect.height);

  for (let row = 0; row < rect.height; row++) {
    const start = ((rect.y + row) * canvasWidth + rect.x) * 4;
    canvas.copy(pixels, row * rowBytes, start, start + rowBytes);
  }

  return pixels;
}

/** Copy pixels into a rectangle of an RGBA canvas, or clear it */
function writeRect(
  canvas: Buffer,
  canvasWidth: number,
  rect: Rect,
  pixels?: Buffer
) {
  const rowBytes = rect.width * 4;

  for (let row = 0; row < rect.height; row++) {
    const start = ((rect.y + row) * canvasWidth + rect.x) * 4;

    if (pixels) {
      pixels.copy(canvas, start, row * rowBytes, (row + 1) * rowBytes);
    } else {
      canvas.fill(0, start, start + rowBytes);
    }
  }
}

/**
 * Whether each frame has its own graphic control extension. omggif's reader
 * keeps the delay, disposal and transparent index of the last one for every
 * later frame, but they only apply to the frame that follows them.
 */
function framesWithControl(data: Buffer) {
  const result: boolean[] = [];
  const paletteSize = (packed: number) =>
    packed & 0x80 ? 3 * (1 << ((packed & 7) + 1)) : 0;
  let p = 13 + paletteSize(data[10]!);
  let hasControl = false;

  const skipSubBlocks = () => {
    while (p < data.length) {
      const size = data[p++]!;

      if (size === 0) {
        break;
      }

      p += size;
    }
  };

  while (p < data.length) {
    const block = data[p++];

    if (block === 0x21) {
      hasControl ||= data[p++] === 0xf9;
      skipSubBlocks();
    } else if (block === 0x2c) {
      p += 9 + paletteSize(data[p + 8]!);
      // LZW minimum code size
      p++;
      skipSubBlocks();
      result.push(hasControl);
      hasControl = false;
    } else {
      break;
    }
  }

  return result;
}

/**
 * Decode frames and draw each over the previous ones, following their
 * disposal methods, so every frame is the full image shown at that point.
 */
function decodeGifFrames(
  data: Buffer,
  maxResolutionInMP: number,
  maxFrames: number
): DecodedFrames {
  let gif = readGif(data, maxResolutionInMP);
  const { width, height } = gif;
  const count = Math.min(gif.numFrames(), maxFrames);
  const hasControl = framesWithControl(data);

  // The decoder reads the frame objects, so fixing them fixes decoding
  const readFrames = () =>
    Array.from({ length: count }, (_, i) => {
      const frame = gif.frameInfo(i);

      if (!hasControl[i]) {
        frame.delay = 0;
        frame.disposal = 0;
        frame.transparent_index = null;
      }

      return frame;
    });
  let frames = readFrames();

  for (const frame of frames) {
    validateFrame(frame, maxResolutionInMP);
  }

  if (count * width * height > maxResolutionInMP * 1_000_000) {
    throw new Error(
      `GIF has ${count} frames of ${width}x${height}, which together exceed the maximum resolution of ${maxResolutionInMP} megapixels. Decode fewer frames with maxFrames, or raise maxResolutionInMP`
    );
  }

  // Frames are drawn on the logical screen, so ones that start outside it
  // can't be seen
  const isVisible = (frame: Rect) => frame.x < width && frame.y < height;
  // omggif draws rows of a frame that's wider than the logical screen into
  // the next row. Decode on a screen that fits every frame instead and only
  // keep the part of it inside the image.
  let canvasWidth = width;
  let canvasHeight = height;

  for (const frame of frames) {
    if (isVisible(frame)) {
      canvasWidth = Math.max(canvasWidth, frame.x + frame.width);
      canvasHeight = Math.max(canvasHeight, frame.y + frame.height);
    }
  }

  const isCropped = canvasWidth !== width || canvasHeight !== height;

  if (isCropped) {
    if (canvasWidth > MAX_GIF_DIMENSION || canvasHeight > MAX_GIF_DIMENSION) {
      throw new Error(
        "Invalid GIF file: a frame extends too far past the image"
      );
    }

    if (canvasWidth * canvasHeight > maxResolutionInMP * 1_000_000) {
      throw new Error(
        `GIF frames cover ${canvasWidth}x${canvasHeight}, which exceeds the maximum resolution of ${maxResolutionInMP} megapixels`
      );
    }

    const resized = Buffer.from(data);
    resized.writeUInt16LE(canvasWidth, 6);
    resized.writeUInt16LE(canvasHeight, 8);
    gif = new GIF.GifReader(resized);
    frames = readFrames();
  }

  const image = { x: 0, y: 0, width, height };
  const canvas = Buffer.alloc(canvasWidth * canvasHeight * 4);
  const decoded: DecodedFrames["frames"] = [];
  let previous: GIF.Frame | undefined;
  let beforePrevious: Buffer | undefined;

  for (let i = 0; i < count; i++) {
    const frame = frames[i]!;

    if (previous?.disposal === DISPOSE_TO_BACKGROUND) {
      // Browsers clear to transparent rather than the background color
      writeRect(canvas, canvasWidth, previous);
    } else if (previous?.disposal === DISPOSE_TO_PREVIOUS && beforePrevious) {
      writeRect(canvas, canvasWidth, previous, beforePrevious);
    }

    if (!isVisible(frame)) {
      previous = undefined;
    } else {
      beforePrevious =
        frame.disposal === DISPOSE_TO_PREVIOUS
          ? readRect(canvas, canvasWidth, frame)
          : undefined;
      gif.decodeAndBlitFrameRGBA(i, canvas);
      previous = frame;
    }

    const isLast = i === count - 1;

    decoded.push({
      bitmap: {
        data: isCropped
          ? readRect(canvas, canvasWidth, image)
          : // Nothing draws on the last frame, so it can keep the canvas
            isLast
            ? canvas
            : Buffer.from(canvas),
        width,
        height,
      },
      // GIF delays are in hundredths of a second
      delay: frame.delay * 10,
    });
  }

  // The types say number, but it's null without a loop extension
  return { frames: decoded, loop: gif.loopCount() as number | null };
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
