import { JimpClass } from "@jimp/types";
import { ResizeStrategy, AutoSize } from "./constants.js";

import Resize from "./modules/resize.js";
import Resize2 from "./modules/resize2.js";

export * from "./constants.js";

export const methods = {
  /**
   * Resizes the image to a set width and height using a 2-pass bilinear algorithm
   * @param w the width to resize the image to (or AutoSize)
   * @param h the height to resize the image to (or AutoSize)
   * @param mode a scaling method (e.g. Jimp.RESIZE_BEZIER)
   */
  resize<I extends JimpClass>(
    image: I,
    w: number,
    h: number,
    mode?: ResizeStrategy
  ) {
    if (typeof w !== "number" || typeof h !== "number") {
      throw new Error("w and h must be numbers");
    }

    if (w === AutoSize && h === AutoSize) {
      throw new Error("w and h cannot both be set to auto");
    }

    if (w === AutoSize) {
      w = image.bitmap.width * (h / image.bitmap.height);
    }

    if (h === AutoSize) {
      h = image.bitmap.height * (w / image.bitmap.width);
    }

    if (w < 0 || h < 0) {
      throw new Error("w and h must be positive numbers");
    }

    // round inputs
    w = Math.round(w) || 1;
    h = Math.round(h) || 1;

    if (mode && typeof Resize2[mode] === "function") {
      const dst = {
        data: Buffer.alloc(w * h * 4),
        width: w,
        height: h,
      };
      Resize2[mode](image.bitmap, dst);
      image.bitmap = dst;
    } else {
      const resize = new Resize(
        image.bitmap.width,
        image.bitmap.height,
        w,
        h,
        true,
        true,
        (buffer) => {
          image.bitmap.data = Buffer.from(buffer);
          image.bitmap.width = w;
          image.bitmap.height = h;
        }
      );

      resize.resize(image.bitmap.data);
    }

    return image;
  },

  /**
   * Uniformly scales the image by a factor.
   * @param f the factor to scale the image by
   * @param mode (optional) a scaling method (e.g. Jimp.RESIZE_BEZIER)
   */
  scale<I extends JimpClass>(image: I, f: number, mode?: ResizeStrategy) {
    if (typeof f !== "number") {
      throw new Error("f must be a number");
    }

    if (f < 0) {
      throw new Error("f must be a positive number");
    }

    const w = image.bitmap.width * f;
    const h = image.bitmap.height * f;
    this.resize(image, w, h, mode);

    return image;
  },

  /**
   * Scale the image to the largest size that fits inside the rectangle that has the given width and height.
   * @param w the width to resize the image to
   * @param h the height to resize the image to
   * @param mode a scaling method (e.g. ResizeStrategy.BEZIER)
   */
  scaleToFit<I extends JimpClass>(
    image: I,
    w: number,
    h: number,
    mode?: ResizeStrategy
  ) {
    if (typeof w !== "number" || typeof h !== "number") {
      throw new Error("w and h must be numbers");
    }

    const f =
      w / h > image.bitmap.width / image.bitmap.height
        ? h / image.bitmap.height
        : w / image.bitmap.width;

    this.scale(image, f, mode);

    return image;
  },
};
