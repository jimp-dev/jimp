import { ColorType, PNG } from "pngjs";
import { Format } from "@jimp/types";
import { PNGFilterType } from "./constants.js";

export interface PNGOptions {
  deflateLevel?: number;
  deflateStrategy?: number;
  filterType?: PNGFilterType;
  colorType?: ColorType;
  inputHasAlpha?: boolean;
}

export default function png() {
  return {
    mime: "image/png",
    encode: async (
      bitmap,
      {
        deflateLevel = 9,
        deflateStrategy = 3,
        filterType = PNGFilterType.AUTO,
        colorType,
        inputHasAlpha = true,
      }: PNGOptions = {},
    ) => {
      const png = new PNG({
        width: bitmap.width,
        height: bitmap.height,
      });

      png.data = bitmap.data;

      return PNG.sync.write(png, {
        deflateLevel,
        deflateStrategy,
        filterType,
        colorType:
          typeof colorType === "number" ? colorType : inputHasAlpha ? 6 : 2,
        inputHasAlpha,
      });
    },
    decode: async (data) => {
      const result = PNG.sync.read(data);

      return {
        data: result.data,
        width: result.width,
        height: result.height,
      };
    },
  } satisfies Format<"image/png">;
}
