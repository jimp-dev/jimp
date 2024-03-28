import { JimpClass } from "@jimp/types";

export const methods = {
  /**
   * Creates a circle out of an image.
   */
  circle<I extends JimpClass>(
    image: I,
    options: {
      x?: number;
      y?: number;
      radius?: number;
    } = {}
  ) {
    const radius =
      options.radius ||
      (image.bitmap.width > image.bitmap.height
        ? image.bitmap.height
        : image.bitmap.width) / 2;

    const center = {
      x: typeof options.x === "number" ? options.x : image.bitmap.width / 2,
      y: typeof options.y === "number" ? options.y : image.bitmap.height / 2,
    };

    image.scan((x, y, idx) => {
      const curR = Math.sqrt(
        Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2)
      );

      if (radius - curR <= 0.0) {
        image.bitmap.data[idx + 3] = 0;
      } else if (radius - curR < 1.0) {
        image.bitmap.data[idx + 3] = 255 * (radius - curR);
      }
    });

    return image;
  },
};
