// Renders the before and after images on the median() and bilateral() pages
// (src/content/docs/methods/median.mdx and bilateral.mdx) into
// public/denoise/. The noisy images are also the pages' playground sources.
// Run it from packages/docs after `pnpm build`:
//
//   node scripts/denoise-images.mjs
import { Jimp } from "jimp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const out = new URL("../public/denoise/", import.meta.url);
const photo = await Jimp.read(
  fileURLToPath(new URL("../public/dice-on-paper.png", import.meta.url)),
);

/** A small, repeatable pseudo-random number generator */
function random(seed) {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

/** Add grain of about `amount` levels to each channel, like sensor noise */
function addGrain(image, amount) {
  const next = random(1);
  const { data } = image.bitmap;

  for (let idx = 0; idx < data.length; idx++) {
    if ((idx & 3) !== 3) {
      const offset = (next() + next() + next() - 1.5) * 2 * amount;
      data[idx] = Math.min(255, Math.max(0, Math.round(data[idx] + offset)));
    }
  }

  return image;
}

/** Turn `share` of the pixels black or white, like dust and dead pixels */
function addSpecks(image, share) {
  const next = random(2);

  image.scan((_, __, idx) => {
    if (next() < share) {
      const value = next() < 0.5 ? 0 : 255;
      image.bitmap.data.set([value, value, value], idx);
    }
  });

  return image;
}

const grain = addGrain(photo.clone(), 10);
const specks = addSpecks(photo.clone(), 0.08);

const images = {
  "grain.png": grain,
  "grain-bilateral.png": grain.clone().bilateral(),
  "grain-gaussian.png": grain.clone().gaussian(1.5),
  "grain-median.png": grain.clone().median(1),
  "specks.png": specks,
  "specks-median.png": specks.clone().median(1),
  "specks-bilateral.png": specks.clone().bilateral(),
};

await mkdir(out, { recursive: true });

for (const [name, image] of Object.entries(images)) {
  await image.write(fileURLToPath(new URL(name, out)));
}
