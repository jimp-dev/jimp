import { Buffer } from "buffer";
import decode, { init as initDecoder } from "@jsquash/avif/decode.js";
import encode, { init as initEncoder } from "@jsquash/avif/encode.js";
import { Format } from "@jimp/types";
import { z } from "zod";

import { loadWasm } from "./load-wasm.js";

const AvifOptionsSchema = z.object({
  chromaDeltaQ: z.boolean().optional().default(false),
  cqAlphaLevel: z.number().min(0).max(100).optional().default(0),
  cqLevel: z.number().min(0).max(100).optional().default(0),
  denoiseLevel: z.number().min(0).max(100).optional().default(0),
  sharpness: z.number().min(0).max(100).optional().default(0),
  speed: z.number().min(0).max(100).optional().default(6),
  subsample: z.number().min(0).max(4).optional().default(1),
  tileColsLog2: z.number().min(0).max(10).optional().default(0),
  tileRowsLog2: z.number().min(0).max(10).optional().default(0),
  tune: z
    .union([z.literal("psnr"), z.literal("ssim"), z.literal("auto")])
    .optional()
    .default("auto"),
}).strict();

type AvifOptions = z.infer<typeof AvifOptionsSchema>;

export interface AvifWasm {
  /** The compiled `@jsquash/avif/codec/dec/avif_dec.wasm` */
  decoder?: WebAssembly.Module;
  /**
   * The compiled `@jsquash/avif/codec/enc/avif_enc.wasm`, the single-threaded
   * encoder that @jsquash/avif uses in Node and Cloudflare Workers
   */
  encoder?: WebAssembly.Module;
}

export interface AvifFormatOptions {
  /**
   * Precompiled wasm modules for runtimes where the codecs can't load their
   * own wasm, like Cloudflare Workers.
   * Each codec is initialized once, by the first instance that encodes or
   * decodes, so pass the same modules to every instance.
   */
  wasm?: AvifWasm;
}

let decoderReady: Promise<unknown> | undefined;
let encoderReady: Promise<unknown> | undefined;

function initDecoderOnce(module?: WebAssembly.Module) {
  decoderReady ??= Promise.resolve(
    module ?? loadWasm("@jsquash/avif/codec/dec/avif_dec.wasm"),
  ).then(initDecoder);
  return decoderReady;
}

function initEncoderOnce(module?: WebAssembly.Module) {
  // @jsquash/avif only uses the multi-threaded encoder outside of Node
  encoderReady ??= Promise.resolve(
    module ?? loadWasm("@jsquash/avif/codec/enc/avif_enc.wasm"),
  ).then(initEncoder);
  return encoderReady;
}

export default function avif({ wasm }: AvifFormatOptions = {}) {
  return {
    mime: "image/avif",
    hasAlpha: true,
    encode: async (bitmap, options: Partial<AvifOptions> = {}) => {
      const {
        chromaDeltaQ,
        cqAlphaLevel,
        cqLevel,
        denoiseLevel,
        sharpness,
        speed,
        subsample,
        tileColsLog2,
        tileRowsLog2,
        tune,
      } = AvifOptionsSchema.parse(options);
      await initEncoderOnce(wasm?.encoder);
      const arrayBuffer = await encode(
        {
          ...bitmap,
          data: new Uint8ClampedArray(bitmap.data),
          // ImageData needs one, but the codec only reads the pixels
          colorSpace: "srgb",
        },
        {
          chromaDeltaQ,
          cqAlphaLevel,
          cqLevel,
          denoiseLevel,
          sharpness,
          speed,
          subsample,
          tileColsLog2,
          tileRowsLog2,
          tune: tune === "auto" ? 0 : tune === "psnr" ? 1 : 2,
        }
      );

      return Buffer.from(arrayBuffer);
    },
    decode: async (data) => {
      await initDecoderOnce(wasm?.decoder);
      const result = await decode(new Uint8Array(data).buffer);

      return {
        data: Buffer.from(new Uint8Array(result.data.buffer, result.data.byteOffset, result.data.byteLength)),
        width: result.width,
        height: result.height,
      };
    },
  } satisfies Format<"image/avif">;
}
