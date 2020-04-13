// The entry file of your WebAssembly module.

// Copies of @jimp/core constants
const enum EdgeHandling {
  EDGE_EXTEND = 1,
  EDGE_WRAP = 2,
  EDGE_CROP = 3
}

export const UINT8ARRAY_ID = idof<Uint8Array>();

export class AsmBitmap {
  width: i32;
  height: i32;
  data: Uint8Array;
}

function scan(
  bitmap: AsmBitmap,
  x: i32,
  y: i32,
  w: i32,
  h: i32,
  f: (bitmap: AsmBitmap, x: i32, y: i32, idx: i32) => Error | null
): Error | null {
  for (let _y = y; _y < y + h; _y++) {
    for (let _x = x; _x < x + w; _x++) {
      const idx = (bitmap.width * _y + _x) << 2;
      const err = f(bitmap, _x, _y, idx);
      if (err) {
        return err;
      }
    }
  }
  return null;
}

function getPixelIndex(
  bitmap: AsmBitmap,
  x: i32,
  y: i32,
  edgeHandling: EdgeHandling = EdgeHandling.EDGE_EXTEND
): i32 {
  let xi = x;
  let yi = y;

  if (edgeHandling === EdgeHandling.EDGE_EXTEND) {
    if (x < 0) xi = 0;
    if (x >= bitmap.width) xi = bitmap.width - 1;
    if (y < 0) yi = 0;
    if (y >= bitmap.height) yi = bitmap.height - 1;
  }

  if (edgeHandling === EdgeHandling.EDGE_WRAP) {
    if (x < 0) {
      xi = bitmap.width + x;
    }

    if (x >= bitmap.width) {
      xi = x % bitmap.width;
    }

    if (y < 0) {
      xi = bitmap.height + y;
    }

    if (y >= bitmap.height) {
      yi = y % bitmap.height;
    }
  }

  let i = (bitmap.width * yi + xi) << 2;

  // if out of bounds index is -1
  if (xi < 0 || xi >= bitmap.width) {
    i = -1;
  }

  if (yi < 0 || yi >= bitmap.height) {
    i = -1;
  }

  return i;
}

// @ts-ignore: decorator
@inline
function limit255(n: u16): u8 {
  return <u8>min(n, 255);
}

class ScanIterator {
  x: i32;
  xStart: i32;
  xEnd: i32;
  y: i32;
  yEnd: i32;
  idx: i32;
  bitmapWidth: i32;
  constructor(bitmap: AsmBitmap, x: i32, y: i32, w: i32, h: i32) {
    // TODO: file assemblyscript bug for
    // this.x = this.xStart = x;
    this.x = x;
    this.xStart = x;
    this.xEnd = x + w;
    this.y = y;
    this.yEnd = y + h;
    this.idx = (bitmap.width * y + x) << 2;
    this.bitmapWidth = bitmap.width;
  }

  next(): boolean {
    ++this.x;
    if (this.x < this.xEnd) {
      this.idx += 4;
      return true;
    }
    ++this.y;
    if (this.y < this.yEnd) {
      this.x = this.xStart;
      this.idx = (this.bitmapWidth * this.y + this.x) << 2;
      return true;
    }
    return false;
  }
}

/**
 * Blits a source image on to this image
 * @param baseBitmap the this.bitmap from the baseImage Jimp instance
 * @param srcBitmap the source bitmap from a Jimp instance
 * @param x the x position to blit the image
 * @param y the y position to blit the image
 * @param srcx the x position from which to crop the source image
 * @param srcy the y position from which to crop the source image
 * @param srcw the width to which to crop the source image
 * @param srch the height to which to crop the source image
 */
export function blit(
  baseBitmap: AsmBitmap,
  srcBitmap: AsmBitmap,
  x: i32,
  y: i32,
  srcx: i32,
  srcy: i32,
  srcw: i32,
  srch: i32
): void {
  const maxWidth = baseBitmap.width;
  const maxHeight = baseBitmap.height;

  const it = new ScanIterator(srcBitmap, srcx, srcy, srcw, srch);
  do {
    // FIXME: file an issue with assemblyscript that destructuring doesn't work
    const idx = it.idx;
    const xOffset: i32 = x + it.x - srcx;
    const yOffset: i32 = y + it.y - srcy;

    if (
      xOffset >= 0 &&
      yOffset >= 0 &&
      maxWidth - xOffset > 0 &&
      maxHeight - yOffset > 0
    ) {
      const dstIdx = getPixelIndex(baseBitmap, xOffset, yOffset);

      const src_r: u16 = srcBitmap.data[idx];
      const src_g: u16 = srcBitmap.data[idx + 1];
      const src_b: u16 = srcBitmap.data[idx + 2];
      const src_a: u16 = srcBitmap.data[idx + 3];

      const dst_r: u16 = baseBitmap.data[dstIdx];
      const dst_g: u16 = baseBitmap.data[dstIdx + 1];
      const dst_b: u16 = baseBitmap.data[dstIdx + 2];
      const dst_a: u16 = baseBitmap.data[dstIdx + 3];

      baseBitmap.data[dstIdx] = <u8>(
        ((src_a * (src_r - dst_r) - dst_r + 255) >> 8) + dst_r
      );
      baseBitmap.data[dstIdx + 1] = <u8>(
        ((src_a * (src_g - dst_g) - dst_g + 255) >> 8) + dst_g
      );
      baseBitmap.data[dstIdx + 2] = <u8>(
        ((src_a * (src_b - dst_b) - dst_b + 255) >> 8) + dst_b
      );
      baseBitmap.data[dstIdx + 3] = limit255(dst_a + src_a);

    }
  } while (it.next());
}
