import { JimpClass } from "@jimp/types";
import { VerticalAlign, HorizontalAlign } from "@jimp/core";
import { ResizeStrategy, methods as resizeMethods } from "@jimp/plugin-resize";
import { methods as cropMethods } from "@jimp/plugin-crop";
import { z } from "zod";

import { COVER_STRATEGIES, findSmartAlign } from "./smart.js";

export type { CoverStrategy } from "./smart.js";

const CoverOptionsSchema = z.object({
  /** the width to resize the image to */
  w: z.number(),
  /** the height to resize the image to */
  h: z.number(),
  /**
   * Where to place the image (default `HorizontalAlign.CENTER |
   * VerticalAlign.MIDDLE`). Either a bitmask of at most one `HorizontalAlign`
   * and one `VerticalAlign` flag, or `{ x, y }` fractions from 0 (left/top)
   * to 1 (right/bottom), like CSS `object-position` percentages. An axis with
   * no flag or fraction is centered, and fractions are clamped to 0-1.
   *
   * Or a strategy that looks at the image to choose: `"entropy"` keeps the
   * most detailed part, and `"attention"` the part with the most edges,
   * saturated colour and skin tones, like sharp's `position` strategies.
   */
  align: z
    .union([
      z.number(),
      z.object({ x: z.number().optional(), y: z.number().optional() }),
      z.enum(COVER_STRATEGIES),
    ])
    .optional(),
  /** a scaling method (e.g. ResizeStrategy.BEZIER) */
  mode: z.nativeEnum(ResizeStrategy).optional(),
  /**
   * Whether to treat alpha as opacity (default `true`). With `false` every
   * channel is resampled on its own, which keeps the colour of transparent
   * pixels, for alpha that holds other data
   */
  premultiplyAlpha: z.boolean().optional(),
});

export type CoverOptions = z.infer<typeof CoverOptionsSchema>;

const CoverRectOptionsSchema = CoverOptionsSchema.pick({
  w: true,
  h: true,
  align: true,
});

export type CoverRectOptions = z.infer<typeof CoverRectOptionsSchema>;

/**
 * Turn `align` into how far along each axis to place the image, from 0
 * (left/top) to 1 (right/bottom). An axis with no flag or fraction is centered.
 * Strategies look at the image, keeping a `keep`-sized part of it.
 */
function parseAlign(
  align: NonNullable<CoverOptions["align"]>,
  image: JimpClass,
  keep: { w: number; h: number },
) {
  if (typeof align === "string") {
    return findSmartAlign(image.bitmap, keep, align);
  }

  if (typeof align === "object") {
    const clamp = (v = 0.5) => Math.min(1, Math.max(0, v));
    return { alignX: clamp(align.x), alignY: clamp(align.y) };
  }

  const hbits = align & 0b111;
  const vbits = (align >> 3) & 0b111;

  if (
    !Number.isInteger(align) ||
    align !== (hbits | (vbits << 3)) ||
    hbits & (hbits - 1) ||
    vbits & (vbits - 1)
  ) {
    throw new Error(
      "align must combine at most one HorizontalAlign and one VerticalAlign flag",
    );
  }

  // LEFT/TOP is 1, CENTER/MIDDLE 2 and RIGHT/BOTTOM 4
  return {
    alignX: hbits ? (hbits >> 1) / 2 : 0.5,
    alignY: vbits ? (vbits >> 1) / 2 : 0.5,
  };
}

/** How much `cover` scales the image by to fill a `w` × `h` box */
function coverFactor(image: JimpClass, w: number, h: number) {
  return w / h > image.bitmap.width / image.bitmap.height
    ? w / image.bitmap.width
    : h / image.bitmap.height;
}

export const methods = {
  /**
   * Scale the image so the given width and height keeping the aspect ratio. Some parts of the image may be clipped.
   * @param options the size to cover
   * @param options.w the width to resize the image to
   * @param options.h the height to resize the image to
   * @param options.align A bitmask of `HorizontalAlign` and `VerticalAlign` flags, `{ x, y }` fractions from 0 (left/top) to 1 (right/bottom), or `"entropy"` or `"attention"` to keep the most interesting part
   * @param options.mode a scaling method (e.g. ResizeStrategy.BEZIER)
   * @param options.premultiplyAlpha (optional) whether to treat alpha as opacity (default `true`). With `false` the colour of transparent pixels is kept
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.cover({ w: 150, h: 100 });
   *
   * // like CSS `object-position: center 20%`
   * image.cover({ w: 150, h: 100, align: { x: 0.5, y: 0.2 } });
   *
   * // keep the subject of an off-centre photo
   * image.cover({ w: 150, h: 150, align: "attention" });
   * ```
   */
  cover<I extends JimpClass>(image: I, options: CoverOptions) {
    const {
      w,
      h,
      align = HorizontalAlign.CENTER | VerticalAlign.MIDDLE,
      mode,
      premultiplyAlpha,
    } = CoverOptionsSchema.parse(options);
    const f = coverFactor(image, w, h);
    const { alignX, alignY } = parseAlign(align, image, {
      w: w / f,
      h: h / f,
    });

    image = resizeMethods.scale(image, {
      f,
      mode,
      premultiplyAlpha,
    });
    image = cropMethods.crop(image, {
      x: (image.bitmap.width - w) * alignX,
      y: (image.bitmap.height - h) * alignY,
      w,
      h,
    });

    return image;
  },

  /**
   * Measure the part of the image that {@link cover} would keep, in the
   * image's own pixels, without changing it. Use it to crop at full
   * resolution, to draw the crop for a user to adjust, or to save the result
   * of a smart `align` and reuse it later. The rectangle is rounded to whole
   * pixels and always lies inside the image.
   * @param options the size to cover
   * @param options.w the width of the box
   * @param options.h the height of the box
   * @param options.align as for {@link cover}
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   * const rect = image.coverRect({ w: 1200, h: 630, align: "attention" });
   *
   * // crop the original to the same framing, without scaling it
   * image.crop(rect);
   * ```
   */
  coverRect<I extends JimpClass>(image: I, options: CoverRectOptions) {
    const {
      w,
      h,
      align = HorizontalAlign.CENTER | VerticalAlign.MIDDLE,
    } = CoverRectOptionsSchema.parse(options);
    const { width, height } = image.bitmap;
    const f = coverFactor(image, w, h);
    const { alignX, alignY } = parseAlign(align, image, {
      w: w / f,
      h: h / f,
    });
    const keepW = Math.min(width, Math.max(1, Math.round(w / f)));
    const keepH = Math.min(height, Math.max(1, Math.round(h / f)));

    return {
      x: Math.round((width - keepW) * alignX),
      y: Math.round((height - keepH) * alignY),
      w: keepW,
      h: keepH,
    };
  },
};
