// Renders public/gradients/banding.png: the Open Graph guide's background
// gradient, with and without `dither` and `grain`, saved as PNG, JPEG and
// WebP. Each strip is shown as it is and with its contrast turned up, so the
// bands are easy to see. Run it from packages/docs after `pnpm build`:
//
//   node scripts/gradient-banding-images.mjs
import { createJimp } from "@jimp/core";
import { render } from "@jimp/layout";
import webp from "@jimp/wasm-webp";
import { defaultFormats, defaultPlugins } from "jimp";
import { loadTTF } from "jimp/load-ttf";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const Jimp = createJimp({
  formats: [...defaultFormats, webp],
  plugins: defaultPlugins,
});
const fonts = new URL("../../layout/fixtures/", import.meta.url);
const out = new URL("../public/gradients/", import.meta.url);
const font = await loadTTF(new URL("Inter-Regular.otf", fonts));
const bold = await loadTTF(new URL("Inter-Bold.otf", fonts));

const stops = ["#1b1840", "#3a2d7a"];
const card = (dither) =>
  render(
    {
      type: "box",
      background: { type: "linear", angle: 135, stops, dither },
    },
    { Jimp, width: 1200, height: 630 },
  );

const rows = [
  { label: "PNG", dither: false, mime: "image/png" },
  { label: "PNG, dither: true", dither: true, mime: "image/png" },
  { label: "JPEG 85", dither: false, mime: "image/jpeg" },
  { label: "JPEG 85, grain 0.01", grain: { amount: 0.01 }, mime: "image/jpeg" },
  { label: "WebP 80", dither: false, mime: "image/webp" },
  {
    label: "WebP 95, color grain 0.012",
    grain: { amount: 0.012, monochrome: false },
    mime: "image/webp",
    q: 95,
  },
];

const STRIP_W = 520;
const STRIP_H = 110;
const LABEL_W = 300;
const GAP = 16;
// How much the contrast is turned up in the right-hand column
const BOOST = 6;

const sheet = new Jimp({
  width: LABEL_W + (STRIP_W + GAP) * 2 + GAP,
  height: 56 + rows.length * (STRIP_H + GAP) + GAP,
  color: 0xffffffff,
});

sheet.print({
  font: bold,
  size: 22,
  x: LABEL_W,
  y: 18,
  text: "As it is",
});
sheet.print({
  font: bold,
  size: 22,
  x: LABEL_W + STRIP_W + GAP,
  y: 18,
  text: `Contrast x ${BOOST}`,
});

for (const [i, row] of rows.entries()) {
  let image = await card(row.dither);

  if (row.grain) {
    image.grain(row.grain);
  }

  const quality = row.q ?? (row.mime === "image/webp" ? 80 : 85);
  const bytes = await image.getBuffer(
    row.mime,
    row.mime === "image/png" ? {} : { quality },
  );
  const decoded = await Jimp.fromBuffer(bytes);
  // Part of the middle of the card, where it's widest
  const strip = decoded.crop({ x: 340, y: 260, w: STRIP_W, h: STRIP_H });
  const boosted = strip.clone();
  const lows = [0x1b, 0x18, 0x40];

  boosted.scan((_, __, idx) => {
    for (let c = 0; c < 3; c++) {
      const value = boosted.bitmap.data[idx + c] - lows[c];
      boosted.bitmap.data[idx + c] = Math.max(
        0,
        Math.min(255, 40 + value * BOOST),
      );
    }
  });

  const y = 56 + i * (STRIP_H + GAP);

  sheet.composite(strip, LABEL_W, y);
  sheet.composite(boosted, LABEL_W + STRIP_W + GAP, y);
  sheet.print({ font: bold, size: 18, x: GAP, y: y + 30, text: row.label });
  sheet.print({
    font,
    size: 16,
    x: GAP,
    y: y + 58,
    text: `${Math.round(bytes.length / 1024)} KB at 1200 x 630`,
  });
}

await mkdir(out, { recursive: true });
await sheet.write(fileURLToPath(new URL("banding.png", out)));
