/**
 * Generates the multi-frame test images:
 *
 * - images/multipage.tiff, a big endian TIFF with three pages of different
 *   sizes and color types, written with utif2
 *
 * It's written with a library rather than jimp's encoder, so the decoder is
 * tested against a file jimp didn't make.
 *
 * images/animated-disposal.gif, an 8x8 GIF whose frames use every disposal
 * method, was written the same way with omggif's GifWriter. Jimp no longer
 * depends on omggif, so it's kept as it is: red over the whole image (kept),
 * a green square at 2,2 (disposed to the background), blue in the corner
 * with a transparent pixel (restored to the previous image) and white in the
 * other corner, shown for 100ms, 200ms, 300ms and 0ms, looping 3 times.
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
const UTIF = createRequire(path.join(root, "plugins/js-tiff/package.json"))(
  "utif2",
);

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

writeMultipageTiff();
