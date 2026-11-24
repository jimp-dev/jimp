<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/plugin-print</h1>
  <p>Print text onto an image.</p>
</div>

`print` draws text with two kinds of font:

- Bitmap fonts (BMFont), like the bundled ones in `jimp/fonts`. Their glyphs are copied onto the image at the size and in the color they were made with. Load one with `loadFont`.
- TrueType, OpenType and WOFF fonts. Their glyphs are drawn from their outlines, at any size and in any color or gradient. Load one with `loadTTF`. See [TrueType, OpenType and WOFF fonts](#truetype-opentype-and-woff-fonts).

Load a bitmap font with `loadFont`. The bundled fonts are named exports of `jimp/fonts`:

```js
import { Jimp, loadFont } from "jimp";
import { SANS_32_BLACK } from "jimp/fonts";

const image = new Jimp({ width: 256, height: 256, color: 0xffffffff });
const font = await loadFont(SANS_32_BLACK);

image.print({ font, x: 10, y: 10, text: "Hello world!" });
```

## Layout

The text is laid out in a box whose top left corner is at `x`, `y`. `maxWidth` and `maxHeight` set the size of the box, and without them it reaches to the right and bottom edges of the image.

- Text wraps at `maxWidth`. Without it, text only breaks at newlines.
- Every newline (`\n`, `\r\n` or `\r`) starts a new line, so `"a\n\nb"` prints three lines with an empty one between `a` and `b`. Leading and trailing newlines add empty lines too.
- Spaces are printed as they are, including runs of spaces and lines of only spaces. Where text wraps at `maxWidth`, the spaces at the wrap are dropped instead of being carried to the next line.
- `alignmentX` and `alignmentY` align the text within the box. So without `maxWidth` and `maxHeight` this centers the text on the image:

  ```js
  import { HorizontalAlign, VerticalAlign } from "jimp";

  image.print({
    font,
    x: 0,
    y: 0,
    text: {
      text: "Hello world!",
      alignmentX: HorizontalAlign.CENTER,
      alignmentY: VerticalAlign.MIDDLE,
    },
  });
  ```

- `maxHeight` is only used to align the text. Text that is taller isn't clipped.

`measureText(font, text)` returns the width of the widest line, and `measureTextHeight(font, text, maxWidth)` the height of the text wrapped at `maxWidth`, empty lines included, for example to check whether it fits.

The `cb` option is called with the end of the text: `x` is the box's left edge plus the width of the widest line, and `y` the bottom of the last line, so you can print more text below it.

See [Getting Started](https://jimp-dev.github.io/jimp/guides/getting-started/) to read an image, change it and save the result with `write` or `getBuffer`.

## Custom fonts

Fonts are bitmap fonts in the [BMFont](https://www.angelcode.com/products/bmfont/) format: a `.fnt` file and the `.png` pages it points to. A bitmap font only has glyphs for the characters it was generated with. The bundled fonts cover:

- 8, 16, 32, 64 and 128px: printable ASCII except the backtick (`` ` ``), Latin-1 (accented letters like `é` and `ü`, and symbols like `£`, `©` and `°`) and `€`.
- 10, 12 and 14px: printable ASCII only.

Any character the font has no glyph for is printed as `?`, and whitespace without a glyph is left blank. So if Japanese, Chinese or Korean text prints as `???`, the font doesn't include those characters.

To print them, use a TrueType font that covers them with `loadTTF`, or generate a bitmap font that includes them. For example, with [fontbm](https://github.com/vladimirgamalyan/fontbm) and [Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP):

```sh
# chars.txt holds the characters to include, e.g. こんにちは世界
fontbm --font-file NotoSansJP-Regular.ttf --output noto-sans-jp \
  --font-size 32 --chars 32-126 --chars-file chars.txt --color 0,0,0
```

Then load the `.fnt` file. Keep the `.png` pages next to it.

```js
const font = await loadFont("fonts/noto-sans-jp.fnt");

image.print({ font, x: 10, y: 10, text: "こんにちは世界" });
```

Pass `loadFont` the path to the `.fnt` file, not its contents. The pages are found relative to it. In Node.js the font and its pages are read from disk, so this works in runtimes without a global `fetch`. URLs (`http:`, `https:`, `data:`) are loaded with `fetch`, and in the browser everything is.

- The pages must be PNGs. AngelCode's BMFont exports TGA pages by default, so set its texture format to png when exporting (Options > Export options). A font with pages in any other format fails to load with `loadFont: font page "fonts/font_0.tga" is a TGA image; Jimp fonts need PNG pages.`
- Glyphs are copied onto the image as they are, so set the text color when you generate the font, and use a generator that renders plain bitmaps. Signed distance field (SDF or MSDF) fonts won't look right.
- CJK fonts have thousands of glyphs. Include only the characters you need to keep the pages small.
- Characters outside the Basic Multilingual Plane, like emoji and rare kanji, work too, as long as the font has glyphs for them.

## TrueType, OpenType and WOFF fonts

With a font from `loadTTF`, `print` draws text from the font's outlines, antialiased, at any `size`, in any `color` or gradient, and optionally outlined with `stroke`. Kerning and ligatures come from the font. It's pure JavaScript: fonts are parsed with [opentype.js](https://github.com/opentypejs/opentype.js) and drawn with [`@jimp/plugin-draw`](../plugin-draw).

`loadTTF` is in `jimp/load-ttf` (and `@jimp/plugin-print/load-ttf`), so the font parser (about 245 KB minified) is only bundled when you load fonts. In Node.js, opentype.js is only loaded the first time `loadTTF` is called.

```ts
import { HorizontalAlign, Jimp } from "jimp";
import { loadTTF } from "jimp/load-ttf";

const font = await loadTTF("fonts/Inter-Regular.ttf");
const image = new Jimp({ width: 400, height: 200, color: "white" });

image.print({ font, size: 32, x: 10, y: 10, text: "Hello world!" });

image.print({
  font,
  size: 20,
  x: 10,
  y: 60,
  maxWidth: 380,
  text: {
    text: "Long text wraps between words at maxWidth and is centered in it.",
    alignmentX: HorizontalAlign.CENTER,
  },
  color: "#1d3557",
});
```

### Loading fonts

`loadTTF` loads TrueType (`.ttf`), OpenType (`.otf`, CFF outlines) and WOFF (`.woff`) fonts.

- In Node.js it takes a path, a `file:` URL, an `http:`, `https:` or `data:` URL (loaded with `fetch`), or the font's bytes in a `Buffer`.
- In the browser it takes a URL, which is loaded with `fetch`, or the font's bytes in an `ArrayBuffer` or typed array.

Errors say what went wrong, for example `loadTTF: font file not found: "fonts/missing.ttf"`, `loadTTF: couldn't load "https://example.com/font.ttf": HTTP 404 Not Found` or `loadTTF: the data isn't a TrueType, OpenType or WOFF font (it's empty).`

WOFF2 isn't supported, because decoding it needs a Brotli decompressor, which is larger than the rest of the plugin. Convert WOFF2 fonts to WOFF or TTF first, for example with [fonttools](https://github.com/fonttools/fonttools): `fonttools ttLib.woff2 decompress font.woff2`. Font collections (`.ttc`) aren't supported either.

The font is the opentype.js `Font` in `font.opentype`, for anything else you want to do with it.

### Layout

Text is laid out the same way as with bitmap fonts (see [Layout](#layout)), including `alignmentX` and `alignmentY` in the `text` object and the `cb` callback. A word wider than `maxWidth` is broken between characters.

`size` is required for these fonts. It's the font size in pixels, like CSS's `font-size`. Each line is `lineHeight` pixels high, which defaults to the font's own line height: its ascender to its descender plus its line gap. Like CSS, the glyphs are centered vertically in the line. `letterSpacing` adds space between characters (or removes it, if it's negative), and like CSS it turns off ligatures like `fi`.

Glyphs are placed at fractional x positions, and each line's baseline is rounded to a whole pixel so horizontal edges stay sharp. Fonts aren't hinted.

Text is walked by code point, so an emoji is one character, not two. Characters the font has no glyph for are drawn with its `.notdef` glyph, usually a box. There's no font fallback, so pick a font that covers your text. Text is laid out left to right, and scripts that need complex shaping (like Arabic or Devanagari) may not come out right.

`size`, `color`, `stroke`, `strokeWidth`, `lineHeight` and `letterSpacing` only work with these fonts. With a bitmap font they throw, for example `print: size can only be used with fonts loaded with loadTTF.`, and TypeScript rejects them.

### Measuring

`measureText` and `measureTextHeight` measure text in these fonts too. Pass the `size`, and the `lineHeight` and `letterSpacing` you print with, as the last argument:

```ts
import { measureText, measureTextHeight } from "jimp";

measureText(font, "Hello world!", { size: 32 }); // the width of the widest line
measureTextHeight(font, "Hello world!", 100, { size: 32 }); // wrapped at 100px
```

### Color, gradients and outlines

`color` and `stroke` take the same colors and gradients as the [drawing methods](../plugin-draw): a hex number (`0xRRGGBBAA`), a CSS color string, `{ r, g, b, a }`, or a linear or radial gradient. CSS colors are converted to the image's colour space, and invalid ones throw (`Invalid color "notacolor"`). Gradients are in image coordinates, so one gradient can span several lines.

`stroke` outlines the glyphs `strokeWidth` pixels wide (1 by default), centered on their edges, with round corners. It's drawn over the fill. With a `stroke` and no `color` the text is only outlined.

```ts
image.print({
  font,
  size: 80,
  x: 0,
  y: 0,
  text: {
    text: "Jimp",
    alignmentX: HorizontalAlign.CENTER,
    alignmentY: VerticalAlign.MIDDLE,
  },
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

The glyphs of a `print` call are filled together with the nonzero rule, so where they overlap their edges aren't drawn twice.

### Kerning

Kerning comes from the `kern` feature of the font's `GPOS` table, or its `kern` table if it has no GPOS kerning. The GPOS kerning is read by this plugin instead of opentype.js, because opentype.js skips extension lookups, and large fonts like Inter and Noto keep their kerning in those.

### Test fonts

The fonts in `fixtures/` are small subsets of [Open Sans](https://github.com/googlefonts/opensans) and [Inter](https://github.com/rsms/inter), both under the SIL Open Font License 1.1 (see the `*-OFL.txt` files next to them). `scripts/subset-fonts.sh` makes them with fonttools.

## API

- [print](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#print)
- [loadFont](https://jimp-dev.github.io/jimp/api/jimp/functions/loadfont/)
- [measureText](https://jimp-dev.github.io/jimp/api/jimp/functions/measuretext/)
- [measureTextHeight](https://jimp-dev.github.io/jimp/api/jimp/functions/measuretextheight/)
- [loadTTF](#loading-fonts)
