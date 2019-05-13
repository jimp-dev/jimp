<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>@jimp/plugin-blur</h1>
  <p>Blur an image.</p>
</div>

A fast blur algorithm that produces similar effect to a Gaussian blur - but MUCH quicker

## Usage

- @param {number} r the pixel radius of the blur
- @param {Object} dim (optional) the object containing the dimensions of the blur area
  - @param {number} dim.x the top left x coordinate of the blur area
  - @param {number} dim.y the top left y coordinate of the blur area
  - @param {number} dim.w the width of the blur area
  - @param {number} dim.h the height of the blur area
- @param {function(Error, Jimp)} cb (optional) a callback for when complete

```js
import jimp from 'jimp';

async function main() {
  const image = await jimp.read('test/image.png');

  image.blur(5);

  // or

  image.blur(5, { x: 30, y: 45, w: 100, h: 75 });
}

main();
```
