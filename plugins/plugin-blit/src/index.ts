import { JimpClass, JimpClassSchema } from "@jimp/types";
import { limit255, pixelsInColorSpaceOf, scan } from "@jimp/utils";
import { z } from "zod";

const BlitOptionsSchemaComplex = z.object({
  src: JimpClassSchema,
  /** the x position to blit the image */
  x: z.number().optional(),
  /** the y position to blit the image */
  y: z.number().optional(),
  /** the x position from which to crop the source image */
  srcX: z.number().optional(),
  /** the y position from which to crop the source image */
  srcY: z.number().optional(),
  /** the width to which to crop the source image */
  srcW: z.number().optional(),
  /** the height to which to crop the source image */
  srcH: z.number().optional(),
});

type BlitOptionsComplex = z.infer<typeof BlitOptionsSchemaComplex>;

const BlitOptionsSchema = z.union([JimpClassSchema, BlitOptionsSchemaComplex]);

export type BlitOptions = z.infer<typeof BlitOptionsSchema>;

export const methods = {
  /**
   * Short for "bit-block transfer".
   * It involves the transfer of a block of pixel data from one area of a computer's memory to another area, typically for the purpose of rendering images on the screen or manipulating them in various ways.
   * It's a fundamental operation in computer graphics utilized in various applications, from operating systems to video games.
   *
   * Only the part of the source region (`srcX`, `srcY`, `srcW`, `srcH`) that's
   * inside the source is drawn, and only where it lands inside this image.
   * The pixels drawn stay where they'd have been if the whole region had been
   * drawn: a region starting at `srcX: -10` leaves the first 10 columns at
   * `x` untouched.
   *
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   * const parrot = await Jimp.read("test/party-parrot.png");
   *
   * image.blit({ src: parrot, x: 10, y: 10 });
   * ```
   */
  blit<I extends JimpClass>(image: I, options: BlitOptions) {
    const parsed = BlitOptionsSchema.parse(options);
    let {
      // eslint-disable-next-line prefer-const
      src,
      x = 0,
      y = 0,
      srcX = 0,
      srcY = 0,
      srcW = src.bitmap.width,
      srcH = src.bitmap.height,
    } = "bitmap" in parsed ? ({ src: parsed } as BlitOptionsComplex) : parsed;

    if (!("bitmap" in src)) {
      throw new Error("The source must be a Jimp image");
    }

    if (typeof x !== "number" || typeof y !== "number") {
      throw new Error("x and y must be numbers");
    }

    // round input
    x = Math.round(x);
    y = Math.round(y);

    // round input
    srcX = Math.round(srcX);
    srcY = Math.round(srcY);
    srcW = Math.round(srcW);
    srcH = Math.round(srcH);

    const maxWidth = image.bitmap.width;
    const maxHeight = image.bitmap.height;
    // Draw the source's colours, not its values, if it's in another colour
    // space
    const srcData = pixelsInColorSpaceOf(src, image);

    scan(src, srcX, srcY, srcW, srcH, function (sx, sy, idx) {
      const xOffset = x + sx - srcX;
      const yOffset = y + sy - srcY;

      if (
        xOffset >= 0 &&
        yOffset >= 0 &&
        maxWidth - xOffset > 0 &&
        maxHeight - yOffset > 0
      ) {
        const dstIdx = image.getPixelIndex(xOffset, yOffset);
        const srcColor = {
          r: srcData[idx] || 0,
          g: srcData[idx + 1] || 0,
          b: srcData[idx + 2] || 0,
          a: srcData[idx + 3] || 0,
        };

        // A fully transparent source pixel leaves the destination untouched.
        // This also means the output alpha below is never 0.
        if (srcColor.a === 0) {
          return;
        }

        const dst = {
          r: image.bitmap.data[dstIdx] || 0,
          g: image.bitmap.data[dstIdx + 1] || 0,
          b: image.bitmap.data[dstIdx + 2] || 0,
          a: image.bitmap.data[dstIdx + 3] || 0,
        };

        // Porter-Duff source-over, the same as composite's SRC_OVER mode
        const srcA = srcColor.a / 255;
        const dstA = dst.a / 255;
        const outA = srcA + dstA - srcA * dstA;
        const blend = (s: number, d: number) =>
          Math.round(limit255((s * srcA + d * dstA * (1 - srcA)) / outA));

        image.bitmap.data[dstIdx] = blend(srcColor.r, dst.r);
        image.bitmap.data[dstIdx + 1] = blend(srcColor.g, dst.g);
        image.bitmap.data[dstIdx + 2] = blend(srcColor.b, dst.b);
        image.bitmap.data[dstIdx + 3] = Math.round(limit255(outA * 255));
      }
    });

    return image;
  },
};
