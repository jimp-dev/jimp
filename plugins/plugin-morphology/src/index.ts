import { JimpClass } from "@jimp/types";
import { z } from "zod";

const MorphologyOptionsSchema = z.object({
  /**
   * How far the neighbourhood reaches from each pixel, in pixels. Rounded to
   * a whole number, and 0 or less leaves the image unchanged.
   */
  radius: z.number(),
  /**
   * The shape of the neighbourhood (default "square").
   *
   * - "square": a (2 × radius + 1) square. Fast for any radius.
   * - "disk": the pixels within `radius` of the center. Rounder results,
   *   but slower for large radii.
   */
  shape: z.enum(["square", "disk"]).optional(),
});

export type MorphologyOptions = z.infer<typeof MorphologyOptionsSchema>;

/** Sets `size` bytes of `dst` to the max of the bytes of `a` and `b` */
function maxInto(
  dst: Uint8Array,
  dstStart: number,
  a: Uint8Array,
  aStart: number,
  b: Uint8Array,
  bStart: number,
  size: number,
) {
  for (let i = 0; i < size; i++) {
    const x = a[aStart + i]!;
    const y = b[bStart + i]!;

    dst[dstStart + i] = x > y ? x : y;
  }
}

/**
 * Sets each element of a line to the max of the elements within `r` of it,
 * with van Herk/Gil-Werman, so the cost doesn't grow with `r`. The window is
 * clipped to the line, so it never wraps.
 *
 * The line is `n` elements of `size` contiguous bytes starting at `start`,
 * and each byte is maxed on its own. A row is `width` elements of 4 bytes
 * (one per channel), and the whole image is `height` elements of a row's
 * bytes. `dst` may be `src`. `g` and `h` are scratch of at least
 * `n * size` bytes.
 */
function maxLine(
  src: Uint8Array,
  dst: Uint8Array,
  start: number,
  n: number,
  size: number,
  r: number,
  g: Uint8Array,
  h: Uint8Array,
) {
  const k = 2 * r + 1;

  // g: max from the start of each block of k elements up to the element.
  // 0 is the identity for max, so it starts each block.
  for (let e = 0, o = 0; e < n; e++, o += size) {
    const blockStart = e % k === 0;

    for (let i = o; i < o + size; i++) {
      const value = src[start + i]!;
      const prev = blockStart ? 0 : g[i - size]!;

      g[i] = value > prev ? value : prev;
    }
  }

  // h: max from the element to the end of its block (or of the line)
  for (let e = n - 1, o = e * size; e >= 0; e--, o -= size) {
    const blockEnd = e === n - 1 || (e + 1) % k === 0;

    for (let i = o; i < o + size; i++) {
      const value = src[start + i]!;
      const next = blockEnd ? 0 : h[i + size]!;

      h[i] = value > next ? value : next;
    }
  }

  // A window is at most k long, so it's the end of one block (h) and the
  // start of the next (g). If the edge of the line clips it to one block,
  // g alone covers it when it starts the block and h alone when it ends it.
  for (let e = 0, o = 0; e < n; e++, o += size) {
    const lo = Math.max(0, e - r);
    const hi = Math.min(n - 1, e + r);
    const split = lo - (lo % k) !== hi - (hi % k);
    const useH = split || lo % k !== 0;
    const useG = split || lo % k === 0;
    const loO = lo * size - o;
    const hiO = hi * size - o;

    for (let i = o; i < o + size; i++) {
      const a = useH ? h[i + loO]! : 0;
      const b = useG ? g[i + hiO]! : 0;

      dst[start + i] = a > b ? a : b;
    }
  }
}

/** Dilates every row of `data` in place by `r` pixels */
function maxRows(data: Uint8Array, width: number, height: number, r: number) {
  const rowLength = width * 4;
  const g = new Uint8Array(rowLength);
  const h = new Uint8Array(rowLength);

  for (let y = 0; y < height; y++) {
    maxLine(data, data, y * rowLength, width, 4, r, g, h);
  }
}

function dilateSquare(
  data: Uint8Array,
  width: number,
  height: number,
  r: number,
) {
  // A square is separable: dilate the rows, then the columns. The columns
  // are done a whole row at a time, which keeps the reads in order.
  maxRows(data, width, height, r);
  maxLine(
    data,
    data,
    0,
    height,
    width * 4,
    r,
    new Uint8Array(data.length),
    new Uint8Array(data.length),
  );
}

function dilateDisk(
  data: Uint8Array,
  width: number,
  height: number,
  r: number,
) {
  // Each row of the disk, `dy` from the center, is a horizontal line that
  // reaches `w` pixels each way. So the result is the max of the rows dilated
  // by `w`, shifted up and down by `dy`. That's one fast row pass per
  // distinct `w`, rather than looking at every pixel in the disk.
  const rowLength = width * 4;
  const result = new Uint8Array(data.length);
  const rows = new Uint8Array(data.length);
  let dilatedBy = -1;

  for (let dy = 0; dy <= Math.min(r, height - 1); dy++) {
    const w = Math.floor(Math.sqrt(r * r - dy * dy));

    if (w !== dilatedBy) {
      rows.set(data);
      maxRows(rows, width, height, w);
      dilatedBy = w;
    }

    for (let y = 0; y < height; y++) {
      const out = y * rowLength;

      // Rows outside the image aren't part of the neighbourhood
      if (y - dy >= 0) {
        const from = (y - dy) * rowLength;
        maxInto(result, out, result, out, rows, from, rowLength);
      }

      if (dy > 0 && y + dy < height) {
        const from = (y + dy) * rowLength;
        maxInto(result, out, result, out, rows, from, rowLength);
      }
    }
  }

  data.set(result);
}

function invert(data: Uint8Array) {
  for (let i = 0; i < data.length; i++) {
    data[i] = 255 - data[i]!;
  }
}

function morph<I extends JimpClass>(
  image: I,
  options: MorphologyOptions,
  erode: boolean,
) {
  const { radius, shape = "square" } = MorphologyOptionsSchema.parse(options);
  const { data, width, height } = image.bitmap;
  // A disk this big already covers the whole image, from any pixel in it
  const r = Math.min(Math.max(0, Math.round(radius)), width + height);

  if (r === 0) {
    return image;
  }

  // Eroding is dilating the inverted image: min(x) = 255 - max(255 - x)
  if (erode) {
    invert(data);
  }

  if (shape === "disk") {
    dilateDisk(data, width, height, r);
  } else {
    dilateSquare(data, width, height, r);
  }

  if (erode) {
    invert(data);
  }

  return image;
}

export const methods = {
  /**
   * Erodes the image: sets each pixel to the minimum of the pixels around
   * it, so dark areas grow and bright details thinner than the neighbourhood
   * disappear.
   *
   * - Each channel, alpha included, is eroded on its own, like OpenCV's
   *   `erode` on a color image. On a greyscale or black and white image this
   *   is the usual erosion. On an image with transparency, opaque shapes
   *   shrink.
   * - The neighbourhood is clipped to the image, so pixels near an edge only
   *   look at pixels inside it.
   * - `radius` is rounded to a whole number. 0 or less does nothing.
   *
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.erode({ radius: 2 });
   * image.erode({ radius: 3, shape: "disk" });
   * ```
   */
  erode<I extends JimpClass>(image: I, options: MorphologyOptions) {
    return morph(image, options, true);
  },

  /**
   * Dilates the image: sets each pixel to the maximum of the pixels around
   * it, so bright areas grow and dark details thinner than the neighbourhood
   * disappear.
   *
   * - Each channel, alpha included, is dilated on its own, like OpenCV's
   *   `dilate` on a color image. On a greyscale or black and white image this
   *   is the usual dilation. On an image with transparency, opaque shapes
   *   grow.
   * - The neighbourhood is clipped to the image, so pixels near an edge only
   *   look at pixels inside it.
   * - `radius` is rounded to a whole number. 0 or less does nothing.
   *
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.dilate({ radius: 2 });
   * image.dilate({ radius: 3, shape: "disk" });
   * ```
   */
  dilate<I extends JimpClass>(image: I, options: MorphologyOptions) {
    return morph(image, options, false);
  },

  /**
   * Opens the image: erodes it, then dilates it with the same options.
   * Removes bright specks and thin bright lines smaller than the
   * neighbourhood, and keeps the size of larger bright shapes.
   *
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.open({ radius: 1 });
   * ```
   */
  open<I extends JimpClass>(image: I, options: MorphologyOptions) {
    morph(image, options, true);
    return morph(image, options, false);
  },

  /**
   * Closes the image: dilates it, then erodes it with the same options.
   * Fills dark holes and gaps smaller than the neighbourhood, and keeps the
   * size of larger bright shapes.
   *
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.close({ radius: 1 });
   * ```
   */
  close<I extends JimpClass>(image: I, options: MorphologyOptions) {
    morph(image, options, false);
    return morph(image, options, true);
  },
};
