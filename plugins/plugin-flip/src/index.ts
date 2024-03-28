import { JimpClass } from "@jimp/types";

export const methods = {
  /**
   * Flip the image.
   * @param horizontal a Boolean, if true the image will be flipped horizontally
   * @param vertical a Boolean, if true the image will be flipped vertically
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.flip(true, false);
   * ```
   */
  flip<I extends JimpClass>(image: I, horizontal: boolean, vertical: boolean) {
    if (typeof horizontal !== "boolean" || typeof vertical !== "boolean") {
      throw new Error("horizontal and vertical must be Booleans");
    }

    const bitmap = Buffer.alloc(image.bitmap.data.length);

    image.scan((x, y, idx) => {
      const _x = horizontal ? image.bitmap.width - 1 - x : x;
      const _y = vertical ? image.bitmap.height - 1 - y : y;
      const _idx = (image.bitmap.width * _y + _x) << 2;
      const data = image.bitmap.data.readUInt32BE(idx);

      bitmap.writeUInt32BE(data, _idx);
    });

    image.bitmap.data = Buffer.from(bitmap);

    return image;
  },
};
