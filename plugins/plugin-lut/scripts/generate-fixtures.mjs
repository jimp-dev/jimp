// Makes the test fixtures in src/fixtures/. Every LUT here is made by this
// script, so there are no third-party LUT files.
//
// The reference outputs are made by FFmpeg's lut3d and haldclut filters with
// tetrahedral interpolation, so the tests compare @jimp/plugin-lut with
// another implementation. Run it from plugins/plugin-lut after `pnpm build`,
// with ffmpeg on the PATH:
//
//   node scripts/generate-fixtures.mjs
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { createJimp } from "@jimp/core";
import png from "@jimp/js-png";

const Jimp = createJimp({ formats: [png] });
const fixture = (name) =>
  fileURLToPath(new URL(`../src/fixtures/${name}`, import.meta.url));

/**
 * A teal and orange look: more contrast, cool shadows, warm highlights, and
 * more saturated shadows than highlights. The saturation change makes each
 * output depend on all three inputs, which trilinear and tetrahedral
 * interpolation treat differently.
 */
function tealOrange(r, g, b) {
  const curve = (x) => 0.35 * x + 0.65 * x * x * (3 - 2 * x);
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const saturation = 1.8 - 1.4 * luma;
  const warmth = luma - 0.5;
  const graded = (x) => curve(luma + (x - luma) * saturation);

  return [
    graded(r) + 0.12 * warmth,
    graded(g) + 0.03 * warmth,
    graded(b) - 0.14 * warmth,
  ];
}

function cube({ title, size, look, header = [] }) {
  const lines = [
    "# Made by plugins/plugin-lut/scripts/generate-fixtures.mjs",
    `TITLE "${title}"`,
    ...header,
    `LUT_3D_SIZE ${size}`,
    "",
  ];

  for (let b = 0; b < size; b++) {
    for (let g = 0; g < size; g++) {
      for (let r = 0; r < size; r++) {
        const rgb = look(r / (size - 1), g / (size - 1), b / (size - 1));

        lines.push(rgb.map((value) => value.toFixed(6)).join(" "));
      }
    }
  }

  return `${lines.join("\n")}\n`;
}

writeFileSync(
  fixture("identity.cube"),
  cube({ title: "Identity", size: 2, look: (r, g, b) => [r, g, b] }),
);

writeFileSync(
  fixture("teal-orange.cube"),
  cube({
    title: "Teal and orange",
    size: 5,
    look: tealOrange,
    header: ["DOMAIN_MIN 0 0 0", "DOMAIN_MAX 1 1 1"],
  }),
);

// A level 4 Hald CLUT of the same look: 64 × 64 pixels, 16 points per axis
const level = 4;
const points = level * level;
const hald = new Jimp({ width: level ** 3, height: level ** 3 });

for (let i = 0; i < points ** 3; i++) {
  const rgb = tealOrange(
    (i % points) / (points - 1),
    (Math.floor(i / points) % points) / (points - 1),
    Math.floor(i / points ** 2) / (points - 1),
  );

  rgb.forEach((value, c) => {
    hald.bitmap.data[i * 4 + c] = Math.round(
      Math.min(1, Math.max(0, value)) * 255,
    );
  });
  hald.bitmap.data[i * 4 + 3] = 255;
}

await hald.write(fixture("teal-orange-hald.png"));

// An image to grade: red across, green down, blue in diagonal bands, and
// alpha fading out in the bottom rows
const sweep = new Jimp({ width: 64, height: 64 });

sweep.scan((x, y, idx) => {
  sweep.bitmap.data[idx] = Math.round((x * 255) / 63);
  sweep.bitmap.data[idx + 1] = Math.round((y * 255) / 63);
  sweep.bitmap.data[idx + 2] = Math.round((((x * 7 + y * 13) % 64) * 255) / 63);
  sweep.bitmap.data[idx + 3] = y < 56 ? 255 : 255 - (y - 55) * 30;
});

await sweep.write(fixture("sweep.png"));

// Run in src/fixtures, so the filter's file name needs no escaping
const ffmpeg = (...args) =>
  execFileSync("ffmpeg", ["-v", "error", "-y", ...args], {
    cwd: fixture(""),
    stdio: "inherit",
  });

ffmpeg(
  "-i",
  "sweep.png",
  "-vf",
  "lut3d=file=teal-orange.cube:interp=tetrahedral",
  "-pix_fmt",
  "rgba",
  fixture("sweep-teal-orange.png"),
);

ffmpeg(
  "-i",
  "sweep.png",
  "-i",
  "teal-orange-hald.png",
  "-filter_complex",
  "[0][1]haldclut=interp=tetrahedral",
  "-pix_fmt",
  "rgba",
  fixture("sweep-teal-orange-hald.png"),
);
