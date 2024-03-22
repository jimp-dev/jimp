/* eslint-disable no-labels */

import { JimpClass } from "@jimp/types";
import { colorDiff, intToRGBA, scan } from "@jimp/utils";

export function crop<I extends JimpClass>(
  image: I,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  if (typeof x !== "number" || typeof y !== "number") {
    throw new Error("x and y must be numbers");
  }

  if (typeof w !== "number" || typeof h !== "number") {
    throw new Error("w and h must be numbers");
  }

  // round input
  x = Math.round(x);
  y = Math.round(y);
  w = Math.round(w);
  h = Math.round(h);

  if (x === 0 && w === image.bitmap.width) {
    // shortcut
    const start = (w * y + x) << 2;
    const end = start + ((h * w) << 2);

    image.bitmap.data = image.bitmap.data.slice(start, end);
  } else {
    const bitmap = Buffer.allocUnsafe(w * h * 4);
    let offset = 0;

    scan(image, x, y, w, h, function (x, y, idx) {
      const data = image.bitmap.data.readUInt32BE(idx);
      bitmap.writeUInt32BE(data, offset);
      offset += 4;
    });

    image.bitmap.data = bitmap;
  }

  image.bitmap.width = w;
  image.bitmap.height = h;

  return image;
}

export interface AutocropOptions {
  /** percent of color difference tolerance (default value) */
  tolerance?: number;
  /** flag to force cropping only if the image has a real "frame" i.e. all 4 sides have some border (default value) */
  cropOnlyFrames?: boolean;
  /**
   * force cropping top be symmetric
   */
  cropSymmetric?: boolean;
  /** Amount of pixels in border to leave */
  leaveBorder?: number;
  ignoreSides?: {
    north?: boolean;
    south?: boolean;
    east?: boolean;
    west?: boolean;
  };
}

export function autocrop<I extends JimpClass>(
  image: I,
  {
    tolerance = 0.0002,
    cropOnlyFrames = true,
    cropSymmetric = false,
    leaveBorder = 0,
    ignoreSides: ignoreSidesArg,
  }: AutocropOptions = {},
) {
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const minPixelsPerSide = 1; // to avoid cropping completely the image, resulting in an invalid 0 sized image

  // i.e. north and south / east and west are cropped by the same value
  let ignoreSides = {
    north: false,
    south: false,
    east: false,
    west: false,
    ...ignoreSidesArg,
  };

  /**
   * All borders must be of the same color as the top left pixel, to be cropped.
   * It should be possible to crop borders each with a different color,
   * but since there are many ways for corners to intersect, it would
   * introduce unnecessary complexity to the algorithm.
   */

  // scan each side for same color borders
  let colorTarget = image.getPixelColor(0, 0); // top left pixel color is the target color
  const rgba1 = intToRGBA(colorTarget);

  // for north and east sides
  let northPixelsToCrop = 0;
  let eastPixelsToCrop = 0;
  let southPixelsToCrop = 0;
  let westPixelsToCrop = 0;

  // north side (scan rows from north to south)
  colorTarget = image.getPixelColor(0, 0);
  if (!ignoreSides.north) {
    north: for (let y = 0; y < h - minPixelsPerSide; y++) {
      for (let x = 0; x < w; x++) {
        const colorXY = image.getPixelColor(x, y);
        const rgba2 = intToRGBA(colorXY);

        if (colorDiff(rgba1, rgba2) > tolerance) {
          // this pixel is too distant from the first one: abort this side scan
          break north;
        }
      }

      // this row contains all pixels with the same color: increment this side pixels to crop
      northPixelsToCrop++;
    }
  }

  // west side (scan columns from west to east)
  colorTarget = image.getPixelColor(w, 0);
  if (!ignoreSides.west) {
    west: for (let x = 0; x < w - minPixelsPerSide; x++) {
      for (let y = 0 + northPixelsToCrop; y < h; y++) {
        const colorXY = image.getPixelColor(x, y);
        const rgba2 = intToRGBA(colorXY);

        if (colorDiff(rgba1, rgba2) > tolerance) {
          // this pixel is too distant from the first one: abort this side scan
          break west;
        }
      }

      // this column contains all pixels with the same color: increment this side pixels to crop
      westPixelsToCrop++;
    }
  }

  // south side (scan rows from south to north)
  colorTarget = image.getPixelColor(0, h);

  if (!ignoreSides.south) {
    south: for (let y = h - 1; y >= northPixelsToCrop + minPixelsPerSide; y--) {
      for (let x = w - eastPixelsToCrop - 1; x >= 0; x--) {
        const colorXY = image.getPixelColor(x, y);
        const rgba2 = intToRGBA(colorXY);

        if (colorDiff(rgba1, rgba2) > tolerance) {
          // this pixel is too distant from the first one: abort this side scan
          break south;
        }
      }

      // this row contains all pixels with the same color: increment this side pixels to crop
      southPixelsToCrop++;
    }
  }

  // east side (scan columns from east to west)
  colorTarget = image.getPixelColor(w, h);
  if (!ignoreSides.east) {
    east: for (
      let x = w - 1;
      x >= 0 + westPixelsToCrop + minPixelsPerSide;
      x--
    ) {
      for (let y = h - 1; y >= 0 + northPixelsToCrop; y--) {
        const colorXY = image.getPixelColor(x, y);
        const rgba2 = intToRGBA(colorXY);

        if (colorDiff(rgba1, rgba2) > tolerance) {
          // this pixel is too distant from the first one: abort this side scan
          break east;
        }
      }

      // this column contains all pixels with the same color: increment this side pixels to crop
      eastPixelsToCrop++;
    }
  }

  // decide if a crop is needed
  let doCrop = false;

  // apply leaveBorder
  westPixelsToCrop -= leaveBorder;
  eastPixelsToCrop -= leaveBorder;
  northPixelsToCrop -= leaveBorder;
  southPixelsToCrop -= leaveBorder;

  if (cropSymmetric) {
    const horizontal = Math.min(eastPixelsToCrop, westPixelsToCrop);
    const vertical = Math.min(northPixelsToCrop, southPixelsToCrop);
    westPixelsToCrop = horizontal;
    eastPixelsToCrop = horizontal;
    northPixelsToCrop = vertical;
    southPixelsToCrop = vertical;
  }

  // make sure that crops are >= 0
  westPixelsToCrop = westPixelsToCrop >= 0 ? westPixelsToCrop : 0;
  eastPixelsToCrop = eastPixelsToCrop >= 0 ? eastPixelsToCrop : 0;
  northPixelsToCrop = northPixelsToCrop >= 0 ? northPixelsToCrop : 0;
  southPixelsToCrop = southPixelsToCrop >= 0 ? southPixelsToCrop : 0;

  // safety checks
  const widthOfRemainingPixels = w - (westPixelsToCrop + eastPixelsToCrop);
  const heightOfRemainingPixels = h - (southPixelsToCrop + northPixelsToCrop);

  if (cropOnlyFrames) {
    // crop image if all sides should be cropped
    doCrop =
      eastPixelsToCrop !== 0 &&
      northPixelsToCrop !== 0 &&
      westPixelsToCrop !== 0 &&
      southPixelsToCrop !== 0;
  } else {
    // crop image if at least one side should be cropped
    doCrop =
      eastPixelsToCrop !== 0 ||
      northPixelsToCrop !== 0 ||
      westPixelsToCrop !== 0 ||
      southPixelsToCrop !== 0;
  }

  if (doCrop) {
    // do the real crop
    crop(
      image,
      westPixelsToCrop,
      northPixelsToCrop,
      widthOfRemainingPixels,
      heightOfRemainingPixels,
    );
  }

  return image;
}

export default function cropPlugin() {
  return {
    /**
     * Crops the image at a given point to a give size
     */
    crop,
    /**
     * Autocrop same color borders from this image
     */
    autocrop,
  };
}
