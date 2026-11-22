import { Buffer } from "buffer";
import decode, { init as initDecoder } from "@jsquash/png/decode.js";
import encode, { init as initEncoder } from "@jsquash/png/encode.js";
import { Format } from "@jimp/types";
import type { optimise as optimiseCodec } from "@jsquash/oxipng/codec/pkg/squoosh_oxipng.js";
import z from "zod";

import { loadWasm } from "./load-wasm.js";

const PngOptionsSchema = z.object({
  colorSpace: z.union([z.literal("display-p3"), z.literal("srgb")]).optional(),
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
});

type PngOptions = z.infer<typeof PngOptionsSchema>;

let pngReady: Promise<unknown> | undefined;
let optimiseReady: Promise<typeof optimiseCodec> | undefined;

function initPngOnce() {
  // The decoder and encoder share one wasm module
  pngReady ??= loadWasm("@jsquash/png/codec/pkg/squoosh_png_bg.wasm").then(
    async (module) => {
      await initDecoder(module);
      await initEncoder(module);
    },
  );
  return pngReady;
}

function initOptimiseOnce() {
  // Load the single-threaded codec directly, and only once it's needed.
  // @jsquash/oxipng/optimise.js can also load the multi-threaded build, whose
  // worker imports a bare directory that webpack 5 can't resolve.
  optimiseReady ??= Promise.all([
    import("@jsquash/oxipng/codec/pkg/squoosh_oxipng.js"),
    loadWasm("@jsquash/oxipng/codec/pkg/squoosh_oxipng_bg.wasm"),
  ]).then(async ([codec, module]) => {
    await codec.default(module);
    return codec.optimise;
  });
  return optimiseReady;
}

export default function png() {
  return {
    mime: "image/png",
    hasAlpha: true,
    encode: async (bitmap, options: Partial<PngOptions> = {}) => {
      const { colorSpace = "srgb", optimize } = PngOptionsSchema.parse(options);
      await initPngOnce();
      let arrayBuffer = await encode({
        ...bitmap,
        data: new Uint8ClampedArray(bitmap.data),
        colorSpace,
      });

      if (optimize) {
        const optimise = await initOptimiseOnce();
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
      await initPngOnce();
      const result = await decode(new Uint8Array(data).buffer);

      return {
        data: Buffer.from(new Uint8Array(result.data.buffer, result.data.byteOffset, result.data.byteLength)),
        width: result.width,
        height: result.height,
      };
    },
  } satisfies Format<"image/png">;
}
