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

## Custom fonts

Fonts are bitmap fonts in the [BMFont](https://www.angelcode.com/products/bmfont/) format: a `.fnt` file and the `.png` pages it points to. A bitmap font only has glyphs for the characters it was generated with. The bundled fonts only cover printable ASCII.

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

- Glyphs are copied onto the image as they are, so set the text color when you generate the font, and use a generator that renders plain bitmaps. Signed distance field (SDF or MSDF) fonts won't look right.
- CJK fonts have thousands of glyphs. Include only the characters you need to keep the pages small.
- Characters outside the Basic Multilingual Plane, like emoji and rare kanji, work too, as long as the font has glyphs for them.

- [print](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#print)
- [loadFont](https://jimp-dev.github.io/jimp/api/jimp/functions/loadfont/)
