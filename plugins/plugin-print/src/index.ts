import { HorizontalAlign, VerticalAlign } from "@jimp/core";
import { JimpClass } from "@jimp/types";
import { methods as blitMethods } from "@jimp/plugin-blit";
import { z } from "zod";

import {
  glyphCharacter,
  kerning,
  measureText,
  measureTextHeight,
  splitLines,
} from "./measure-text.js";
import type { VectorFont } from "./load-ttf.js";
import { BmCharacter, BmFont } from "./types.js";
import {
  isVectorFont,
  printVectorText,
  VectorTextOptionsSchema,
  type VectorTextOptions,
} from "./vector-text.js";

export { measureText, measureTextHeight } from "./measure-text.js";
export type {
  VectorTextLayoutOptions,
  VectorTextOptions,
} from "./vector-text.js";
// loadTTF is in "./load-ttf", so opentype.js is only bundled when it's used
export type { FontSource, VectorFont } from "./load-ttf.js";
export type { OpenTypeFont, OpenTypeGlyph } from "./opentype.js";
export * from "./types.js";

const PrintOptionsSchema = z.object({
  /** the x position to draw the image */
  x: z.number(),
  /** the y position to draw the image */
  y: z.number(),
  /** the text to print */
  text: z.union([
    z.union([z.string(), z.number()]),
    z.object({
      text: z.union([z.string(), z.number()]),
      alignmentX: z.nativeEnum(HorizontalAlign).optional(),
      alignmentY: z.nativeEnum(VerticalAlign).optional(),
    }),
  ]),
  /** the width to wrap the text at and to align it within horizontally */
  maxWidth: z.number().optional(),
  /** the height to align the text within vertically. It doesn't clip the text. */
  maxHeight: z.number().optional(),
  /** a callback for when complete that has the end co-ordinates of the text */
  cb: z
    .function({ input: z.tuple([z.object({ x: z.number(), y: z.number() })]) })
    .optional(),
});

export type PrintOptions = z.infer<typeof PrintOptionsSchema>;

/**
 * The font to print with: a bitmap font from `loadFont`, or a TrueType,
 * OpenType or WOFF font from `loadTTF` with the options only those take
 */
export type PrintFontOptions<I extends JimpClass = JimpClass> =
  | ({
      /** a bitmap font loaded with `loadFont` */
      font: BmFont<I>;
    } & { [K in keyof VectorTextOptions]?: never })
  | ({
      /** a TrueType, OpenType or WOFF font loaded with `loadTTF` */
      font: VectorFont;
    } & VectorTextOptions);

const VECTOR_ONLY_OPTIONS = Object.keys(VectorTextOptionsSchema.shape);

function xOffsetBasedOnAlignment<I extends JimpClass>(
  font: BmFont<I>,
  line: string,
  maxWidth: number,
  alignment: HorizontalAlign,
) {
  if (alignment === HorizontalAlign.LEFT) {
    return 0;
  }

  if (alignment === HorizontalAlign.CENTER) {
    return (maxWidth - measureText(font, line)) / 2;
  }

  return maxWidth - measureText(font, line);
}

function drawCharacter<I extends JimpClass>(
  image: I,
  font: BmFont<I>,
  x: number,
  y: number,
  char: BmCharacter,
) {
  if (char.width > 0 && char.height > 0) {
    const characterPage = font.pages[char.page];

    if (characterPage) {
      image = blitMethods.blit(image, {
        src: characterPage,
        x: x + char.xoffset,
        y: y + char.yoffset,
        srcX: char.x,
        srcY: char.y,
        srcW: char.width,
        srcH: char.height,
      });
    }
  }

  return image;
}

function printText<I extends JimpClass>(
  image: I,
  font: BmFont<I>,
  x: number,
  y: number,
  text: string,
  defaultCharWidth: number,
) {
  // Split by code point so characters outside the BMP (emoji, rare CJK)
  // aren't broken into their surrogate halves
  const characters = Array.from(text);

  for (let i = 0; i < characters.length; i++) {
    const char = glyphCharacter(font, characters[i]!);
    const fontChar = char ? font.chars[char] : undefined;

    if (fontChar) {
      drawCharacter(image, font, x, y, fontChar);
    }

    x +=
      kerning(font, char, characters[i + 1]) +
      (fontChar?.xadvance || defaultCharWidth);
  }
}

export const methods = {
  /**
   * Draws text on an image, with a bitmap font from `loadFont` or a
   * TrueType, OpenType or WOFF font from `loadTTF`.
   *
   * The text is laid out in a box whose top left corner is at `x`, `y`.
   * `maxWidth` and `maxHeight` set the size of the box. Without them the box
   * reaches to the right and bottom edges of the image.
   *
   * - Text wraps at `maxWidth`. Without it the text only breaks at newlines.
   * - Every newline (`\n`, `\r\n` or `\r`) starts a new line, so `"a\n\nb"`
   *   is three lines with an empty one in the middle. Leading and trailing
   *   newlines add empty lines too.
   * - Spaces are printed as they are, including runs of spaces. Spaces where
   *   the text wraps at `maxWidth` are dropped.
   * - `alignmentX` and `alignmentY` align the text within the box.
   * - `maxHeight` is only used for `alignmentY`. Text taller than it isn't
   *   clipped, use `measureTextHeight` to check whether it fits.
   *
   * Bitmap fonts have their glyphs copied onto the image, at the size and in
   * the color they were made with. The font must include a glyph for every
   * character you print. Characters it has no glyph for are drawn as `?`.
   * The bundled fonts cover printable ASCII, and the 8, 16, 32, 64 and 128px
   * ones also Latin-1 and `€`. For other text (e.g. Japanese) generate a
   * BMFont that includes those characters, or use a font from `loadTTF`.
   *
   * Fonts from `loadTTF` are drawn from their outlines, antialiased, at any
   * `size`, filled with `color` and outlined with `stroke`. Kerning and
   * ligatures from the font are applied. Characters the font has no glyph
   * for are drawn with its `.notdef` glyph, usually a box. Glyphs are placed
   * at fractional x positions, and each line's baseline is rounded to a
   * whole pixel to keep horizontal edges sharp.
   * @param options the font, position and text to print
   * @param options.font a bitmap font loaded with `loadFont`, or a TrueType, OpenType or WOFF font loaded with `loadTTF`
   * @param options.x the x position of the left edge of the text box
   * @param options.y the y position of the top edge of the text box
   * @param options.text the text to draw (string or object with `text`, `alignmentX`, and/or `alignmentY`)
   * @param options.maxWidth the width to wrap the text at and to align it within. Defaults to the width of the image right of `x`, but text only wraps when it is set.
   * @param options.maxHeight the height to align the text within. Defaults to the height of the image below `y`. Text taller than it is not clipped.
   * @param options.cb a callback for when complete that has the end co-ordinates of the text: `x` is the left edge of the box plus the width of the widest line, `y` the bottom of the last line
   * @param options.size for `loadTTF` fonts, required: the font size in pixels, the size of the font's em square, like CSS's `font-size`
   * @param options.color for `loadTTF` fonts: what to fill the glyphs with, a hex number (`0xRRGGBBAA`), a CSS color (converted to the image's colour space), `{ r, g, b, a }`, or a linear or radial gradient in image coordinates. Defaults to black, or to no fill when there's a `stroke`.
   * @param options.stroke for `loadTTF` fonts: what to outline the glyphs with, a color or gradient like `color`
   * @param options.strokeWidth for `loadTTF` fonts: the width of the outline in pixels, centered on the glyphs' edges, with round corners. Defaults to 1.
   * @param options.lineHeight for `loadTTF` fonts: the height of each line in pixels. Defaults to the font's line height. The glyphs are centered vertically in it, like CSS.
   * @param options.letterSpacing for `loadTTF` fonts: extra space between characters in pixels, which can be negative. Turns off ligatures like `fi`, like CSS.
   * @example
   * ```ts
   * import { HorizontalAlign, Jimp, VerticalAlign, loadFont } from "jimp";
   * import { SANS_32_BLACK } from "jimp/fonts";
   * import { loadTTF } from "jimp/load-ttf";
   *
   * const image = await Jimp.read("test/image.png");
   * const font = await loadFont(SANS_32_BLACK);
   *
   * image.print({ font, x: 10, y: 10, text: "Hello world!" });
   *
   * // Centered on the image
   * image.print({
   *   font,
   *   x: 0,
   *   y: 0,
   *   text: {
   *     text: "Hello world!",
   *     alignmentX: HorizontalAlign.CENTER,
   *     alignmentY: VerticalAlign.MIDDLE,
   *   },
   * });
   *
   * // A TrueType font, at any size, with a gradient and an outline
   * const inter = await loadTTF("fonts/Inter-Regular.ttf");
   *
   * image.print({
   *   font: inter,
   *   size: 48,
   *   x: 10,
   *   y: 60,
   *   text: "Jimp",
   *   color: {
   *     type: "linear",
   *     x1: 0,
   *     y1: 60,
   *     x2: 0,
   *     y2: 120,
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
  print<I extends JimpClass>(
    image: I,
    options: PrintOptions & PrintFontOptions<I>,
  ) {
    const { font, ...printOptions } = options;
    let {
      // eslint-disable-next-line prefer-const
      x,
      y,
      text,
      // eslint-disable-next-line prefer-const
      maxWidth = Infinity,
      // eslint-disable-next-line prefer-const
      maxHeight = Infinity,
      // eslint-disable-next-line prefer-const
      cb = () => {},
    } = PrintOptionsSchema.parse(printOptions);

    let alignmentX: HorizontalAlign;
    let alignmentY: VerticalAlign;

    if (
      typeof text === "object" &&
      text.text !== null &&
      text.text !== undefined
    ) {
      alignmentX = text.alignmentX || HorizontalAlign.LEFT;
      alignmentY = text.alignmentY || VerticalAlign.TOP;
      ({ text } = text);
    } else {
      alignmentX = HorizontalAlign.LEFT;
      alignmentY = VerticalAlign.TOP;
      text = text.toString();
    }

    if (typeof text === "number") {
      text = text.toString();
    }

    // The box to align the text in. Without a size it reaches to the edges of
    // the image, but text only wraps at an explicit maxWidth.
    const boxWidth =
      maxWidth === Infinity ? Math.max(0, image.bitmap.width - x) : maxWidth;
    const boxHeight =
      maxHeight === Infinity ? Math.max(0, image.bitmap.height - y) : maxHeight;

    if (isVectorFont(font)) {
      const end = printVectorText(
        image,
        font,
        { x, y, text, maxWidth, boxWidth, boxHeight, alignmentX, alignmentY },
        printOptions as VectorTextOptions,
      );

      cb.bind(image)(end);

      return image;
    }

    // Bitmap fonts have a fixed size and color
    const vectorOptions = VECTOR_ONLY_OPTIONS.filter(
      (key) => (printOptions as Record<string, unknown>)[key] !== undefined,
    );

    if (vectorOptions.length > 0) {
      throw new Error(
        `print: ${vectorOptions.join(", ")} can only be used with fonts loaded with loadTTF. Bitmap fonts from loadFont are drawn at the size and in the color they were made with.`,
      );
    }

    if (alignmentY === VerticalAlign.BOTTOM) {
      y += boxHeight - measureTextHeight(font, text, maxWidth);
    } else if (alignmentY === VerticalAlign.MIDDLE) {
      y += boxHeight / 2 - measureTextHeight(font, text, maxWidth) / 2;
    }

    const defaultCharWidth = Object.entries(font.chars).find(
      (c) => c[1].xadvance,
    )?.[1].xadvance;

    if (typeof defaultCharWidth !== "number") {
      throw new Error("Could not find default character width");
    }

    const { lines, longestLine } = splitLines(font, text, maxWidth);

    lines.forEach((line) => {
      const lineString = line.join(" ");
      const alignmentWidth = xOffsetBasedOnAlignment(
        font,
        lineString,
        boxWidth,
        alignmentX,
      );

      printText(
        image,
        font,
        x + alignmentWidth,
        y,
        lineString,
        defaultCharWidth,
      );
      y += font.common.lineHeight;
    });

    cb.bind(image)({ x: x + longestLine, y });

    return image;
  },
};
