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
   * A bitmask of at most one `HorizontalAlign` and one `VerticalAlign` flag
   * (default `HorizontalAlign.CENTER | VerticalAlign.MIDDLE`). An axis with no
   * flag is centered.
   */
  align: z.number().optional(),
  /** a scaling method (e.g. ResizeStrategy.BEZIER) */
  mode: z.nativeEnum(ResizeStrategy).optional(),
});

export type CoverOptions = z.infer<typeof CoverOptionsSchema>;

/**
 * Split an `align` bitmask into how far along each axis to place the image:
 * 0 for left/top, 1 for center/middle and 2 for right/bottom. An axis with no
 * flag is centered.
 */
function parseAlign(align: number) {
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

  return {
    alignH: hbits ? hbits >> 1 : 1,
    alignV: vbits ? vbits >> 1 : 1,
  };
}

export const methods = {
  /**
   * Scale the image so the given width and height keeping the aspect ratio. Some parts of the image may be clipped.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.cover({ w: 150, h: 100 });
   * ```
   */
  cover<I extends JimpClass>(image: I, options: CoverOptions) {
    const {
      w,
      h,
      align = HorizontalAlign.CENTER | VerticalAlign.MIDDLE,
      mode,
    } = CoverOptionsSchema.parse(options);
    const { alignH, alignV } = parseAlign(align);

    const f =
      w / h > image.bitmap.width / image.bitmap.height
        ? w / image.bitmap.width
        : h / image.bitmap.height;

    image = resizeMethods.scale(image, {
      f,
      mode,
    });
    image = cropMethods.crop(image, {
      x: ((image.bitmap.width - w) / 2) * alignH,
      y: ((image.bitmap.height - h) / 2) * alignV,
      w,
      h,
    });

    return image;
  },
};
