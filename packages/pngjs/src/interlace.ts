import { CHANNELS } from "./constants.js";
import type { PngHeader } from "./types.js";

/** One Adam7 pass, or the whole image when it isn't interlaced */
export interface Pass {
  /** Size of the pass in pixels */
  width: number;
  height: number;
  /** Position of its first pixel in the image */
  x: number;
  y: number;
  /** Distance between its pixels in the image */
  xStep: number;
  yStep: number;
}

const ADAM7 = [
  { x: 0, y: 0, xStep: 8, yStep: 8 },
  { x: 4, y: 0, xStep: 8, yStep: 8 },
  { x: 0, y: 4, xStep: 4, yStep: 8 },
  { x: 2, y: 0, xStep: 4, yStep: 4 },
  { x: 0, y: 2, xStep: 2, yStep: 4 },
  { x: 1, y: 0, xStep: 2, yStep: 2 },
  { x: 0, y: 1, xStep: 1, yStep: 2 },
];

/** The passes with pixels in them */
export function getPasses(
  width: number,
  height: number,
  interlace: boolean,
): Pass[] {
  if (!interlace) {
    return [{ width, height, x: 0, y: 0, xStep: 1, yStep: 1 }];
  }

  const passes: Pass[] = [];

  for (const pass of ADAM7) {
    const passWidth = Math.ceil((width - pass.x) / pass.xStep);
    const passHeight = Math.ceil((height - pass.y) / pass.yStep);

    if (passWidth > 0 && passHeight > 0) {
      passes.push({ ...pass, width: passWidth, height: passHeight });
    }
  }

  return passes;
}

/** Bytes in a line of `width` pixels, without the filter byte */
export function getLineBytes(header: PngHeader, width: number) {
  return Math.ceil((width * CHANNELS[header.colorType] * header.depth) / 8);
}

/** Bytes per complete pixel, at least 1, which filters compare against */
export function getFilterStride(header: PngHeader) {
  return Math.max(1, (CHANNELS[header.colorType] * header.depth) >> 3);
}

/** The size of the uncompressed image data, with a filter byte per line */
export function getImageDataSize(header: PngHeader) {
  let size = 0;

  for (const pass of getPasses(header.width, header.height, header.interlace)) {
    size += (getLineBytes(header, pass.width) + 1) * pass.height;
  }

  return size;
}
