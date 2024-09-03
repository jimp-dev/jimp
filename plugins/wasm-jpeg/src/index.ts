import decode, { init as initDecoder } from "@jsquash/jpeg/decode.js";
import encode, { init as initEncoder } from "@jsquash/jpeg/encode.js";
import { Format } from "@jimp/types";
import z from "zod";

const JpegOptionsSchema = z.object({
  colorSpace: z.union([z.literal("display-p3"), z.literal("srgb")]).optional(),
  jpegColorSpace: z.union([
    z.literal("rgb"),
    z.literal("grayscale"),
    z.literal("ycbcr"),
  ]),
  /**
   * Image quality, between 0 and 100.
   * For lossy, 0 gives the smallest size and 100 the largest.
   * For lossless, this parameter is the amount of effort put
   * into the compression: 0 is the fastest but gives larger
   * files compared to the slowest, but best, 100.
   * @default 100
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
});

type JpegOptions = z.infer<typeof JpegOptionsSchema>;

export default function jpeg() {
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
      await initEncoder();
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
      await initDecoder();
      const result = await decode(data);

      return {
        data: Buffer.from(result.data),
        width: result.width,
        height: result.height,
      };
    },
  } satisfies Format<"image/jpeg">;
}
