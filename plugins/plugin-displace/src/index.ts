import { JimpClass } from "@jimp/types";
import { clone } from "@jimp/utils";

export const methods = {
  /**
   * Displaces the image based on the provided displacement map
   * @param map the source Jimp instance
   * @param offset the maximum displacement value
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   * const map = await Jimp.read("test/map.png");
   *
   * image.displace(map, 10);
   * ```
   */
  displace<I extends JimpClass>(image: I, map: I, offset: number) {
    if (typeof map !== "object" || !map.bitmap) {
      throw new Error("The source must be a Jimp image");
    }

    if (typeof offset !== "number") {
      throw new Error("offset must be a number");
    }

    const source = clone(image);

    image.scan((x, y, idx) => {
      let displacement = (map.bitmap.data[idx]! / 256) * offset;
      displacement = Math.round(displacement);

      const ids = image.getPixelIndex(x + displacement, y);
      image.bitmap.data[ids] = source.bitmap.data[idx]!;
      image.bitmap.data[ids + 1] = source.bitmap.data[idx + 1]!;
      image.bitmap.data[ids + 2] = source.bitmap.data[idx + 2]!;
    });

    return image;
  },
};
