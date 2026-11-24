<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>@jimp/js-tiff</h1>
  <p>Default Jimp tiff encoder/decoder.</p>
</div>

`Jimp.read` and `getBuffer` read and write a single page: decoding a multi-page TIFF reads its first page.

Use `Jimp.readFrames` and `Jimp.writeFrames` (or `Jimp.encodeFrames`) for every page:

```ts
import { Jimp } from "jimp";

const { frames } = await Jimp.readFrames("scan.tiff");

for (const { image } of frames) {
  image.rotate(90);
}

await Jimp.writeFrames("rotated.tiff", frames);
```

Pages keep their own sizes, and are written as uncompressed RGBA.

Decode options, under `"image/tiff"`:

- `maxResolutionInMP` (default 100): the largest image, in megapixels, that will be decoded. For `readFrames` it limits all pages together. Pass `maxFrames` to read only the first pages.
