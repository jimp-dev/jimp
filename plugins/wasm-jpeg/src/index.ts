import decode, { init as initDecoder } from "@jsquash/jpeg/decode.js";
import encode, { init as initEncoder } from "@jsquash/jpeg/encode.js";
import { Format } from "@jimp/types";

export type JpegOptions = {
  colorSpace?: "display-p3" | "srgb";
};

export default function jpeg() {
  return {
    mime: "image/jpeg",
    hasAlpha: true,
    encode: async (bitmap, { colorSpace = "srgb" }: JpegOptions = {}) => {
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
  } satisfies Format<"image/jpeg">;
}
