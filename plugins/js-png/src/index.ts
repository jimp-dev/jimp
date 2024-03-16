import { PNG } from "pngjs";
import { Format } from "@jimp/types";
import { Jimp, JimpOptions } from "@jimp/core";

interface PNGOptions {
  deflateLevel?: number;
  deflateStrategy?: number;
  filterType?: number;
  colorType?: number;
  inputHasAlpha?: boolean;
}

export default function png(jimp: Jimp, options: JimpOptions) {
  return {
    mime: "image/png",
    encode: async (bitmap) => {
      const png = new PNG({
        width: bitmap.width,
        height: bitmap.height,
      });

      console.log(bitmap);

      png.data = bitmap.data;

      return PNG.sync.write(png, {
        // deflateLevel: data._deflateLevel,
        // deflateStrategy: data._deflateStrategy,
        // filterType: data._filterType,
        // colorType:
        //   typeof data._colorType === "number"
        //     ? data._colorType
        //     : data._rgba
        //       ? 6
        //       : 2,
        // inputHasAlpha: data._rgba,
        colorType: 6,
      });
    },
    decode: async (data) => {
      const result = PNG.sync.read(data);

      console.log(result);

      return {
        data: result.data,
        width: result.width,
        height: result.height,
      };
    },
  } satisfies Format<"image/png">;
}
