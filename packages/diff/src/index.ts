import { resize } from "@jimp/plugin-resize";
import { JimpClass } from "@jimp/types";
import { clone } from "@jimp/utils";
import pixelMatch from "pixelmatch";

/**
 * Diffs two images and returns
 * @param img1 a Jimp image to compare
 * @param img2 a Jimp image to compare
 * @param threshold a number, 0 to 1, the smaller the value the more sensitive the comparison (default: 0.1)
 */
export function diff<I extends JimpClass>(img1: I, img2: I, threshold = 0.1) {
  const bmp1 = img1.bitmap;
  const bmp2 = img2.bitmap;

  if (bmp1.width !== bmp2.width || bmp1.height !== bmp2.height) {
    if (bmp1.width * bmp1.height > bmp2.width * bmp2.height) {
      // img1 is bigger
      img1 = resize(clone(img1), bmp2.width, bmp2.height);
    } else {
      // img2 is bigger (or they are the same in area)
      img2 = resize(clone(img2), bmp1.width, bmp1.height);
    }
  }

  if (typeof threshold !== "number" || threshold < 0 || threshold > 1) {
    throw new Error("threshold must be a number between 0 and 1");
  }

  const diff = new (img1 as any).constructor({
    width: bmp1.width,
    height: bmp1.height,
    color: 0xffffffff,
  });

  const numDiffPixels = pixelMatch(
    bmp1.data,
    bmp2.data,
    diff.bitmap.data,
    diff.bitmap.width,
    diff.bitmap.height,
    { threshold }
  );

  return {
    percent: numDiffPixels / (diff.bitmap.width * diff.bitmap.height),
    image: diff,
  };
}
