import { RGBAColor } from "@jimp/types";

export function srcOver(src: RGBAColor, dst: RGBAColor, ops = 1) {
  src.a *= ops;

  const a = dst.a + src.a - dst.a * src.a;

  const r = (src.r * src.a + dst.r * dst.a * (1 - src.a)) / a;
  const g = (src.g * src.a + dst.g * dst.a * (1 - src.a)) / a;
  const b = (src.b * src.a + dst.b * dst.a * (1 - src.a)) / a;

  return { r, g, b, a };
}

export function dstOver(src: RGBAColor, dst: RGBAColor, ops = 1) {
  src.a *= ops;

  const a = dst.a + src.a - dst.a * src.a;

  const r = (dst.r * dst.a + src.r * src.a * (1 - dst.a)) / a;
  const g = (dst.g * dst.a + src.g * src.a * (1 - dst.a)) / a;
  const b = (dst.b * dst.a + src.b * src.a * (1 - dst.a)) / a;

  return { r, g, b, a };
}

export function multiply(src: RGBAColor, dst: RGBAColor, ops = 1) {
  src.a *= ops;

  const a = dst.a + src.a - dst.a * src.a;

  const sra = src.r * src.a;
  const sga = src.g * src.a;
  const sba = src.b * src.a;

  const dra = dst.r * dst.a;
  const dga = dst.g * dst.a;
  const dba = dst.b * dst.a;

  const r = (sra * dra + sra * (1 - dst.a) + dra * (1 - src.a)) / a;
  const g = (sga * dga + sga * (1 - dst.a) + dga * (1 - src.a)) / a;
  const b = (sba * dba + sba * (1 - dst.a) + dba * (1 - src.a)) / a;

  return { r, g, b, a };
}

export function add(src: RGBAColor, dst: RGBAColor, ops = 1) {
  src.a *= ops;

  const a = dst.a + src.a - dst.a * src.a;

  const sra = src.r * src.a;
  const sga = src.g * src.a;
  const sba = src.b * src.a;

  const dra = dst.r * dst.a;
  const dga = dst.g * dst.a;
  const dba = dst.b * dst.a;

  const r = (sra + dra) / a;
  const g = (sga + dga) / a;
  const b = (sba + dba) / a;

  return { r, g, b, a };
}

export function screen(src: RGBAColor, dst: RGBAColor, ops = 1) {
  src.a *= ops;

  const a = dst.a + src.a - dst.a * src.a;

  const sra = src.r * src.a;
  const sga = src.g * src.a;
  const sba = src.b * src.a;

  const dra = dst.r * dst.a;
  const dga = dst.g * dst.a;
  const dba = dst.b * dst.a;

  const r =
    (sra * dst.a +
      dra * src.a -
      sra * dra +
      sra * (1 - dst.a) +
      dra * (1 - src.a)) /
    a;
  const g =
    (sga * dst.a +
      dga * src.a -
      sga * dga +
      sga * (1 - dst.a) +
      dga * (1 - src.a)) /
    a;
  const b =
    (sba * dst.a +
      dba * src.a -
      sba * dba +
      sba * (1 - dst.a) +
      dba * (1 - src.a)) /
    a;

  return { r, g, b, a };
}

export function overlay(src: RGBAColor, dst: RGBAColor, ops = 1) {
  src.a *= ops;

  const a = dst.a + src.a - dst.a * src.a;

  const sra = src.r * src.a;
  const sga = src.g * src.a;
  const sba = src.b * src.a;

  const dra = dst.r * dst.a;
  const dga = dst.g * dst.a;
  const dba = dst.b * dst.a;

  const r =
    (2 * dra <= dst.a
      ? 2 * sra * dra + sra * (1 - dst.a) + dra * (1 - src.a)
      : sra * (1 + dst.a) + dra * (1 + src.a) - 2 * dra * sra - dst.a * src.a) /
    a;

  const g =
    (2 * dga <= dst.a
      ? 2 * sga * dga + sga * (1 - dst.a) + dga * (1 - src.a)
      : sga * (1 + dst.a) + dga * (1 + src.a) - 2 * dga * sga - dst.a * src.a) /
    a;

  const b =
    (2 * dba <= dst.a
      ? 2 * sba * dba + sba * (1 - dst.a) + dba * (1 - src.a)
      : sba * (1 + dst.a) + dba * (1 + src.a) - 2 * dba * sba - dst.a * src.a) /
    a;

  return { r, g, b, a };
}

export function darken(src: RGBAColor, dst: RGBAColor, ops = 1) {
  src.a *= ops;

  const a = dst.a + src.a - dst.a * src.a;

  const sra = src.r * src.a;
  const sga = src.g * src.a;
  const sba = src.b * src.a;

  const dra = dst.r * dst.a;
  const dga = dst.g * dst.a;
  const dba = dst.b * dst.a;

  const r =
    (Math.min(sra * dst.a, dra * src.a) +
      sra * (1 - dst.a) +
      dra * (1 - src.a)) /
    a;
  const g =
    (Math.min(sga * dst.a, dga * src.a) +
      sga * (1 - dst.a) +
      dga * (1 - src.a)) /
    a;
  const b =
    (Math.min(sba * dst.a, dba * src.a) +
      sba * (1 - dst.a) +
      dba * (1 - src.a)) /
    a;

  return { r, g, b, a };
}

export function lighten(src: RGBAColor, dst: RGBAColor, ops = 1) {
  src.a *= ops;

  const a = dst.a + src.a - dst.a * src.a;

  const sra = src.r * src.a;
  const sga = src.g * src.a;
  const sba = src.b * src.a;

  const dra = dst.r * dst.a;
  const dga = dst.g * dst.a;
  const dba = dst.b * dst.a;

  const r =
    (Math.max(sra * dst.a, dra * src.a) +
      sra * (1 - dst.a) +
      dra * (1 - src.a)) /
    a;
  const g =
    (Math.max(sga * dst.a, dga * src.a) +
      sga * (1 - dst.a) +
      dga * (1 - src.a)) /
    a;
  const b =
    (Math.max(sba * dst.a, dba * src.a) +
      sba * (1 - dst.a) +
      dba * (1 - src.a)) /
    a;

  return { r, g, b, a };
}

export function hardLight(src: RGBAColor, dst: RGBAColor, ops = 1) {
  src.a *= ops;

  const a = dst.a + src.a - dst.a * src.a;

  const sra = src.r * src.a;
  const sga = src.g * src.a;
  const sba = src.b * src.a;

  const dra = dst.r * dst.a;
  const dga = dst.g * dst.a;
  const dba = dst.b * dst.a;

  const r =
    (2 * sra <= src.a
      ? 2 * sra * dra + sra * (1 - dst.a) + dra * (1 - src.a)
      : sra * (1 + dst.a) + dra * (1 + src.a) - 2 * dra * sra - dst.a * src.a) /
    a;

  const g =
    (2 * sga <= src.a
      ? 2 * sga * dga + sga * (1 - dst.a) + dga * (1 - src.a)
      : sga * (1 + dst.a) + dga * (1 + src.a) - 2 * dga * sga - dst.a * src.a) /
    a;

  const b =
    (2 * sba <= src.a
      ? 2 * sba * dba + sba * (1 - dst.a) + dba * (1 - src.a)
      : sba * (1 + dst.a) + dba * (1 + src.a) - 2 * dba * sba - dst.a * src.a) /
    a;

  return { r, g, b, a };
}

export function difference(src: RGBAColor, dst: RGBAColor, ops = 1) {
  src.a *= ops;

  const a = dst.a + src.a - dst.a * src.a;

  const sra = src.r * src.a;
  const sga = src.g * src.a;
  const sba = src.b * src.a;

  const dra = dst.r * dst.a;
  const dga = dst.g * dst.a;
  const dba = dst.b * dst.a;

  const r = (sra + dra - 2 * Math.min(sra * dst.a, dra * src.a)) / a;
  const g = (sga + dga - 2 * Math.min(sga * dst.a, dga * src.a)) / a;
  const b = (sba + dba - 2 * Math.min(sba * dst.a, dba * src.a)) / a;

  return { r, g, b, a };
}

export function exclusion(src: RGBAColor, dst: RGBAColor, ops = 1) {
  src.a *= ops;

  const a = dst.a + src.a - dst.a * src.a;

  const sra = src.r * src.a;
  const sga = src.g * src.a;
  const sba = src.b * src.a;

  const dra = dst.r * dst.a;
  const dga = dst.g * dst.a;
  const dba = dst.b * dst.a;

  const r =
    (sra * dst.a +
      dra * src.a -
      2 * sra * dra +
      sra * (1 - dst.a) +
      dra * (1 - src.a)) /
    a;
  const g =
    (sga * dst.a +
      dga * src.a -
      2 * sga * dga +
      sga * (1 - dst.a) +
      dga * (1 - src.a)) /
    a;
  const b =
    (sba * dst.a +
      dba * src.a -
      2 * sba * dba +
      sba * (1 - dst.a) +
      dba * (1 - src.a)) /
    a;

  return { r, g, b, a };
}

type RGB = Pick<RGBAColor, "r" | "g" | "b">;

/**
 * Composite with a W3C blend function: where both images are there the
 * source's color is `B(dst, src)`, and elsewhere it's whichever is there.
 * https://www.w3.org/TR/compositing-1/#blending
 */
function blend(
  src: RGBAColor,
  dst: RGBAColor,
  ops: number,
  B: (cb: RGB, cs: RGB) => RGB,
) {
  src.a *= ops;

  const a = dst.a + src.a - dst.a * src.a;
  const mixed = B(dst, src);

  const r =
    (src.a * ((1 - dst.a) * src.r + dst.a * mixed.r) +
      dst.r * dst.a * (1 - src.a)) /
    a;
  const g =
    (src.a * ((1 - dst.a) * src.g + dst.a * mixed.g) +
      dst.g * dst.a * (1 - src.a)) /
    a;
  const b =
    (src.a * ((1 - dst.a) * src.b + dst.a * mixed.b) +
      dst.b * dst.a * (1 - src.a)) /
    a;

  return { r, g, b, a };
}

/** Blend each channel on its own with `B` */
function separable(B: (cb: number, cs: number) => number) {
  return (cb: RGB, cs: RGB) => ({
    r: B(cb.r, cs.r),
    g: B(cb.g, cs.g),
    b: B(cb.b, cs.b),
  });
}

const dodge = separable((cb, cs) => {
  if (cb === 0) {
    return 0;
  }

  if (cs === 1) {
    return 1;
  }

  return Math.min(1, cb / (1 - cs));
});

export function colorDodge(src: RGBAColor, dst: RGBAColor, ops = 1) {
  return blend(src, dst, ops, dodge);
}

const burn = separable((cb, cs) => {
  if (cb === 1) {
    return 1;
  }

  if (cs === 0) {
    return 0;
  }

  return 1 - Math.min(1, (1 - cb) / cs);
});

export function colorBurn(src: RGBAColor, dst: RGBAColor, ops = 1) {
  return blend(src, dst, ops, burn);
}

const soft = separable((cb, cs) => {
  if (cs <= 0.5) {
    return cb - (1 - 2 * cs) * cb * (1 - cb);
  }

  const d = cb <= 0.25 ? ((16 * cb - 12) * cb + 4) * cb : Math.sqrt(cb);

  return cb + (2 * cs - 1) * (d - cb);
});

export function softLight(src: RGBAColor, dst: RGBAColor, ops = 1) {
  return blend(src, dst, ops, soft);
}

// The non-separable modes mix the channels, using the spec's helpers:
// https://www.w3.org/TR/compositing-1/#blendingnonseparable

function lum({ r, g, b }: RGB) {
  return 0.3 * r + 0.59 * g + 0.11 * b;
}

function clipColor(c: RGB): RGB {
  const l = lum(c);
  const n = Math.min(c.r, c.g, c.b);
  const x = Math.max(c.r, c.g, c.b);
  let { r, g, b } = c;

  if (n < 0) {
    r = l + ((r - l) * l) / (l - n);
    g = l + ((g - l) * l) / (l - n);
    b = l + ((b - l) * l) / (l - n);
  }

  if (x > 1) {
    r = l + ((r - l) * (1 - l)) / (x - l);
    g = l + ((g - l) * (1 - l)) / (x - l);
    b = l + ((b - l) * (1 - l)) / (x - l);
  }

  return { r, g, b };
}

function setLum(c: RGB, l: number) {
  const d = l - lum(c);

  return clipColor({ r: c.r + d, g: c.g + d, b: c.b + d });
}

function sat({ r, g, b }: RGB) {
  return Math.max(r, g, b) - Math.min(r, g, b);
}

function setSat(c: RGB, s: number): RGB {
  const channels: (keyof RGB)[] = ["r", "g", "b"];
  const [min, mid, max] = channels.sort((x, y) => c[x] - c[y]) as [
    keyof RGB,
    keyof RGB,
    keyof RGB,
  ];
  const result = { r: 0, g: 0, b: 0 };

  if (c[max] > c[min]) {
    result[mid] = ((c[mid] - c[min]) * s) / (c[max] - c[min]);
    result[max] = s;
  }

  return result;
}

export function hue(src: RGBAColor, dst: RGBAColor, ops = 1) {
  return blend(src, dst, ops, (cb, cs) => setLum(setSat(cs, sat(cb)), lum(cb)));
}

export function saturation(src: RGBAColor, dst: RGBAColor, ops = 1) {
  return blend(src, dst, ops, (cb, cs) => setLum(setSat(cb, sat(cs)), lum(cb)));
}

export function color(src: RGBAColor, dst: RGBAColor, ops = 1) {
  return blend(src, dst, ops, (cb, cs) => setLum(cs, lum(cb)));
}

export function luminosity(src: RGBAColor, dst: RGBAColor, ops = 1) {
  return blend(src, dst, ops, (cb, cs) => setLum(cb, lum(cs)));
}

export const names = [
  srcOver,
  dstOver,
  multiply,
  add,
  screen,
  overlay,
  darken,
  lighten,
  hardLight,
  difference,
  exclusion,
  colorDodge,
  colorBurn,
  softLight,
  hue,
  saturation,
  color,
  luminosity,
] as const;
export type CompositeMode = (typeof names)[number];
