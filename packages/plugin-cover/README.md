<div align="center">
  <a href="https://intuit.github.io/Ignite/">
    <img width="200" height="200"
      src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  </a>
  <h1>@jimp/plugin-cover</h1>
</div>

Scale the image so the given width and height keeping the aspect ratio. Some parts of the image may be clipped.

## Usage

- @param {number} w the width to resize the image to
- @param {number} h the height to resize the image to
- @param {number} alignBits (optional) A bitmask for horizontal and vertical alignment
- @param {string} mode (optional) a scaling method (e.g. Jimp.RESIZE_BEZIER)
- @param {function(Error, Jimp)} cb (optional) a callback for when complete

```js
import jimp from 'jimp';

async function main() {
  const image = await jimp.read('test/image.png');

  image.cover(150, 100);
}

main();
```
