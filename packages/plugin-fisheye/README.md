<div align="center">
  <a href="https://intuit.github.io/Ignite/">
    <img width="200" height="200"
      src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  </a>
  <h1>@jimp/plugin-fishey</h1>
  <p>Apply a fisheye effect to an image</p>
</div>

## Usage

- @param {function(Error, Jimp)} options (optional) radius, x, y
- @param {function(Error, Jimp)} cb (optional) a callback for when complete

```js
import jimp from 'jimp';

async function main() {
  const image = await jimp.read('test/image.png');

  image.fisheye();
  // or
  image.fisheye({ r: 1.6 });
}

main();
```

Produces nice images with [@jimp/plugin-circle](../plugin-circle).
