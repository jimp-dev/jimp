import { Buffer } from "buffer";
import decode, { init as initDecoder } from "@jsquash/jpeg/decode.js";
import encode, { init as initEncoder } from "@jsquash/jpeg/encode.js";
import { Format } from "@jimp/types";
import z from "zod";

import { loadWasm } from "./load-wasm.js";

const JpegOptionsSchema = z.object({
  colorSpace: z.union([z.literal("display-p3"), z.literal("srgb")]).optional(),
  jpegColorSpace: z
    .union([z.literal("rgb"), z.literal("grayscale"), z.literal("ycbcr")])
    .optional()
    .default("ycbcr"),
  /**
   * Image quality, between 0 and 100.
   * For lossy, 0 gives the smallest size and 100 the largest.
   * For lossless, this parameter is the amount of effort put
   * into the compression: 0 is the fastest but gives larger
   * files compared to the slowest, but best, 100.
   * @default 75
   */
  quality: z.number().min(0).max(100).optional().default(75),
  arithmetic: z.boolean().optional().default(false),
  autoSubsample: z.boolean().optional().default(true),
  baseline: z.boolean().optional().default(false),
  chromaQuality: z.number().min(0).max(100).optional().default(75),
  chromaSubsample: z.number().min(0).max(4).optional().default(2),
  optimizeCoding: z.boolean().optional().default(true),
  progressive: z.boolean().optional().default(true),
  quantTable: z.number().min(0).optional().default(3),
  separateChromaQuality: z.boolean().optional().default(false),
  smoothing: z.number().min(0).max(100).optional().default(0),
  trellisLoops: z.number().min(0).max(100).optional().default(1),
  trellisMultipass: z.boolean().optional().default(false),
  trellisOptTable: z.boolean().optional().default(false),
  trellisOptZero: z.boolean().optional().default(false),
  /**
   * Write the EXIF data of the JPEG the image was read from. Jimp core adds
   * it after encoding. Off by default, as EXIF can contain private data such
   * as the location.
   * @default false
   */
  exif: z.boolean().optional(),
});

type JpegOptions = z.infer<typeof JpegOptionsSchema>;

export interface JpegWasm {
  /** The compiled `@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm` */
  decoder?: WebAssembly.Module;
  /** The compiled `@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm` */
  encoder?: WebAssembly.Module;
}

export interface JpegFormatOptions {
  /**
   * Precompiled wasm modules for runtimes where the codecs can't load their
   * own wasm, like Cloudflare Workers.
   * Each codec is initialized once, by the first instance that encodes or
   * decodes, so pass the same modules to every instance.
   */
  wasm?: JpegWasm;
}

let decoderReady: Promise<unknown> | undefined;
let encoderReady: Promise<unknown> | undefined;

function initDecoderOnce(module?: WebAssembly.Module) {
  decoderReady ??= Promise.resolve(
    module ?? loadWasm("@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm"),
  ).then(initDecoder);
  return decoderReady;
}

function initEncoderOnce(module?: WebAssembly.Module) {
  encoderReady ??= Promise.resolve(
    module ?? loadWasm("@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm"),
  ).then(initEncoder);
  return encoderReady;
}

export default function jpeg({ wasm }: JpegFormatOptions = {}) {
  return {
    mime: "image/jpeg",
    hasAlpha: true,
    encode: async (bitmap, options: Partial<JpegOptions> = {}) => {
      const {
        quality,
        colorSpace = "srgb",
        arithmetic,
        autoSubsample,
        baseline,
        chromaQuality,
        chromaSubsample,
        optimizeCoding,
        progressive,
        quantTable,
        separateChromaQuality,
        smoothing,
        trellisLoops,
        trellisMultipass,
        trellisOptTable,
        trellisOptZero,
        jpegColorSpace,
      } = JpegOptionsSchema.parse(options);
      await initEncoderOnce(wasm?.encoder);
      const arrayBuffer = await encode(
        {
          ...bitmap,
          data: new Uint8ClampedArray(bitmap.data),
          colorSpace,
        },
        {
          quality,
          arithmetic,
          auto_subsample: autoSubsample,
          baseline,
          chroma_quality: chromaQuality,
          chroma_subsample: chromaSubsample,
          color_space:
            jpegColorSpace === "rgb"
              ? 2
              : jpegColorSpace === "grayscale"
                ? 1
                : 3,
          optimize_coding: optimizeCoding,
          progressive,
          quant_table: quantTable,
          separate_chroma_quality: separateChromaQuality,
          smoothing,
          trellis_loops: trellisLoops,
          trellis_multipass: trellisMultipass,
          trellis_opt_table: trellisOptTable,
          trellis_opt_zero: trellisOptZero,
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
  } satisfies Format<"image/jpeg">;
}
