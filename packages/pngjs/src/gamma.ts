export interface GammaImage {
  width: number;
  height: number;
  data: Uint8Array | Uint16Array;
  /** The gAMA chunk's gamma. 0 or undefined if there isn't one. */
  gamma?: number;
}

/**
 * Applies the image's gamma, so its pixels look right on a display with the
 * given gamma, then sets `gamma` to 0. Does nothing if there's no gamma.
 *
 * Works on 8-bit data (a Uint8Array or Buffer) and on 16-bit data (a
 * Uint16Array, from `outputDepth: 16` or `skipRescale`). For 16-bit images,
 * adjust the 16-bit data, as rounding to 8 bits first loses precision.
 *
 * Alpha isn't changed, so semi-transparent pixels are only approximately
 * right: that would need the background they're drawn on.
 *
 * @param displayGamma The gamma of the display @default 2.2
 */
export function adjustGamma(image: GammaImage, displayGamma = 2.2) {
  if (!image.gamma) {
    return;
  }

  const { data } = image;
  const max = data instanceof Uint16Array ? 65535 : 255;
  // Computed as pngjs did, so 8-bit results stay the same
  const exponent = 1 / displayGamma / image.gamma;
  const table = new (max === 255 ? Uint8Array : Uint16Array)(max + 1);

  for (let v = 0; v <= max; v++) {
    table[v] = Math.round(Math.pow(v / max, exponent) * max);
  }

  const length = Math.min(data.length, image.width * image.height * 4);

  for (let i = 0; i < length; i += 4) {
    data[i] = table[data[i]!]!;
    data[i + 1] = table[data[i + 1]!]!;
    data[i + 2] = table[data[i + 2]!]!;
  }

  image.gamma = 0;
}
