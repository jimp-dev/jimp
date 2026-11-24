import { HorizontalAlign, VerticalAlign } from "@jimp/core";
import {
  drawShape,
  flattenPath,
  PaintSchema,
  type Polyline,
} from "@jimp/plugin-draw";
import type { JimpClass } from "@jimp/types";
import { z } from "zod";

import type { VectorFont } from "./load-ttf.js";
import { fontLineHeight, shapeLine, splitLines } from "./vector-layout.js";

export const VectorTextLayoutSchema = z.object({
  /**
   * the font size in pixels: the size of the font's em square, like CSS's
   * `font-size`
   */
  size: z.number().min(0),
  /**
   * the height of each line in pixels. Defaults to the font's line height:
   * its ascender to its descender plus its line gap.
   */
  lineHeight: z.number().min(0).optional(),
  /** extra space between characters, in pixels. Can be negative. Defaults to 0. */
  letterSpacing: z.number().optional(),
});

/**
 * How text is laid out with a font from `loadTTF`. `measureText` and
 * `measureTextHeight` need it for those fonts.
 */
export type VectorTextLayoutOptions = z.infer<typeof VectorTextLayoutSchema>;

export const VectorTextOptionsSchema = VectorTextLayoutSchema.extend({
  /**
   * what to fill the text with: a color or a gradient. Defaults to black, or
   * to no fill when there's a `stroke`.
   */
  color: PaintSchema.optional(),
  /** what to outline the glyphs with: a color or a gradient */
  stroke: PaintSchema.optional(),
  /** the width of the outline in pixels, centered on the glyphs' edges. Defaults to 1. */
  strokeWidth: z.number().min(0).optional(),
});

/** The options `print` takes only with a font from `loadTTF` */
export type VectorTextOptions = z.infer<typeof VectorTextOptionsSchema>;

/** Whether `font` came from `loadTTF`, rather than being a bitmap font */
export function isVectorFont(font: unknown): font is VectorFont {
  return (
    typeof font === "object" &&
    font !== null &&
    "opentype" in font &&
    "kerning" in font &&
    typeof font.kerning === "function"
  );
}

/** Lays out text in lines, wrapped at `maxWidth` like bitmap fonts are */
export function layOutVectorText(
  font: VectorFont,
  text: string,
  maxWidth: number,
  options: VectorTextLayoutOptions,
) {
  const layout = VectorTextLayoutSchema.parse(options);
  const lineHeight = layout.lineHeight ?? fontLineHeight(font, layout.size);
  const lines = splitLines(font, text, maxWidth, layout).map((line) =>
    shapeLine(font, line, layout),
  );

  return {
    lines,
    lineHeight,
    width: lines.reduce((width, line) => Math.max(width, line.width), 0),
    height: lines.length * lineHeight,
  };
}

/** Where `print` draws text, already worked out from its options */
export interface TextBox {
  x: number;
  y: number;
  text: string;
  maxWidth: number;
  boxWidth: number;
  boxHeight: number;
  alignmentX: HorizontalAlign;
  alignmentY: VerticalAlign;
}

/**
 * Draws text with a font from `loadTTF`, for `print`
 * @returns the end of the text, for `print`'s callback
 */
export function printVectorText<I extends JimpClass>(
  image: I,
  font: VectorFont,
  box: TextBox,
  options: VectorTextOptions,
) {
  const { size, color, stroke, strokeWidth } =
    VectorTextOptionsSchema.parse(options);
  const { x, boxWidth, boxHeight, alignmentX, alignmentY } = box;
  let { y } = box;
  const { lines, lineHeight, width, height } = layOutVectorText(
    font,
    box.text,
    box.maxWidth,
    options,
  );

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
  drawShape(image, polylines, {
    fill: color,
    stroke,
    strokeWidth,
    join: "round",
  });

  return { x: x + width, y: y + height };
}
