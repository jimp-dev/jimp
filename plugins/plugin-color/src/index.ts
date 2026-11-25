import { Buffer } from "buffer";
import {
  clone,
  ColorSpace,
  cssColorToHex,
  getColorSpace,
  gradientTable,
  GradientStopsSchema,
  intToRGBA,
  limit255,
  normalizeStops,
  pixelNoise,
  scan,
  SRGB,
} from "@jimp/utils";
import { Edge, JimpClass, RGBColor } from "@jimp/types";
import { z } from "zod";

const ConvolutionMatrixSchema = z
  .array(z.number())
  .min(1, "kernel rows must not be empty")
  .array()
  .min(1, "kernel must be a matrix")
  .refine(
    (kernel) => kernel.every((row) => row.length === kernel[0]!.length),
    "kernel rows must all have the same length",
  );
const ConvolutionDivisorSchema = z
  .number()
  .refine((divisor) => divisor !== 0, "divisor must not be 0");
const ConvolutionComplexOptionsSchema = z.object({
  /** a matrix to weight the neighbors sum */
  kernel: ConvolutionMatrixSchema,
  /**define how to sum pixels from outside the border */
  edgeHandling: z.nativeEnum(Edge).optional(),
  /** divide the weighted sum by this before clamping it to 0-255 (default 1) */
  divisor: ConvolutionDivisorSchema.optional(),
  /** add this to each color channel after dividing (default 0) */
  bias: z.number().optional(),
});
const ConvolutionOptionsSchema = z.union([
  ConvolutionMatrixSchema,
  ConvolutionComplexOptionsSchema,
]);

type ConvolutionComplexOptions = z.infer<
  typeof ConvolutionComplexOptionsSchema
>;
type ConvolutionOptions = z.infer<typeof ConvolutionOptionsSchema>;

const ConvoluteComplexOptionsSchema = z.object({
  /** the convolution kernel */
  kernel: ConvolutionMatrixSchema,
  /** the x position of the region to apply convolution to */
  x: z.number().optional(),
  /** the y position of the region to apply convolution to */
  y: z.number().optional(),
  /** the width of the region to apply convolution to */
  w: z.number().optional(),
  /** the height of the region to apply convolution to */
  h: z.number().optional(),
  /** divide the weighted sum by this before clamping it to 0-255 (default 1) */
  divisor: ConvolutionDivisorSchema.optional(),
  /** add this to each color channel after dividing (default 0) */
  bias: z.number().optional(),
  /**
   * leave alpha as is instead of convolving it, like `preserveAlpha` in the
   * CSS `feConvolveMatrix` (default false)
   */
  preserveAlpha: z.boolean().optional(),
});
const ConvoluteOptionsSchema = z.union([
  ConvolutionMatrixSchema,
  ConvoluteComplexOptionsSchema,
]);

type ConvoluteComplexOptions = z.infer<typeof ConvoluteComplexOptionsSchema>;
type ConvoluteOptions = z.infer<typeof ConvoluteOptionsSchema>;

const PixelateSize = z.number().min(1).max(Infinity);
const PixelateComplexOptionsSchema = z.object({
  /** the size of the pixels */
  size: PixelateSize,
  /** the x position of the region to pixelate */
  x: z.number().optional(),
  /** the y position of the region to pixelate */
  y: z.number().optional(),
  /** the width of the region to pixelate */
  w: z.number().optional(),
  /** the height of the region to pixelate */
  h: z.number().optional(),
});
const PixelateOptionsSchema = z.union([
  PixelateSize,
  PixelateComplexOptionsSchema,
]);

type PixelateComplexOptions = z.infer<typeof PixelateComplexOptionsSchema>;
type PixelateOptions = z.infer<typeof PixelateOptionsSchema>;

const GradientMapOptionsSchema = z.union([
  GradientStopsSchema,
  z.object({
    /**
     * the colors to map the darkest (offset 0) to the lightest (offset 1)
     * pixels to: colors, spread out evenly, or `{ offset, color }` stops
     */
    stops: GradientStopsSchema,
    /**
     * how much of the gradient map to apply, from 0 (the original image) to
     * 1 (the default). Values outside 0-1 are clamped.
     */
    amount: z.number().optional(),
  }),
]);

/**
 * The colors to map an image's tones to: a list of gradient stops, or
 * `{ stops, amount }` to blend the result with the original
 */
export type GradientMapOptions = z.infer<typeof GradientMapOptionsSchema>;

function applyKernel(
  image: JimpClass,
  kernel: number[][],
  x: number,
  y: number,
) {
  const value = [0, 0, 0, 0] as [number, number, number, number];
  const rows = kernel.length;
  const cols = kernel[0]!.length;
  const originY = Math.floor((rows - 1) / 2);
  const originX = Math.floor((cols - 1) / 2);

  // kernel[ky][kx] weights the pixel kx - originX across and ky - originY
  // down, the same as `convolution`. The x-outer loop order keeps the sums
  // bit-identical to before for symmetric kernels.
  for (let kx = 0; kx < cols; kx += 1) {
    for (let ky = 0; ky < rows; ky += 1) {
      const idx = image.getPixelIndex(x + kx - originX, y + ky - originY);
      const weight = kernel[ky]![kx]!;

      value[0] += image.bitmap.data[idx]! * weight;
      value[1] += image.bitmap.data[idx + 1]! * weight;
      value[2] += image.bitmap.data[idx + 2]! * weight;
      value[3] += image.bitmap.data[idx + 3]! * weight;
    }
  }

  return value;
}

/*
 * color() used to run every pixel through tinycolor2, which validates its
 * input with regexes and round-trips numbers through strings, so it was very
 * slow (#1207). The functions below do the same maths as tinycolor2 v1.6.0 on
 * plain numbers. They follow tinycolor step by step, including its clamping
 * and rounding quirks, so the output is byte-identical to the old code.
 */

/**
 * The value tinycolor stores for a channel of `tinycolor({ r, g, b })`:
 * `bound01(v, 255) * 255`, with values below 1 rounded.
 */
function tinyChannel(v: number) {
  const n = Math.min(255, Math.max(0, v));
  const c = Math.abs(n - 255) < 0.000001 ? 255 : (n / 255) * 255;

  return c < 1 ? Math.round(c) : c;
}

/**
 * tinycolor's `bound01(n, 100)` for a value from `toHsl()`, after
 * `convertToPercentage()` has turned it into a string like `"42.5%"`.
 * Percentages are truncated to 2 decimal places with `parseInt()`.
 */
function percentTo01(v: number) {
  if (v > 1) {
    const n = Math.min(100, v);
    return Math.abs(n - 100) < 0.000001 ? 1 : n / 100;
  }

  const x = Math.min(100, Math.max(0, v * 100)) * 100;
  // parseInt() reads tiny numbers from their exponential form ("5e-7" → 5)
  const n =
    (x > 0 && x < 0.000001 ? parseInt(String(x), 10) : Math.floor(x)) / 100;

  return Math.abs(n - 100) < 0.000001 ? 1 : n / 100;
}

function hueToRgb(p: number, q: number, t: number) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

// Outputs of toHsl() and fromHsl(). Typed arrays hold doubles unboxed, so
// writing to them doesn't allocate per pixel.
const hsl = new Float64Array(3);
const rgb = new Float64Array(3);

/**
 * `tinycolor({ r, g, b }).toHsl()`. Sets `hsl` to [h (degrees), s, l].
 */
function toHsl(red: number, green: number, blue: number) {
  const r0 = tinyChannel(red);
  const g0 = tinyChannel(green);
  const b0 = tinyChannel(blue);
  const r = Math.abs(r0 - 255) < 0.000001 ? 1 : r0 / 255;
  const g = Math.abs(g0 - 255) < 0.000001 ? 1 : g0 / 255;
  const b = Math.abs(b0 - 255) < 0.000001 ? 1 : b0 / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  const l = (max + min) / 2;

  hsl[2] = l;

  if (max === min) {
    hsl[0] = 0;
    hsl[1] = 0;
    return;
  }

  const d = max - min;
  let h;

  hsl[1] = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  if (max === r) {
    h = (g - b) / d + (g < b ? 6 : 0);
  } else if (max === g) {
    h = (b - r) / d + 2;
  } else {
    h = (r - g) / d + 4;
  }

  hsl[0] = (h / 6) * 360;
}

/**
 * `tinycolor({ h, s, l }).toRgb()`. Sets `rgb`.
 */
function fromHsl(hue: number, saturation: number, lightness: number) {
  const n = Math.min(360, Math.max(0, hue));
  const h = Math.abs(n - 360) < 0.000001 ? 1 : n / 360;
  const s = percentTo01(saturation);
  const l = percentTo01(lightness);
  let r;
  let g;
  let b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }

  rgb[0] = Math.round(Math.min(255, Math.max(r * 255, 0)));
  rgb[1] = Math.round(Math.min(255, Math.max(g * 255, 0)));
  rgb[2] = Math.round(Math.min(255, Math.max(b * 255, 0)));
}

/**
 * The grey value `greyscale()` gives a pixel: its Rec. 709 luminance, rounded
 * to the nearest integer. Rounding (rather than truncating) keeps grey pixels
 * the same, since the weights' floating point sum is a little under 1.
 */
function luminance(r: number, g: number, b: number) {
  return Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
}

/**
 * One channel of `tinycolor(clr).brighten(amount).toRgb()`, where
 * `delta` is `Math.round(255 * -(amount / 100))`.
 */
function brightenChannel(v: number, delta: number) {
  const c = Math.max(0, Math.min(255, Math.round(tinyChannel(v)) - delta));
  return Math.round(tinyChannel(c));
}

/**
 * A table that maps each 8 bit value to its exposure adjusted value: decoded
 * to linear light with the colour space's tone curve, multiplied by
 * `factor`, then encoded back to the nearest 8 bit value
 */
function exposureTable(curve: (value: number) => number, factor: number) {
  // The linear light half way between each pair of 8 bit values
  const thresholds = Array.from({ length: 255 }, (_, k) =>
    curve((k + 0.5) / 255),
  );

  return Uint8Array.from({ length: 256 }, (_, v) => {
    // 0 * Infinity is NaN, which stays black like 0 should
    const linear = curve(v / 255) * factor;
    let value = 0;

    while (value < 255 && linear > thresholds[value]!) {
      value++;
    }

    return value;
  });
}

const HueActionSchema = z.object({
  apply: z.literal("hue"),
  params: z.tuple([z.number().min(-360).max(360)]),
});
export type HueAction = z.infer<typeof HueActionSchema>;

const SpinActionSchema = z.object({
  apply: z.literal("spin"),
  params: z.tuple([z.number().min(-360).max(360)]),
});
export type SpinAction = z.infer<typeof SpinActionSchema>;

const LightenActionSchema = z.object({
  apply: z.literal("lighten"),
  params: z.tuple([z.number().min(0).max(100)]).optional(),
});
export type LightenAction = z.infer<typeof LightenActionSchema>;

const RGBColorSchema = z.object({
  r: z.number().min(0).max(255),
  g: z.number().min(0).max(255),
  b: z.number().min(0).max(255),
});

/**
 * An `{ r, g, b }` object, or a CSS color, which is converted to the image's
 * colour space. Alpha is ignored.
 */
const MixColorSchema = z.union([RGBColorSchema, z.string()]);

const MixActionSchema = z.object({
  apply: z.literal("mix"),
  params: z.union([
    z.tuple([MixColorSchema]),
    z.tuple([MixColorSchema, z.number().min(0).max(100)]),
  ]),
});
export type MixAction = z.infer<typeof MixActionSchema>;

/**
 * Three factors to multiply red, green and blue by, or a color to multiply
 * with (each channel divided by 255), like the multiply blend mode
 */
const MultiplyActionSchema = z.object({
  apply: z.literal("multiply"),
  params: z.union([
    z.tuple([z.number(), z.number(), z.number()]),
    z.tuple([MixColorSchema]),
  ]),
});
export type MultiplyAction = z.infer<typeof MultiplyActionSchema>;

const TintActionSchema = z.object({
  apply: z.literal("tint"),
  params: z.tuple([z.number().min(0).max(100)]).optional(),
});
export type TintAction = z.infer<typeof TintActionSchema>;

const ShadeActionSchema = z.object({
  apply: z.literal("shade"),
  params: z.tuple([z.number().min(0).max(100)]).optional(),
});
export type ShadeAction = z.infer<typeof ShadeActionSchema>;

const XorActionSchema = z.object({
  apply: z.literal("xor"),
  params: z.tuple([MixColorSchema]),
});
export type XorAction = z.infer<typeof XorActionSchema>;

const RedActionSchema = z.object({
  apply: z.literal("red"),
  params: z.tuple([z.number().min(-255).max(255)]),
});
export type RedAction = z.infer<typeof RedActionSchema>;

const GreenActionSchema = z.object({
  apply: z.literal("green"),
  params: z.tuple([z.number().min(-255).max(255)]),
});
export type GreenAction = z.infer<typeof GreenActionSchema>;

const BlueActionSchema = z.object({
  apply: z.literal("blue"),
  params: z.tuple([z.number().min(-255).max(255)]),
});
export type BlueAction = z.infer<typeof BlueActionSchema>;

const BrightenActionSchema = z.object({
  apply: z.literal("brighten"),
  params: z.tuple([z.number().min(0).max(100)]).optional(),
});
export type BrightenAction = z.infer<typeof BrightenActionSchema>;

const DarkenActionSchema = z.object({
  apply: z.literal("darken"),
  params: z.tuple([z.number().min(0).max(100)]).optional(),
});
export type DarkenAction = z.infer<typeof DarkenActionSchema>;

const DesaturateActionSchema = z.object({
  apply: z.literal("desaturate"),
  params: z.tuple([z.number().min(0).max(100)]).optional(),
});
export type DesaturateAction = z.infer<typeof DesaturateActionSchema>;

const SaturateActionSchema = z.object({
  apply: z.literal("saturate"),
  params: z.tuple([z.number().min(0).max(100)]).optional(),
});
export type SaturateAction = z.infer<typeof SaturateActionSchema>;

const GrayscaleActionSchema = z.object({
  apply: z.literal("greyscale"),
  params: z.tuple([]).optional(),
});
export type GrayscaleAction = z.infer<typeof GrayscaleActionSchema>;

const ColorActionNameSchema = z.union([
  HueActionSchema,
  SpinActionSchema,
  LightenActionSchema,
  MixActionSchema,
  MultiplyActionSchema,
  TintActionSchema,
  ShadeActionSchema,
  XorActionSchema,
  RedActionSchema,
  GreenActionSchema,
  BlueActionSchema,
  BrightenActionSchema,
  DarkenActionSchema,
  DesaturateActionSchema,
  SaturateActionSchema,
  GrayscaleActionSchema,
]);
export type ColorAction = z.infer<typeof ColorActionNameSchema>;

export const ColorActionName = Object.freeze({
  LIGHTEN: "lighten",
  BRIGHTEN: "brighten",
  DARKEN: "darken",
  DESATURATE: "desaturate",
  SATURATE: "saturate",
  GREYSCALE: "greyscale",
  SPIN: "spin",
  HUE: "hue",
  MIX: "mix",
  MULTIPLY: "multiply",
  TINT: "tint",
  SHADE: "shade",
  XOR: "xor",
  RED: "red",
  GREEN: "green",
  BLUE: "blue",
});

const ColorOp = {
  Mix: 0,
  MixRounded: 1,
  Xor: 2,
  Red: 3,
  Green: 4,
  Blue: 5,
  ScaleSaturation: 6,
  Greyscale: 7,
  Spin: 8,
  Brighten: 9,
  Multiply: 10,
} as const;
type ColorOp = (typeof ColorOp)[keyof typeof ColorOp];

/** A color action with everything that doesn't depend on the pixel worked out */
interface ColorStep {
  op: ColorOp;
  /** The color to mix toward or xor with, or the factors to multiply by */
  r: number;
  g: number;
  b: number;
  /** The op's number: a mix weight, saturation factor, hue offset or channel delta */
  amount: number;
}

/** `tinycolor(color).toRgb()` */
function roundColor(color: RGBColor): RGBColor {
  return {
    r: Math.round(tinyChannel(color.r)),
    g: Math.round(tinyChannel(color.g)),
    b: Math.round(tinyChannel(color.b)),
  };
}

const BLACK = { r: 0, g: 0, b: 0 };
const WHITE = { r: 255, g: 255, b: 255 };

function colorStep(op: ColorOp, amount = 0, color = BLACK): ColorStep {
  return { op, r: color.r, g: color.g, b: color.b, amount };
}

/** An `{ r, g, b }` color, or a CSS color converted to `colorSpace` */
function toRGBColor(
  color: z.infer<typeof MixColorSchema>,
  colorSpace: ColorSpace,
): RGBColor {
  return roundColor(
    typeof color === "string"
      ? intToRGBA(cssColorToHex(color, colorSpace))
      : color,
  );
}

function compileColorAction(
  action: ColorAction,
  colorSpace: ColorSpace,
): ColorStep {
  switch (action.apply) {
    case "mix":
      return colorStep(
        ColorOp.Mix,
        (action.params[1] ?? 50) / 100,
        toRGBColor(action.params[0], colorSpace),
      );
    case "multiply": {
      if (action.params.length === 3) {
        const [r, g, b] = action.params;
        return colorStep(ColorOp.Multiply, 0, { r, g, b });
      }

      const { r, g, b } = toRGBColor(action.params[0], colorSpace);

      return colorStep(ColorOp.Multiply, 0, {
        r: r / 255,
        g: g / 255,
        b: b / 255,
      });
    }
    case "tint":
      return colorStep(ColorOp.Mix, (action.params?.[0] ?? 50) / 100, WHITE);
    case "shade":
      return colorStep(ColorOp.Mix, (action.params?.[0] ?? 50) / 100, BLACK);
    case "lighten":
      return colorStep(
        ColorOp.MixRounded,
        (action.params?.[0] ?? 10) / 100,
        WHITE,
      );
    case "darken":
      return colorStep(
        ColorOp.MixRounded,
        (action.params?.[0] ?? 10) / 100,
        BLACK,
      );
    case "xor":
      return colorStep(
        ColorOp.Xor,
        0,
        toRGBColor(action.params[0], colorSpace),
      );
    case "red":
      return colorStep(ColorOp.Red, action.params[0]);
    case "green":
      return colorStep(ColorOp.Green, action.params[0]);
    case "blue":
      return colorStep(ColorOp.Blue, action.params[0]);
    case "saturate":
      return colorStep(
        ColorOp.ScaleSaturation,
        1 + (action.params?.[0] ?? 10) / 100,
      );
    case "desaturate":
      return colorStep(
        ColorOp.ScaleSaturation,
        1 - (action.params?.[0] ?? 10) / 100,
      );
    case "greyscale":
      return colorStep(ColorOp.Greyscale);
    case "hue":
    case "spin":
      return colorStep(ColorOp.Spin, action.params[0]);
    case "brighten":
      return colorStep(
        ColorOp.Brighten,
        Math.round(255 * -((action.params?.[0] ?? 10) / 100)),
      );
  }
}

/**
 * Get an image's histogram
 * @return An object with an array of color occurrence counts for each channel (r,g,b)
 */
function histogram<I extends JimpClass>(image: I) {
  const histogram = {
    r: new Array<number>(256).fill(0),
    g: new Array<number>(256).fill(0),
    b: new Array<number>(256).fill(0),
  };

  image.scan((_, __, index) => {
    histogram.r[image.bitmap.data[index + 0]!]!++;
    histogram.g[image.bitmap.data[index + 1]!]!++;
    histogram.b[image.bitmap.data[index + 2]!]!++;
  });

  return histogram;
}

/**
 * Normalize values
 * @param  value Pixel channel value.
 * @param  min   Minimum value for channel
 * @param  max   Maximum value for channel
 */
const normalizeValue = function (value: number, min: number, max: number) {
  // A channel with a single value has no range to stretch
  if (min === max) {
    return value;
  }

  return ((value - min) * 255) / (max - min);
};

const getBounds = function (histogramChannel: number[]) {
  return [
    histogramChannel.findIndex((value) => value > 0),
    255 -
      histogramChannel
        .slice()
        .reverse()
        .findIndex((value) => value > 0),
  ];
};

const GrainOptionsSchema = z.object({
  /**
   * how strong the grain is, from 0 to 1 (default 0.1). Each pixel moves by
   * at most `amount` × 255 levels, and usually far less. 0.01 is enough to
   * hide banding in gradients saved as JPEG.
   */
  amount: z.number().min(0).max(1).optional(),
  /**
   * roughly how wide a grain is in pixels, from 1 (default: every pixel
   * gets its own noise) to 16. Bigger grains are softer clumps, with the
   * same strength.
   */
  size: z.number().min(1).max(16).optional(),
  /**
   * `true` (default) for grain that only changes brightness, like black and
   * white film. `false` for separate noise in red, green and blue.
   */
  monochrome: z.boolean().optional(),
  /**
   * picks the pattern, a whole number (default 0). The same seed always
   * gives the same grain.
   */
  seed: z.number().int().optional(),
});

export type GrainOptions = z.infer<typeof GrainOptionsSchema>;

/**
 * Noise for each pixel of a width × height image, from -1 to 1 and centered
 * on 0, with a standard deviation of 1 / √6 (that of a triangular
 * distribution) whatever the size. It only depends on the pixel's position,
 * the size and the seed, and uses seeds `seed * 2` and `seed * 2 + 1`.
 */
function grainField(width: number, height: number, size: number, seed: number) {
  const field = new Float32Array(width * height);

  if (size <= 1) {
    // The sum of two uniform numbers is triangular, like dither noise
    for (let y = 0, i = 0; y < height; y++) {
      for (let x = 0; x < width; x++, i++) {
        field[i] =
          pixelNoise(x, y, seed * 2) + pixelNoise(x, y, seed * 2 + 1) - 1;
      }
    }

    return field;
  }

  // Blur per-pixel noise with a gaussian about `size` wide
  const sigma = (size - 1) / 2;
  const radius = Math.ceil(sigma * 3);
  const kernel: number[] = [];

  for (let i = -radius; i <= radius; i++) {
    kernel.push(Math.exp(-(i * i) / (2 * sigma * sigma)));
  }

  const total = kernel.reduce((sum, w) => sum + w, 0);
  const weights = kernel.map((w) => w / total);
  // Blurring shrinks the noise's standard deviation by the sum of the
  // squared weights in each direction. Scale it back up, from that of a
  // uniform number (1 / √12) to 1 / √6.
  const gain = Math.SQRT2 / weights.reduce((sum, w) => sum + w * w, 0);
  // The noise for the image and `radius` pixels around it
  const paddedWidth = width + radius * 2;
  const paddedHeight = height + radius * 2;
  const noise = new Float32Array(paddedWidth * paddedHeight);

  for (let py = 0, i = 0; py < paddedHeight; py++) {
    for (let px = 0; px < paddedWidth; px++, i++) {
      noise[i] = pixelNoise(px - radius, py - radius, seed * 2) - 0.5;
    }
  }

  // Blur it across, then down
  const rows = new Float32Array(width * paddedHeight);

  for (let py = 0; py < paddedHeight; py++) {
    for (let x = 0; x < width; x++) {
      const start = py * paddedWidth + x;
      let sum = 0;

      for (let k = 0; k < weights.length; k++) {
        sum += weights[k]! * noise[start + k]!;
      }

      rows[py * width + x] = sum;
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;

      for (let k = 0; k < weights.length; k++) {
        sum += weights[k]! * rows[(y + k) * width + x]!;
      }

      field[y * width + x] = Math.max(-1, Math.min(1, sum * gain));
    }
  }

  return field;
}

export const methods = {
  /**
   * Normalizes the image: stretches each color channel so its lowest value
   * becomes 0 and its highest 255. A channel that has the same value in
   * every pixel is left unchanged.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.normalize();
   * ```
   */
  normalize<I extends JimpClass>(image: I) {
    const h = histogram(image);

    // store bounds (minimum and maximum values)
    const bounds = {
      r: getBounds(h.r),
      g: getBounds(h.g),
      b: getBounds(h.b),
    };

    // apply value transformations
    image.scan((_, __, idx) => {
      const r = image.bitmap.data[idx + 0]!;
      const g = image.bitmap.data[idx + 1]!;
      const b = image.bitmap.data[idx + 2]!;

      image.bitmap.data[idx + 0] = normalizeValue(
        r,
        bounds.r[0]!,
        bounds.r[1]!,
      );
      image.bitmap.data[idx + 1] = normalizeValue(
        g,
        bounds.g[0]!,
        bounds.g[1]!,
      );
      image.bitmap.data[idx + 2] = normalizeValue(
        b,
        bounds.b[0]!,
        bounds.b[1]!,
      );
    });

    return image;
  },

  /**
   * Inverts the colors in the image.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.invert();
   * ```
   */
  invert<I extends JimpClass>(image: I) {
    image.scan((_, __, idx) => {
      image.bitmap.data[idx] = 255 - image.bitmap.data[idx]!;
      image.bitmap.data[idx + 1] = 255 - image.bitmap.data[idx + 1]!;
      image.bitmap.data[idx + 2] = 255 - image.bitmap.data[idx + 2]!;
    });

    return image;
  },

  /**
   * Adjusts the brightness of the image by multiplying each color channel
   * by `val` and clamping the result to 0-255. Alpha is not changed.
   *
   * - `1` leaves the image unchanged
   * - greater than `1` brightens it (`1.5` is 50% brighter)
   * - between `0` and `1` darkens it (`0.5` is 50% darker)
   * - `0` or below makes it black
   *
   * In v0 `val` was a number between -1 and +1 where 0 left the image
   * unchanged. See the
   * [migration guide](https://jimp-dev.github.io/jimp/guides/migrate-to-v1/#brightness)
   * for how to convert old values.
   * @param val the factor to multiply each color channel by
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.brightness(1.5); // brighten
   * image.brightness(0.5); // darken
   * ```
   */
  brightness<I extends JimpClass>(image: I, val: number) {
    if (typeof val !== "number") {
      throw new Error("val must be numbers");
    }

    image.scan((_, __, idx) => {
      image.bitmap.data[idx]! = limit255(image.bitmap.data[idx]! * val);
      image.bitmap.data[idx + 1]! = limit255(image.bitmap.data[idx + 1]! * val);
      image.bitmap.data[idx + 2]! = limit255(image.bitmap.data[idx + 2]! * val);
    });

    return image;
  },

  /**
   * Adjusts the contrast of the image by scaling each color channel's
   * distance from the midpoint, 127.5, by `(1 + val) / (1 - val)`.
   *
   * - `0` leaves the image unchanged
   * - `-1` turns every pixel mid grey (128)
   * - `1` sets channels up to 127 to 0 and channels from 128 up to 255
   * @param val the amount to adjust the contrast, a number between -1 and +1
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.contrast(0.75);
   * ```
   */
  contrast<I extends JimpClass>(image: I, val: number) {
    if (typeof val !== "number") {
      throw new Error("val must be numbers");
    }

    if (val < -1 || val > +1) {
      throw new Error("val must be a number between -1 and +1");
    }

    const factor = (val + 1) / (1 - val);

    function adjust(value: number) {
      // 127.5 is never a channel value, so with val = 1 (an infinite
      // factor) every channel goes to 0 or 255 rather than 0 * Infinity
      const offset = factor * (value - 127.5);

      // Round halves away from the midpoint, so dark and light channels
      // are treated alike: contrast(invert(image)) is invert(contrast(image))
      return limit255(
        offset < 0
          ? 255 - Math.round(127.5 - offset)
          : Math.round(127.5 + offset),
      );
    }

    image.scan((_, __, idx) => {
      image.bitmap.data[idx] = adjust(image.bitmap.data[idx]!);
      image.bitmap.data[idx + 1] = adjust(image.bitmap.data[idx + 1]!);
      image.bitmap.data[idx + 2] = adjust(image.bitmap.data[idx + 2]!);
    });

    return image;
  },

  /**
   * Adjusts the exposure of the image by `stops`, like a camera or a photo
   * editor's exposure slider. Each color channel is decoded to linear light,
   * multiplied by `2 ** stops` and encoded back, so `1` doubles the light and
   * `-1` halves it. Channels that go over 255 are clamped. Alpha is not
   * changed.
   *
   * Unlike `brightness()`, which multiplies the encoded 8 bit values, this
   * works on the light the values stand for, so shadows and highlights change
   * the way they would with a longer or shorter exposure. The image's tone
   * curves are used (sRGB unless it has another ICC profile).
   *
   * - `0` leaves the image unchanged
   * - greater than `0` brightens it (`1` is one stop brighter)
   * - less than `0` darkens it (`-1` is one stop darker)
   * @param stops the number of stops to change the exposure by
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.exposure(1); // one stop brighter
   * image.exposure(-0.5); // half a stop darker
   * ```
   */
  exposure<I extends JimpClass>(image: I, stops: number) {
    const factor = 2 ** z.number().parse(stops);
    const curves = getColorSpace(image).curves ?? SRGB.curves!;
    const [r, g, b] = curves.map((curve) => exposureTable(curve, factor));

    image.scan((_, __, idx) => {
      image.bitmap.data[idx] = r![image.bitmap.data[idx]!]!;
      image.bitmap.data[idx + 1] = g![image.bitmap.data[idx + 1]!]!;
      image.bitmap.data[idx + 2] = b![image.bitmap.data[idx + 2]!]!;
    });

    return image;
  },

  /**
   * Adjusts the vibrance of the image: like `color([{ apply: "saturate" }])`
   * it scales each pixel's HSL saturation, but by more for muted colors than
   * for vivid ones, so skies and skin tones get richer while colors that are
   * already saturated don't clip.
   *
   * Each pixel's saturation is scaled by `1 + amount * (1 - chroma)`, where
   * chroma is `(max(r, g, b) - min(r, g, b)) / 255`. Greys and fully
   * saturated colors don't change.
   *
   * - `0` leaves the image unchanged
   * - `1` boosts the saturation of muted colors the most (up to double)
   * - `-1` mutes the colors, muted colors the most
   *
   * Values outside -1 to +1 are clamped.
   * @param amount the amount to adjust the vibrance, a number between -1 and +1
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.vibrance(0.5);
   * ```
   */
  vibrance<I extends JimpClass>(image: I, amount: number) {
    amount = Math.min(1, Math.max(-1, z.number().parse(amount)));

    if (amount === 0) {
      return image;
    }

    image.scan((_, __, idx) => {
      const r = image.bitmap.data[idx]!;
      const g = image.bitmap.data[idx + 1]!;
      const b = image.bitmap.data[idx + 2]!;
      const chroma = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;

      toHsl(r, g, b);
      fromHsl(
        hsl[0]!,
        Math.min(1, hsl[1]! * (1 + amount * (1 - chroma))),
        hsl[2]!,
      );

      image.bitmap.data[idx] = rgb[0]!;
      image.bitmap.data[idx + 1] = rgb[1]!;
      image.bitmap.data[idx + 2] = rgb[2]!;
    });

    return image;
  },

  /**
   * Apply a posterize effect: rounds each color channel to the nearest of
   * `n` evenly spaced levels from 0 to 255. For example `n = 2` gives 0 and
   * 255, and `n = 4` gives 0, 85, 170 and 255.
   * @param  n the number of levels per channel, at least 2
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.posterize(5);
   * ```
   */
  posterize<I extends JimpClass>(image: I, n: number) {
    if (typeof n !== "number") {
      throw new Error("n must be numbers");
    }

    // a whole number of levels from 2 to 256 (256 leaves the image as is)
    n = Math.min(256, Math.max(2, Math.round(n)));

    const step = 255 / (n - 1);

    function level(value: number) {
      return Math.round(Math.round(value / step) * step);
    }

    image.scan((_, __, idx) => {
      image.bitmap.data[idx] = level(image.bitmap.data[idx]!);
      image.bitmap.data[idx + 1] = level(image.bitmap.data[idx + 1]!);
      image.bitmap.data[idx + 2] = level(image.bitmap.data[idx + 2]!);
    });

    return image;
  },

  /**
   * Removes colour from the image. Each pixel's red, green and blue are set to
   * its ITU Rec. 709 luminance, `0.2126 * r + 0.7152 * g + 0.0722 * b`,
   * rounded to the nearest integer. Alpha is left alone, and pixels that are
   * already grey don't change, so greyscaling twice is the same as once.
   *
   * `color([{ apply: "greyscale" }])` gives the same result.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.greyscale();
   * ```
   */
  greyscale<I extends JimpClass>(image: I) {
    image.scan((_, __, idx) => {
      const grey = luminance(
        image.bitmap.data[idx]!,
        image.bitmap.data[idx + 1]!,
        image.bitmap.data[idx + 2]!,
      );

      image.bitmap.data[idx] = grey;
      image.bitmap.data[idx + 1] = grey;
      image.bitmap.data[idx + 2] = grey;
    });

    return image;
  },

  /**
   * Multiplies the opacity of each pixel by a factor between 0 and 1
   * @param f A number, the factor by which to multiply the opacity of each pixel
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.opacity(0.5);
   * ```
   */
  opacity<I extends JimpClass>(image: I, f: number) {
    if (typeof f !== "number") {
      throw new Error("f must be a number");
    }

    if (f < 0 || f > 1) {
      throw new Error("f must be a number from 0 to 1");
    }

    image.scan((_, __, idx) => {
      const v = image.bitmap.data[idx + 3]! * f;
      image.bitmap.data[idx + 3] = v;
    });

    return image;
  },

  /**
   * Applies a sepia tone to the image. `amount` blends between the original
   * image (`0`) and full sepia (`1`, the default), like CSS's
   * `sepia(amount)` filter. Values outside 0-1 are clamped.
   * @param amount how much sepia to apply, from 0 to 1 (default 1)
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.sepia();
   * image.sepia(0.5); // half way between the original and full sepia
   * ```
   */
  sepia<I extends JimpClass>(image: I, amount = 1) {
    const t = Math.min(1, Math.max(0, z.number().parse(amount)));

    image.scan((_, __, idx) => {
      const r = image.bitmap.data[idx]!;
      const g = image.bitmap.data[idx + 1]!;
      const b = image.bitmap.data[idx + 2]!;

      const red = r * 0.393 + g * 0.769 + b * 0.189;
      const green = r * 0.349 + g * 0.686 + b * 0.168;
      const blue = r * 0.272 + g * 0.534 + b * 0.131;

      image.bitmap.data[idx] = (red < 255 ? red : 255) * t + r * (1 - t);
      image.bitmap.data[idx + 1] =
        (green < 255 ? green : 255) * t + g * (1 - t);
      image.bitmap.data[idx + 2] = (blue < 255 ? blue : 255) * t + b * (1 - t);
    });

    return image;
  },

  /**
   * Applies a gradient map: replaces each pixel with the color at its
   * luminance along a gradient, so the darkest pixels get the first stop's
   * color and the lightest the last's. Two stops give a duotone, like
   * Photoshop's Gradient Map adjustment.
   *
   * The stops are the same as `@jimp/plugin-draw`'s gradients: colors spread
   * out evenly, or `{ offset, color }` stops with offsets from 0 to 1. CSS
   * colors are converted to the image's colour space, and invalid colors
   * throw.
   *
   * A pixel's place on the gradient is the luminance `greyscale()` gives it
   * (Rec. 709 weights on the stored values), divided by 255, so a gradient
   * map of an image and of its greyscale version are the same. The colors
   * between stops are interpolated in the image's colour space as it's
   * stored (gamma encoded, not linear light), like CSS and `plugin-draw`
   * gradients, so mapping a black to white ramp gives the same colors as
   * drawing the gradient.
   *
   * Each pixel keeps its alpha, multiplied by the alpha of its gradient
   * color. `amount` blends the result with the original image, like
   * `sepia(amount)`.
   * @param options the gradient's stops, or `{ stops, amount }`
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * // a duotone: shadows navy, highlights pink
   * image.gradientMap(["#1e3264", "#f037a5"]);
   *
   * // three stops, blended half way with the original
   * image.gradientMap({
   *   stops: [
   *     { offset: 0, color: "#000000" },
   *     { offset: 0.6, color: "#d9381e" },
   *     { offset: 1, color: "#ffe08a" },
   *   ],
   *   amount: 0.5,
   * });
   * ```
   */
  gradientMap<I extends JimpClass>(image: I, options: GradientMapOptions) {
    const parsed = GradientMapOptionsSchema.parse(options);
    const { stops, amount = 1 } = Array.isArray(parsed)
      ? { stops: parsed }
      : parsed;
    const t = Math.min(1, Math.max(0, amount));
    const lut = gradientTable(normalizeStops(stops), getColorSpace(image), 256);
    const data = image.bitmap.data;

    image.scan((_, __, idx) => {
      const r = data[idx]!;
      const g = data[idx + 1]!;
      const b = data[idx + 2]!;
      const a = data[idx + 3]!;
      const j = luminance(r, g, b) * 4;

      data[idx] = Math.round(lut[j]! * t + r * (1 - t));
      data[idx + 1] = Math.round(lut[j + 1]! * t + g * (1 - t));
      data[idx + 2] = Math.round(lut[j + 2]! * t + b * (1 - t));
      data[idx + 3] = Math.round(a * (1 - t + (t * lut[j + 3]!) / 255));
    });

    return image;
  },

  /**
   * Fades each pixel by a factor between 0 and 1
   * @param f A number from 0 to 1. 0 will haven no effect. 1 will turn the image completely transparent.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.fade(0.7);
   * ```
   */
  fade<I extends JimpClass>(image: I, f: number) {
    if (typeof f !== "number") {
      throw new Error("f must be a number");
    }

    if (f < 0 || f > 1) {
      throw new Error("f must be a number from 0 to 1");
    }

    // this method is an alternative to opacity (which may be deprecated)
    return this.opacity(image, 1 - f);
  },

  /**
   * Adds each element of the image to its local neighbors, weighted by the kernel.
   * Only the color channels are changed, alpha is left as is.
   *
   * Each channel becomes `sum / divisor + bias`, clamped to 0-255. The kernel
   * isn't normalized, so pass the sum of its weights as the `divisor` to keep
   * the brightness of the image (like ImageMagick's `-define convolve:scale`
   * or the CSS `feConvolveMatrix` divisor), and a `bias` to shift results that
   * can be negative, like edge detection, into the visible range.
   *
   * The kernel is laid out like the image: `kernel[row][col]` weights the
   * pixel `col - originX` to the right and `row - originY` below, where the
   * origin is `floor((size - 1) / 2)` along each axis. Kernels can be any
   * size, including even-sized and non-square ones. An even-sized axis has one
   * more entry after the origin than before it, so a 4x4 kernel covers
   * offsets -1 to 2. All rows must be the same length.
   *
   * The kernel isn't flipped (strictly this is correlation), like
   * ImageMagick's `-convolve` and `-morphology Correlate`, GIMP's convolution
   * matrix and Matlab's `imfilter`, which also share this origin. For a true
   * convolution (ImageMagick's `-morphology Convolve`, Matlab's `conv2`),
   * reverse the order of the rows and of each row.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.convolution([
   *   [-1, -1, 0],
   *   [-1, 1, 1],
   *   [0, 1, 1],
   * ]);
   *
   * // a 3x3 Gaussian blur written with integer weights
   * image.convolution({
   *   kernel: [
   *     [1, 2, 1],
   *     [2, 4, 2],
   *     [1, 2, 1],
   *   ],
   *   divisor: 16,
   * });
   * ```
   */
  convolution<I extends JimpClass>(image: I, options: ConvolutionOptions) {
    const parsed = ConvolutionOptionsSchema.parse(options);
    const {
      kernel,
      edgeHandling = Edge.EXTEND,
      divisor = 1,
      bias = 0,
    } = "kernel" in parsed
      ? parsed
      : ({ kernel: parsed } as ConvolutionComplexOptions);

    const newData = Buffer.from(image.bitmap.data);
    const kRows = kernel.length;
    const kCols = kernel[0]!.length;
    // The origin is at floor((size - 1) / 2), so an even-sized kernel has one
    // more row/column after the origin than before it
    const rowIni = -Math.floor((kRows - 1) / 2);
    const colIni = -Math.floor((kCols - 1) / 2);
    const rowEnd = kRows - 1 + rowIni;
    const colEnd = kCols - 1 + colIni;

    let weight;
    let rSum;
    let gSum;
    let bSum;
    let ri;
    let gi;
    let bi;
    let xi;
    let yi;
    let idxi;

    image.scan((x, y, idx) => {
      bSum = 0;
      gSum = 0;
      rSum = 0;

      for (let row = rowIni; row <= rowEnd; row++) {
        for (let col = colIni; col <= colEnd; col++) {
          xi = x + col;
          yi = y + row;
          weight = kernel[row - rowIni]![col - colIni]!;
          idxi = image.getPixelIndex(xi, yi, edgeHandling);

          if (idxi === -1) {
            bi = 0;
            gi = 0;
            ri = 0;
          } else {
            ri = image.bitmap.data[idxi + 0]!;
            gi = image.bitmap.data[idxi + 1]!;
            bi = image.bitmap.data[idxi + 2]!;
          }

          rSum += weight * ri;
          gSum += weight * gi;
          bSum += weight * bi;
        }
      }

      rSum = rSum / divisor + bias;
      gSum = gSum / divisor + bias;
      bSum = bSum / divisor + bias;

      if (rSum < 0) {
        rSum = 0;
      }

      if (gSum < 0) {
        gSum = 0;
      }

      if (bSum < 0) {
        bSum = 0;
      }

      if (rSum > 255) {
        rSum = 255;
      }

      if (gSum > 255) {
        gSum = 255;
      }

      if (bSum > 255) {
        bSum = 255;
      }

      newData[idx + 0] = rSum;
      newData[idx + 1] = gSum;
      newData[idx + 2] = bSum;
    });

    image.bitmap.data = newData;

    return image;
  },

  /**
   * Set the alpha channel on every pixel to fully opaque.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.opaque();
   * ```
   */
  opaque<I extends JimpClass>(image: I) {
    image.scan((_, __, idx) => {
      image.bitmap.data[idx + 3] = 255;
    });

    return image;
  },

  /**
   * Pixelates the image or a region. The region is clamped to the image, and
   * its width and height default to the rest of the image.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * // pixelate the whole image
   * image.pixelate(10);
   *
   * // pixelate a region
   * image.pixelate({ size: 10, x: 10, y: 10, w: 20, h: 20 });
   * ```
   */
  pixelate<I extends JimpClass>(image: I, options: PixelateOptions) {
    const parsed = PixelateOptionsSchema.parse(options);
    const {
      size,
      x = 0,
      y = 0,
      w = image.bitmap.width - x,
      h = image.bitmap.height - y,
    } = typeof parsed === "number"
      ? ({ size: parsed } as PixelateComplexOptions)
      : parsed;

    const kernel = [
      [1 / 16, 2 / 16, 1 / 16],
      [2 / 16, 4 / 16, 2 / 16],
      [1 / 16, 2 / 16, 1 / 16],
    ];

    const source = clone(image);

    scan(source, x, y, w, h, (xx, yx, idx) => {
      xx = size * Math.floor(xx / size);
      yx = size * Math.floor(yx / size);

      const value = applyKernel(source, kernel, xx, yx);

      image.bitmap.data[idx] = value[0]!;
      image.bitmap.data[idx + 1] = value[1]!;
      image.bitmap.data[idx + 2] = value[2]!;
      image.bitmap.data[idx + 3] = value[3]!;
    });

    return image;
  },

  /**
   * Applies a convolution kernel to the image or a region. Unlike
   * `convolution`, the kernel is applied to the alpha channel too, unless
   * `preserveAlpha` is true (like the CSS `feConvolveMatrix`).
   *
   * Each color channel becomes `sum / divisor + bias` and alpha becomes
   * `sum / divisor`, clamped to 0-255. The kernel isn't normalized, so pass
   * the sum of its weights as the `divisor` to keep the brightness of the
   * image, and a `bias` to shift results that can be negative into the
   * visible range. Kernels whose weights sum to 0, like edge detection, make
   * the image transparent unless `preserveAlpha` is true.
   *
   * The kernel is laid out and anchored the same way as in `convolution`.
   *
   * The region is clamped to the image, and its width and height default to
   * the rest of the image.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * // apply a convolution kernel to the whole image
   * image.convolute([
   *   [-1, -1, 0],
   *   [-1, 1, 1],
   *   [0, 1, 1],
   * ]);
   *
   * // apply a convolution kernel to a region
   * image.convolute({
   *   kernel: [
   *     [-1, -1, 0],
   *     [-1, 1, 1],
   *     [0, 1, 1],
   *   ],
   *   x: 10,
   *   y: 10,
   *   w: 10,
   *   h: 20,
   * });
   *
   * // a 3x3 Gaussian blur written with integer weights
   * image.convolute({
   *   kernel: [
   *     [1, 2, 1],
   *     [2, 4, 2],
   *     [1, 2, 1],
   *   ],
   *   divisor: 16,
   * });
   *
   * // edge detection that keeps the image's alpha
   * image.convolute({
   *   kernel: [
   *     [-1, -1, -1],
   *     [-1, 8, -1],
   *     [-1, -1, -1],
   *   ],
   *   preserveAlpha: true,
   * });
   * ```
   */
  convolute<I extends JimpClass>(image: I, options: ConvoluteOptions) {
    const parsed = ConvoluteOptionsSchema.parse(options);
    const {
      kernel,
      x = 0,
      y = 0,
      w = image.bitmap.width - x,
      h = image.bitmap.height - y,
      divisor = 1,
      bias = 0,
      preserveAlpha = false,
    } = "kernel" in parsed
      ? parsed
      : ({ kernel: parsed } as ConvoluteComplexOptions);

    const source = clone(image);

    scan(source, x, y, w, h, (xx, yx, idx) => {
      const value = applyKernel(source, kernel, xx, yx);

      image.bitmap.data[idx] = limit255(value[0]! / divisor + bias);
      image.bitmap.data[idx + 1] = limit255(value[1]! / divisor + bias);
      image.bitmap.data[idx + 2] = limit255(value[2]! / divisor + bias);

      if (!preserveAlpha) {
        image.bitmap.data[idx + 3] = limit255(value[3]! / divisor);
      }
    });

    return image;
  },

  /**
   * Apply multiple color modification rules
   *
   * `greyscale` gives the same result as `greyscale()` (Rec. 709 luminance).
   * `multiply` takes three factors to multiply red, green and blue by, or a
   * color to multiply with (each channel divided by 255, like the multiply
   * blend mode). Results are rounded and clamped to 0-255.
   * `desaturate` scales HSL saturation, so `desaturate` 100 gives a different
   * grey: the HSL lightness, `(max(r, g, b) + min(r, g, b)) / 2`.
   * @param  actions list of color modification rules, in following format: { apply: '<rule-name>', params: [ <rule-parameters> ]  }
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.color([
   *   { apply: "hue", params: [-90] },
   *   { apply: "lighten", params: [50] },
   *   { apply: "xor", params: ["#06D"] },
   * ]);
   *
   * // multiply red by 1.2, green by 1.1 and leave blue as is
   * image.color([{ apply: "multiply", params: [1.2, 1.1, 1] }]);
   * // multiply with a color, like the multiply blend mode
   * image.color([{ apply: "multiply", params: ["#ffcc99"] }]);
   * ```
   */
  color<I extends JimpClass>(image: I, actions: ColorAction[]) {
    if (!actions || !Array.isArray(actions)) {
      throw new Error("actions must be an array");
    }

    actions.forEach((action) => ColorActionNameSchema.parse(action));

    // Work out everything that doesn't depend on the pixel once per call.
    // The caller's actions aren't modified so they can be reused.
    const colorSpace = getColorSpace(image);
    const steps = actions.map((action) =>
      compileColorAction(action, colorSpace),
    );
    const data = image.bitmap.data;
    const end = image.bitmap.width * image.bitmap.height * 4;

    for (let idx = 0; idx < end; idx += 4) {
      let r = data[idx]!;
      let g = data[idx + 1]!;
      let b = data[idx + 2]!;

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]!;

        switch (step.op) {
          case ColorOp.Mix: {
            // (target - clr) * (p / 100) + clr, with step.amount = p / 100
            r = (step.r - r) * step.amount + r;
            g = (step.g - g) * step.amount + g;
            b = (step.b - b) * step.amount + b;
            break;
          }

          case ColorOp.MixRounded: {
            // lighten/darken blend toward white/black (like Photoshop's
            // Hue/Saturation lightness) rather than offsetting HSL lightness
            // like tinycolor does, which turns near-white pixels vivid when
            // darkened.
            r = Math.round((step.r - r) * step.amount + r);
            g = Math.round((step.g - g) * step.amount + g);
            b = Math.round((step.b - b) * step.amount + b);
            break;
          }

          case ColorOp.Multiply: {
            r = Math.round(limit255(r * step.r));
            g = Math.round(limit255(g * step.g));
            b = Math.round(limit255(b * step.b));
            break;
          }

          case ColorOp.Xor: {
            r = r ^ step.r;
            g = g ^ step.g;
            b = b ^ step.b;
            break;
          }

          case ColorOp.Red: {
            r = limit255(r + step.amount);
            break;
          }

          case ColorOp.Green: {
            g = limit255(g + step.amount);
            break;
          }

          case ColorOp.Blue: {
            b = limit255(b + step.amount);
            break;
          }

          case ColorOp.ScaleSaturation: {
            // Scale saturation (like GIMP) rather than offsetting it like
            // tinycolor does, which flattens muted colors to grey.
            toHsl(r, g, b);
            fromHsl(hsl[0]!, Math.min(1, hsl[1]! * step.amount), hsl[2]!);
            r = rgb[0]!;
            g = rgb[1]!;
            b = rgb[2]!;
            break;
          }

          case ColorOp.Greyscale: {
            // The same as greyscale(), rather than tinycolor's greyscale
            // (HSL lightness, like desaturate 100). Clamped like the HSL
            // steps, since earlier steps in a chain can leave any value.
            r = g = b = limit255(luminance(r, g, b));
            break;
          }

          case ColorOp.Spin: {
            toHsl(r, g, b);
            const hue = (hsl[0]! + step.amount) % 360;
            fromHsl(hue < 0 ? 360 + hue : hue, hsl[1]!, hsl[2]!);
            r = rgb[0]!;
            g = rgb[1]!;
            b = rgb[2]!;
            break;
          }

          case ColorOp.Brighten: {
            r = brightenChannel(r, step.amount);
            g = brightenChannel(g, step.amount);
            b = brightenChannel(b, step.amount);
            break;
          }
        }
      }

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
    }

    return image;
  },

  /**
   * Adds film grain: noise that's the same every time for the same options,
   * so the output can be cached and tested. Alpha isn't changed, and fully
   * transparent pixels are left alone.
   *
   * A little grain also hides the banding that smooth gradients get from
   * being stored with 256 levels per channel, including after JPEG
   * compression, which smooths away weaker noise.
   * @param options how strong and big the grain is, and its seed
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.grain(); // the default grain
   * image.grain({ amount: 0.2, size: 2 }); // stronger, bigger grain
   * image.grain({ monochrome: false, seed: 42 }); // colored, another pattern
   * image.grain({ amount: 0.01 }); // just enough to hide banding
   * ```
   */
  grain<I extends JimpClass>(image: I, options: GrainOptions = {}) {
    const {
      amount = 0.1,
      size = 1,
      monochrome = true,
      seed = 0,
    } = GrainOptionsSchema.parse(options);
    const { width, height, data } = image.bitmap;

    if (amount === 0) {
      return image;
    }

    // A different seed for each channel's noise
    const fields = monochrome
      ? [grainField(width, height, size, seed * 3)]
      : [0, 1, 2].map((c) => grainField(width, height, size, seed * 3 + c));
    const scale = amount * 255;

    for (let i = 0, p = 0; p < width * height; i += 4, p++) {
      if (data[i + 3] === 0) {
        continue;
      }

      for (let c = 0; c < 3; c++) {
        const value = data[i + c]! + fields[monochrome ? 0 : c]![p]! * scale;

        data[i + c] = value < 0 ? 0 : value > 255 ? 255 : Math.round(value);
      }
    }

    return image;
  },
};
