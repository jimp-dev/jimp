<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>@jimp/plugin-text</h1>
  <p>Draw text with TrueType, OpenType and WOFF fonts.</p>
</div>

Draws text from a font's outlines, antialiased, at any size, in any color or gradient, and optionally outlined. Kerning and ligatures come from the font. It's pure JavaScript: fonts are parsed with [opentype.js](https://github.com/opentypejs/opentype.js) and drawn with [`@jimp/plugin-draw`](../plugin-draw).

- [printText](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#printtext)
- [measureVectorText](https://jimp-dev.github.io/jimp/api/jimp/functions/measurevectortext/)
- [loadTTF](#loading-fonts)

`printText` and `measureVectorText` are included in `jimp`. `loadTTF` is in `jimp/load-ttf`, so the font parser (about 245 KB minified) is only bundled when you load fonts. In Node.js, opentype.js is only loaded the first time `loadTTF` is called.

```ts
import { HorizontalAlign, Jimp } from "jimp";
import { loadTTF } from "jimp/load-ttf";

const font = await loadTTF("fonts/Inter-Regular.ttf");
const image = new Jimp({ width: 400, height: 200, color: "white" });

image.printText({ font, size: 32, x: 10, y: 10, text: "Hello world!" });

image.printText({
  font,
  size: 20,
  x: 10,
  y: 60,
  maxWidth: 380,
  alignmentX: HorizontalAlign.CENTER,
  text: "Long text wraps between words at maxWidth and is centered in it.",
  color: "#1d3557",
});
```

## Loading fonts

`loadTTF` loads TrueType (`.ttf`), OpenType (`.otf`, CFF outlines) and WOFF (`.woff`) fonts.

- In Node.js it takes a path, a `file:` URL, an `http:`, `https:` or `data:` URL (loaded with `fetch`), or the font's bytes in a `Buffer`.
- In the browser it takes a URL, which is loaded with `fetch`, or the font's bytes in an `ArrayBuffer` or typed array.

Errors say what went wrong, for example `loadTTF: font file not found: "fonts/missing.ttf"`, `loadTTF: couldn't load "https://example.com/font.ttf": HTTP 404 Not Found` or `loadTTF: the data isn't a TrueType, OpenType or WOFF font (it's empty).`

WOFF2 isn't supported, because decoding it needs a Brotli decompressor, which is larger than the rest of the plugin. Convert WOFF2 fonts to WOFF or TTF first, for example with [fonttools](https://github.com/fonttools/fonttools): `fonttools ttLib.woff2 decompress font.woff2`. Font collections (`.ttc`) aren't supported either.

The font is the opentype.js `Font` in `font.opentype`, for anything else you want to do with it.

## Layout

Text is laid out the same way as [`print`](../plugin-print), in a box whose top left corner is at `x`, `y`. `maxWidth` and `maxHeight` set the size of the box, and without them it reaches to the right and bottom edges of the image.

- Text wraps between words at `maxWidth`. Without it, text only breaks at newlines. A word wider than `maxWidth` is broken between characters.
- Every newline (`\n`, `\r\n` or `\r`) starts a new line, so `"a\n\nb"` is three lines with an empty one in the middle.
- Spaces are drawn as they are, including runs of spaces. The spaces where text wraps at `maxWidth` are dropped.
- `alignmentX` (`HorizontalAlign.LEFT`, `CENTER` or `RIGHT`) and `alignmentY` (`VerticalAlign.TOP`, `MIDDLE` or `BOTTOM`) align the text within the box. Each line is aligned on its own.
- `maxHeight` is only used for `alignmentY`. Text taller than it isn't clipped.

`size` is the font size in pixels, like CSS's `font-size`. Each line is `lineHeight` pixels high, which defaults to the font's own line height: its ascender to its descender plus its line gap. Like CSS, the glyphs are centered vertically in the line. `letterSpacing` adds space between characters (or removes it, if it's negative), and like CSS it turns off ligatures like `fi`.

Glyphs are placed at fractional x positions, and each line's baseline is rounded to a whole pixel so horizontal edges stay sharp. Fonts aren't hinted.

Text is walked by code point, so an emoji is one character, not two. Characters the font has no glyph for are drawn with its `.notdef` glyph, usually a box. There's no font fallback, so pick a font that covers your text. Text is laid out left to right, and scripts that need complex shaping (like Arabic or Devanagari) may not come out right.

## Measuring

`measureVectorText(font, size, text, maxWidth?, { lineHeight?, letterSpacing? })` lays out text the same way as `printText` and returns:

- `width`: the width of the widest line
- `height`: the number of lines, including empty ones, times the line height
- `lines`: the text of each line, after wrapping

```ts
import { measureVectorText } from "jimp";

const { width, height, lines } = measureVectorText(
  font,
  32,
  "Hello world!",
  100,
);
// lines: ["Hello", "world!"]
```

## Color, gradients and outlines

`color` and `stroke` take the same colors and gradients as the [drawing methods](../plugin-draw): a hex number (`0xRRGGBBAA`), a CSS color string, `{ r, g, b, a }`, or a linear or radial gradient. CSS colors are converted to the image's colour space, and invalid ones throw (`Invalid color "notacolor"`). Gradients are in image coordinates, so one gradient can span several lines.

`stroke` outlines the glyphs `strokeWidth` pixels wide (1 by default), centered on their edges, with round corners. It's drawn over the fill. With a `stroke` and no `color` the text is only outlined.

```ts
image.printText({
  font,
  size: 80,
  x: 0,
  y: 0,
  text: "Jimp",
  alignmentX: HorizontalAlign.CENTER,
  alignmentY: VerticalAlign.MIDDLE,
  color: {
    type: "linear",
    x1: 0,
    y1: 20,
    x2: 0,
    y2: 90,
    stops: [
      { offset: 0, color: "#ffd166" },
      { offset: 1, color: "#e63946" },
    ],
  },
  stroke: "#1d3557",
  strokeWidth: 3,
});
```

The glyphs of a call are filled together with the nonzero rule, so where they overlap their edges aren't drawn twice.

## Kerning

Kerning comes from the `kern` feature of the font's `GPOS` table, or its `kern` table if it has no GPOS kerning. The GPOS kerning is read by this plugin instead of opentype.js, because opentype.js skips extension lookups, and large fonts like Inter and Noto keep their kerning in those.

## Test fonts

The fonts in `fixtures/` are small subsets of [Open Sans](https://github.com/googlefonts/opensans) and [Inter](https://github.com/rsms/inter), both under the SIL Open Font License 1.1 (see the `*-OFL.txt` files next to them). `scripts/subset-fonts.sh` makes them with fonttools.
