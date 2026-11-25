/**
 * BlurHash <https://blurha.sh>, after the reference implementation
 * (woltapp/blurhash). The image is described by a few cosine components of
 * its colour in linear light, quantised and written in base 83.
 *
 * The arithmetic follows the reference TypeScript package step by step,
 * including the order of the sums and products, so the hashes are the same
 * to the character.
 */

const BASE83 =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~";

function encode83(value: number, length: number) {
  let result = "";

  for (let i = 1; i <= length; i++) {
    const digit = (Math.floor(value) / Math.pow(83, length - i)) % 83;
    result += BASE83[Math.floor(digit)];
  }

  return result;
}

function decode83(str: string) {
  let value = 0;

  for (const char of str) {
    value = value * 83 + BASE83.indexOf(char);
  }

  return value;
}

/** Linear light (0-1) for each 8 bit sRGB value */
let srgbToLinearTable: Float64Array | undefined;

function getSrgbToLinear() {
  if (!srgbToLinearTable) {
    srgbToLinearTable = Float64Array.from({ length: 256 }, (_, i) => {
      const v = i / 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
  }

  return srgbToLinearTable;
}

function linearToSrgb(value: number) {
  const v = Math.max(0, Math.min(1, value));

  return v <= 0.0031308
    ? Math.trunc(v * 12.92 * 255 + 0.5)
    : Math.trunc((1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255 + 0.5);
}

function signPow(value: number, exp: number) {
  return (value < 0 ? -1 : 1) * Math.pow(Math.abs(value), exp);
}

/** `cos(PI * a * b / size)` for every `a` below `count` and `b` below `size` */
function cosines(count: number, size: number, componentFirst: boolean) {
  const table = new Float64Array(count * size);

  for (let a = 0; a < count; a++) {
    for (let b = 0; b < size; b++) {
      // The reference multiplies in a different order when encoding and
      // decoding, which can change the last bit
      table[a * size + b] = componentFirst
        ? Math.cos((Math.PI * a * b) / size)
        : Math.cos((Math.PI * b * a) / size);
    }
  }

  return table;
}

/**
 * Encode RGBA pixels in sRGB as a BlurHash. Alpha is ignored.
 */
export function encodeBlurhash(
  data: ArrayLike<number>,
  width: number,
  height: number,
  componentsX: number,
  componentsY: number,
) {
  const toLinear = getSrgbToLinear();
  const cosX = cosines(componentsX, width, true);
  const cosY = cosines(componentsY, height, true);
  const count = componentsX * componentsY;
  const factors = new Float64Array(count * 3);

  // One pass over the pixels for every component at once. Each component's
  // sum still adds the pixels in the reference's order: by column, then row.
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const i = 4 * (x + y * width);
      const r = toLinear[data[i]!]!;
      const g = toLinear[data[i + 1]!]!;
      const b = toLinear[data[i + 2]!]!;

      for (let cy = 0; cy < componentsY; cy++) {
        const yCos = cosY[cy * height + y]!;

        for (let cx = 0; cx < componentsX; cx++) {
          const normalisation = cx === 0 && cy === 0 ? 1 : 2;
          const basis = normalisation * cosX[cx * width + x]! * yCos;
          const k = (cx + cy * componentsX) * 3;

          factors[k] = factors[k]! + basis * r;
          factors[k + 1] = factors[k + 1]! + basis * g;
          factors[k + 2] = factors[k + 2]! + basis * b;
        }
      }
    }
  }

  const scale = 1 / (width * height);

  for (let k = 0; k < factors.length; k++) {
    factors[k] = factors[k]! * scale;
  }

  let hash = encode83(componentsX - 1 + (componentsY - 1) * 9, 1);
  let maximumValue = 1;

  if (count > 1) {
    // The largest AC value, not the largest magnitude: that's what the
    // reference TypeScript package does, so hashes match it. Values below
    // -maximumValue are clamped.
    let actualMaximumValue = -Infinity;

    for (let k = 3; k < factors.length; k++) {
      actualMaximumValue = Math.max(actualMaximumValue, factors[k]!);
    }

    const quantisedMaximumValue = Math.floor(
      Math.max(0, Math.min(82, Math.floor(actualMaximumValue * 166 - 0.5))),
    );

    maximumValue = (quantisedMaximumValue + 1) / 166;
    hash += encode83(quantisedMaximumValue, 1);
  } else {
    hash += encode83(0, 1);
  }

  hash += encode83(
    (linearToSrgb(factors[0]!) << 16) +
      (linearToSrgb(factors[1]!) << 8) +
      linearToSrgb(factors[2]!),
    4,
  );

  const quantise = (value: number) =>
    Math.floor(
      Math.max(
        0,
        Math.min(18, Math.floor(signPow(value / maximumValue, 0.5) * 9 + 9.5)),
      ),
    );

  for (let k = 3; k < factors.length; k += 3) {
    hash += encode83(
      quantise(factors[k]!) * 19 * 19 +
        quantise(factors[k + 1]!) * 19 +
        quantise(factors[k + 2]!),
      2,
    );
  }

  return hash;
}

/**
 * Check a BlurHash and read how many components it has. Throws if it isn't
 * a valid hash.
 */
export function parseBlurhashSize(hash: string) {
  if (typeof hash !== "string" || hash.length < 6) {
    throw new Error("A BlurHash must be at least 6 characters");
  }

  for (const char of hash) {
    if (!BASE83.includes(char)) {
      throw new Error(`"${char}" isn't a BlurHash character`);
    }
  }

  const sizeFlag = decode83(hash[0]!);
  const componentsY = Math.floor(sizeFlag / 9) + 1;
  const componentsX = (sizeFlag % 9) + 1;
  const length = 4 + 2 * componentsX * componentsY;

  if (hash.length !== length) {
    throw new Error(
      `This BlurHash has ${componentsX}x${componentsY} components, so it should be ${length} characters, not ${hash.length}`,
    );
  }

  return { componentsX, componentsY };
}

/**
 * Decode a BlurHash to RGBA pixels in sRGB. `punch` scales the AC
 * components, for more (above 1) or less contrast.
 */
export function decodeBlurhashPixels(
  hash: string,
  width: number,
  height: number,
  punch: number,
) {
  const { componentsX, componentsY } = parseBlurhashSize(hash);
  const toLinear = getSrgbToLinear();
  const maximumValue = ((decode83(hash[1]!) + 1) / 166) * punch;
  const count = componentsX * componentsY;
  const colors = new Float64Array(count * 3);
  const dc = decode83(hash.substring(2, 6));

  colors[0] = toLinear[dc >> 16]!;
  colors[1] = toLinear[(dc >> 8) & 255]!;
  colors[2] = toLinear[dc & 255]!;

  for (let i = 1; i < count; i++) {
    const value = decode83(hash.substring(4 + i * 2, 6 + i * 2));
    const quantR = Math.floor(value / (19 * 19));
    const quantG = Math.floor(value / 19) % 19;
    const quantB = value % 19;

    colors[i * 3] = signPow((quantR - 9) / 9, 2) * maximumValue;
    colors[i * 3 + 1] = signPow((quantG - 9) / 9, 2) * maximumValue;
    colors[i * 3 + 2] = signPow((quantB - 9) / 9, 2) * maximumValue;
  }

  const cosX = cosines(componentsX, width, false);
  const cosY = cosines(componentsY, height, false);
  const pixels = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;

      for (let j = 0; j < componentsY; j++) {
        const yCos = cosY[j * height + y]!;

        for (let i = 0; i < componentsX; i++) {
          const basis = cosX[i * width + x]! * yCos;
          const k = (i + j * componentsX) * 3;

          r += colors[k]! * basis;
          g += colors[k + 1]! * basis;
          b += colors[k + 2]! * basis;
        }
      }

      const p = 4 * (x + y * width);

      pixels[p] = linearToSrgb(r);
      pixels[p + 1] = linearToSrgb(g);
      pixels[p + 2] = linearToSrgb(b);
      pixels[p + 3] = 255;
    }
  }

  return pixels;
}
