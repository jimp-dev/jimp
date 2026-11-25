import { PNG, decode, decodeFrames, encode, readHeader } from "@jimp/pngjs";
import type {
  ColorType,
  LegacyColorType,
  PNGOptions as PNGJSOptions,
} from "@jimp/pngjs";
import { Format } from "@jimp/types";
import { PNGFilterType, PNGColorType } from "./constants.js";

export type { PNGOptions as PNGJSOptions } from "@jimp/pngjs";
// Written out rather than picked from @jimp/pngjs's types, so the declarations
// of packages that use these options don't need @jimp/pngjs to resolve
export interface PNGOptions {
  /** zlib's compression level, 0-9 @default 9 */
  deflateLevel?: number;
  /** zlib's strategy, e.g. 3 (run-length) @default 3 */
  deflateStrategy?: number;
  /**
   * Bits per sample (or palette index). By default the smallest that keeps
   * every pixel exactly. 16 stores each 8-bit sample in 16 bits.
   */
  bitDepth?: 1 | 2 | 4 | 8 | 16;
  /**
   * The background transparent pixels are blended with when `colorType` has
   * no alpha channel
   * @default white
   */
  bgColor?: { red: number; green: number; blue: number };
  /**
   * The filter for each line. By default the best of all five for each line,
   * or none for palette and low bit depth images, which filters rarely help.
   */
  filterType?: PNGFilterType;
  /**
   * The colour type to write. By default the smallest that keeps every pixel
   * exactly, see the README.
   */
  colorType?: PNGColorType;
  inputColorType?: PNGColorType;
  /**
   * Jimp bitmaps always have an alpha channel, so this no longer describes the
   * input. Passing `false` only makes `colorType` default to
   * `PNGColorType.COLOR`, so the PNG is written without an alpha channel.
   * Passing `true` does nothing.
   *
   * @deprecated Use `colorType: PNGColorType.COLOR` instead.
   */
  inputHasAlpha?: boolean;
  /**
   * Write the image's ICC colour profile, e.g. Display P3 for iPhone photos.
   * Jimp core adds it after encoding. Pass `false` to write sRGB without a
   * profile instead: the colours are converted to sRGB first, so they still
   * look right.
   * @default true
   */
  icc?: boolean;
}

export interface DecodePngOptions {
  checkCRC?: boolean | undefined;
  /**
   * Largest image, in megapixels, that will be decoded. Larger images are
   * rejected before any pixel memory is allocated. Each frame of an animated
   * PNG is the image's size, so with `decodeFrames` this limits each frame.
   * @default Infinity
   */
  maxResolutionInMP?: number | undefined;
}

/** Throw if the PNG's header says it's larger than `maxResolutionInMP` */
function checkResolution(data: Uint8Array, maxResolutionInMP?: number) {
  if (maxResolutionInMP === undefined) {
    return;
  }

  const { width, height } = readHeader(data);

  if (width * height > maxResolutionInMP * 1_000_000) {
    throw new Error(
      `PNG dimensions ${width}x${height} exceed the maximum resolution of ${maxResolutionInMP} megapixels`,
    );
  }
}

export * from "./constants.js";

function toBuffer(data: Uint8Array) {
  return Buffer.isBuffer(data)
    ? data
    : Buffer.from(data.buffer, data.byteOffset, data.byteLength);
}

/**
 * APNG counts how many times the animation plays, 0 for forever. Jimp counts
 * the repeats after the first play, and uses null for playing once.
 */
function toLoop(plays: number) {
  return plays === 0 ? 0 : plays === 1 ? null : plays - 1;
}

export default function png() {
  return {
    mime: "image/png",
    hasAlpha: true,
    /**
     * file-type says animated PNGs are "image/apng", which no format has, so
     * recognise them here
     */
    detect: (data) => {
      try {
        readHeader(data);
        return true;
      } catch {
        return false;
      }
    },
    encode: (
      bitmap,
      {
        deflateLevel = 9,
        deflateStrategy = 3,
        filterType,
        colorType,
        inputColorType,
        inputHasAlpha,
        bitDepth,
        bgColor,
      }: PNGOptions = {},
    ) => {
      // pngjs reads input that isn't RGBA, which a Jimp bitmap never is
      if (inputColorType !== undefined) {
        const png = new PNG({ width: bitmap.width, height: bitmap.height });

        png.data = bitmap.data;

        return PNG.sync.write(png, {
          inputColorType: inputColorType as PNGJSOptions["inputColorType"],
          bitDepth,
          bgColor,
          deflateLevel,
          deflateStrategy,
          filterType,
          colorType: (colorType ?? PNGColorType.COLOR_ALPHA) as LegacyColorType,
          inputHasAlpha: true,
        });
      }

      return toBuffer(
        encode(bitmap, {
          deflateLevel,
          deflateStrategy,
          filterType,
          colorType: (colorType ??
            (inputHasAlpha === false ? PNGColorType.COLOR : undefined)) as
            ColorType | undefined,
          bitDepth,
          background: bgColor,
        }),
      );
    },
    decode: (data, options?: DecodePngOptions) => {
      checkResolution(data, options?.maxResolutionInMP);

      // Jimp bitmaps are 8-bit, so samples are always rescaled to 8 bits
      const result = decode(data, { checkCRC: options?.checkCRC });

      return {
        data: toBuffer(result.data),
        width: result.width,
        height: result.height,
      };
    },
    /** Decodes every frame of an animated PNG (APNG) */
    decodeFrames: (
      data,
      options?: DecodePngOptions,
      { maxFrames = Infinity } = {},
    ) => {
      checkResolution(data, options?.maxResolutionInMP);

      const { width, height, frames, plays } = decodeFrames(data, {
        checkCRC: options?.checkCRC,
        maxFrames,
      });

      if (plays === undefined) {
        return {
          frames: [
            { bitmap: { data: toBuffer(frames[0]!.data), width, height } },
          ],
        };
      }

      return {
        frames: frames.map((frame) => ({
          bitmap: { data: toBuffer(frame.data), width, height },
          delay: frame.delay,
        })),
        loop: toLoop(plays),
      };
    },
  } satisfies Format<"image/png">;
}
