import { Buffer } from "buffer";
import { Bitmap, ColorSpaceName } from "@jimp/types";

/**
 * Colour spaces described by ICC profiles, and conversion between them.
 *
 * Jimp keeps pixels in the colour space they were read in. An image's space
 * comes from its ICC profile (`image.iccProfile`): no profile means sRGB.
 * Conversions go through the ICC profile connection space (XYZ, D50), so
 * they work for any RGB profile made of three primaries and tone curves,
 * which covers sRGB, Display P3, Adobe RGB and Rec. 2020. Colours outside
 * the target space are clipped (relative colorimetric intent).
 */

export type { ColorSpaceName };

type Vector = [number, number, number];
type Matrix = [Vector, Vector, Vector];
/** Decodes a channel value (0-1) to linear light (0-1) */
type Curve = (value: number) => number;

export interface ColorSpace {
  /**
   * `"srgb"` or `"display-p3"` if the profile describes one of them,
   * `"custom"` for any other profile
   */
  name: ColorSpaceName | "custom";
  /**
   * Converts linear RGB to XYZ (D50). Undefined if the profile isn't an RGB
   * profile with primaries and tone curves, so jimp can't convert its colours.
   */
  toXyz?: Matrix;
  /** Decodes each channel to linear light */
  curves?: [Curve, Curve, Curve];
}

function multiply(a: Matrix, b: Matrix): Matrix {
  const [b0, b1, b2] = b;

  return a.map(([x, y, z]) =>
    b0.map((_, j) => x * b0[j]! + y * b1[j]! + z * b2[j]!),
  ) as Matrix;
}

function transform(m: Matrix, [x, y, z]: Vector): Vector {
  return m.map((row) => row[0] * x + row[1] * y + row[2] * z) as Vector;
}

function invert(m: Matrix): Matrix {
  const [[a, b, c], [d, e, f], [g, h, i]] = m;
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);

  return [
    [e * i - f * h, c * h - b * i, b * f - c * e],
    [f * g - d * i, a * i - c * g, c * d - a * f],
    [d * h - e * g, b * g - a * h, a * e - b * d],
  ].map((row) => row.map((v) => v / det)) as Matrix;
}

const diagonal = ([x, y, z]: Vector): Matrix => [
  [x, 0, 0],
  [0, y, 0],
  [0, 0, z],
];

/** The ICC profile connection space's white point */
const D50: Vector = [0.9642, 1, 0.8249];

const BRADFORD: Matrix = [
  [0.8951, 0.2664, -0.1614],
  [-0.7502, 1.7135, 0.0367],
  [0.0389, -0.0685, 1.0296],
];

/**
 * The linear RGB to XYZ (D50) matrix for the primaries and white point
 * (CIE xy), adapted from the white point to D50 with Bradford, the way ICC
 * profiles store their colorants
 */
function rgbToXyzD50(
  primaries: [number, number][],
  whitePoint: [number, number],
) {
  const xyz = ([x, y]: [number, number]): Vector => [x / y, 1, (1 - x - y) / y];
  const white = xyz(whitePoint);
  // Each column is a primary, scaled so that together they make the white
  const unscaled = [0, 1, 2].map((r) =>
    primaries.map((p) => xyz(p)[r]!),
  ) as Matrix;
  const scale = transform(invert(unscaled), white);
  const toXyz = unscaled.map((row) =>
    row.map((v, j) => v * scale[j]!),
  ) as Matrix;
  const from = transform(BRADFORD, white);
  const to = transform(BRADFORD, D50);
  const adapt = multiply(
    invert(BRADFORD),
    multiply(diagonal(to.map((v, i) => v / from[i]!) as Vector), BRADFORD),
  );

  return multiply(adapt, toXyz);
}

/** The sRGB transfer curve, which Display P3 uses too */
const srgbCurve: Curve = (v) =>
  v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);

const D65: [number, number] = [0.3127, 0.329];

export const SRGB: ColorSpace = {
  name: "srgb",
  toXyz: rgbToXyzD50(
    [
      [0.64, 0.33],
      [0.3, 0.6],
      [0.15, 0.06],
    ],
    D65,
  ),
  curves: [srgbCurve, srgbCurve, srgbCurve],
};

export const DISPLAY_P3: ColorSpace = {
  name: "display-p3",
  toXyz: rgbToXyzD50(
    [
      [0.68, 0.32],
      [0.265, 0.69],
      [0.15, 0.06],
    ],
    D65,
  ),
  curves: [srgbCurve, srgbCurve, srgbCurve],
};

export const COLOR_SPACES: Record<ColorSpaceName, ColorSpace> = {
  srgb: SRGB,
  "display-p3": DISPLAY_P3,
};

/**
 * The Display P3 ICC profile jimp writes for images it creates in, or
 * converts to, Display P3. An ICC v4 profile with the Display P3 primaries,
 * D65 white point and sRGB tone curve.
 */
export const DISPLAY_P3_PROFILE = Buffer.from(
  "AAACVAAAAAAEMAAAbW50clJHQiBYWVogB+oAAQABAAAAAAAAYWNzcAAAAAAAAAAAAAAAAAAA" +
    "AAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKZGVzYwAAAPwAAAAwY3BydAAAASwAAABMd3RwdAAA" +
    "AXgAAAAUclhZWgAAAYwAAAAUZ1hZWgAAAaAAAAAUYlhZWgAAAbQAAAAUclRSQwAAAcgAAAAg" +
    "Z1RSQwAAAegAAAAgYlRSQwAAAggAAAAgY2hhZAAAAigAAAAsbWx1YwAAAAAAAAABAAAADGVu" +
    "VVMAAAAUAAAAHABEAGkAcwBwAGwAYQB5ACAAUAAzbWx1YwAAAAAAAAABAAAADGVuVVMAAAAw" +
    "AAAAHABOAG8AIABjAG8AcAB5AHIAaQBnAGgAdAAsACAAdQBzAGUAIABmAHIAZQBlAGwAeVhZ" +
    "WiAAAAAAAAD21gABAAAAANMtWFlaIAAAAAAAAIPhAAA9wP///7tYWVogAAAAAAAASr0AALE2" +
    "AAAKuVhZWiAAAAAAAAAoNwAAEQoAAMi5cGFyYQAAAAAAAwAAAAJmZgAA8qcAAA1ZAAAT0AAA" +
    "CltwYXJhAAAAAAADAAAAAmZmAADypwAADVkAABPQAAAKW3BhcmEAAAAAAAMAAAACZmYAAPKn" +
    "AAANWQAAE9AAAApbc2YzMgAAAAAAAQw/AAAF3f//8ycAAAeRAAD9kf//+6L///2iAAAD2wAA" +
    "wHk=",
  "base64",
);

const CUSTOM: ColorSpace = { name: "custom" };

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Reads a `curv` or `para` tone curve tag */
function readCurve(tag: Buffer | undefined): Curve {
  const type = tag?.toString("latin1", 0, 4);

  if (tag && type === "curv") {
    const count = tag.readUInt32BE(8);

    if (count === 0) {
      return (v) => v;
    }

    if (count === 1) {
      const gamma = tag.readUInt16BE(12) / 256;
      return (v) => Math.pow(v, gamma);
    }

    const table = Array.from(
      { length: count },
      (_, i) => tag.readUInt16BE(12 + i * 2) / 65535,
    );

    return (v) => {
      const x = clamp01(v) * (count - 1);
      const i = Math.min(Math.floor(x), count - 2);
      return table[i]! + (table[i + 1]! - table[i]!) * (x - i);
    };
  }

  if (tag && type === "para") {
    const fn = tag.readUInt16BE(8);
    const count = [1, 3, 4, 5, 7][fn];

    if (!count) {
      throw new Error(`Unknown parametric curve type ${fn}`);
    }

    const [g = 1, a = 1, b = 0, c = 0, d = 0, e = 0, f = 0] = Array.from(
      { length: count },
      (_, i) => tag.readInt32BE(12 + i * 4) / 65536,
    );
    const power = (v: number) => Math.pow(Math.max(a * v + b, 0), g);

    switch (fn) {
      case 0:
        return (v) => Math.pow(v, g);
      case 1:
        return (v) => (v >= -b / a ? power(v) : 0);
      case 2:
        return (v) => (v >= -b / a ? power(v) + c : c);
      case 3:
        return (v) => (v >= d ? power(v) : c * v);
      default:
        return (v) => (v >= d ? power(v) + e : c * v + f);
    }
  }

  throw new Error("Unsupported tone curve");
}

const SAMPLES = Array.from({ length: 17 }, (_, i) => i / 16);

/** Whether the colorants and curves are those of `space` */
function describes(space: ColorSpace, toXyz: Matrix, curves: Curve[]) {
  return (
    toXyz.every((row, i) =>
      row.every((v, j) => Math.abs(v - space.toXyz![i]![j]!) < 0.002),
    ) &&
    curves.every((curve, i) =>
      SAMPLES.every((v) => Math.abs(curve(v) - space.curves![i]!(v)) < 0.002),
    )
  );
}

function parseProfile(profile: Buffer): ColorSpace {
  try {
    // Only RGB profiles with an XYZ connection space can use colorants and
    // tone curves
    if (
      profile.toString("latin1", 16, 20) !== "RGB " ||
      profile.toString("latin1", 20, 24) !== "XYZ "
    ) {
      return CUSTOM;
    }

    const tags = new Map<string, Buffer>();
    const count = profile.readUInt32BE(128);

    for (let i = 0; i < count; i++) {
      const entry = 132 + i * 12;
      const offset = profile.readUInt32BE(entry + 4);

      tags.set(
        profile.toString("latin1", entry, entry + 4),
        profile.subarray(offset, offset + profile.readUInt32BE(entry + 8)),
      );
    }

    const columns = ["rXYZ", "gXYZ", "bXYZ"].map((signature) => {
      const tag = tags.get(signature);

      if (tag?.toString("latin1", 0, 4) !== "XYZ ") {
        throw new Error(`Missing ${signature}`);
      }

      return [8, 12, 16].map((o) => tag.readInt32BE(o) / 65536);
    });
    const toXyz = [0, 1, 2].map((r) => columns.map((c) => c[r]!)) as Matrix;
    const curves = ["rTRC", "gTRC", "bTRC"].map((signature) =>
      readCurve(tags.get(signature)),
    ) as [Curve, Curve, Curve];

    for (const space of [SRGB, DISPLAY_P3]) {
      if (describes(space, toXyz, curves)) {
        return space;
      }
    }

    return { name: "custom", toXyz, curves };
  } catch {
    return CUSTOM;
  }
}

const parsedProfiles = new WeakMap<Uint8Array, ColorSpace>();

/** The colour space an ICC profile describes. No profile means sRGB. */
export function colorSpaceFromProfile(profile: Uint8Array | undefined) {
  if (!profile) {
    return SRGB;
  }

  let space = parsedProfiles.get(profile);

  if (!space) {
    space = parseProfile(
      Buffer.from(profile.buffer, profile.byteOffset, profile.byteLength),
    );
    parsedProfiles.set(profile, space);
  }

  return space;
}

/** The colour space of an image's pixels, from its ICC profile */
export function getColorSpace(image: { iccProfile?: Uint8Array }) {
  return colorSpaceFromProfile(image.iccProfile);
}

/** Whether colours have to be converted to go from one space to the other */
function needsConversion(from: ColorSpace, to: ColorSpace) {
  return (
    from !== to &&
    from.toXyz !== undefined &&
    to.toXyz !== undefined &&
    // A matched built-in space is always the same object, so only custom
    // profiles can describe the same space with different objects
    !(from.name === to.name && from.name !== "custom")
  );
}

/** Inverts a tone curve, which is increasing, by bisection */
function encode(curve: Curve, linear: number) {
  let low = 0;
  let high = 1;

  for (let i = 0; i < 32; i++) {
    const mid = (low + high) / 2;

    if (curve(mid) < linear) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return (low + high) / 2;
}

/**
 * Converts a colour, with channels from 0 to 1, from one colour space to
 * another. Channels outside the target space are clipped.
 * Returns the colour unchanged if either space can't be converted.
 */
export function convertColor(
  rgb: [number, number, number],
  from: ColorSpace,
  to: ColorSpace,
): [number, number, number] {
  if (!needsConversion(from, to)) {
    return rgb;
  }

  const linear = rgb.map((v, i) => from.curves![i]!(clamp01(v))) as Vector;
  const target = transform(multiply(invert(to.toXyz!), from.toXyz!), linear);

  return target.map((v, i) => encode(to.curves![i]!, clamp01(v))) as Vector;
}

/** Steps in the table that encodes linear light back to 8 bit values */
const ENCODE_STEPS = 65536;

/**
 * Maps linear light, in ENCODE_STEPS steps, to the nearest 8 bit value in
 * the curve's encoding
 */
function encodeTable(curve: Curve) {
  const table = new Uint8Array(ENCODE_STEPS);
  // The linear light half way between each pair of 8 bit values
  const thresholds = Array.from({ length: 255 }, (_, k) =>
    curve((k + 0.5) / 255),
  );
  let value = 0;

  for (let i = 0; i < ENCODE_STEPS; i++) {
    const linear = i / (ENCODE_STEPS - 1);

    while (value < 255 && linear > thresholds[value]!) {
      value++;
    }

    table[i] = value;
  }

  return table;
}

/**
 * Creates a function that converts RGBA pixel data from one colour space to
 * another in place, leaving alpha unchanged. Returns undefined if nothing
 * needs converting: the spaces are the same, or one of them can't be
 * converted.
 */
export function createColorConverter(from: ColorSpace, to: ColorSpace) {
  if (!needsConversion(from, to)) {
    return undefined;
  }

  const [m0, m1, m2] = multiply(invert(to.toXyz!), from.toXyz!);
  const [d0, d1, d2] = from.curves!.map((curve) =>
    Float32Array.from({ length: 256 }, (_, i) => curve(i / 255)),
  ) as [Float32Array, Float32Array, Float32Array];
  const [e0, e1, e2] = to.curves!.map(encodeTable) as [
    Uint8Array,
    Uint8Array,
    Uint8Array,
  ];
  const max = ENCODE_STEPS - 1;
  const index = (v: number) =>
    v <= 0 ? 0 : v >= 1 ? max : (v * max + 0.5) | 0;

  return (data: Uint8Array) => {
    for (let i = 0; i < data.length; i += 4) {
      const r = d0[data[i]!]!;
      const g = d1[data[i + 1]!]!;
      const b = d2[data[i + 2]!]!;

      data[i] = e0[index(m0[0] * r + m0[1] * g + m0[2] * b)]!;
      data[i + 1] = e1[index(m1[0] * r + m1[1] * g + m1[2] * b)]!;
      data[i + 2] = e2[index(m2[0] * r + m2[1] * g + m2[2] * b)]!;
    }
  };
}

/**
 * The pixel data of `source` in the colour space of `target`: the same
 * Buffer if they're in the same space, a converted copy if not. Used to draw
 * one image onto another.
 */
export function pixelsInColorSpaceOf(
  source: { bitmap: Bitmap; iccProfile?: Uint8Array },
  target: { iccProfile?: Uint8Array },
) {
  const convert = createColorConverter(
    getColorSpace(source),
    getColorSpace(target),
  );

  if (!convert) {
    return source.bitmap.data;
  }

  const data = Buffer.from(source.bitmap.data);
  convert(data);

  return data;
}

const COLOR_FUNCTION =
  /^color\(\s*(srgb|display-p3)\s+([^\s/)]+)\s+([^\s/)]+)\s+([^\s/)]+)\s*(?:\/\s*([^\s)]+)\s*)?\)$/i;

function parseChannel(value: string) {
  if (value === "none") {
    return 0;
  }

  const number = value.endsWith("%")
    ? parseFloat(value) / 100
    : parseFloat(value);

  if (Number.isNaN(number)) {
    throw new Error(`Invalid color channel: ${value}`);
  }

  return clamp01(number);
}

/**
 * Parses CSS's `color(display-p3 r g b / a)` and `color(srgb r g b / a)`
 * syntax, with channels from 0 to 1 or percentages
 */
export function parseColorFunction(css: string) {
  const match = COLOR_FUNCTION.exec(css.trim());

  if (!match) {
    return undefined;
  }

  const [, space, r, g, b, alpha] = match;

  return {
    colorSpace: COLOR_SPACES[space!.toLowerCase() as ColorSpaceName],
    rgb: [r, g, b].map((v) => parseChannel(v!)) as [number, number, number],
    alpha: alpha === undefined ? 1 : parseChannel(alpha),
  };
}
