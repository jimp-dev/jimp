import { RGBAColor, JimpClass, Bitmap } from "@jimp/types";
import tinyColor from "tinycolor2";

export function clone<I extends JimpClass>(image: I): I {
  const newBitmap = {
    width: image.bitmap.width,
    height: image.bitmap.height,
    data: Buffer.from(image.bitmap.data),
  };

  return new (image.constructor as any)(newBitmap);
}

export function scan<I extends JimpClass>(
  image: I,
  f: (this: I, x: number, y: number, idx: number) => any
): I;
export function scan<I extends { bitmap: Bitmap }>(
  image: I,
  x: number,
  y: number,
  w: number,
  h: number,
  cb: (x: number, y: number, idx: number) => any
): I;
export function scan<I extends { bitmap: Bitmap }>(
  image: I,
  xArg: number | ((x: number, y: number, idx: number) => any),
  yArg?: number,
  wArg?: number,
  hArg?: number,
  cbArg?: (x: number, y: number, idx: number) => any
): I {
  let x: number;
  let y: number;
  let w: number;
  let h: number;
  let cb: (x: number, y: number, idx: number) => any;

  if (typeof xArg === "function") {
    cb = xArg;
    x = 0;
    y = 0;
    w = image.bitmap.width;
    h = image.bitmap.height;
  } else {
    x = xArg;
    if (typeof yArg !== "number") throw new Error("y must be a number");
    y = yArg;
    if (typeof wArg !== "number") throw new Error("w must be a number");
    w = wArg;
    if (typeof hArg !== "number") throw new Error("h must be a number");
    h = hArg;
    if (typeof cbArg !== "function") throw new Error("cb must be a function");
    cb = cbArg;
  }

  // round input
  x = Math.round(x);
  y = Math.round(y);
  w = Math.round(w);
  h = Math.round(h);

  for (let _y = y; _y < y + h; _y++) {
    for (let _x = x; _x < x + w; _x++) {
      const idx = (image.bitmap.width * _y + _x) << 2;
      cb(_x, _y, idx);
    }
  }

  return image;
}

export function* scanIterator<I extends JimpClass>(
  image: I,
  x: number,
  y: number,
  w: number,
  h: number
) {
  // round input
  x = Math.round(x);
  y = Math.round(y);
  w = Math.round(w);
  h = Math.round(h);

  for (let _y = y; _y < y + h; _y++) {
    for (let _x = x; _x < x + w; _x++) {
      const idx = (image.bitmap.width * _y + _x) << 2;
      yield { x: _x, y: _y, idx, image };
    }
  }
}

/**
 * A helper method that converts RGBA values to a single integer value
 * @param i a single integer value representing an RGBA colour (e.g. 0xFF0000FF for red)
 * @returns an object with the properties r, g, b and a representing RGBA values
 */
export function intToRGBA(i: number) {
  if (typeof i !== "number") {
    throw new Error("i must be a number");
  }

  const rgba: RGBAColor = {
    r: 0,
    g: 0,
    b: 0,
    a: 0,
  };

  rgba.r = Math.floor(i / Math.pow(256, 3));
  rgba.g = Math.floor((i - rgba.r * Math.pow(256, 3)) / Math.pow(256, 2));
  rgba.b = Math.floor(
    (i - rgba.r * Math.pow(256, 3) - rgba.g * Math.pow(256, 2)) /
      Math.pow(256, 1)
  );
  rgba.a = Math.floor(
    (i -
      rgba.r * Math.pow(256, 3) -
      rgba.g * Math.pow(256, 2) -
      rgba.b * Math.pow(256, 1)) /
      Math.pow(256, 0)
  );

  return rgba;
}

/**
 * Compute color difference
 * 0 means no difference, 1 means maximum difference.
 * @param rgba1:    first color to compare.
 * @param rgba2:    second color to compare.
 * Both parameters must be an color object {r:val, g:val, b:val, a:val}
 * Where `a` is optional and `val` is an integer between 0 and 255.
 * @returns float between 0 and 1.
 */
export function colorDiff(rgba1: RGBAColor, rgba2: RGBAColor) {
  const sq = (n: number) => Math.pow(n, 2);
  const { max } = Math;
  const maxVal = 255 * 255 * 3;

  if (rgba1.a !== 0 && !rgba1.a) {
    rgba1.a = 255;
  }

  if (rgba2.a !== 0 && !rgba2.a) {
    rgba2.a = 255;
  }

  return (
    (max(sq(rgba1.r - rgba2.r), sq(rgba1.r - rgba2.r - rgba1.a + rgba2.a)) +
      max(sq(rgba1.g - rgba2.g), sq(rgba1.g - rgba2.g - rgba1.a + rgba2.a)) +
      max(sq(rgba1.b - rgba2.b), sq(rgba1.b - rgba2.b - rgba1.a + rgba2.a))) /
    maxVal
  );
}

/**
 * Limits a number to between 0 or 255
 */
export function limit255(n: number) {
  n = Math.max(n, 0);
  n = Math.min(n, 255);

  return n;
}

/**
 * Converts a css color (Hex, 8-digit (RGBA) Hex, RGB, RGBA, HSL, HSLA, HSV, HSVA, Named) to a hex number
 * @param cssColor a number
 * @returns a hex number representing a color
 */
export function cssColorToHex(cssColor: string | number) {
  if (typeof cssColor === "number") {
    return cssColor;
  }

  return parseInt(tinyColor(cssColor).toHex8(), 16);
}
