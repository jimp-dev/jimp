/**
 * Generates the multi-frame test images:
 *
 * - images/animated-disposal.gif, an 8x8 GIF whose frames use every disposal
 *   method, written with omggif
 * - images/multipage.tiff, a big endian TIFF with three pages of different
 *   sizes and color types, written with utif2
 *
 * They're written with the libraries rather than jimp's encoders, so the
 * decoders are tested against files jimp didn't make.
 *
 * Run from the repo root: node packages/test-utils/scripts/generate-multi-frame-images.mjs
 */

import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const images = path.join(root, "packages/test-utils/images");
const GIF = createRequire(path.join(root, "plugins/js-gif/package.json"))(
  "omggif",
);
const UTIF = createRequire(path.join(root, "plugins/js-tiff/package.json"))(
  "utif2",
);

function writeAnimatedGif() {
  const TRANSPARENT = 0;
  const RED = 1;
  const GREEN = 2;
  const BLUE = 3;
  const WHITE = 4;
  const palette = [
    0x000000, 0xff0000, 0x00ff00, 0x0000ff, 0xffffff, 0x000000, 0x000000,
    0x000000,
  ];
  const buffer = new Uint8Array(4096);
  const writer = new GIF.GifWriter(buffer, 8, 8, { palette, loop: 3 });

  // 1. Red over the whole image, kept (disposal 1)
  writer.addFrame(0, 0, 8, 8, new Array(64).fill(RED), {
    delay: 10,
    disposal: 1,
  });
  // 2. A green square, cleared to the background afterwards (disposal 2)
  writer.addFrame(2, 2, 4, 4, new Array(16).fill(GREEN), {
    delay: 20,
    disposal: 2,
  });
  // 3. Blue in the corner with a transparent pixel, restored to the
  //    previous state afterwards (disposal 3)
  writer.addFrame(0, 0, 2, 2, [BLUE, BLUE, BLUE, TRANSPARENT], {
    delay: 30,
    disposal: 3,
    transparent: TRANSPARENT,
  });
  // 4. White in the other corner, no disposal specified (disposal 0)
  writer.addFrame(6, 6, 2, 2, new Array(4).fill(WHITE), {
    delay: 0,
    disposal: 0,
  });

  writeFileSync(
    path.join(images, "animated-disposal.gif"),
    buffer.subarray(0, writer.end()),
  );
}

function writeMultipageTiff() {
  const pages = [
    // 2x2 RGBA: red, green, blue and half transparent white
    {
      width: 2,
      height: 2,
      photometric: 2,
      bits: [8, 8, 8, 8],
      extra: [2],
      data: [
        255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 128,
      ],
    },
    // 3x1 RGB
    {
      width: 3,
      height: 1,
      photometric: 2,
      bits: [8, 8, 8],
      data: [10, 20, 30, 40, 50, 60, 70, 80, 90],
    },
    // 1x2 greyscale
    { width: 1, height: 2, photometric: 1, bits: [8], data: [0, 200] },
  ];

  const ifdsFor = (offsets) =>
    pages.map((page, i) => ({
      t254: [2],
      t256: [page.width],
      t257: [page.height],
      t258: page.bits,
      t259: [1],
      t262: [page.photometric],
      t273: [offsets[i]],
      t277: [page.bits.length],
      t278: [page.height],
      t279: [page.data.length],
      t284: [1],
      t297: [i, pages.length],
      ...(page.extra ? { t338: page.extra } : {}),
    }));

  // The IFDs are the same size whatever the offsets are
  const headerLength = UTIF.encode(ifdsFor(pages.map(() => 0))).byteLength;
  const offsets = [];
  let offset = headerLength;

  for (const page of pages) {
    offsets.push(offset);
    offset += page.data.length;
  }

  const header = new Uint8Array(UTIF.encode(ifdsFor(offsets)));
  const tiff = new Uint8Array(offset);

  tiff.set(header);
  pages.forEach((page, i) => tiff.set(page.data, offsets[i]));

  writeFileSync(path.join(images, "multipage.tiff"), tiff);
}

writeAnimatedGif();
writeMultipageTiff();
