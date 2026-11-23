<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>@jimp/plugin-print</h1>
  <p>Print text onto an image.</p>
</div>

Load a font with `loadFont`. The bundled fonts are named exports of `jimp/fonts`:

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

To print them, generate a font that includes them. For example, with [fontbm](https://github.com/vladimirgamalyan/fontbm) and [Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP):

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

- Glyphs are copied onto the image as they are, so set the text color when you generate the font, and use a generator that renders plain bitmaps. Signed distance field (SDF or MSDF) fonts won't look right.
- CJK fonts have thousands of glyphs. Include only the characters you need to keep the pages small.
- Characters outside the Basic Multilingual Plane, like emoji and rare kanji, work too, as long as the font has glyphs for them.

- [print](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#print)
- [loadFont](https://jimp-dev.github.io/jimp/api/jimp/functions/loadfont/)
