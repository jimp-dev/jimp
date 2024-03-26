import { JimpClass } from "@jimp/types";
import { VerticalAlign, HorizontalAlign } from "@jimp/core";
import { ResizeStrategy, scale } from "@jimp/plugin-resize";
import { crop } from "@jimp/plugin-crop";

export function cover<I extends JimpClass>(
  image: I,
  w: number,
  h: number,
  alignBits?: number,
  mode?: ResizeStrategy
) {
  alignBits = alignBits || HorizontalAlign.CENTER | VerticalAlign.MIDDLE;
  const hbits = alignBits & ((1 << 3) - 1);
  const vbits = alignBits >> 3;

  // check if more flags than one is in the bit sets
  if (
    !(
      (hbits !== 0 && !(hbits & (hbits - 1))) ||
      (vbits !== 0 && !(vbits & (vbits - 1)))
    )
  ) {
    throw new Error("only use one flag per alignment direction");
  }

  const alignH = hbits >> 1; // 0, 1, 2
  const alignV = vbits >> 1; // 0, 1, 2

  const f =
    w / h > image.bitmap.width / image.bitmap.height
      ? w / image.bitmap.width
      : h / image.bitmap.height;

  image = scale(image, f, mode);
  image = crop(
    image,
    ((image.bitmap.width - w) / 2) * alignH,
    ((image.bitmap.height - h) / 2) * alignV,
    w,
    h
  );

  return image;
}

export default () => ({
  /**
   * Scale the image so the given width and height keeping the aspect ratio. Some parts of the image may be clipped.
   * @param w the width to resize the image to
   * @param h the height to resize the image to
   * @param alignBits A bitmask for horizontal and vertical alignment
   * @param mode a scaling method (e.g. Jimp.RESIZE_BEZIER)
   */
  cover,
});
