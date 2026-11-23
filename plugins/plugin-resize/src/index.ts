import { Buffer } from "buffer";
import { JimpClass } from "@jimp/types";
import { ResizeStrategy } from "./constants.js";
import { z } from "zod";

import Resize from "./modules/resize.js";
import { operations as Resize2 } from "./modules/resize2.js";

export * from "./constants.js";

interface ResizeClass {
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  new (
    widthOriginal: number,
    heightOriginal: number,
    targetWidth: number,
    targetHeight: number,
    blendAlpha: boolean,
    interpolationPass: boolean,
    resizeCallback: (buffer: Buffer) => void
  ): ResizeClass;
  resize(buffer: Buffer): void;
}

type Constructable<T> = new (...args: unknown[]) => T;

const ResizeOptionsSchema = z.union([
  z.object({
    /** the width to resize the image to */
    w: z.number().min(0),
    /** the height to resize the image to */
    h: z.number().min(0).optional(),
    /** a scaling method (e.g. ResizeStrategy.BEZIER) */
    mode: z.nativeEnum(ResizeStrategy).optional(),
  }),
  z.object({
    /** the width to resize the image to */
    w: z.number().min(0).optional(),
    /** the height to resize the image to */
    h: z.number().min(0),
    /** a scaling method (e.g. ResizeStrategy.BEZIER) */
    mode: z.nativeEnum(ResizeStrategy).optional(),
  }),
]);

export type ResizeOptions = z.infer<typeof ResizeOptionsSchema>;

const ScaleToFitOptionsSchema = z.object({
  /** the width to resize the image to */
  w: z.number().min(0),
  /** the height to resize the image to */
  h: z.number().min(0),
  /** a scaling method (e.g. ResizeStrategy.BEZIER) */
  mode: z.nativeEnum(ResizeStrategy).optional(),
});

export type ScaleToFitOptions = z.infer<typeof ScaleToFitOptionsSchema>;

const ScaleComplexOptionsSchema = z.object({
  /** the width to resize the image to */
  f: z.number().min(0),
  /** a scaling method (e.g. ResizeStrategy.BEZIER) */
  mode: z.nativeEnum(ResizeStrategy).optional(),
});

export type ScaleComplexOptions = z.infer<typeof ScaleComplexOptionsSchema>;
export type ScaleOptions = number | ScaleComplexOptions;

export const methods = {
  /**
   * Resizes the image to a set width and height using a 2-pass bilinear algorithm
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.resize({ w: 150 });
   * ```
   */
  resize<I extends JimpClass>(image: I, options: ResizeOptions) {
    const { mode } = ResizeOptionsSchema.parse(options);

    let w: number;
    let h: number;

    if (typeof options.w === "number") {
      w = options.w;
      h = options.h ?? image.bitmap.height * (w / image.bitmap.width);
    } else if (typeof options.h === "number") {
      h = options.h;
      w = options.w ?? image.bitmap.width * (h / image.bitmap.height);
    } else {
      throw new Error("w must be a number");
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
      const resize = new (Resize as unknown as Constructable<ResizeClass>)(
        image.bitmap.width,
        image.bitmap.height,
        w,
        h,
        true,
        true,
        (buffer: Buffer) => {
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
   * @param options the factor to scale the image by, or an object with the factor and scaling method
   * @param options.f the factor to scale the image by
   * @param options.mode (optional) a scaling method (e.g. ResizeStrategy.BEZIER)
   * @example
   * ```ts
   * import { Jimp, ResizeStrategy } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.scale(0.5);
   *
   * // or pick the scaling method
   * image.scale({ f: 0.5, mode: ResizeStrategy.BEZIER });
   * ```
   */
  scale<I extends JimpClass>(image: I, options: ScaleOptions) {
    const { f, mode } =
      typeof options === "number"
        ? ({ f: options } as ScaleComplexOptions)
        : ScaleComplexOptionsSchema.parse(options);
    const w = image.bitmap.width * f;
    const h = image.bitmap.height * f;

    return this.resize(image, { w, h, mode: mode });
  },

  /**
   * Scale the image to the largest size that fits inside the rectangle that has the given width and height.
   * @param options the size to fit the image in
   * @param options.w the width to resize the image to
   * @param options.h the height to resize the image to
   * @param options.mode a scaling method (e.g. ResizeStrategy.BEZIER)
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.scaleToFit({ w: 100, h: 100 });
   * ```
   */
  scaleToFit<I extends JimpClass>(image: I, options: ScaleToFitOptions) {
    const { h, w, mode } = ScaleToFitOptionsSchema.parse(options);
    const f =
      w / h > image.bitmap.width / image.bitmap.height
        ? h / image.bitmap.height
        : w / image.bitmap.width;

    return this.scale(image, { f, mode: mode });
  },
};
