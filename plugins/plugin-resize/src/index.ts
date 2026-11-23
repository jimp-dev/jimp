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
    /**
     * Whether to treat alpha as opacity and weight the colour by it (default
     * `true`). With `false` every channel is resampled on its own, which keeps
     * the colour of transparent pixels, for alpha that holds other data
     */
    premultiplyAlpha: z.boolean().optional(),
  }),
  z.object({
    /** the width to resize the image to */
    w: z.number().min(0).optional(),
    /** the height to resize the image to */
    h: z.number().min(0),
    /** a scaling method (e.g. ResizeStrategy.BEZIER) */
    mode: z.nativeEnum(ResizeStrategy).optional(),
    /**
     * Whether to treat alpha as opacity and weight the colour by it (default
     * `true`). With `false` every channel is resampled on its own, which keeps
     * the colour of transparent pixels, for alpha that holds other data
     */
    premultiplyAlpha: z.boolean().optional(),
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
  /**
   * Whether to treat alpha as opacity and weight the colour by it (default
   * `true`). With `false` every channel is resampled on its own, which keeps
   * the colour of transparent pixels, for alpha that holds other data
   */
  premultiplyAlpha: z.boolean().optional(),
});

export type ScaleToFitOptions = z.infer<typeof ScaleToFitOptionsSchema>;

const ScaleComplexOptionsSchema = z.object({
  /** the width to resize the image to */
  f: z.number().min(0),
  /** a scaling method (e.g. ResizeStrategy.BEZIER) */
  mode: z.nativeEnum(ResizeStrategy).optional(),
  /**
   * Whether to treat alpha as opacity and weight the colour by it (default
   * `true`). With `false` every channel is resampled on its own, which keeps
   * the colour of transparent pixels, for alpha that holds other data
   */
  premultiplyAlpha: z.boolean().optional(),
});

export type ScaleComplexOptions = z.infer<typeof ScaleComplexOptionsSchema>;
export type ScaleOptions = number | ScaleComplexOptions;

/** Copy RGBA data with each color multiplied by its pixel's alpha */
function toPremultiplied(data: ArrayLike<number>) {
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

/** Round resized RGBA into bytes */
function roundToBytes(data: ArrayLike<number>) {
  if (data instanceof Uint8Array) {
    return Buffer.from(data);
  }

  const result = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i++) {
    result[i] = Math.round(data[i]!);
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
        Math.max(0, Math.round((data[i + k]! * 255) / data[i + 3]!)),
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
   * @param options.premultiplyAlpha (optional) whether to treat alpha as opacity (default `true`), so transparent pixels don't darken their neighbours. Pass `false` when alpha holds other data (e.g. a texture mask): every channel is then resampled on its own and transparent pixels keep their colour
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
   *
   * // keep the colour of transparent pixels, e.g. for a texture whose alpha is a mask
   * image.resize({ w: 150, premultiplyAlpha: false });
   * ```
   */
  resize<I extends JimpClass>(image: I, options: ResizeOptions) {
    const { mode, premultiplyAlpha = true } =
      ResizeOptionsSchema.parse(options);

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
      Resize2[mode](image.bitmap, dst, premultiplyAlpha);
      image.bitmap = dst;
    } else {
      const { data } = image.bitmap;
      // Images with transparency are resized with their colors premultiplied
      // by alpha, so transparent pixels don't darken their neighbors
      const premultiply =
        premultiplyAlpha &&
        data.some((value, i) => (i & 3) === 3 && value !== 255);
      const resize = new (Resize as unknown as Constructable<ResizeClass>)(
        image.bitmap.width,
        image.bitmap.height,
        w,
        h,
        true,
        true,
        (buffer: ArrayLike<number>) => {
          image.bitmap.data = premultiply
            ? unpremultiplyAlpha(buffer)
            : roundToBytes(buffer);
          image.bitmap.width = w;
          image.bitmap.height = h;
        },
      );

      resize.resize(premultiply ? toPremultiplied(data) : data);
    }

    return image;
  },

  /**
   * Uniformly scales the image by a factor.
   * @param options the factor to scale the image by, or an object with the factor and scaling method
   * @param options.f the factor to scale the image by
   * @param options.mode (optional) a scaling method (e.g. ResizeStrategy.BEZIER)
   * @param options.premultiplyAlpha (optional) whether to treat alpha as opacity (default `true`). See `resize`
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
    const { f, mode, premultiplyAlpha } =
      typeof options === "number"
        ? ({ f: options } as ScaleComplexOptions)
        : ScaleComplexOptionsSchema.parse(options);
    const w = image.bitmap.width * f;
    const h = image.bitmap.height * f;

    return this.resize(image, { w, h, mode, premultiplyAlpha });
  },

  /**
   * Scale the image to the largest size that fits inside the rectangle that has the given width and height.
   * @param options the size to fit the image in
   * @param options.w the width to resize the image to
   * @param options.h the height to resize the image to
   * @param options.mode a scaling method (e.g. ResizeStrategy.BEZIER)
   * @param options.premultiplyAlpha (optional) whether to treat alpha as opacity (default `true`). See `resize`
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
    const { h, w, mode, premultiplyAlpha } =
      ScaleToFitOptionsSchema.parse(options);
    const f =
      w / h > image.bitmap.width / image.bitmap.height
        ? h / image.bitmap.height
        : w / image.bitmap.width;

    return this.scale(image, { f, mode, premultiplyAlpha });
  },
};
