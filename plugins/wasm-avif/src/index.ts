import decode, { init as initDecoder } from "@jsquash/avif/decode.js";
import encode, { init as initEncoder } from "@jsquash/avif/encode.js";
import { Format } from "@jimp/types";
import z from "zod";

const AvifOptionsSchema = z.object({
  colorSpace: z.union([z.literal("display-p3"), z.literal("srgb")]).optional(),
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
});

type AvifOptions = z.infer<typeof AvifOptionsSchema>;

export default function avif() {
  return {
    mime: "image/avif",
    hasAlpha: true,
    encode: async (bitmap, options: Partial<AvifOptions> = {}) => {
      const {
        colorSpace = "srgb",
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
      await initEncoder();
      const arrayBuffer = await encode(
        {
          ...bitmap,
          data: new Uint8ClampedArray(bitmap.data),
          colorSpace,
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
      await initDecoder();
      const result = await decode(data);

      return {
        data: Buffer.from(result.data),
        width: result.width,
        height: result.height,
      };
    },
  } satisfies Format<"image/avif">;
}
