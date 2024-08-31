<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>@jimp/plugin-resize</h1>
  <p>Resize an image.</p>
</div>

Resizes the image to a set width and height using a 2-pass bilinear algorithm.

## Usage

- @param {number} w the width to resize the image to (or ResizeStrategy.AUTO)
- @param {number} h the height to resize the image to (or ResizeStrategy.AUTO)
- @param {string} mode (optional) a scaling method (e.g. ResizeStrategy.BEZIER)

```js
import jimp, { ResizeStrategy } from "jimp";

async function main() {
  // Read the image.
  const image = await jimp.read("test/image.png");

  // Resize the image to width 150 and auto height.
  await image.resize(150, ResizeStrategy.AUTO);

  // Save and overwrite the image
  await image.writeAsync("test/image.png");
}

main();
```

## Auto

`ResizeStrategy.AUTO` can be passes to either the height or width and jimp will scale the image accordingly. `ResizeStrategy.AUTO` cannot be both height and width.

```js
// resize the height to 250 and scale the width accordingly
image.resize(ResizeStrategy.AUTO, 250);
// resize the width to 250 and scale the height accordingly
image.resize(250, ResizeStrategy.AUTO);
```

### Resize modes

The default resizing algorithm uses a bilinear method.

Optionally, the following constants can be passed to choose a particular resizing algorithm:

```js
ResizeStrategy.NEAREST_NEIGHBOR;
ResizeStrategy.BILINEAR;
ResizeStrategy.BICUBIC;
ResizeStrategy.HERMITE;
ResizeStrategy.BEZIER;
```

```js
image.resize(250, 250, ResizeStrategy.BEZIER);
```

## scale

Uniformly scales the image by a factor.

- @param {number} f the factor to scale the image by
- @param {string} mode (optional) a scaling method (e.g. Jimp.RESIZE_BEZIER)
- @param {function(Error, Jimp)} cb (optional) a callback for when complete

```js
import jimp from "jimp";

async function main() {
  const image = await jimp.read("test/image.png");

  image.scale(2);
  image.scale(2, jimp.RESIZE_BEZIER);
}

main();
```

## scaleToFit

Scale the image to the largest size that fits inside the rectangle that has the given width and height.

- @param {number} w the width to resize the image to
- @param {number} h the height to resize the image to
- @param {string} mode (optional) a scaling method (e.g. Jimp.RESIZE_BEZIER)
- @param {function(Error, Jimp)} cb (optional) a callback for when complete

```js
import jimp from "jimp";

async function main() {
  const image = await jimp.read("test/image.png");

  image.scaleToFit(100, 100);
}

main();
```
