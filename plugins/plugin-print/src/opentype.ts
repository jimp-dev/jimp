import type { PathCommand } from "@jimp/plugin-draw";

/** A glyph of an {@link OpenTypeFont} */
export interface OpenTypeGlyph {
  /** the glyph's index in the font. 0 is `.notdef`, the missing glyph. */
  index: number;
  /** how far the pen moves after the glyph, in font units */
  advanceWidth?: number;
  /** the outline, in font units with y pointing up */
  path: { commands: PathCommand[] };
}

/**
 * The parts of an opentype.js `Font` that Jimp uses. The object is the full
 * opentype.js font, so cast it to opentype.js's own types for anything else.
 */
export interface OpenTypeFont {
  /** how many font units make up one em, the font size */
  unitsPerEm: number;
  /** the top of the font's line box above the baseline, in font units */
  ascender: number;
  /** the bottom of the font's line box, below the baseline, so negative */
  descender: number;
  tables: {
    hhea?: { lineGap?: number };
    [table: string]: unknown;
  };
  /** the pairs from the legacy `kern` table, by `"left,right"` glyph index */
  kerningPairs?: Record<string, number>;
  /**
   * The glyphs for a string, one per code point, with `features`
   * substitutions like ligatures applied. Missing ones are `.notdef`.
   */
  stringToGlyphs(
    text: string,
    options?: { features?: Record<string, boolean> },
  ): OpenTypeGlyph[];
}
