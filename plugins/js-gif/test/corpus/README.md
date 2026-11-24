# GIF conformance corpus

GIFs that `src/corpus.node.test.ts` decodes and compares with how browsers show them. `reference.json` records what Chromium, Firefox and ImageMagick decode for each file, so the tests don't need them.

## Sources

| Folder          | Files | From                                                                                                                                                                      | License                                                                                  |
| --------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `libnsgif`      |    72 | [libnsgif](https://github.com/netsurf-browser/libnsgif) `test/data` at `b9e3b0aa`: edge cases, each described in its `.meta` file there                                   | MIT, [LICENSE](libnsgif/LICENSE)                                                         |
| `libnsgif-afl`  |   281 | libnsgif `test/ns-afl-gif` at `b9e3b0aa`: files found by fuzzing it with AFL, renamed `afl-NNN.gif` in the order of their original names                                  | MIT, [LICENSE](libnsgif-afl/LICENSE)                                                     |
| `image-gif`     |    18 | [image-rs/image-gif](https://github.com/image-rs/image-gif) `tests/{samples,regression,crashtest,stall}` at `a5f89ddc`                                                     | MIT or Apache-2.0, [LICENSE-MIT](image-gif/LICENSE-MIT), [LICENSE-APACHE](image-gif/LICENSE-APACHE) |
| `giflib`        |     9 | [giflib](https://sourceforge.net/projects/giflib/) `pic` and `tests` at `a8e3114a`                                                                                        | MIT, [LICENSE](giflib/LICENSE)                                                           |
| `skia`          |    13 | [Skia](https://skia.googlesource.com/skia) `resources/images`, the GIFs used by its codec tests                                                                           | BSD-3-Clause, [LICENSE](skia/LICENSE)                                                    |
| `chromium`      |     9 | [Chromium](https://chromium.googlesource.com/chromium/src) `third_party/blink/web_tests/images/resources`                                                                 | BSD-3-Clause, [LICENSE](chromium/LICENSE)                                                |
| `synthetic`     |    40 | Written by `scripts/generate-synthetic-corpus.mjs` for cases the others don't cover: LZW minimum code sizes 1 to 11, deferred clear codes, truncation, loop counts, etc.  | MIT, like Jimp                                                                           |

image-gif's two largest samples, Skia's `flightAnim.gif` and giflib's documentation images (whose license isn't stated) were left out.

## The reference

`scripts/generate-corpus-reference.mjs` decodes every file with:

- Chromium 159 and Firefox 159, with WebCodecs' `ImageDecoder`, which gives the composited image the browser shows at each frame, with its delay and the loop count.
- Chromium's `<img>`, for the first frame. Chromium's `ImageDecoder` fails frames with corrupt or cut-off data that `<img>` still shows.
- ImageMagick 7.1.2 with `-coalesce`, to note where it disagrees with browsers.

Pixels are stored as hashes of each frame's RGBA data, with the color of transparent pixels zeroed.

A file passes if the decoder gives exactly what Chromium shows: the same size, frames, pixels, delays and loop count. Where Chromium fails a frame, the frame can match Chromium's `<img>` or Firefox. A file that matches Firefox exactly also passes.

## Results

The 161 files outside `libnsgif-afl` all pass, apart from these, where the browsers disagree with each other or show something odd. The decoder's output for them is recorded in the test, so changes still show:

- `image-gif/issue-117-out-of-range.gif`: an LZW minimum code size of 0, which isn't valid, so nothing is drawn. Chromium draws two pixels of a color that isn't in the palette, Firefox shows a different size.
- `libnsgif/frame-clipped-lzw.gif`: frames that end early or have an invalid LZW code. Chromium draws the last frame over the first, skipping the incomplete frames between them. Firefox fails two of the frames. Each frame draws over the one before.
- `libnsgif/lzw-no-eoi.gif`: frames without an end of information code. Chromium fails the second and third frames. Firefox draws neither of them, and clears a row outside them. The decoder gives libnsgif's expected output.
- `synthetic/lzw-min-code-size-1.gif`: an LZW minimum code size of 1, below the 2 the specification asks for. Chromium fails it, and Firefox grows the code size later than the encoder did. The decoder matches ImageMagick.
- `synthetic/truncated-interlaced.gif`: an interlaced frame cut off in its last pass. Browsers fill the rows they haven't decoded from the rows above them, each differently. Those rows stay as they were.

Wherever Chromium and Firefox agree exactly (113 files) the decoder matches them.

The `libnsgif-afl` files only have to decode or throw an `Error`. Chromium and Firefox don't agree on any of them. The decoder matches one of them exactly on 193 of the 281. Most of the rest are files with an LZW minimum code size above 8 or a palette index without a color: Chromium stops at such a frame and draws missing colors black, while Firefox carries on and wraps indexes around the palette. The decoder carries on like Firefox and draws black like Chromium.

## Where browsers and ImageMagick disagree

ImageMagick gives the same pixels as Chromium for 101 of the 122 files that Chromium decodes completely. The decoder follows the browsers:

- ImageMagick fills the parts of the image no frame has covered yet with the background color. Browsers leave them transparent.
- Browsers grow the image to fit the first frame when it's larger than the logical screen. ImageMagick keeps the logical screen size.
- Browsers treat disposal method 4 as restoring the previous image, like 3. ImageMagick doesn't, and restores some frames differently.
- ImageMagick keeps a graphic control extension's delay for the frames after it. Browsers only apply it to the next image.
- ImageMagick rejects frames outside the logical screen, palette indexes without a color, and files without a palette, which browsers show.

## Updating

```sh
# Write test/corpus/synthetic
node scripts/generate-synthetic-corpus.mjs
# Needs the Playwright browsers (npx playwright install chromium firefox in
# packages/config-vitest) and ImageMagick 7
node scripts/generate-corpus-reference.mjs
```
