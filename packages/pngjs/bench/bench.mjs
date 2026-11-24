/* global console, process */
// Compares decode and encode speed and size with pngjs 7.0.0, on real images
// from this repo. Run `pnpm build` first, then `pnpm bench`.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import * as browser from "../dist/browser/index.js";
import * as node from "../dist/esm/index.js";

const require = createRequire(import.meta.url);
const upstream = require("pngjs");
const upstreamBrowser = require("pngjs/browser.js");
const root = new URL("../../../", import.meta.url);

const images = {
  "photo 555x680 RGBA": readFileSync(new URL("images/GIgFDCFbAAA0zlg.png", root)),
  "dice 800x600 RGBA": readFileSync(new URL("packages/docs/public/dice.png", root)),
  "font atlas 4093x146": readFileSync(
    new URL(
      "packages/docs/public/fonts/open-sans/open-sans-64-white/open-sans-64-white.png",
      root,
    ),
  ),
};

// A bigger image: the photo tiled 4x4
{
  const photo = node.decode(images["photo 555x680 RGBA"]);
  const width = photo.width * 4;
  const height = photo.height * 4;
  const data = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let tile = 0; tile < 4; tile++) {
      const start = (y % photo.height) * photo.width * 4;

      data.set(
        photo.data.subarray(start, start + photo.width * 4),
        (y * width + tile * photo.width) * 4,
      );
    }
  }

  images[`photo tiled ${width}x${height} RGBA`] = Buffer.from(
    node.encode({ width, height, data }, { colorType: 6 }),
  );
}

function time(fn) {
  const runs = [];
  let result;

  result = fn();

  for (let i = 0; i < 7; i++) {
    const start = performance.now();

    result = fn();
    runs.push(performance.now() - start);
  }

  runs.sort((a, b) => a - b);

  return { ms: runs[3], result };
}

const format = (ms) => `${ms.toFixed(1)} ms`;
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const rows = [];

for (const [name, file] of Object.entries(images)) {
  const decoded = upstream.PNG.sync.read(file);
  const image = { width: decoded.width, height: decoded.height, data: decoded.data };
  // pngjs adds its defaults to the options object, so make a new one each time
  const settings = () => ({ deflateLevel: 9, deflateStrategy: 3 });

  const decodeUp = time(() => upstream.PNG.sync.read(file));
  const decodeOurs = time(() => node.decode(file));
  const decodeUpBrowser = time(() => upstreamBrowser.PNG.sync.read(file));
  const decodeOursBrowser = time(() => browser.decode(file));
  const encodeUp = time(() => upstream.PNG.sync.write(image, settings()));
  const encodeOursLegacy = time(() => node.PNG.sync.write(image, settings()));
  const encodeOursAuto = time(() => node.encode(image, settings()));
  const encodeUpBrowser = time(() => upstreamBrowser.PNG.sync.write(image, settings()));
  const encodeOursBrowser = time(() => browser.PNG.sync.write(image, settings()));

  rows.push({
    image: name,
    "decode pngjs": format(decodeUp.ms),
    "decode ours": format(decodeOurs.ms),
    "decode pngjs (browser)": format(decodeUpBrowser.ms),
    "decode ours (browser)": format(decodeOursBrowser.ms),
    "encode pngjs": `${format(encodeUp.ms)}, ${kb(encodeUp.result.length)}`,
    "encode ours, same settings": `${format(encodeOursLegacy.ms)}, ${kb(encodeOursLegacy.result.length)}`,
    "encode() auto": `${format(encodeOursAuto.ms)}, ${kb(encodeOursAuto.result.length)}`,
    "encode pngjs (browser)": format(encodeUpBrowser.ms),
    "encode ours (browser)": format(encodeOursBrowser.ms),
  });
}

if (process.argv.includes("--markdown")) {
  const keys = Object.keys(rows[0]);

  console.log(`| ${keys.join(" | ")} |`);
  console.log(`| ${keys.map(() => "---").join(" | ")} |`);

  for (const row of rows) {
    console.log(`| ${keys.map((key) => row[key]).join(" | ")} |`);
  }
} else {
  console.table(rows);
}
