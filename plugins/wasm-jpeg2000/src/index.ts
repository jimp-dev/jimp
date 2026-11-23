import { Buffer } from "buffer";
import OpenJPEGWASM, {
  OpenJpegModule,
} from "@cornerstonejs/codec-openjpeg/wasmjs";
import { Bitmap, Format } from "@jimp/types";
import z from "zod";

import {
  CodestreamHeader,
  readCodestreamHeader,
  writeJp2,
} from "./codestream.js";
import { loadWasm } from "./load-wasm.js";

const Jpeg2000OptionsSchema = z
  .object({
    /**
     * How many times smaller than the uncompressed RGB pixels the file
     * should be, e.g. 20 for 20:1. 1 is lossless: it uses the reversible
     * wavelet and keeps every pixel exactly. Above 1, the irreversible
     * wavelet is used and quality drops as the ratio rises.
     * @default 1
     */
    compressionRatio: z.number().optional().default(1),
    /**
     * Wavelet decomposition levels. Each level is a resolution, half the
     * size of the one above, that decoders can `reduce` to without decoding
     * the full image. Limited to what the image's size allows.
     * @default 5
     */
    decompositions: z.number().optional().default(5),
  })
  .strict();

type Jpeg2000Options = z.infer<typeof Jpeg2000OptionsSchema>;

export interface DecodeJpeg2000Options {
  /**
   * Decode at a lower resolution. Each step halves the width and height
   * (rounding up), down to the image's smallest resolution. It's much faster
   * and uses less memory than decoding a huge image in full and resizing it.
   * @default 0
   */
  reduce?: number;
  /**
   * Decode only the first quality layers of an image encoded with several,
   * for a quick lower quality preview. 0 decodes all of them.
   * @default 0
   */
  layers?: number;
  /**
   * Largest image, in megapixels, that will be decoded, after `reduce`.
   * Larger images are rejected before any pixel memory is allocated.
   * @default 100
   */
  maxResolutionInMP?: number;
}

export interface Jpeg2000Wasm {
  /** The compiled `@cornerstonejs/codec-openjpeg/wasm` */
  codec?: WebAssembly.Module;
}

export interface Jpeg2000FormatOptions {
  /**
   * A precompiled wasm module for runtimes or bundlers where the plugin
   * can't load the codec's wasm itself.
   * The codec is initialized once, by the first instance that encodes or
   * decodes, so pass the same module to every instance.
   */
  wasm?: Jpeg2000Wasm;
}

let codecReady: Promise<OpenJpegModule> | undefined;
/** What OpenJPEG printed during the current encode or decode */
let messages: string[] = [];

function initCodecOnce(module?: WebAssembly.Module) {
  codecReady ??= Promise.resolve(module ?? loadWasm()).then(
    (wasm) =>
      new Promise<OpenJpegModule>((resolve, reject) => {
        OpenJPEGWASM({
          // OpenJPEG logs its errors, warnings and progress
          print: (message) => messages.push(message),
          printErr: (message) => messages.push(message),
          instantiateWasm(imports, receiveInstance) {
            WebAssembly.instantiate(wasm, imports).then(
              (instance) => receiveInstance(instance, wasm),
              reject,
            );
            return {};
          },
        }).then(resolve, reject);
      }),
  );
  return codecReady;
}

/** The errors OpenJPEG printed, to explain why it failed */
function withErrors(message: string) {
  const errors = messages
    .filter((line) => line.startsWith("[ERROR]"))
    .map((line) => line.slice("[ERROR]".length).trim());

  return new Error(
    errors.length ? `${message}: ${errors.join(". ")}` : message,
  );
}

/** Rejects layouts the codec can't decode, or decodes to the wrong pixels */
function validate({ components }: CodestreamHeader) {
  const [first, cb, cr] = components;

  if (
    !first ||
    components.some(
      ({ precision, signed }) =>
        precision !== first.precision || signed !== first.signed,
    )
  ) {
    throw new Error(
      "Unsupported JPEG 2000 image: every component must have the same bit depth",
    );
  }

  if (first.precision > 16) {
    throw new Error(
      `Unsupported JPEG 2000 bit depth ${first.precision}: up to 16 bits per sample can be decoded`,
    );
  }

  // The codec clamps them to 0-255, losing the negative half
  if (components.length === 1 && first.signed && first.precision <= 8) {
    throw new Error(
      "Unsupported JPEG 2000 image: signed grayscale samples of 8 bits or fewer",
    );
  }

  const subsampled = components.some(({ dx, dy }) => dx !== 1 || dy !== 1);
  // The codec converts YCbCr with 4:2:0 or 4:2:2 chroma to RGB
  const subsampledChroma =
    components.length === 3 &&
    first.dx === 1 &&
    first.dy === 1 &&
    cb!.dx === 2 &&
    cr!.dx === 2 &&
    cb!.dy === cr!.dy &&
    cb!.dy <= 2;

  if (subsampled && !subsampledChroma) {
    throw new Error(
      "Unsupported JPEG 2000 subsampling: only the chroma of YCbCr 4:2:0 and 4:2:2 images can be subsampled",
    );
  }
}

/** Converts the codec's interleaved gray or RGB samples to 8-bit RGBA */
function toRgba(
  samples: Uint8Array,
  pixels: number,
  components: number,
  bitsPerSample: number,
  signed: boolean,
) {
  // Copy the samples out of wasm memory, which also aligns 16-bit ones
  const copy = samples.slice();
  const values =
    bitsPerSample > 8
      ? signed
        ? new Int16Array(copy.buffer)
        : new Uint16Array(copy.buffer)
      : signed
        ? new Int8Array(copy.buffer)
        : copy;
  const offset = signed ? 2 ** (bitsPerSample - 1) : 0;
  const scale = 255 / (2 ** bitsPerSample - 1);
  // Rounds and clamps to 0-255
  const rgba = new Uint8ClampedArray(pixels * 4);

  for (let i = 0; i < pixels; i++) {
    for (let c = 0; c < 3; c++) {
      const value = values[i * components + (components === 1 ? 0 : c)]!;
      rgba[i * 4 + c] = (value + offset) * scale;
    }

    rgba[i * 4 + 3] = 255;
  }

  return Buffer.from(rgba.buffer);
}

async function decode(
  data: Buffer,
  { reduce = 0, layers = 0, maxResolutionInMP = 100 }: DecodeJpeg2000Options,
  wasm?: WebAssembly.Module,
): Promise<Bitmap> {
  const header = readCodestreamHeader(data);

  if (!header) {
    throw new Error(
      "Invalid JPEG 2000 image: the codestream's main header can't be read",
    );
  }

  validate(header);

  const level = Math.min(
    Math.max(0, Math.floor(reduce)),
    header.decompositions,
  );
  const width = Math.ceil(header.width / 2 ** level);
  const height = Math.ceil(header.height / 2 ** level);

  if (width * height > maxResolutionInMP * 1_000_000) {
    throw new Error(
      `JPEG 2000 dimensions ${width}x${height} exceed the maximum resolution of ${maxResolutionInMP} megapixels. Use the reduce option to decode it at a lower resolution.`,
    );
  }

  const codec = await initCodecOnce(wasm);
  const decoder = new codec.J2KDecoder();

  messages = [];

  try {
    try {
      decoder.getEncodedBuffer(data.length).set(data);
      decoder.decodeSubResolution(level, Math.max(0, Math.floor(layers)));
    } catch {
      // C++ exceptions reach JS as pointers, without their message
      const count = header.components.length;

      throw count === 1 || count === 3
        ? withErrors("Failed to decode the JPEG 2000 image")
        : new Error(
            `Unsupported JPEG 2000 image with ${count} components: only grayscale and RGB images can be decoded, without alpha`,
          );
    }

    const frame = decoder.getFrameInfo();
    // Without an exception, OpenJPEG's own failures leave the frame empty
    if (!frame.width) {
      throw withErrors("Failed to decode the JPEG 2000 image");
    }

    const size = decoder.calculateSizeAtDecompositionLevel(level);

    return {
      data: toRgba(
        decoder.getDecodedBuffer(),
        size.width * size.height,
        frame.componentCount,
        frame.bitsPerSample,
        frame.isSigned,
      ),
      width: size.width,
      height: size.height,
    };
  } finally {
    decoder.delete();
  }
}

/** Encodes the bitmap's RGB, without alpha, as a codestream */
async function encode(
  { width, height, data }: Bitmap,
  options: Partial<Jpeg2000Options>,
  wasm?: WebAssembly.Module,
) {
  const { compressionRatio, decompositions } =
    Jpeg2000OptionsSchema.parse(options);
  const codec = await initCodecOnce(wasm);
  const encoder = new codec.J2KEncoder();

  messages = [];

  try {
    const pixels = encoder.getDecodedBuffer({
      width,
      height,
      bitsPerSample: 8,
      componentCount: 3,
      isSigned: false,
    });

    for (let i = 0; i < width * height; i++) {
      pixels[i * 3] = data[i * 4]!;
      pixels[i * 3 + 1] = data[i * 4 + 1]!;
      pixels[i * 3 + 2] = data[i * 4 + 2]!;
    }

    // The smallest resolution needs at least a pixel in each direction
    encoder.setDecompositions(
      Math.min(
        Math.max(0, Math.round(decompositions)),
        Math.floor(Math.log2(Math.min(width, height))),
      ),
    );

    if (compressionRatio > 1) {
      encoder.setQuality(false, 1);
      encoder.setCompressionRatio(0, compressionRatio);
    }

    try {
      encoder.encode();
    } catch {
      throw withErrors("Failed to encode the JPEG 2000 image");
    }

    // Copied out of wasm memory
    return Buffer.from(encoder.getEncodedBuffer());
  } finally {
    encoder.delete();
  }
}

/**
 * JP2 files, the usual JPEG 2000 container (.jp2).
 * Images are written as 8-bit sRGB without alpha.
 */
export default function jpeg2000({ wasm }: Jpeg2000FormatOptions = {}) {
  return {
    mime: "image/jp2",
    hasAlpha: false,
    encode: async (bitmap, options: Partial<Jpeg2000Options> = {}) =>
      writeJp2(
        await encode(bitmap, options, wasm?.codec),
        bitmap.width,
        bitmap.height,
      ),
    decode: (data, options: DecodeJpeg2000Options = {}) =>
      decode(data, options, wasm?.codec),
  } satisfies Format<"image/jp2">;
}

/** Raw JPEG 2000 codestreams, without a container (.j2c, .j2k) */
export function j2c({ wasm }: Jpeg2000FormatOptions = {}) {
  return {
    mime: "image/j2c",
    hasAlpha: false,
    encode: (bitmap, options: Partial<Jpeg2000Options> = {}) =>
      encode(bitmap, options, wasm?.codec),
    decode: (data, options: DecodeJpeg2000Options = {}) =>
      decode(data, options, wasm?.codec),
  } satisfies Format<"image/j2c">;
}

/**
 * JPX files (.jpx, .jpf), the extended JPEG 2000 container. Only decoding is
 * supported, of the codestreams that only use JPEG 2000 part 1 features.
 */
export function jpx({ wasm }: Jpeg2000FormatOptions = {}) {
  return {
    mime: "image/jpx",
    hasAlpha: false,
    encode: async () => {
      throw new Error(
        "Writing JPX isn't supported. Write a JP2 (image/jp2) instead, which JPX readers can read too.",
      );
    },
    decode: (data, options: DecodeJpeg2000Options = {}) =>
      decode(data, options, wasm?.codec),
  } satisfies Format<"image/jpx">;
}
