import { Edge, JimpClass, JimpClassSchema } from "@jimp/types";

import { BlendMode } from "./constants.js";
import * as compositeModes from "./composite-modes.js";
import { limit255, pixelsInColorSpaceOf, scan } from "@jimp/utils";

const blendModes: string[] = Object.values(BlendMode);

/** Clamp an opacity to 0..1, using 1 if it isn't a number */
function toOpacity(value: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 1;
  }

  return Math.min(Math.max(value, 0), 1);
}

/** The image to draw: any Jimp image, from any Jimp class */
export type CompositeSource = Pick<JimpClass, "bitmap" | "iccProfile">;

export function composite<I extends JimpClass>(
  baseImage: I,
  src: CompositeSource,
  x = 0,
  y = 0,
  options: {
    mode?: BlendMode;
    opacitySource?: number;
    opacityDest?: number;
  } = {}
) {
  // Check the shape rather than the class, so images made by different Jimp
  // classes (e.g. one from createJimp and one from the default Jimp) mix
  if (!JimpClassSchema.safeParse(src).success) {
    throw new Error(
      "The source must be a Jimp image: an object with a bitmap of width, height and data"
    );
  }

  if (typeof x !== "number" || typeof y !== "number") {
    throw new Error("x and y must be numbers");
  }

  const { mode = BlendMode.SRC_OVER } = options;
  const opacitySource = toOpacity(options.opacitySource ?? 1);
  const opacityDest = toOpacity(options.opacityDest ?? 1);

  if (!blendModes.includes(mode)) {
    throw new Error(
      `Unknown blend mode "${mode}", expected one of: ${blendModes.join(", ")}`
    );
  }

  const blendmode = compositeModes[mode];

  // round input
  x = Math.round(x);
  y = Math.round(y);

  if (opacityDest !== 1.0) {
    baseImage.scan((_, __, idx) => {
      const v = baseImage.bitmap.data[idx + 3]! * opacityDest;
      baseImage.bitmap.data[idx + 3] = Math.round(v);
    });
  }

  // Draw the source's colours, not its values, if it's in another colour space
  const srcData = pixelsInColorSpaceOf(src, baseImage);

  const { width, height } = src.bitmap;

  scan(src, 0, 0, width, height, (sx, sy, idx) => {
    const dstIdx = baseImage.getPixelIndex(x + sx, y + sy, Edge.CROP);

    if (dstIdx === -1) {
      // Skip target pixels outside of dst
      return;
    }

    const blended = blendmode(
      {
        r: srcData[idx + 0]! / 255,
        g: srcData[idx + 1]! / 255,
        b: srcData[idx + 2]! / 255,
        a: srcData[idx + 3]! / 255,
      },
      {
        r: baseImage.bitmap.data[dstIdx + 0]! / 255,
        g: baseImage.bitmap.data[dstIdx + 1]! / 255,
        b: baseImage.bitmap.data[dstIdx + 2]! / 255,
        a: baseImage.bitmap.data[dstIdx + 3]! / 255,
      },
      opacitySource
    );

    // Round rather than let the Uint8Array truncate: floating point error can
    // put a result just under the integer it should be, e.g. an opaque source
    // over a semi-transparent pixel can give an alpha of 254.999...
    baseImage.bitmap.data[dstIdx + 0] = Math.round(limit255(blended.r * 255));
    baseImage.bitmap.data[dstIdx + 1] = Math.round(limit255(blended.g * 255));
    baseImage.bitmap.data[dstIdx + 2] = Math.round(limit255(blended.b * 255));
    baseImage.bitmap.data[dstIdx + 3] = Math.round(limit255(blended.a * 255));
  });

  return baseImage;
}
