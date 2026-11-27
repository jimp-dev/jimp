import type { VectorFont } from "./load-ttf.js";
import type { OpenTypeGlyph } from "./opentype.js";

/** Line breaks: `\n`, `\r\n` or `\r` */
const LINE_BREAK = /\r\n?|\n/;

/** Widths are sums of floats, so allow for rounding when checking a fit */
const EPSILON = 1e-6;

export interface LayoutOptions {
  /** the font size in pixels: the size of the font's em square */
  size: number;
  /** extra space between characters, in pixels. Defaults to 0. */
  letterSpacing?: number;
}

/** A line of text shaped into glyphs */
export interface ShapedLine {
  glyphs: OpenTypeGlyph[];
  /** the x of each glyph's origin, relative to the start of the line */
  positions: number[];
  /** the distance from the first glyph's origin to the last one's advance */
  width: number;
}

/** Unicode variation selectors, which pick a variant of the character before */
const VARIATION_SELECTOR = /[᠋-᠍︀-️\u{E0100}-\u{E01EF}]/u;

/**
 * The glyphs for a line, with the font's substitutions like ligatures applied
 * by opentype.js.
 *
 * opentype.js throws on substitution lookups it doesn't implement, and it
 * applies some features, like `ccmp`, whatever `features` says. So for a font
 * with one of those lookups, like Hanken Grotesk's chained-context `ccmp`, the
 * line falls back to one glyph per code point, without substitutions. Text is
 * measured and drawn with this, so both fall back the same way.
 */
function lineGlyphs(
  font: VectorFont,
  text: string,
  options?: { features?: Record<string, boolean> },
) {
  try {
    return font.opentype.stringToGlyphs(text, options);
  } catch {
    const glyphs: OpenTypeGlyph[] = [];

    for (const char of text) {
      // stringToGlyphs drops variation selectors too
      if (!VARIATION_SELECTOR.test(char)) {
        glyphs.push(font.opentype.charToGlyph(char));
      }
    }

    return glyphs;
  }
}

/**
 * Turns a line of text into positioned glyphs: one per code point (`.notdef`
 * for ones the font doesn't have), with ligatures, kerning and letter
 * spacing.
 */
export function shapeLine(
  font: VectorFont,
  text: string,
  { size, letterSpacing = 0 }: LayoutOptions,
): ShapedLine {
  const scale = size / font.opentype.unitsPerEm;
  // Like CSS, letter spacing turns off optional ligatures
  const glyphs = lineGlyphs(
    font,
    text,
    letterSpacing === 0 ? undefined : { features: { rlig: true } },
  );
  const positions: number[] = [];
  let x = 0;

  for (let i = 0; i < glyphs.length; i++) {
    const glyph = glyphs[i]!;
    const next = glyphs[i + 1];

    positions.push(x);
    x += (glyph.advanceWidth ?? 0) * scale;

    if (next) {
      x += font.kerning(glyph.index, next.index) * scale + letterSpacing;
    }
  }

  return { glyphs, positions, width: x };
}

/** The font's line height at `size`: ascender to descender plus the line gap */
export function fontLineHeight(font: VectorFont, size: number) {
  const { ascender, descender, tables, unitsPerEm } = font.opentype;

  return (
    ((ascender - descender + (tables.hhea?.lineGap ?? 0)) * size) / unitsPerEm
  );
}

/** Wraps a paragraph, a line without line breaks, at `maxWidth` */
function wrapParagraph(
  measure: (text: string) => number,
  text: string,
  maxWidth: number,
) {
  if (maxWidth === Infinity) {
    return [text];
  }

  const fits = (line: string) => measure(line) <= maxWidth + EPSILON;
  // Runs of spaces are kept, as empty words between the spaces
  const words = text.split(" ");
  const lines: string[] = [];
  let line: string[] = [];
  // Whether `line` was started by wrapping, so spaces at its start are dropped
  let wrapped = false;

  // The line ends at a wrap, and the spaces before the wrap are dropped
  const wrap = () => {
    while (line.length > 0 && line[line.length - 1] === "") {
      line.pop();
    }

    if (line.length > 0) {
      lines.push(line.join(" "));
    }

    line = [];
    wrapped = true;
  };

  for (const word of words) {
    if (word === "" && wrapped && line.length === 0) {
      continue;
    }

    if (fits([...line, word].join(" "))) {
      line.push(word);
      continue;
    }

    if (word === "" || fits(word)) {
      wrap();

      if (word !== "") {
        line.push(word);
      }

      continue;
    }

    // A word wider than maxWidth is broken between characters, filling the
    // line it starts on
    let current = line.length > 0 ? `${line.join(" ")} ` : "";

    for (const char of word) {
      if (current === "" || fits(current + char)) {
        current += char;
      } else {
        // Without the space before the word, if no part of it fit
        line = [current.replace(/ +$/, "")];
        wrap();
        current = char;
      }
    }

    line = [current];
  }

  if (line.length > 0 || lines.length === 0) {
    lines.push(line.join(" "));
  }

  return lines;
}

/**
 * Splits text into lines at line breaks, keeping empty lines, and wraps each
 * of them at `maxWidth`, the same way `print` lays out text.
 */
export function splitLines(
  font: VectorFont,
  text: string,
  maxWidth: number,
  options: LayoutOptions,
) {
  const measure = (line: string) => shapeLine(font, line, options).width;

  return text
    .split(LINE_BREAK)
    .flatMap((paragraph) => wrapParagraph(measure, paragraph, maxWidth));
}
