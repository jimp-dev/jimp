import { JimpClass } from "@jimp/types";
import { VerticalAlign, HorizontalAlign } from "@jimp/core";
import { ResizeStrategy, methods as resizeMethods } from "@jimp/plugin-resize";
import { methods as cropMethods } from "@jimp/plugin-crop";
import { z } from "zod";

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
   */
  align: z
    .union([
      z.number(),
      z.object({ x: z.number().optional(), y: z.number().optional() }),
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

/**
 * Turn `align` into how far along each axis to place the image, from 0
 * (left/top) to 1 (right/bottom). An axis with no flag or fraction is centered.
 */
function parseAlign(align: number | { x?: number; y?: number }) {
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

export const methods = {
  /**
   * Scale the image so the given width and height keeping the aspect ratio. Some parts of the image may be clipped.
   * @param options the size to cover
   * @param options.w the width to resize the image to
   * @param options.h the height to resize the image to
   * @param options.align A bitmask of `HorizontalAlign` and `VerticalAlign` flags, or `{ x, y }` fractions from 0 (left/top) to 1 (right/bottom)
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
    const { alignX, alignY } = parseAlign(align);

    const f =
      w / h > image.bitmap.width / image.bitmap.height
        ? w / image.bitmap.width
        : h / image.bitmap.height;

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
};
