<div align="center">
  <a href="https://intuit.github.io/Ignite/">
    <img width="200" height="200"
      src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  </a>
  <h1>@jimp/plugin-color</h1>
  <p>Jimp color methods.</p>
</div>

Bitmap manipulation to adjust the color in an image.

## color

Apply multiple color modification rules

- @param {array} actions list of color modification rules, in following format: { apply: '<rule-name>', params: [ <rule-parameters> ] }
- @param {function(Error, Jimp)} cb (optional) a callback for when complete

```js
import jimp from 'jimp';

async function main() {
  const image = await jimp.read('test/image.png');

  image.color([{ apply: 'red', params: [100] }]);
}

main();
```

## brightness

Adjusts the brightness of the image

- @param {number} val the amount to adjust the brightness, a number between -1 and +1
- @param {function(Error, Jimp)} cb (optional) a callback for when complete

```js
import jimp from 'jimp';

async function main() {
  const image = await jimp.read('test/image.png');

  image.brightness(20);
}

main();
```

## contrast

Adjusts the contrast of the image

- @param {number} val the amount to adjust the contrast, a number between -1 and +1
- @param {function(Error, Jimp)} cb (optional) a callback for when complete

```js
import jimp from 'jimp';

async function main() {
  const image = await jimp.read('test/image.png');

  image.contrast(70);
}

main();
```

## posterize

Apply a posterize effect

- @param {number} n the amount to adjust the contrast, minimum threshold is two
- @param {function(Error, Jimp)} cb (optional) a callback for when complete

```js
import jimp from 'jimp';

async function main() {
  const image = await jimp.read('test/image.png');

  image.posterize(5);
}

main();
```

## opacity

Multiplies the opacity of each pixel by a factor between 0 and 1

- @param {number} f A number, the factor by which to multiply the opacity of each pixel
- @param {function(Error, Jimp)} cb (optional) a callback for when complete

```js
import jimp from 'jimp';

async function main() {
  const image = await jimp.read('test/image.png');

  image.opacity(80);
}

main();
```

## sepia

Applies a sepia tone to the image

- @param {function(Error, Jimp)} cb (optional) a callback for when complete

```js
import jimp from 'jimp';

async function main() {
  const image = await jimp.read('test/image.png');

  image.sepia();
}

main();
```

## fade

Fades each pixel by a factor between 0 and 1

- @param {number} f A number from 0 to 1. 0 will haven no effect. 1 will turn the image completely transparent.
- @param {function(Error, Jimp)} cb (optional) a callback for when complete

```js
import jimp from 'jimp';

async function main() {
  const image = await jimp.read('test/image.png');

  image.fade(0.7);
}

main();
```

## convolution

Adds each element of the image to its local neighbors, weighted by the kernel

- @param {array} kernel a matrix to weight the neighbors sum
- @param {string} edgeHandling (optional) define how to sum pixels from outside the border
- @param {function(Error, Jimp)} cb (optional) a callback for when complete

```js
import jimp from 'jimp';

async function main() {
  const image = await jimp.read('test/image.png');

  // make me better
  image.convolution(weights);
}

main();
```

## opaque

Set the alpha channel on every pixel to fully opaque

- @param {function(Error, Jimp)} cb (optional) a callback for when complete

```js
import jimp from 'jimp';

async function main() {
  const image = await jimp.read('test/image.png');

  image.opaque();
}

main();
```

## pixelate

Pixelates the image or a region

- @param {number} size the size of the pixels
- @param {number} x (optional) the x position of the region to pixelate
- @param {number} y (optional) the y position of the region to pixelate
- @param {number} w (optional) the width of the region to pixelate
- @param {number} h (optional) the height of the region to pixelate
- @param {function(Error, Jimp)} cb (optional) a callback for when complete

```js
import jimp from 'jimp';

async function main() {
  const image = await jimp.read('test/image.png');

  image.pixelate(10);
}

main();
```

## convolute

Applies a convolution kernel to the image or a region

- @param {array} kernel the convolution kernel
- @param {number} x (optional) the x position of the region to apply convolution to
- @param {number} y (optional) the y position of the region to apply convolution to
- @param {number} w (optional) the width of the region to apply convolution to
- @param {number} h (optional) the height of the region to apply convolution to
- @param {function(Error, Jimp)} cb (optional) a callback for when complete

```js
import jimp from 'jimp';

async function main() {
  const image = await jimp.read('test/image.png');

  // make me better
  image.pixelate(kernal);
}

main();
```
