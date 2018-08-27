<div align="center">
  <a href="https://intuit.github.io/Ignite/">
    <img width="200" height="200"
      src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  </a>
  <h1>@jimp/plugin-crop</h1>
  <p>Crop an image.</p>
</div>

## Crop

Crops the image at a given point to a give size

- @param {number} x the x coordinate to crop form
- @param {number} y the y coordinate to crop form
- @param w the width of the crop region
- @param h the height of the crop region
- @param {function(Error, Jimp)} cb (optional) a callback for when complete

```js
import jimp from 'jimp';

async function main() {
  const image = await jimp.read('test/image.png');

  image.crop(150, 150);
}

main();
```

## AutoCrop

AutoCrop same color borders from this image

_ @param {number} tolerance (optional): a percent value of tolerance for pixels color difference (default: 0.0002%)
_ @param {boolean} cropOnlyFrames (optional): flag to crop only real frames: all 4 sides of the image must have some border (default: true)

```js
import jimp from 'jimp';

async function main() {
  const image = await jimp.read('test/image.png');

  image.autocrop();
}

main();
```
