import { JimpClass } from "@jimp/types";
import { HorizontalAlign, VerticalAlign } from "@jimp/core";
import { clone } from "@jimp/utils";
import { ResizeStrategy, methods as resizeMethods } from "@jimp/plugin-resize";
import { methods as blitMethods } from "@jimp/plugin-blit";
import { z } from "zod";

const ContainOptionsSchema = z.object({
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

export type ContainOptions = z.infer<typeof ContainOptionsSchema>;

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
   * Scale the image to the given width and height keeping the aspect ratio. Some parts of the image may be letter boxed.
   * @param options the size to contain the image in
   * @param options.w the width to resize the image to
   * @param options.h the height to resize the image to
   * @param options.align A bitmask for horizontal and vertical alignment
   * @param options.mode a scaling method (e.g. ResizeStrategy.BEZIER)
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.contain({ w: 150, h: 100 });
   * ```
   */
  contain<I extends JimpClass>(image: I, options: ContainOptions) {
    const {
      w,
      h,
      align = HorizontalAlign.CENTER | VerticalAlign.MIDDLE,
      mode,
    } = ContainOptionsSchema.parse(options);

    const { alignH, alignV } = parseAlign(align);

    const f =
      w / h > image.bitmap.width / image.bitmap.height
        ? h / image.bitmap.height
        : w / image.bitmap.width;

    const c = resizeMethods.scale(clone(image), { f, mode });

    image = resizeMethods.resize(image, { w, h, mode });

    image.scan((_, __, idx) => {
      image.bitmap.data.writeUInt32BE(image.background, idx);
    });

    image = blitMethods.blit(image, {
      src: c,
      x: ((image.bitmap.width - c.bitmap.width) / 2) * alignH,
      y: ((image.bitmap.height - c.bitmap.height) / 2) * alignV,
    });

    return image;
  },
};
