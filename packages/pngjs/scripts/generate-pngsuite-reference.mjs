/* global Buffer, URL, console, process */
// Generates the reference pixels the PngSuite tests compare against, with
// two decoders built on libpng: netpbm's pngtopam and ImageMagick. They must
// agree on every image, except that pngtopam ignores the tRNS colour of RGB
// images (tbbn2c16, tbgn2c16, tbrn2c08). There ImageMagick is used after
// checking that exactly the pixels with the tRNS colour differ, and only in
// alpha. ImageMagick converts the colours with gAMA, cHRM and
// iCCP, which pngtopam doesn't (and nor do we), so it gets a copy without
// them. Needs both installed (`brew install netpbm
// imagemagick`), so CI uses the committed output instead.
//
// Writes test/pngsuite/reference/<name>.rgba16.gz: the image as 16-bit RGBA
// samples, big-endian, gzipped. Run with `node scripts/generate-pngsuite-reference.mjs`.
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const dir = new URL("../test/pngsuite/", import.meta.url);
const out = new URL("reference/", dir);

mkdirSync(out, { recursive: true });

/** Parses a PAM file to 16-bit RGBA */
function parsePam(pam) {
  const headerEnd = pam.indexOf("ENDHDR\n") + 7;
  const header = Object.fromEntries(
    pam
      .subarray(0, headerEnd)
      .toString("latin1")
      .split("\n")
      .map((line) => line.split(" "))
      .filter((parts) => parts.length === 2),
  );
  const width = Number(header.WIDTH);
  const height = Number(header.HEIGHT);
  const depth = Number(header.DEPTH);
  const maxval = Number(header.MAXVAL);
  const bytes = maxval > 255 ? 2 : 1;
  const rgba = new Uint16Array(width * height * 4);
  const scale = (v) => (v * 65535) / maxval;

  for (let p = 0; p < width * height; p++) {
    const samples = [];

    for (let c = 0; c < depth; c++) {
      const i = headerEnd + (p * depth + c) * bytes;

      samples.push(bytes === 2 ? pam.readUInt16BE(i) : pam[i]);
    }

    const [r, g, b, a] =
      depth === 1
        ? [samples[0], samples[0], samples[0], maxval]
        : depth === 2
          ? [samples[0], samples[0], samples[0], samples[1]]
          : depth === 3
            ? [...samples, maxval]
            : samples;

    rgba.set([scale(r), scale(g), scale(b), scale(a)], p * 4);
  }

  return { width, height, rgba };
}

const COLOR_SPACE_CHUNKS = new Set(["gAMA", "cHRM", "sRGB", "iCCP"]);

/** Copies a PNG without the chunks that change how its colours are read */
function withoutColorSpace(file, tmp) {
  const data = readFileSync(file);
  const parts = [data.subarray(0, 8)];

  for (let offset = 8; offset < data.length;) {
    const end = offset + 12 + data.readUInt32BE(offset);

    if (
      !COLOR_SPACE_CHUNKS.has(data.toString("latin1", offset + 4, offset + 8))
    ) {
      parts.push(data.subarray(offset, end));
    }

    offset = end;
  }

  const copy = join(tmp, "image.png");

  writeFileSync(copy, Buffer.concat(parts));

  return copy;
}

/** The tRNS colour of an RGB image, at the image's bit depth */
function getRgbTrns(file) {
  const data = readFileSync(file);

  if (data[25] !== 2) {
    return undefined;
  }

  for (let offset = 8; offset < data.length;) {
    const length = data.readUInt32BE(offset);

    if (data.toString("latin1", offset + 4, offset + 8) === "tRNS") {
      return [0, 2, 4].map((i) => data.readUInt16BE(offset + 8 + i));
    }

    offset += 12 + length;
  }

  return undefined;
}

/**
 * Whether the only difference is that ImageMagick made the pixels with the
 * tRNS colour transparent, which pngtopam didn't
 */
function isTrnsDifference(file, rgba, magick) {
  const trns = getRgbTrns(file);

  if (!trns) {
    return false;
  }

  const depth = readFileSync(file)[24];
  const scale = 65535 / (2 ** depth - 1);

  for (let p = 0; p < rgba.length / 4; p++) {
    const rgb = [0, 1, 2].map((c) => magick.readUInt16BE((p * 4 + c) * 2));
    const isTransparent = rgb.every((v, c) => v === trns[c] * scale);
    const expected = [...rgb, isTransparent ? 0 : 65535];

    for (let c = 0; c < 4; c++) {
      if (
        magick.readUInt16BE((p * 4 + c) * 2) !== expected[c] ||
        (c < 3 && rgba[p * 4 + c] !== expected[c])
      ) {
        return false;
      }
    }
  }

  return true;
}

function toBigEndian(rgba) {
  const buffer = Buffer.alloc(rgba.length * 2);

  rgba.forEach((v, i) => buffer.writeUInt16BE(v, i * 2));

  return buffer;
}

const tmp = mkdtempSync(join(tmpdir(), "pngsuite-"));
const names = readdirSync(dir).filter(
  (name) => name.endsWith(".png") && !name.startsWith("x"),
);

for (const name of names) {
  const file = fileURLToPath(new URL(name, dir));
  const pam = execFileSync("pngtopam", ["-alphapam", file], {
    stdio: ["ignore", "pipe", "ignore"],
  });
  const { width, height, rgba } = parsePam(pam);
  const magick = execFileSync("magick", [
    `png:${withoutColorSpace(file, tmp)}`,
    "-depth",
    "16",
    "-endian",
    "MSB",
    "rgba:-",
  ]);
  let reference = toBigEndian(rgba);

  if (!reference.equals(magick) && isTrnsDifference(file, rgba, magick)) {
    reference = magick;
  }

  if (!reference.equals(magick)) {
    process.exitCode = 1;
    let differences = 0;

    for (let i = 0; i < reference.length; i += 2) {
      if (reference.readUInt16BE(i) !== magick.readUInt16BE(i)) {
        differences++;
      }
    }

    console.warn(
      `${name}: pngtopam and ImageMagick differ in ${differences} of ${reference.length / 2} samples (${width}x${height})`,
    );
  }

  writeFileSync(
    new URL(name.replace(/\.png$/, ".rgba16.gz"), out),
    gzipSync(reference, { level: 9 }),
  );
}

console.log(`Wrote ${names.length} references`);
