import { RGBAColor, JimpClass } from "@jimp/types";

export function scan<I extends JimpClass>(
  image: I,
  x: number,
  y: number,
  w: number,
  h: number,
  cb: (x: number, y: number, idx: number) => any,
) {
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
  h: number,
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
      Math.pow(256, 1),
  );
  rgba.a = Math.floor(
    (i -
      rgba.r * Math.pow(256, 3) -
      rgba.g * Math.pow(256, 2) -
      rgba.b * Math.pow(256, 1)) /
      Math.pow(256, 0),
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
