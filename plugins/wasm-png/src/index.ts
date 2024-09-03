import decode, { init as initDecoder } from "@jsquash/png/decode.js";
import encode, { init as initEncoder } from "@jsquash/png/encode.js";
import { Format } from "@jimp/types";

export type PngOptions = {
  colorSpace?: "display-p3" | "srgb";
};

export default function png() {
  return {
    mime: "image/png",
    hasAlpha: true,
    encode: async (bitmap, { colorSpace = "srgb" }: PngOptions = {}) => {
      await initEncoder();
      const arrayBuffer = await encode({
        ...bitmap,
        data: new Uint8ClampedArray(bitmap.data),
        colorSpace,
      });

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
  } satisfies Format<"image/png">;
}
