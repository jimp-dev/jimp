import { measureText, measureTextHeight } from "@jimp/plugin-print";

import { isVectorFont, type LayoutFont } from "./schema.js";

/** How text is set: the font and, for `loadTTF` fonts, its layout options */
export interface TextStyle {
  font: LayoutFont;
  /** for `loadTTF` fonts */
  size?: number;
  lineHeight?: number;
  letterSpacing?: number;
}

/** Heights are sums of floats, so allow for rounding when checking a fit */
const EPSILON = 1e-6;

function vectorOptions(style: TextStyle) {
  return {
    size: style.size!,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
  };
}

/** The width of the text's widest line, without wrapping */
export function textWidth(style: TextStyle, text: string) {
  const { font } = style;

  return isVectorFont(font)
    ? measureText(font, text, vectorOptions(style))
    : measureText(font, text);
}

/** The height of the text wrapped at `maxWidth`, like `print` wraps it */
export function textHeight(style: TextStyle, text: string, maxWidth: number) {
  const { font } = style;

  return isVectorFont(font)
    ? measureTextHeight(font, text, maxWidth, vectorOptions(style))
    : measureTextHeight(font, text, maxWidth);
}

/** The height of one line */
export function lineHeight(style: TextStyle) {
  return textHeight(style, "", Infinity);
}

/** "…" if the font has a glyph for it, otherwise three dots */
function ellipsis(font: LayoutFont) {
  const hasGlyph = isVectorFont(font)
    ? font.opentype.stringToGlyphs("…")[0]?.index !== 0
    : Boolean(font.chars["…"]);

  return hasGlyph ? "…" : "...";
}

/**
 * The text to draw so it's at most `maxLines` lines when wrapped at
 * `maxWidth`: the text itself if it fits, otherwise as much of it as fits
 * followed by an ellipsis.
 */
export function clampLines(
  style: TextStyle,
  text: string,
  maxWidth: number,
  maxLines: number | undefined,
) {
  if (maxLines === undefined) {
    return text;
  }

  const maxHeight = lineHeight(style) * maxLines + EPSILON;
  const fits = (candidate: string) =>
    textHeight(style, candidate, maxWidth) <= maxHeight;

  if (fits(text)) {
    return text;
  }

  // The height only grows as characters are added, so find the most that
  // fit with a binary search. Split by code point so emoji stay whole.
  const characters = Array.from(text);
  const suffix = ellipsis(style.font);
  const truncate = (length: number) =>
    characters.slice(0, length).join("").trimEnd() + suffix;
  let low = 0;
  let high = characters.length - 1;

  while (low < high) {
    const middle = Math.ceil((low + high) / 2);

    if (fits(truncate(middle))) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }

  return truncate(low);
}
