<div align="center">
  <a href="https://intuit.github.io/Ignite/">
    <img width="200" height="200"
      src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  </a>
  <h1>@jimp/plugin-print</h1>
  <p>Print text on an image.</p>
</div>

Functions to load fonts and print text on an images.

## Included Fonts

- FONT_SANS_8_BLACK
- FONT_SANS_10_BLACK
- FONT_SANS_12_BLACK
- FONT_SANS_14_BLACK
- FONT_SANS_16_BLACK
- FONT_SANS_32_BLACK
- FONT_SANS_64_BLACK
- FONT_SANS_128_BLACK
- FONT_SANS_8_WHITE
- FONT_SANS_16_WHITE
- FONT_SANS_32_WHITE
- FONT_SANS_64_WHITE
- FONT_SANS_128_WHITE

## loadFont

Loads a bitmap font from a file

- @param {string} file the file path of a .fnt file
- @param {function(Error, Jimp)} cb (optional) a function to call when the font is loaded
- @returns {Promise} a promise

```js
import jimp from 'jimp';

async function main() {
  const font = await jimp.read(jimp.FONT_SANS_32_BLACK);
}

main();
```

## print

Draws a text on a image on a given boundary

_ @param {Jimp} font a bitmap font loaded from `Jimp.loadFont` command
_ @param {number} x the x position to start drawing the text
_ @param {number} y the y position to start drawing the text
_ @param {string} text the text to draw (string or object with `text`, `alignmentX`, and/or `alignmentY`)
_ @param {number} maxWidth (optional) the boundary width to draw in
_ @param {number} maxHeight (optional) the boundary height to draw in \* @param {function(Error, Jimp)} cb (optional) a function to call when the text is written

```js
import jimp from 'jimp';

async function main() {
  const font = await jimp.read(jimp.FONT_SANS_32_BLACK);
  const image = await jimp.read(1000, 1000, 0x0000ffff);

  image.print(font, 10, 10, 'Hello World!');
}

main();
```

## measureText

Measure how wide a piece of text will be.

```js
import jimp from 'jimp';

async function main() {
  const font = await jimp.read(jimp.FONT_SANS_32_BLACK);
  const image = await jimp.read(1000, 1000, 0x0000ffff);

  image.measureText(font, 'Hello World!');
}

main();
```

## measureTextHeight

Measure how tall a piece of text will be.

```js
import jimp from 'jimp';

async function main() {
  const font = await jimp.read(jimp.FONT_SANS_32_BLACK);
  const image = await jimp.read(1000, 1000, 0x0000ffff);

  image.measureTextHeight(font, 'Hello World!', 100);
}

main();
```
