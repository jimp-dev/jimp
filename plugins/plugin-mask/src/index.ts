import { JimpClass } from "@jimp/types";

export function mask<I extends JimpClass>(image: I, src: I, x = 0, y = 0) {
  // round input
  x = Math.round(x);
  y = Math.round(y);

  const w = image.bitmap.width;
  const h = image.bitmap.height;

  src.scan(function (sx, sy, idx) {
    const destX = x + sx;
    const destY = y + sy;

    if (destX >= 0 && destY >= 0 && destX < w && destY < h) {
      const dstIdx = image.getPixelIndex(destX, destY);
      const { data } = src.bitmap;
      const avg = (data[idx + 0]! + data[idx + 1]! + data[idx + 2]!) / 3;

      image.bitmap.data[dstIdx + 3] *= avg / 255;
    }
  });

  return image;
}

export default () => ({
  /**
   * Masks a source image on to this image using average pixel colour. A completely black pixel on the mask will turn a pixel in the image completely transparent.
   * @param src the source Jimp instance
   * @param x the horizontal position to blit the image
   * @param y the vertical position to blit the image
   */
  mask,
});
