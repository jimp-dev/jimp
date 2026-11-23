import { Buffer } from "buffer";
import decode, { init as initDecoder } from "@jsquash/png/decode.js";
import encode, { init as initEncoder } from "@jsquash/png/encode.js";
import { Format } from "@jimp/types";
import type { optimise as optimiseCodec } from "@jsquash/oxipng/codec/pkg/squoosh_oxipng.js";
import { z } from "zod";

import { loadWasm } from "./load-wasm.js";

const PngOptionsSchema = z.object({
  optimize: z
    .object({
      /** whether to use PNG interlacing or not. Interlacing will increase the size of an optimised image. */
      interlace: z.boolean().optional().default(false),
      /** is the optimisation level between 1 to 6. The higher the level, the higher the compression. Any level above 4 is not recommended. */
      level: z.number().min(0).max(6).optional().default(2),
      /** whether to allow transparent pixels to be altered to improve compression. */
      optimiseAlpha: z.boolean().optional().default(false),
    })
    .optional(),
  /**
   * Write the image's ICC colour profile, e.g. Display P3 for iPhone photos.
   * Jimp core adds it after encoding. Pass `false` to write sRGB without a
   * profile instead: the colours are converted to sRGB first, so they still
   * look right.
   * @default true
   */
  icc: z.boolean().optional(),
}).strict();

type PngOptions = z.input<typeof PngOptionsSchema>;

export interface PngWasm {
  /**
   * The compiled `@jsquash/png/codec/pkg/squoosh_png_bg.wasm`, used to decode
   * and encode
   */
  png?: WebAssembly.Module;
  /**
   * The compiled `@jsquash/oxipng/codec/pkg/squoosh_oxipng_bg.wasm`, used
   * when encoding with `optimize`
   */
  optimise?: WebAssembly.Module;
}

export interface PngFormatOptions {
  /**
   * Precompiled wasm modules for runtimes where the codecs can't load their
   * own wasm, like Cloudflare Workers.
   * Each codec is initialized once, by the first instance that encodes or
   * decodes, so pass the same modules to every instance.
   */
  wasm?: PngWasm;
}

let pngReady: Promise<unknown> | undefined;
let optimiseReady: Promise<typeof optimiseCodec> | undefined;

function initPngOnce(module?: WebAssembly.Module) {
  // The decoder and encoder share one wasm module
  pngReady ??= Promise.resolve(
    module ?? loadWasm("@jsquash/png/codec/pkg/squoosh_png_bg.wasm"),
  ).then(async (module) => {
    await initDecoder(module);
    await initEncoder(module);
  });
  return pngReady;
}

function initOptimiseOnce(module?: WebAssembly.Module) {
  // Load the single-threaded codec directly, and only once it's needed.
  // @jsquash/oxipng/optimise.js can also load the multi-threaded build, whose
  // worker imports a bare directory that webpack 5 can't resolve.
  optimiseReady ??= Promise.all([
    import("@jsquash/oxipng/codec/pkg/squoosh_oxipng.js"),
    module ?? loadWasm("@jsquash/oxipng/codec/pkg/squoosh_oxipng_bg.wasm"),
  ]).then(async ([codec, module]) => {
    await codec.default(module);
    return codec.optimise;
  });
  return optimiseReady;
}

export default function png({ wasm }: PngFormatOptions = {}) {
  return {
    mime: "image/png",
    hasAlpha: true,
    encode: async (bitmap, options: PngOptions = {}) => {
      const { optimize } = PngOptionsSchema.parse(options);
      await initPngOnce(wasm?.png);
      let arrayBuffer = await encode({
        ...bitmap,
        data: new Uint8ClampedArray(bitmap.data),
        // ImageData needs one, but the codec only reads the pixels
        colorSpace: "srgb",
      });

      if (optimize) {
        const optimise = await initOptimiseOnce(wasm?.optimise);
        arrayBuffer = optimise(
          new Uint8Array(arrayBuffer),
          optimize.level,
          optimize.interlace,
          optimize.optimiseAlpha,
        ).buffer;
      }

      return Buffer.from(arrayBuffer);
    },
    decode: async (data) => {
      await initPngOnce(wasm?.png);
      const result = await decode(new Uint8Array(data).buffer);

      return {
        data: Buffer.from(new Uint8Array(result.data.buffer, result.data.byteOffset, result.data.byteLength)),
        width: result.width,
        height: result.height,
      };
    },
  } satisfies Format<"image/png">;
}
