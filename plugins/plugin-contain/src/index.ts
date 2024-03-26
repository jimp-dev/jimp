import { JimpClass } from "@jimp/types";
import { HorizontalAlign } from "@jimp/core";
import { clone } from "@jimp/utils";
import { ResizeStrategy, resize, scale } from "@jimp/plugin-resize";
import { blit } from "@jimp/plugin-blit";

function contain<I extends JimpClass>(
  image: I,
  w: number,
  h: number,
  alignBits?: number,
  mode?: ResizeStrategy
) {
  alignBits = alignBits || HorizontalAlign.CENTER | HorizontalAlign.CENTER;

  const hbits = alignBits & ((1 << 3) - 1);
  const vbits = alignBits >> 3;
  const alignH = hbits >> 1; // 0, 1, 2
  const alignV = vbits >> 1; // 0, 1, 2

  const f =
    w / h > image.bitmap.width / image.bitmap.height
      ? h / image.bitmap.height
      : w / image.bitmap.width;

  const c = scale(clone(image), f, mode);

  image = resize(image, w, h, mode);

  image.scan((_, __, idx) => {
    image.bitmap.data.writeUInt32BE(image.background, idx);
  });

  image = blit(image, {
    src: c,
    x: ((image.bitmap.width - c.bitmap.width) / 2) * alignH,
    y: ((image.bitmap.height - c.bitmap.height) / 2) * alignV,
  });

  return image;
}

export default () => ({
  /**
   * Scale the image to the given width and height keeping the aspect ratio. Some parts of the image may be letter boxed.
   * @param w the width to resize the image to
   * @param h the height to resize the image to
   * @param alignBits A bitmask for horizontal and vertical alignment
   * @param mode a scaling method (e.g. Jimp.RESIZE_BEZIER)
   */
  contain,
});
