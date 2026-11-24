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
import { vectorTextMethods } from "./print-text.js";
import { BmCharacter, BmFont } from "./types.js";

export { measureText, measureTextHeight } from "./measure-text.js";
export {
  measureVectorText,
  type PrintTextOptions,
  type TextLayoutOptions,
} from "./print-text.js";
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
   * Draws a text on a image on a given boundary
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
   * The font must include a glyph for every character you print. Characters
   * it has no glyph for are drawn as `?`. The bundled fonts cover printable
   * ASCII, and the 8, 16, 32, 64 and 128px ones also Latin-1 and `€`. For
   * other text (e.g. Japanese) generate a BMFont that includes those
   * characters.
   * @param options the font, position and text to print
   * @param options.font a bitmap font loaded with `loadFont`
   * @param options.x the x position of the left edge of the text box
   * @param options.y the y position of the top edge of the text box
   * @param options.text the text to draw (string or object with `text`, `alignmentX`, and/or `alignmentY`)
   * @param options.maxWidth the width to wrap the text at and to align it within. Defaults to the width of the image right of `x`, but text only wraps when it is set.
   * @param options.maxHeight the height to align the text within. Defaults to the height of the image below `y`. Text taller than it is not clipped.
   * @param options.cb a callback for when complete that has the end co-ordinates of the text: `x` is the left edge of the box plus the width of the widest line, `y` the bottom of the last line
   * @example
   * ```ts
   * import { HorizontalAlign, Jimp, VerticalAlign, loadFont } from "jimp";
   * import { SANS_32_BLACK } from "jimp/fonts";
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
   * ```
   */
  print<I extends JimpClass>(
    image: I,
    options: PrintOptions & {
      /** the BMFont instance */
      font: BmFont<I>;
    },
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

  ...vectorTextMethods,
};
