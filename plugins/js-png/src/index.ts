import { PNG } from "pngjs";
import { Format } from "@jimp/types";
import { PNGFilterType, PNGColorType } from "./constants.js";

export interface PNGOptions {
  deflateLevel?: number;
  deflateStrategy?: number;
  filterType?: PNGFilterType;
  colorType?: PNGColorType;
  inputHasAlpha?: boolean;
}

export * from "./constants.js";

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
          typeof colorType !== "undefined"
            ? colorType
            : inputHasAlpha
              ? PNGColorType.COLOR_ALPHA
              : PNGColorType.COLOR,
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
