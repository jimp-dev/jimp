<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/js-gif</h1>
  <p>Default Jimp gif encoder/decoder.</p>
</div>

`Jimp.read` and `getBuffer` read and write a single frame: decoding an animated GIF reads its first frame.

Use `Jimp.readFrames` and `Jimp.writeFrames` (or `Jimp.encodeFrames`) for animations:

```ts
import { Jimp } from "jimp";

const { frames, loop } = await Jimp.readFrames("animation.gif");

for (const { image } of frames) {
  image.greyscale();
}

await Jimp.writeFrames("grey.gif", frames, { loop });
```

## Reading

Each frame is the full image shown at that point of the animation, decoded the way browsers show it. Frames that only cover part of the image are drawn over the previous ones, following their disposal method: frames disposed to the background are cleared to transparent, as browsers do. If the first frame is larger than the GIF's logical screen, the image grows to fit it, like in browsers; parts of later frames outside the image are clipped.

Damaged files decode as far as they can, like in browsers: a file cut off part-way through a frame keeps the pixels decoded so far, and so does a frame with corrupt pixel data. A file that ends before any frame's pixel data throws an error.

- `delay` is how long the frame is shown, in milliseconds. GIFs store hundredths of a second, so it's a multiple of 10. Browsers show frames with a delay of 0 or 10ms for 100ms.
- `loop` is how many times the animation repeats after it first plays: 0 for forever, or `null` for a GIF without a loop count, which plays once.

Decode options, under `"image/gif"`:

- `maxResolutionInMP` (default 100): the largest image, in megapixels, that will be decoded. For `readFrames` it limits all frames together, as every frame is a full size image. Pass `maxFrames` to read only the first frames of a long animation.

## Writing

Every frame must be the same size. Each frame gets its own palette of up to 256 colors (frames with more are quantized), and is shown for its `delay`, rounded to hundredths of a second (default 100ms). Pixels with an alpha of 0 are transparent, other pixels are written as opaque.

Options for `encodeFrames` and `writeFrames`:

- `loop` (default 0): how many times the animation repeats after it first plays, from 0 to 65535. 0 repeats forever, `null` writes no loop count, so the animation plays once.

## Credits

Jimp read GIFs with [omggif](https://github.com/deanm/omggif) (MIT, © 2013 Dean McNamee) before it had its own decoder, and the encoder writes the same bytes as omggif's `GifWriter`. The decoder is tested against GIFs from libnsgif, image-rs/image-gif, giflib, Skia and Chromium, compared with how Chromium and Firefox show them: see [the conformance corpus](https://github.com/jimp-dev/jimp/tree/main/plugins/js-gif/test/corpus).
