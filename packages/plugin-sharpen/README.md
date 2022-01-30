<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>@jimp/plugin-sharpen</h1>
  <p>Sharpen an image.</p>
</div>

Sharpen an image.

## Usage

- @param {number} (optional) the sharpen factor, default 3, max 10
- @param {function(Error, Jimp)} cb (optional) a callback for when complete

```js
import jimp from 'jimp';

async function main() {
  const image = await jimp.read('test/image.png');

  image.sharpen();
}

main();
```
