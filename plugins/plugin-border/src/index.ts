import { Buffer } from "buffer";
import { JimpClass } from "@jimp/types";
import { cssColorToHex, intToRGBA } from "@jimp/utils";
import { z } from "zod";

const CornerRadiiSchema = z.object({
  /** the radius of the top left corner */
  topLeft: z.number().min(0).optional(),
  /** the radius of the top right corner */
  topRight: z.number().min(0).optional(),
  /** the radius of the bottom right corner */
  bottomRight: z.number().min(0).optional(),
  /** the radius of the bottom left corner */
  bottomLeft: z.number().min(0).optional(),
});

const RadiusSchema = z.union([z.number().min(0), CornerRadiiSchema]);

/**
 * A corner radius in pixels: one number for every corner, or an object with
 * a radius per corner. Corners left out of the object are square.
 */
export type CornerRadius = z.infer<typeof RadiusSchema>;

const ColorSchema = z.union([z.number(), z.string()]);

const RoundCornersOptionsSchema = z.object({
  /**
   * the radius of the corners in pixels, for every corner or per corner.
   * Radii too big for the image are scaled down like CSS `border-radius`.
   */
  radius: RadiusSchema,
});

export type RoundCornersOptions = z.infer<typeof RoundCornersOptionsSchema>;

const BorderOptionsSchema = z.object({
  /** the width of the border in pixels. The image grows by this much on every side. */
  width: z.number().int().min(0),
  /** the color of the border, as a hex number (0xRRGGBBAA) or a CSS color. Defaults to black. */
  color: ColorSchema.optional(),
  /**
   * the radius of the border's outer corners. The image's own corners are
   * rounded to match, with a radius `width` smaller, like CSS `border-radius`.
   */
  radius: RadiusSchema.optional(),
});

export type BorderOptions = z.infer<typeof BorderOptionsSchema>;

const BoxShadowOptionsSchema = z.object({
  /** how far to move the shadow right, in pixels. Negative moves it left. Defaults to 0. */
  x: z.number().optional(),
  /** how far to move the shadow down, in pixels. Negative moves it up. Defaults to 4. */
  y: z.number().optional(),
  /** the blur radius in pixels, like CSS. Defaults to 12. */
  blur: z.number().min(0).optional(),
  /** how much to grow the shadow on every side, in pixels. Negative shrinks it. Defaults to 0. */
  spread: z.number().optional(),
  /** the color of the shadow, as a hex number (0xRRGGBBAA) or a CSS color. Defaults to 50% black. */
  color: ColorSchema.optional(),
  /** the radius of the shadow's corners. Use the radius you rounded the image with. */
  radius: RadiusSchema.optional(),
});

export type BoxShadowOptions = z.infer<typeof BoxShadowOptionsSchema>;

/** Corner radii in the order top left, top right, bottom right, bottom left */
type Radii = [number, number, number, number];

interface RoundedRect {
  x: number;
  y: number;
  w: number;
  h: number;
  radii: Radii;
}

function toRadii(radius: CornerRadius = 0): Radii {
  if (typeof radius === "number") {
    return [radius, radius, radius, radius];
  }

  return [
    radius.topLeft ?? 0,
    radius.topRight ?? 0,
    radius.bottomRight ?? 0,
    radius.bottomLeft ?? 0,
  ];
}

/**
 * Scale the radii down so that adjacent corners don't overlap, the way CSS
 * does it: https://www.w3.org/TR/css-backgrounds-3/#corner-overlap
 */
function fitRadii(radii: Radii, w: number, h: number): Radii {
  const [tl, tr, br, bl] = radii;
  const f = Math.min(
    1,
    w / (tl + tr),
    w / (bl + br),
    h / (tl + bl),
    h / (tr + br),
  );

  return f < 1 ? [tl * f, tr * f, br * f, bl * f] : radii;
}

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

/** How much of a corner's arc covers the point (px, py), antialiased over one pixel */
function arcCoverage(
  r: number,
  cx: number,
  cy: number,
  px: number,
  py: number,
) {
  return clamp01(r - Math.hypot(px - cx, py - cy) + 0.5);
}

/**
 * How much of the pixel centered on (px, py) is inside the rounded rectangle,
 * from 0 to 1.
 */
function coverage(rect: RoundedRect, px: number, py: number) {
  const { x, y, w, h } = rect;
  const [tl, tr, br, bl] = rect.radii;
  let c = clamp01(Math.min(px - x, x + w - px, py - y, y + h - py) + 0.5);

  if (c === 0) {
    return 0;
  }

  if (tl > 0 && px < x + tl && py < y + tl) {
    c = Math.min(c, arcCoverage(tl, x + tl, y + tl, px, py));
  }

  if (tr > 0 && px > x + w - tr && py < y + tr) {
    c = Math.min(c, arcCoverage(tr, x + w - tr, y + tr, px, py));
  }

  if (br > 0 && px > x + w - br && py > y + h - br) {
    c = Math.min(c, arcCoverage(br, x + w - br, y + h - br, px, py));
  }

  if (bl > 0 && px < x + bl && py > y + h - bl) {
    c = Math.min(c, arcCoverage(bl, x + bl, y + h - bl, px, py));
  }

  return c;
}

/**
 * Sizes of three box blurs that together approximate a gaussian blur.
 * http://blog.ivank.net/fastest-gaussian-blur.html
 */
function boxSizesForGaussian(sigma: number) {
  const n = 3;
  const wIdeal = Math.sqrt((12 * sigma * sigma) / n + 1);
  let wl = Math.floor(wIdeal);

  if (wl % 2 === 0) {
    wl--;
  }

  const mIdeal =
    (12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4);
  const m = Math.round(mIdeal);

  return Array.from({ length: n }, (_, i) => (i < m ? wl : wl + 2));
}

/**
 * Box blur each line of `src` into `dst`. Values outside the buffer count as 0.
 */
function boxBlur(
  src: Float32Array,
  dst: Float32Array,
  lines: number,
  length: number,
  lineStep: number,
  step: number,
  r: number,
) {
  const scale = 1 / (2 * r + 1);

  for (let line = 0; line < lines; line++) {
    const start = line * lineStep;
    let sum = 0;

    for (let i = 0; i <= r && i < length; i++) {
      sum += src[start + i * step]!;
    }

    for (let i = 0; i < length; i++) {
      dst[start + i * step] = sum * scale;

      if (i + r + 1 < length) {
        sum += src[start + (i + r + 1) * step]!;
      }

      if (i - r >= 0) {
        sum -= src[start + (i - r) * step]!;
      }
    }
  }
}

function gaussianBlur(mask: Float32Array, w: number, h: number, sigma: number) {
  const tmp = new Float32Array(mask.length);

  for (const size of boxSizesForGaussian(sigma)) {
    const r = (size - 1) / 2;

    if (r < 1) {
      continue;
    }

    boxBlur(mask, tmp, h, w, w, 1, r);
    boxBlur(tmp, mask, w, h, 1, w, r);
  }
}

function setBitmap<I extends JimpClass>(
  image: I,
  data: Buffer,
  width: number,
  height: number,
) {
  image.bitmap.data = data;
  image.bitmap.width = width;
  image.bitmap.height = height;
}

export const methods = {
  /**
   * Rounds the corners of an image, making them transparent. The edges are
   * antialiased. The image keeps its size.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.roundCorners({ radius: 20 });
   * // or round each corner differently
   * image.roundCorners({ radius: { topLeft: 40, bottomRight: 40 } });
   * ```
   */
  roundCorners<I extends JimpClass>(image: I, options: RoundCornersOptions) {
    const { radius } = RoundCornersOptionsSchema.parse(options);
    const { width, height, data } = image.bitmap;
    const rect: RoundedRect = {
      x: 0,
      y: 0,
      w: width,
      h: height,
      radii: fitRadii(toRadii(radius), width, height),
    };

    image.scan((x, y, idx) => {
      const c = coverage(rect, x + 0.5, y + 0.5);

      if (c < 1) {
        data[idx + 3] = Math.round(data[idx + 3]! * c);
      }
    });

    return image;
  },

  /**
   * Adds a border around an image. The border is drawn outside the image, so
   * the image grows by `width` on every side and none of it is covered.
   *
   * With a `radius` the border's outer corners are rounded, and the image's
   * corners are rounded to fit inside it, like CSS `border-radius`. Use this
   * instead of calling `roundCorners` first.
   *
   * Transparent parts of the image stay transparent: the border is only drawn
   * around the image, not behind it.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.border({ width: 10, color: 0xffffffff });
   * // or with rounded corners
   * image.border({ width: 10, color: "#ff0000", radius: 30 });
   * ```
   */
  border<I extends JimpClass>(image: I, options: BorderOptions) {
    const {
      width: borderWidth,
      color = 0x000000ff,
      radius,
    } = BorderOptionsSchema.parse(options);
    const { width, height, data: src } = image.bitmap;
    const w = width + borderWidth * 2;
    const h = height + borderWidth * 2;
    const outerRadii = fitRadii(toRadii(radius), w, h);
    const outer: RoundedRect = { x: 0, y: 0, w, h, radii: outerRadii };
    const inner: RoundedRect = {
      x: borderWidth,
      y: borderWidth,
      w: width,
      h: height,
      radii: outerRadii.map((r) => Math.max(0, r - borderWidth)) as Radii,
    };
    const border = intToRGBA(cssColorToHex(color));
    const data = Buffer.alloc(w * h * 4);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const outerCoverage = coverage(outer, x + 0.5, y + 0.5);

        if (outerCoverage === 0) {
          continue;
        }

        const innerCoverage = coverage(inner, x + 0.5, y + 0.5);
        const idx = (y * w + x) * 4;
        // The border and the image cover different parts of the pixel, so
        // their alphas add up rather than one being composited over the
        // other. That way there's no seam between them on the curves.
        const borderAlpha =
          (border.a / 255) * Math.max(0, outerCoverage - innerCoverage);
        let imageAlpha = 0;
        let srcIdx = 0;

        if (innerCoverage > 0) {
          srcIdx = ((y - borderWidth) * width + (x - borderWidth)) * 4;
          imageAlpha = (src[srcIdx + 3]! / 255) * innerCoverage;
        }

        const alpha = borderAlpha + imageAlpha;

        if (alpha === 0) {
          continue;
        }

        data[idx] = Math.round(
          (border.r * borderAlpha + src[srcIdx]! * imageAlpha) / alpha,
        );
        data[idx + 1] = Math.round(
          (border.g * borderAlpha + src[srcIdx + 1]! * imageAlpha) / alpha,
        );
        data[idx + 2] = Math.round(
          (border.b * borderAlpha + src[srcIdx + 2]! * imageAlpha) / alpha,
        );
        data[idx + 3] = Math.round(Math.min(1, alpha) * 255);
      }
    }

    setBitmap(image, data, w, h);

    return image;
  },

  /**
   * Draws a shadow under an image, like CSS `box-shadow`. The shadow is the
   * image's box (with rounded corners if you give a `radius`), offset, grown
   * by `spread` and blurred. The image grows to fit the shadow, and the
   * original image is drawn over it unchanged.
   *
   * The shadow is drawn under the whole box, so it shows through any
   * transparent parts of the image. For a shadow in the shape of the image's
   * opaque pixels use `@jimp/plugin-shadow`.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.boxShadow({ x: 0, y: 8, blur: 16, color: 0x00000080 });
   * // or with rounded corners
   * image
   *   .roundCorners({ radius: 20 })
   *   .boxShadow({ y: 8, blur: 16, radius: 20 });
   * ```
   */
  boxShadow<I extends JimpClass>(image: I, options: BoxShadowOptions = {}) {
    const {
      x: offsetX = 0,
      y: offsetY = 4,
      blur = 12,
      spread = 0,
      color = 0x00000080,
      radius,
    } = BoxShadowOptionsSchema.parse(options);
    const { width, height, data: src } = image.bitmap;
    // Grow the image so the shadow fits. Like CSS, the blur reaches `blur`
    // pixels past the edge of the shadow.
    const extent = blur + spread;
    const left = Math.max(0, Math.ceil(extent - offsetX));
    const right = Math.max(0, Math.ceil(extent + offsetX));
    const top = Math.max(0, Math.ceil(extent - offsetY));
    const bottom = Math.max(0, Math.ceil(extent + offsetY));
    const w = width + left + right;
    const h = height + top + bottom;
    const mask = new Float32Array(w * h);
    const shadowWidth = width + spread * 2;
    const shadowHeight = height + spread * 2;

    if (shadowWidth > 0 && shadowHeight > 0) {
      const boxRadii = fitRadii(toRadii(radius), width, height);
      const shape: RoundedRect = {
        x: left + offsetX - spread,
        y: top + offsetY - spread,
        w: shadowWidth,
        h: shadowHeight,
        // Spread grows the corners with the box, but square corners stay square
        radii: fitRadii(
          boxRadii.map((r) => (r > 0 ? Math.max(0, r + spread) : 0)) as Radii,
          shadowWidth,
          shadowHeight,
        ),
      };

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          mask[y * w + x] = coverage(shape, x + 0.5, y + 0.5);
        }
      }

      if (blur > 0) {
        // CSS blurs shadows with a standard deviation of half the blur radius
        gaussianBlur(mask, w, h, blur / 2);
      }
    }

    const shadow = intToRGBA(cssColorToHex(color));
    const data = Buffer.alloc(w * h * 4);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const shadowAlpha = (shadow.a / 255) * clamp01(mask[y * w + x]!);
        const imageX = x - left;
        const imageY = y - top;
        let imageAlpha = 0;
        let srcIdx = 0;

        if (imageX >= 0 && imageX < width && imageY >= 0 && imageY < height) {
          srcIdx = (imageY * width + imageX) * 4;
          imageAlpha = src[srcIdx + 3]! / 255;
        }

        // Draw the image over the shadow (source-over)
        const under = shadowAlpha * (1 - imageAlpha);
        const alpha = imageAlpha + under;

        if (alpha === 0) {
          continue;
        }

        data[idx] = Math.round(
          (src[srcIdx]! * imageAlpha + shadow.r * under) / alpha,
        );
        data[idx + 1] = Math.round(
          (src[srcIdx + 1]! * imageAlpha + shadow.g * under) / alpha,
        );
        data[idx + 2] = Math.round(
          (src[srcIdx + 2]! * imageAlpha + shadow.b * under) / alpha,
        );
        data[idx + 3] = Math.round(alpha * 255);
      }
    }

    setBitmap(image, data, w, h);

    return image;
  },
};
