import { Edge, JimpClass } from "@jimp/types";

import { BlendMode } from "./constants.js";
import * as compositeModes from "./composite-modes.js";
import { limit255 } from "@jimp/utils";

export function composite<I extends JimpClass>(
  baseImage: I,
  src: I,
  x = 0,
  y = 0,
  options: {
    mode?: BlendMode;
    opacitySource?: number;
    opacityDest?: number;
  } = {}
) {
  if (!(src instanceof baseImage.constructor)) {
    throw new Error("The source must be a Jimp image");
  }

  if (typeof x !== "number" || typeof y !== "number") {
    throw new Error("x and y must be numbers");
  }

  const { mode = BlendMode.SRC_OVER } = options;
  let { opacitySource = 1.0, opacityDest = 1.0 } = options;

  if (
    typeof opacitySource !== "number" ||
    opacitySource < 0 ||
    opacitySource > 1
  ) {
    opacitySource = 1.0;
  }

  if (typeof opacityDest !== "number" || opacityDest < 0 || opacityDest > 1) {
    opacityDest = 1.0;
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

  src.scan((sx, sy, idx) => {
    const dstIdx = baseImage.getPixelIndex(x + sx, y + sy, Edge.CROP);

    if (dstIdx === -1) {
      // Skip target pixels outside of dst
      return;
    }

    const blended = blendmode(
      {
        r: src.bitmap.data[idx + 0]! / 255,
        g: src.bitmap.data[idx + 1]! / 255,
        b: src.bitmap.data[idx + 2]! / 255,
        a: src.bitmap.data[idx + 3]! / 255,
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
