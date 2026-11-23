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
  /**
   * Whether to treat alpha as opacity (default `true`). With `false` every
   * channel is resampled on its own, which keeps the colour of transparent
   * pixels, for alpha that holds other data
   */
  premultiplyAlpha: z.boolean().optional(),
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
   * @param options.premultiplyAlpha (optional) whether to treat alpha as opacity (default `true`). With `false` the colour of transparent pixels is kept, and the image is copied into the letter box rather than drawn over the background
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
      premultiplyAlpha,
    } = ContainOptionsSchema.parse(options);

    const { alignH, alignV } = parseAlign(align);

    const f =
      w / h > image.bitmap.width / image.bitmap.height
        ? h / image.bitmap.height
        : w / image.bitmap.width;

    const c = resizeMethods.scale(clone(image), { f, mode, premultiplyAlpha });

    image = resizeMethods.resize(image, { w, h, mode });

    image.scan((_, __, idx) => {
      image.bitmap.data.writeUInt32BE(image.background, idx);
    });

    const x = Math.round(((image.bitmap.width - c.bitmap.width) / 2) * alignH);
    const y = Math.round(
      ((image.bitmap.height - c.bitmap.height) / 2) * alignV,
    );

    if (premultiplyAlpha === false) {
      // alpha isn't opacity, so copy the pixels rather than draw them over
      // the background
      const rowLength = c.bitmap.width * 4;

      for (let row = 0; row < c.bitmap.height; row++) {
        c.bitmap.data.copy(
          image.bitmap.data,
          ((y + row) * image.bitmap.width + x) * 4,
          row * rowLength,
          (row + 1) * rowLength,
        );
      }

      return image;
    }

    return blitMethods.blit(image, { src: c, x, y });
  },
};
