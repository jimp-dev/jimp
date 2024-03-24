import { JimpClass } from "@jimp/types";
import { scan, limit255 } from "@jimp/utils";
import { greyscale } from "@jimp/plugin-color";

interface ThresholdOptions {
  /** A number auto limited between 0 - 255 */
  max: number;
  /** A number auto limited between 0 - 255 (default 255)  */
  replace?: number;
  /** A boolean whether to apply greyscale beforehand (default true)  */
  autoGreyscale?: boolean;
}

export function threshold<I extends JimpClass>(
  image: I,
  { max, replace = 255, autoGreyscale = true }: ThresholdOptions
) {
  if (typeof max !== "number") {
    throw new Error("max must be a number");
  }

  if (typeof replace !== "number") {
    throw new Error("replace must be a number");
  }

  if (typeof autoGreyscale !== "boolean") {
    throw new Error("autoGreyscale must be a boolean");
  }

  max = limit255(max);
  replace = limit255(replace);

  if (autoGreyscale) {
    greyscale(image);
  }

  scan(image, 0, 0, image.bitmap.width, image.bitmap.height, (_, __, idx) => {
    const grey =
      image.bitmap.data[idx]! < max ? image.bitmap.data[idx]! : replace;

    image.bitmap.data[idx] = grey;
    image.bitmap.data[idx + 1] = grey;
    image.bitmap.data[idx + 2] = grey;
  });

  return image;
}

export default function thresholdPlugin() {
  return {
    /**
     * Applies a minimum color threshold to a grayscale image.  Converts image to grayscale by default
     */
    threshold,
  };
}
