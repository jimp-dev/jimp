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
    resizeCallback: (buffer: ArrayLike<number>) => void
  ): ResizeClass;
  resize(buffer: ArrayLike<number>): void;
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
    /** resize the colour and alpha channels separately, so transparent pixels keep their colour */
    separateAlpha: z.boolean().optional(),
  }),
  z.object({
    /** the width to resize the image to */
    w: z.number().min(0).optional(),
    /** the height to resize the image to */
    h: z.number().min(0),
    /** a scaling method (e.g. ResizeStrategy.BEZIER) */
    mode: z.nativeEnum(ResizeStrategy).optional(),
    /** resize the colour and alpha channels separately, so transparent pixels keep their colour */
    separateAlpha: z.boolean().optional(),
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

/** Copy RGBA data with each color multiplied by its pixel's alpha */
function premultiplyAlpha(data: ArrayLike<number>) {
  const result = new Float32Array(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]!;

    result[i] = (data[i]! * a) / 255;
    result[i + 1] = (data[i + 1]! * a) / 255;
    result[i + 2] = (data[i + 2]! * a) / 255;
    result[i + 3] = a;
  }

  return result;
}

/**
 * Turn premultiplied RGBA back into straight RGBA. Fully transparent pixels
 * become transparent black.
 */
function unpremultiplyAlpha(data: ArrayLike<number>) {
  const result = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const a = Math.min(255, Math.max(0, Math.round(data[i + 3]!)));

    result[i + 3] = a;

    if (a === 0) {
      continue;
    }

    for (let k = 0; k < 3; k++) {
      result[i + k] = Math.min(
        255,
        Math.max(0, Math.round((data[i + k]! * 255) / data[i + 3]!))
      );
    }
  }

  return result;
}

export const methods = {
  /**
   * Resizes the image to a set width and height using a 2-pass bilinear algorithm,
   * or the `ResizeStrategy` given as `mode`. For the best quality use
   * `ResizeStrategy.LANCZOS`, or `ResizeStrategy.MITCHELL` for a smoother result
   * with less ringing.
   * @param options the size to resize the image to, and the scaling method
   * @param options.w the width to resize the image to
   * @param options.h the height to resize the image to
   * @param options.mode (optional) a scaling method (e.g. ResizeStrategy.LANCZOS)
   * @param options.separateAlpha (optional) resize the colour and alpha channels separately. By default most modes drop the colour of transparent pixels; use this when alpha isn't opacity (e.g. a texture that stores other data in it)
   * @example
   * ```ts
   * import { Jimp, ResizeStrategy } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.resize({ w: 150 });
   *
   * // or pick the scaling method
   * image.resize({ w: 150, mode: ResizeStrategy.LANCZOS });
   * ```
   */
  resize<I extends JimpClass>(image: I, options: ResizeOptions) {
    const { mode, separateAlpha } = ResizeOptionsSchema.parse(options);

    if (separateAlpha) {
      // No mode drops or weights the colour of opaque pixels, so resize an
      // opaque copy for the colour and the image itself for the alpha.
      const opaque = {
        ...image.bitmap,
        data: Buffer.from(image.bitmap.data),
      };

      for (let i = 3; i < opaque.data.length; i += 4) {
        opaque.data[i] = 255;
      }

      const together = { ...options, separateAlpha: false };
      const alpha = this.resize(image, together).bitmap.data;

      image.bitmap = opaque;
      const { data } = this.resize(image, together).bitmap;

      for (let i = 3; i < data.length; i += 4) {
        data[i] = alpha[i]!;
      }

      return image;
    }

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
      const { data } = image.bitmap;
      // Images with transparency are resized with their colors premultiplied
      // by alpha, so transparent pixels don't darken their neighbors
      const hasAlpha = data.some((value, i) => (i & 3) === 3 && value !== 255);
      const resize = new (Resize as unknown as Constructable<ResizeClass>)(
        image.bitmap.width,
        image.bitmap.height,
        w,
        h,
        true,
        true,
        (buffer: ArrayLike<number>) => {
          image.bitmap.data = hasAlpha
            ? unpremultiplyAlpha(buffer)
            : Buffer.from(buffer as Uint8Array);
          image.bitmap.width = w;
          image.bitmap.height = h;
        }
      );

      resize.resize(hasAlpha ? premultiplyAlpha(data) : data);
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
