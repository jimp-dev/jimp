import { HorizontalAlign, VerticalAlign } from "@jimp/core";
import {
  drawShape,
  flattenPath,
  PaintSchema,
  type Polyline,
} from "@jimp/plugin-draw";
import type { JimpClass } from "@jimp/types";
import { z } from "zod";

import {
  fontLineHeight,
  shapeLine,
  splitLines,
  type LayoutOptions,
} from "./vector-layout.js";
import type { VectorFont } from "./load-ttf.js";

const TextLayoutSchema = z.object({
  /**
   * the height of each line in pixels. Defaults to the font's line height:
   * its ascender to its descender plus its line gap.
   */
  lineHeight: z.number().min(0).optional(),
  /** extra space between characters, in pixels. Can be negative. Defaults to 0. */
  letterSpacing: z.number().optional(),
});

/** Options for {@link measureVectorText} */
export type TextLayoutOptions = z.infer<typeof TextLayoutSchema>;

const PrintTextOptionsSchema = TextLayoutSchema.extend({
  /** the font size in pixels, the size of the font's em square */
  size: z.number().min(0),
  /** the text to draw */
  text: z.union([z.string(), z.number()]),
  /** the x of the left edge of the text box */
  x: z.number(),
  /** the y of the top edge of the text box */
  y: z.number(),
  /**
   * what to fill the text with: a color or a gradient. Defaults to black, or
   * to no fill when there's a `stroke`.
   */
  color: PaintSchema.optional(),
  /** the width to wrap the text at and to align it within horizontally */
  maxWidth: z.number().optional(),
  /** the height to align the text within vertically. It doesn't clip the text. */
  maxHeight: z.number().optional(),
  /** how to align the lines within the box. Defaults to left. */
  alignmentX: z.nativeEnum(HorizontalAlign).optional(),
  /** how to align the text within the box. Defaults to top. */
  alignmentY: z.nativeEnum(VerticalAlign).optional(),
  /** what to outline the glyphs with: a color or a gradient */
  stroke: PaintSchema.optional(),
  /** the width of the outline in pixels, centered on the glyphs' edges. Defaults to 1. */
  strokeWidth: z.number().min(0).optional(),
});

const MeasureOptionsSchema = PrintTextOptionsSchema.pick({
  size: true,
  text: true,
  maxWidth: true,
  lineHeight: true,
  letterSpacing: true,
});

export type PrintTextOptions = z.infer<typeof PrintTextOptionsSchema> & {
  /** a font loaded with `loadTTF` */
  font: VectorFont;
};

/** Throws a clear error for anything that isn't a font from loadTTF */
function assertVectorFont(
  font: unknown,
  method: string,
): asserts font is VectorFont {
  if (
    typeof font === "object" &&
    font !== null &&
    "opentype" in font &&
    "kerning" in font &&
    typeof font.kerning === "function"
  ) {
    return;
  }

  const isBitmapFont =
    typeof font === "object" && font !== null && "chars" in font;

  throw new Error(
    isBitmapFont
      ? `${method} expects a font loaded with loadTTF, but received a bitmap font from loadFont. Draw bitmap fonts with print instead.`
      : `${method} expects a font loaded with loadTTF, but received ${font === null ? "null" : typeof font}.`,
  );
}

function layOut(
  font: VectorFont,
  text: string,
  maxWidth: number,
  options: LayoutOptions & { lineHeight?: number },
) {
  const lineHeight = options.lineHeight ?? fontLineHeight(font, options.size);
  const lines = splitLines(font, text, maxWidth, options).map((line) => ({
    text: line,
    ...shapeLine(font, line, options),
  }));

  return {
    lines,
    lineHeight,
    width: lines.reduce((width, line) => Math.max(width, line.width), 0),
    height: lines.length * lineHeight,
  };
}

/**
 * Measures text drawn with `printText`, wrapped at `maxWidth` the same way.
 * @param font a font loaded with `loadTTF`
 * @param size the font size in pixels
 * @param text the text to measure. Line breaks (`\n`, `\r\n` or `\r`) start
 * a new line.
 * @param maxWidth the width to wrap the text at. Without it the text only
 * breaks at line breaks.
 * @param options the `lineHeight` and `letterSpacing` you'll print with
 * @returns `width`, the width of the widest line; `height`, the number of
 * lines (including empty ones) times the line height; and `lines`, the text
 * of each line
 * @example
 * ```ts
 * import { measureVectorText } from "jimp";
 * import { loadTTF } from "jimp/load-ttf";
 *
 * const font = await loadTTF("fonts/Inter-Regular.ttf");
 *
 * measureVectorText(font, 32, "Hello world!");
 * // { width: 180.015625, height: 38.71875, lines: ["Hello world!"] }
 *
 * measureVectorText(font, 32, "Hello world!", 100);
 * // { width: 93.890625, height: 77.4375, lines: ["Hello", "world!"] }
 * ```
 */
export function measureVectorText(
  font: VectorFont,
  size: number,
  text: string | number,
  maxWidth?: number,
  options: TextLayoutOptions = {},
) {
  assertVectorFont(font, "measureVectorText");

  const parsed = MeasureOptionsSchema.parse({
    size,
    text,
    maxWidth,
    ...options,
  });
  const { lines, width, height } = layOut(
    font,
    String(parsed.text),
    parsed.maxWidth ?? Infinity,
    parsed,
  );

  return { width, height, lines: lines.map((line) => line.text) };
}

/** `printText`, which `methods` in index.ts includes */
export const vectorTextMethods = {
  /**
   * Draws text with a TrueType, OpenType or WOFF font loaded with `loadTTF`.
   * Glyphs are drawn from the font's outlines, antialiased, at any size, in
   * any color or gradient, and optionally outlined. Kerning and ligatures
   * from the font are applied.
   *
   * The text is laid out like `print` does it, in a box whose top left
   * corner is at `x`, `y`. `maxWidth` and `maxHeight` set the size of the
   * box. Without them the box reaches to the right and bottom edges of the
   * image.
   *
   * - Text wraps at `maxWidth`, between words. Without it the text only
   *   breaks at newlines. A word wider than `maxWidth` is broken between
   *   characters.
   * - Every newline (`\n`, `\r\n` or `\r`) starts a new line, so `"a\n\nb"`
   *   is three lines with an empty one in the middle.
   * - Spaces are drawn as they are, including runs of spaces. Spaces where
   *   the text wraps at `maxWidth` are dropped.
   * - `alignmentX` and `alignmentY` align the text within the box.
   * - `maxHeight` is only used for `alignmentY`. Text taller than it isn't
   *   clipped. Use `measureVectorText` to check whether it fits.
   *
   * Characters the font has no glyph for are drawn with its `.notdef` glyph,
   * usually a box. Glyphs are placed at fractional x positions, and each
   * line's baseline is rounded to a whole pixel to keep horizontal edges
   * sharp. Fonts aren't hinted.
   * @param options the font, text, position and style
   * @param options.font a font loaded with `loadTTF`
   * @param options.size the font size in pixels: the size of the font's em square, like CSS's `font-size`
   * @param options.text the text to draw
   * @param options.x the x of the left edge of the text box
   * @param options.y the y of the top edge of the text box
   * @param options.color what to fill the glyphs with: a hex number (`0xRRGGBBAA`), a CSS color (converted to the image's colour space), `{ r, g, b, a }`, or a linear or radial gradient in image coordinates. Defaults to black, or to no fill when there's a `stroke`.
   * @param options.maxWidth the width to wrap the text at and to align it within. Defaults to the width of the image right of `x`, but text only wraps when it is set.
   * @param options.maxHeight the height to align the text within. Defaults to the height of the image below `y`. Text taller than it is not clipped.
   * @param options.alignmentX how to align each line within the box: `HorizontalAlign.LEFT` (default), `CENTER` or `RIGHT`
   * @param options.alignmentY how to align the text within the box: `VerticalAlign.TOP` (default), `MIDDLE` or `BOTTOM`
   * @param options.lineHeight the height of each line in pixels. Defaults to the font's line height. The glyphs are centered vertically in it, like CSS.
   * @param options.letterSpacing extra space between characters in pixels, which can be negative. Turns off ligatures like `fi`, like CSS.
   * @param options.stroke what to outline the glyphs with: a color or gradient, like `color`
   * @param options.strokeWidth the width of the outline in pixels, centered on the glyphs' edges, with round corners. Defaults to 1.
   * @example
   * ```ts
   * import { HorizontalAlign, Jimp, VerticalAlign } from "jimp";
   * import { loadTTF } from "jimp/load-ttf";
   *
   * const font = await loadTTF("fonts/Inter-Regular.ttf");
   * const image = new Jimp({ width: 400, height: 200, color: "white" });
   *
   * image.printText({ font, size: 32, x: 10, y: 10, text: "Hello world!" });
   *
   * // Centered on the image, with a gradient and an outline
   * image.printText({
   *   font,
   *   size: 48,
   *   x: 0,
   *   y: 0,
   *   text: "Jimp",
   *   alignmentX: HorizontalAlign.CENTER,
   *   alignmentY: VerticalAlign.MIDDLE,
   *   color: {
   *     type: "linear",
   *     x1: 0,
   *     y1: 70,
   *     x2: 0,
   *     y2: 130,
   *     stops: [
   *       { offset: 0, color: "#ffd166" },
   *       { offset: 1, color: "#e63946" },
   *     ],
   *   },
   *   stroke: "#1d3557",
   *   strokeWidth: 2,
   * });
   * ```
   */
  printText<I extends JimpClass>(image: I, options: PrintTextOptions) {
    const { font, ...rest } = options;

    assertVectorFont(font, "printText");

    const parsed = PrintTextOptionsSchema.parse(rest);
    const {
      size,
      text,
      x,
      maxWidth = Infinity,
      maxHeight = Infinity,
      alignmentX = HorizontalAlign.LEFT,
      alignmentY = VerticalAlign.TOP,
      color,
      stroke,
      strokeWidth,
      lineHeight: lineHeightOption,
      letterSpacing,
    } = parsed;
    let { y } = parsed;
    const { lines, lineHeight, height } = layOut(font, String(text), maxWidth, {
      size,
      lineHeight: lineHeightOption,
      letterSpacing,
    });

    // The box to align the text in. Without a size it reaches to the edges of
    // the image, but text only wraps at an explicit maxWidth.
    const boxWidth =
      maxWidth === Infinity ? Math.max(0, image.bitmap.width - x) : maxWidth;
    const boxHeight =
      maxHeight === Infinity ? Math.max(0, image.bitmap.height - y) : maxHeight;

    if (alignmentY === VerticalAlign.BOTTOM) {
      y += boxHeight - height;
    } else if (alignmentY === VerticalAlign.MIDDLE) {
      y += (boxHeight - height) / 2;
    }

    const { ascender, descender, unitsPerEm } = font.opentype;
    const scale = size / unitsPerEm;
    // Like CSS, the glyphs are centered in the line: half of the space left
    // over is above them
    const ascent =
      (lineHeight - (ascender - descender) * scale) / 2 + ascender * scale;
    const polylines: Polyline[] = [];

    lines.forEach((line, index) => {
      let left = x;

      if (alignmentX === HorizontalAlign.CENTER) {
        left += (boxWidth - line.width) / 2;
      } else if (alignmentX === HorizontalAlign.RIGHT) {
        left += boxWidth - line.width;
      }

      const baseline = Math.round(y + index * lineHeight + ascent);

      line.glyphs.forEach((glyph, i) => {
        const { commands } = glyph.path;

        if (commands.length > 0) {
          polylines.push(
            ...flattenPath(commands, {
              transform: [
                scale,
                0,
                0,
                -scale,
                left + line.positions[i]!,
                baseline,
              ],
            }),
          );
        }
      });
    });

    // All the glyphs at once, so where they overlap isn't drawn twice
    return drawShape(image, polylines, {
      fill: color,
      stroke,
      strokeWidth,
      join: "round",
    });
  },
};
