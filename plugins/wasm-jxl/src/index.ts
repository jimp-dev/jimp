import { Buffer } from "buffer";
import decode, { init as initDecoder } from "@jsquash/jxl/decode.js";
import encode, { init as initEncoder } from "@jsquash/jxl/encode.js";
import { Bitmap, Format } from "@jimp/types";
import z from "zod";

import { readJxlHeader, TransferFunction } from "./header.js";
import { loadWasm } from "./load-wasm.js";

const JxlOptionsSchema = z
  .object({
    /**
     * Image quality, between 0 and 100. 90 (the `cjxl` default) is
     * visually lossless for most images. 100 is lossless, like `lossless`.
     * @default 90
     */
    quality: z.number().optional().default(90),
    /**
     * Store every pixel exactly, including alpha. `quality` is ignored.
     * @default false
     */
    lossless: z.boolean().optional().default(false),
    /**
     * How hard the encoder tries to make the file smaller, between 1 (fastest)
     * and 9 (slowest).
     * @default 7
     */
    effort: z.number().optional().default(7),
    /**
     * Order the data so a partially downloaded file can be shown at a lower
     * quality first. Makes files a little larger.
     * @default false
     */
    progressive: z.boolean().optional().default(false),
    /**
     * Use the modular mode for lossy images too, rather than the DCT based
     * VarDCT mode. It can do better on graphics, and worse on photos.
     * @default false
     */
    lossyModular: z.boolean().optional().default(false),
    /**
     * Strength of the edge-preserving filter applied when decoding lossy
     * images, between 0 (off) and 3. -1 picks one from the quality.
     * @default -1
     */
    epf: z.number().optional().default(-1),
    /**
     * Make lossy images faster to decode, between 0 (slowest, smallest
     * files) and 4 (fastest).
     * @default 0
     */
    decodingSpeedTier: z.number().optional().default(0),
    /**
     * Add synthetic film grain to lossy images, like a photo taken at this
     * ISO. 0 adds none.
     * @default 0
     */
    photonNoiseIso: z.number().optional().default(0),
  })
  .strict();

type JxlOptions = z.infer<typeof JxlOptionsSchema>;

export interface DecodeJxlOptions {
  /**
   * Largest image, in megapixels, that will be decoded. Larger images are
   * rejected before any pixel memory is allocated.
   * @default 100
   */
  maxResolutionInMP?: number;
}

export interface JxlWasm {
  /** The compiled `@jsquash/jxl/codec/dec/jxl_dec.wasm` */
  decoder?: WebAssembly.Module;
  /**
   * The compiled `@jsquash/jxl/codec/enc/jxl_enc.wasm`, the single-threaded
   * encoder that @jsquash/jxl uses in Node and Cloudflare Workers
   */
  encoder?: WebAssembly.Module;
}

export interface JxlFormatOptions {
  /**
   * Precompiled wasm modules for runtimes where the codecs can't load their
   * own wasm, like Cloudflare Workers.
   * Each codec is initialized once, by the first instance that encodes or
   * decodes, so pass the same modules to every instance.
   */
  wasm?: JxlWasm;
}

let decoderReady: Promise<unknown> | undefined;
let encoderReady: Promise<unknown> | undefined;

function initDecoderOnce(module?: WebAssembly.Module) {
  decoderReady ??= Promise.resolve(
    module ?? loadWasm("@jsquash/jxl/codec/dec/jxl_dec.wasm"),
  ).then(initDecoder);
  return decoderReady;
}

function initEncoderOnce(module?: WebAssembly.Module) {
  // @jsquash/jxl only uses the multi-threaded encoder outside of Node
  encoderReady ??= Promise.resolve(
    module ?? loadWasm("@jsquash/jxl/codec/enc/jxl_enc.wasm"),
  ).then(initEncoder);
  return encoderReady;
}

/**
 * The codecs return null for data they can't handle. Anything else they
 * throw is a wasm trap, almost always from running out of memory (wasm has
 * at most 2 GB), which can leave the codec in a bad state.
 */
function isTrap(error: unknown) {
  return !(
    error instanceof Error && /^(De|En)coding error/.test(error.message)
  );
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

async function decodeJxl(
  data: Buffer,
  { maxResolutionInMP = 100 }: DecodeJxlOptions,
  wasm?: WebAssembly.Module,
): Promise<Bitmap> {
  const header = readJxlHeader(data);

  if (header) {
    const { width, height, transferFunction } = header;

    if (width * height > maxResolutionInMP * 1_000_000) {
      throw new Error(
        `JPEG XL dimensions ${width}x${height} exceed the maximum resolution of ${maxResolutionInMP} megapixels`,
      );
    }

    if (
      transferFunction === TransferFunction.PQ ||
      transferFunction === TransferFunction.HLG
    ) {
      throw new Error(
        `Unsupported JPEG XL image: HDR images (with the ${transferFunction === TransferFunction.PQ ? "PQ" : "HLG"} transfer function) can't be decoded, because the codec would convert them to 8-bit sRGB without tone mapping`,
      );
    }
  }

  await initDecoderOnce(wasm);

  let result: ImageData;

  try {
    result = await decode(new Uint8Array(data).buffer);
  } catch (error) {
    if (!isTrap(error)) {
      throw new Error(
        "Failed to decode the JPEG XL image: it's invalid, or uses a feature the codec doesn't support",
        { cause: error },
      );
    }

    // Start again with a fresh instance
    decoderReady = undefined;
    throw new Error(
      `Failed to decode the ${header ? `${header.width}x${header.height} ` : ""}JPEG XL image: the codec ran out of memory`,
      { cause: error },
    );
  }

  return {
    data: Buffer.from(
      result.data.buffer,
      result.data.byteOffset,
      result.data.byteLength,
    ),
    width: result.width,
    height: result.height,
  };
}

async function encodeJxl(
  { width, height, data }: Bitmap,
  options: Partial<JxlOptions>,
  wasm?: WebAssembly.Module,
) {
  const {
    quality,
    lossless,
    effort,
    progressive,
    lossyModular,
    epf,
    decodingSpeedTier,
    photonNoiseIso,
  } = JxlOptionsSchema.parse(options);

  await initEncoderOnce(wasm);

  try {
    const arrayBuffer = await encode(
      {
        width,
        height,
        data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.length),
        // ImageData needs one, but the codec only reads the pixels
        colorSpace: "srgb",
      },
      {
        // Quality 100 is what makes the codec lossless. Its own lossless
        // option does the same, but warns about the other options.
        quality: lossless ? 100 : clamp(quality, 0, 100),
        lossless: false,
        lossyModular: lossless ? false : lossyModular,
        // Larger values make the codec fail
        effort: clamp(Math.round(effort), 1, 9),
        epf: clamp(Math.round(epf), -1, 3),
        decodingSpeedTier: clamp(Math.round(decodingSpeedTier), 0, 4),
        photonNoiseIso: Math.max(photonNoiseIso, 0),
        progressive,
        // Makes files much larger, and isn't lossless, in this build of libjxl
        lossyPalette: false,
      },
    );

    return Buffer.from(arrayBuffer);
  } catch (error) {
    if (isTrap(error)) {
      encoderReady = undefined;
      throw new Error(
        `Failed to encode the ${width}x${height} JPEG XL image: the codec ran out of memory`,
        { cause: error },
      );
    }

    throw new Error("Failed to encode the JPEG XL image", { cause: error });
  }
}

/**
 * JPEG XL images (.jxl), as bare codestreams or in the ISOBMFF container.
 * Images are decoded to 8-bit sRGB, and written as 8-bit sRGB with alpha.
 */
export default function jxl({ wasm }: JxlFormatOptions = {}) {
  return {
    mime: "image/jxl",
    hasAlpha: true,
    encode: (bitmap, options: Partial<JxlOptions> = {}) =>
      encodeJxl(bitmap, options, wasm?.encoder),
    decode: (data, options: DecodeJxlOptions = {}) =>
      decodeJxl(data, options, wasm?.decoder),
  } satisfies Format<"image/jxl">;
}
