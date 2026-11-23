import { Buffer } from "buffer";
import { JimpClass, RGBAColor } from "@jimp/types";
import { clampRegion, colorDiff, intToRGBA } from "@jimp/utils";
import { z } from "zod";

export const CropOptionsSchema = z.object({
  /** the x position to crop form */
  x: z.number(),
  /** the y position to crop form */
  y: z.number(),
  /** the width to crop form */
  w: z.number(),
  /** the height to crop form */
  h: z.number(),
});

export type CropOptions = z.infer<typeof CropOptionsSchema>;

const AutocropComplexOptionsSchema = z.object({
  /** percent of color difference tolerance (default value) */
  tolerance: z.number().min(0).max(1).optional(),
  /**
   * only crop if the image has a real "frame", i.e. every side that isn't in
   * `ignoreSides` has some border (default true)
   */
  cropOnlyFrames: z.boolean().optional(),
  /** force cropping top be symmetric */
  cropSymmetric: z.boolean().optional(),
  /** Amount of pixels in border to leave */
  leaveBorder: z.number().optional(),
  ignoreSides: z
    .object({
      north: z.boolean().optional(),
      south: z.boolean().optional(),
      east: z.boolean().optional(),
      west: z.boolean().optional(),
    })
    .optional(),
});

export type AutocropComplexOptions = z.infer<
  typeof AutocropComplexOptionsSchema
>;
export type AutocropOptions = number | AutocropComplexOptions;

/**
 * How different a pixel is from the border color, like `colorDiff`, except
 * that fully transparent pixels all match, whatever color they hide.
 */
function borderColorDiff(rgba1: RGBAColor, rgba2: RGBAColor) {
  if (rgba1.a === 0 && rgba2.a === 0) {
    return 0;
  }

  return colorDiff(rgba1, rgba2);
}

function getAutocropRect<I extends JimpClass>(
  image: I,
  options: AutocropOptions = {}
): CropOptions {
  const {
    tolerance = 0.0002,
    cropOnlyFrames = true,
    cropSymmetric = false,
    leaveBorder = 0,
    ignoreSides: ignoreSidesArg,
  } = typeof options === "number"
    ? ({ tolerance: options } as AutocropComplexOptions)
    : AutocropComplexOptionsSchema.parse(options);
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const minPixelsPerSide = 1; // to avoid cropping completely the image, resulting in an invalid 0 sized image

  // i.e. north and south / east and west are cropped by the same value
  const ignoreSides = {
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
  const rgba1 = intToRGBA(image.getPixelColor(0, 0));

  let northPixelsToCrop = 0;
  let eastPixelsToCrop = 0;
  let southPixelsToCrop = 0;
  let westPixelsToCrop = 0;

  // north side (scan rows from north to south)
  if (!ignoreSides.north) {
    north: for (let y = 0; y < h - minPixelsPerSide; y++) {
      for (let x = 0; x < w; x++) {
        const colorXY = image.getPixelColor(x, y);
        const rgba2 = intToRGBA(colorXY);

        if (borderColorDiff(rgba1, rgba2) > tolerance) {
          // this pixel is too distant from the first one: abort this side scan
          break north;
        }
      }

      // this row contains all pixels with the same color: increment this side pixels to crop
      northPixelsToCrop++;
    }
  }

  // west side (scan columns from west to east)
  if (!ignoreSides.west) {
    west: for (let x = 0; x < w - minPixelsPerSide; x++) {
      for (let y = 0 + northPixelsToCrop; y < h; y++) {
        const colorXY = image.getPixelColor(x, y);
        const rgba2 = intToRGBA(colorXY);

        if (borderColorDiff(rgba1, rgba2) > tolerance) {
          // this pixel is too distant from the first one: abort this side scan
          break west;
        }
      }

      // this column contains all pixels with the same color: increment this side pixels to crop
      westPixelsToCrop++;
    }
  }

  // south side (scan rows from south to north)
  if (!ignoreSides.south) {
    south: for (
      let y = h - 1;
      y >= northPixelsToCrop + minPixelsPerSide;
      y--
    ) {
      for (let x = w - eastPixelsToCrop - 1; x >= 0; x--) {
        const colorXY = image.getPixelColor(x, y);
        const rgba2 = intToRGBA(colorXY);

        if (borderColorDiff(rgba1, rgba2) > tolerance) {
          // this pixel is too distant from the first one: abort this side scan
          break south;
        }
      }

      // this row contains all pixels with the same color: increment this side pixels to crop
      southPixelsToCrop++;
    }
  }

  // east side (scan columns from east to west)
  if (!ignoreSides.east) {
    east: for (
      let x = w - 1;
      x >= 0 + westPixelsToCrop + minPixelsPerSide;
      x--
    ) {
      for (let y = h - 1; y >= 0 + northPixelsToCrop; y--) {
        const colorXY = image.getPixelColor(x, y);
        const rgba2 = intToRGBA(colorXY);

        if (borderColorDiff(rgba1, rgba2) > tolerance) {
          // this pixel is too distant from the first one: abort this side scan
          break east;
        }
      }

      // this column contains all pixels with the same color: increment this side pixels to crop
      eastPixelsToCrop++;
    }
  }

  // A frame has a border on every side that was scanned. This is checked
  // before leaveBorder, which can leave nothing to crop on a side.
  const isFrame =
    (ignoreSides.north || northPixelsToCrop > 0) &&
    (ignoreSides.east || eastPixelsToCrop > 0) &&
    (ignoreSides.south || southPixelsToCrop > 0) &&
    (ignoreSides.west || westPixelsToCrop > 0);

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

  // with cropOnlyFrames, only crop images that have a frame
  if (cropOnlyFrames && !isFrame) {
    return {
      x: 0,
      y: 0,
      w,
      h,
    };
  }

  return {
    x: westPixelsToCrop,
    y: northPixelsToCrop,
    w: widthOfRemainingPixels,
    h: heightOfRemainingPixels,
  };
}

export const methods = {
  /**
   * Crops the image at a given point to a give size.
   *
   * The rectangle is clamped to the image, so the part of it outside the
   * image is ignored and the result is never larger than the image. It throws
   * if nothing would be left: the rectangle is entirely outside the image, or
   * its width or height is 0 or less.
   *
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   * const cropped = image.crop({ x: 10, y: 10, w: 150, h: 100 });
   * ```
   */
  crop<I extends JimpClass>(image: I, options: CropOptions) {
    const parsed = CropOptionsSchema.parse(options);
    const { x, y, w, h } = clampRegion(
      image,
      parsed.x,
      parsed.y,
      parsed.w,
      parsed.h,
    );

    if (w === 0 || h === 0) {
      throw new Error(
        `The crop region (x: ${parsed.x}, y: ${parsed.y}, w: ${parsed.w}, h: ${parsed.h}) doesn't overlap the ${image.bitmap.width}x${image.bitmap.height} image, so the result would be empty`,
      );
    }

    if (x === 0 && w === image.bitmap.width) {
      // shortcut
      const start = (w * y + x) << 2;
      const end = start + ((h * w) << 2);

      image.bitmap.data = image.bitmap.data.slice(start, end);
    } else {
      const { data, width } = image.bitmap;
      const rowLength = w << 2;
      const bitmap = Buffer.allocUnsafe(h * rowLength);

      // Copy whole rows, which is much faster than pixel by pixel
      for (let row = 0; row < h; row++) {
        const start = ((y + row) * width + x) << 2;
        data.copy(bitmap, row * rowLength, start, start + rowLength);
      }

      image.bitmap.data = bitmap;
    }

    image.bitmap.width = w;
    image.bitmap.height = h;

    return image;
  },

  /**
   * Measure the crop rectangle that {@link autocrop} would apply.
   * This is useful when you need the crop offsets for packing, alignment,
   * or when you want to inspect the crop area before mutating the image.
   * If no crop would be applied, this returns the current image bounds.
   *
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   * const rect = image.autocropRect();
   *
   * image.crop(rect);
   * ```
   */
  autocropRect<I extends JimpClass>(
    image: I,
    options: AutocropOptions = {}
  ) {
    return getAutocropRect(image, options);
  },

  /**
   * Autocrop same color borders from this image.
   * This function will attempt to crop out transparent pixels from the image.
   *
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   * const cropped = image.autocrop();
   * ```
   */
  autocrop<I extends JimpClass>(image: I, options: AutocropOptions = {}) {
    const crop = this.autocropRect(image, options);

    if (
      crop.x !== 0 ||
      crop.y !== 0 ||
      crop.w !== image.bitmap.width ||
      crop.h !== image.bitmap.height
    ) {
      this.crop(image, crop);
    }

    return image;
  },
};
