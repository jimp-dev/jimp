<div align="center">
  <a href="https://intuit.github.io/Ignite/">
    <img width="200" height="200"
      src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  </a>
  <h1>@jimp/plugin-resize</h1>
  <p>Resize an image.</p>
</div>

Resizes the image to a set width and height using a 2-pass bilinear algorithm/

## Usage

- @param {number} w the width to resize the image to (or Jimp.AUTO)
- @param {number} h the height to resize the image to (or Jimp.AUTO)
- @param {string} mode (optional) a scaling method (e.g. Jimp.RESIZE_BEZIER)
- @param {function(Error, Jimp)} cb (optional) a callback for when complete

```js
import jimp from 'jimp';

async function main() {
  const image = await jimp.read('test/image.png');

  image.resize(150, jimp.AUTO);
}

main();
```
