/* global Buffer, URL, console */
// Generates the APNG test images in test/apng and their reference frames.
// ffmpeg makes one of them and decodes all of them: its APNG decoder draws
// each frame as the animation says, independently of ours. Needs ffmpeg
// (`brew install ffmpeg`) and a build of this package (`pnpm build`).
//
// Writes test/apng/<name>.png and test/apng/<name>.rgba.gz: every frame as
// 8-bit RGBA, one after another, gzipped.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

import { encode } from "../dist/esm/index.js";
import { crc32 } from "../dist/esm/zlib.js";

const dir = new URL("../test/apng/", import.meta.url);
const path = (name) => fileURLToPath(new URL(name, dir));

function chunk(type, data = Buffer.alloc(0)) {
  const result = Buffer.alloc(data.length + 12);

  result.writeUInt32BE(data.length, 0);
  result.write(type, 4, "latin1");
  data.copy(result, 8);
  result.writeUInt32BE(
    crc32(result.subarray(4, data.length + 8)),
    data.length + 8,
  );

  return result;
}

/** The compressed image data of an RGBA image, written as 8-bit RGBA */
function imageData(image) {
  const png = Buffer.from(encode(image, { colorType: 6, bitDepth: 8 }));
  const parts = [];

  for (let offset = 8; offset < png.length;) {
    const length = png.readUInt32BE(offset);

    if (png.toString("latin1", offset + 4, offset + 8) === "IDAT") {
      parts.push(png.subarray(offset + 8, offset + 8 + length));
    }

    offset += 12 + length;
  }

  return Buffer.concat(parts);
}

/** A width x height image filled by fn(x, y) => [r, g, b, a] */
function image(width, height, fn) {
  const data = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      data.set(fn(x, y), (y * width + x) * 4);
    }
  }

  return { width, height, data };
}

/**
 * Builds an APNG. Each frame is { image, x, y, dispose, blend, delay }. With
 * `hiddenDefault`, the IDAT image isn't a frame.
 */
function apng(width, height, frames, { plays = 0, hiddenDefault } = {}) {
  const ihdr = Buffer.alloc(13);
  let sequence = 0;

  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const actl = Buffer.alloc(8);

  actl.writeUInt32BE(frames.length, 0);
  actl.writeUInt32BE(plays, 4);

  const chunks = [chunk("IHDR", ihdr), chunk("acTL", actl)];
  const fctl = (frame) => {
    const data = Buffer.alloc(26);

    data.writeUInt32BE(sequence++, 0);
    data.writeUInt32BE(frame.image.width, 4);
    data.writeUInt32BE(frame.image.height, 8);
    data.writeUInt32BE(frame.x ?? 0, 12);
    data.writeUInt32BE(frame.y ?? 0, 16);
    data.writeUInt16BE(frame.delay ?? 100, 20);
    data.writeUInt16BE(1000, 22);
    data[24] = frame.dispose ?? 0;
    data[25] = frame.blend ?? 0;

    return chunk("fcTL", data);
  };

  if (hiddenDefault) {
    chunks.push(chunk("IDAT", imageData(hiddenDefault)));
  }

  frames.forEach((frame, i) => {
    chunks.push(fctl(frame));

    if (i === 0 && !hiddenDefault) {
      chunks.push(chunk("IDAT", imageData(frame.image)));
    } else {
      const seq = Buffer.alloc(4);

      seq.writeUInt32BE(sequence++);
      chunks.push(chunk("fdAT", Buffer.concat([seq, imageData(frame.image)])));
    }
  });

  chunks.push(chunk("IEND"));

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ...chunks,
  ]);
}

const gradient = image(32, 32, (x, y) => [x * 8, y * 8, 128, 64 + x * 4]);
const red = image(16, 16, () => [255, 0, 0, 128]);
const green = image(16, 16, (x, y) =>
  x > 4 && x < 11 && y > 4 && y < 11 ? [0, 0, 0, 0] : [0, 255, 0, 255],
);
const blue = image(8, 8, () => [0, 0, 255, 200]);

const fixtures = {
  // Every dispose and blend operation
  "blend-dispose": apng(32, 32, [
    { image: gradient },
    { image: red, x: 4, y: 4, blend: 1, dispose: 2, delay: 50 },
    { image: green, x: 12, y: 12, blend: 1, dispose: 1 },
    { image: blue, x: 20, y: 2, blend: 0, dispose: 0, delay: 0 },
    { image: red, x: 10, y: 0, blend: 1, dispose: 2 },
    { image: blue, x: 0, y: 24, blend: 1 },
  ]),
  // A first frame that disposes to "previous", which means "background"
  "first-dispose-previous": apng(
    32,
    32,
    [
      { image: gradient, dispose: 2 },
      { image: blue, x: 4, y: 4, blend: 1 },
    ],
    { plays: 1 },
  ),
  // The IDAT image is shown by viewers without APNG support, not animated
  "hidden-default": apng(16, 16, [{ image: red }, { image: green, blend: 1 }], {
    plays: 2,
    hiddenDefault: image(16, 16, () => [9, 9, 9, 255]),
  }),
};

for (const [name, data] of Object.entries(fixtures)) {
  writeFileSync(path(`${name}.png`), data);
}

// Frames of different sizes, as ffmpeg's encoder writes them
execFileSync("ffmpeg", [
  "-loglevel",
  "error",
  "-y",
  "-f",
  "lavfi",
  "-i",
  "testsrc2=size=48x32:rate=5:duration=1.6,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lt(X,8),0,if(lt(X,16),128,255))'",
  "-plays",
  "3",
  "-f",
  "apng",
  path("ffmpeg.png"),
]);

for (const name of [...Object.keys(fixtures), "ffmpeg"]) {
  const frames = execFileSync("ffmpeg", [
    "-loglevel",
    "error",
    "-i",
    path(`${name}.png`),
    "-fps_mode",
    "passthrough",
    "-f",
    "rawvideo",
    "-pix_fmt",
    "rgba",
    "-",
  ]);

  writeFileSync(path(`${name}.rgba.gz`), gzipSync(frames, { level: 9 }));
  console.log(`${name}: ${readFileSync(path(`${name}.png`)).length} bytes`);
}
