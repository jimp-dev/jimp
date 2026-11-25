// Makes the LUTs and before/after images for the colorGrade() page
// (src/content/docs/methods/color-grade.mdx) and its playground op, in
// public/lut/.
// The looks are defined here, so there are no third-party LUT files. Run it
// from packages/docs after `pnpm build`:
//
//   node scripts/lut-images.mjs
import { Jimp, parseCubeLut } from "jimp";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const out = new URL("../public/lut/", import.meta.url);
const path = (name) => fileURLToPath(new URL(name, out));

const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const smoothstep = (x) => x * x * (3 - 2 * x);
const mix = (a, b, t) => a + (b - a) * t;

/** Each look maps red, green and blue from 0 to 1 to new ones */
const looks = {
  /** More contrast, teal shadows and orange highlights */
  "teal-orange"(r, g, b) {
    const y = luma(r, g, b);
    const saturation = 1.5 - 0.9 * y;
    const curve = (x) => mix(x, smoothstep(x), 0.6);
    const graded = (x) => curve(y + (x - y) * saturation);
    const warmth = y - 0.5;

    return [
      graded(r) + 0.14 * warmth,
      graded(g) + 0.03 * warmth,
      graded(b) - 0.16 * warmth,
    ];
  },
  /** Lifted blacks, softer whites, muted and warm, like an old print */
  "faded-film"(r, g, b) {
    const y = luma(r, g, b);
    const fade = (x) => 0.1 + 0.8 * mix(x, smoothstep(x), 0.3);
    const muted = (x) => y + (x - y) * 0.7;

    return [
      fade(muted(r)) + 0.04,
      fade(muted(g)) + 0.01,
      fade(muted(b)) - 0.04,
    ];
  },
  /** Bleach bypass: half the color, hard contrast and a cool cast */
  "bleach-bypass"(r, g, b) {
    const y = luma(r, g, b);
    const contrast = (x) => mix(x, smoothstep(smoothstep(x)), 0.7);
    const silver = (x) => contrast(mix(x, y, 0.55));

    return [silver(r) - 0.02, silver(g), silver(b) + 0.03];
  },
};

const clamp = (x) => Math.min(1, Math.max(0, x));

/** A Hald CLUT image of a look */
function hald(look, level) {
  const points = level * level;
  const image = new Jimp({ width: level ** 3, height: level ** 3 });

  for (let i = 0; i < points ** 3; i++) {
    const rgb = look(
      (i % points) / (points - 1),
      (Math.floor(i / points) % points) / (points - 1),
      Math.floor(i / points ** 2) / (points - 1),
    );

    rgb.forEach((value, c) => {
      image.bitmap.data[i * 4 + c] = Math.round(clamp(value) * 255);
    });
    image.bitmap.data[i * 4 + 3] = 255;
  }

  return image;
}

/** A .cube file of a look */
function cube(name, look, size) {
  const lines = [`TITLE "${name}"`, `LUT_3D_SIZE ${size}`];

  for (let b = 0; b < size; b++) {
    for (let g = 0; g < size; g++) {
      for (let r = 0; r < size; r++) {
        const rgb = look(r / (size - 1), g / (size - 1), b / (size - 1));

        lines.push(rgb.map((value) => clamp(value).toFixed(4)).join(" "));
      }
    }
  }

  return `${lines.join("\n")}\n`;
}

await mkdir(out, { recursive: true });

const photo = await Jimp.read(
  fileURLToPath(new URL("../public/dice-on-paper.png", import.meta.url)),
);

for (const [name, look] of Object.entries(looks)) {
  // Level 6: 216 × 216 pixels, 36 points per axis
  const image = hald(look, 6);

  await image.write(path(`${name}.png`));
  await photo
    .clone()
    .colorGrade(image)
    .write(path(`dice-${name}.jpg`), {
      quality: 85,
    });
}

// One .cube file, for the parseCubeLut example
const text = cube("Teal and orange", looks["teal-orange"], 17);

await writeFile(path("teal-orange.cube"), text);
await photo
  .clone()
  .colorGrade(parseCubeLut(text), { strength: 0.5 })
  .write(path("dice-teal-orange-half.jpg"), { quality: 85 });
await photo.clone().write(path("dice.jpg"), { quality: 85 });
