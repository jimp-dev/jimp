/**
 * Records how browsers and ImageMagick decode every GIF in test/corpus, so
 * corpus.test.ts can compare the decoder against them without either.
 *
 * - Chromium and Firefox decode every frame with WebCodecs' ImageDecoder,
 *   which gives the full composited image shown at each frame, as the
 *   browser would draw it.
 * - Chromium's ImageDecoder fails frames whose data is cut short or has a
 *   bad LZW code, so Chromium's <img> rendering of the first frame is
 *   recorded too.
 * - ImageMagick's `-coalesce` output is recorded to note where it and the
 *   browsers disagree.
 *
 * Pixels are stored as SHA-256 hashes of each frame's RGBA data, with the
 * color of fully transparent pixels zeroed.
 *
 * Needs the Playwright browsers (`npx playwright install chromium firefox`
 * from packages/config-vitest) and ImageMagick 7.
 *
 * Run from plugins/js-gif: node scripts/generate-corpus-reference.mjs
 */

import { Buffer } from "node:buffer";
import console from "node:console";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const corpus = path.join(root, "test/corpus");
const playwright = createRequire(
  path.join(root, "../../packages/config-vitest/package.json"),
)("playwright");

/** Short hash of RGBA pixels, ignoring the color of transparent pixels */
function hashPixels(rgba) {
  const pixels = Buffer.from(rgba);

  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] === 0) {
      pixels.fill(0, i, i + 4);
    }
  }

  return createHash("sha256").update(pixels).digest("hex").slice(0, 16);
}

/**
 * Convert a WebCodecs repetitionCount to Jimp's loop: Infinity is a GIF loop
 * count of 0 (forever), 0 is no loop count (play once), and single frame
 * images don't report one
 */
function toLoop(repetitionCount, frameCount) {
  if (frameCount < 2 || repetitionCount === undefined) {
    return undefined;
  }

  if (repetitionCount === null || repetitionCount === "Infinity") {
    return 0;
  }

  return repetitionCount === 0 ? null : repetitionCount;
}

/* global atob, btoa, setTimeout, ImageDecoder, URL, Blob, Image, OffscreenCanvas */

/** Runs in the page: decode every frame of a GIF with ImageDecoder */
async function decodeInPage({ base64, withImg }) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const toBase64 = (data) => {
    let text = "";
    for (let i = 0; i < data.length; i += 0x8000) {
      text += String.fromCharCode(...data.subarray(i, i + 0x8000));
    }
    return btoa(text);
  };
  const timeout = (ms) =>
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timed out")), ms),
    );
  const result = { frames: [] };

  try {
    const decoder = new ImageDecoder({
      data: bytes,
      type: "image/gif",
      colorSpaceConversion: "none",
      premultiplyAlpha: "none",
    });

    await Promise.race([decoder.tracks.ready, timeout(10000)]);
    await Promise.race([decoder.completed.catch(() => {}), timeout(10000)]);

    const track = decoder.tracks.selectedTrack;
    const count = track?.frameCount ?? 0;

    result.repetitionCount =
      track?.repetitionCount === Infinity ? "Infinity" : track?.repetitionCount;

    for (let i = 0; i < count; i++) {
      try {
        const { image, complete } = await Promise.race([
          decoder.decode({ frameIndex: i, completeFramesOnly: false }),
          timeout(10000),
        ]);
        const width = image.displayWidth;
        const height = image.displayHeight;
        const data = new Uint8Array(width * height * 4);

        await image.copyTo(data, {
          rect: { x: 0, y: 0, width, height },
          layout: [{ offset: 0, stride: width * 4 }],
        });

        // Convert BGRA, BGRX, RGBA or RGBX to RGBA
        const format = image.format;

        for (let p = 0; p < data.length; p += 4) {
          if (format.startsWith("BGR")) {
            const b = data[p];
            data[p] = data[p + 2];
            data[p + 2] = b;
          }

          if (format.endsWith("X")) {
            data[p + 3] = 255;
          }
        }

        result.frames.push({
          width,
          height,
          duration: image.duration,
          complete,
          pixels: toBase64(data),
        });
        image.close();
      } catch (error) {
        result.frames.push({ error: String(error) });
      }
    }

    decoder.close();
  } catch (error) {
    result.error = String(error);
  }

  if (withImg) {
    try {
      const url = URL.createObjectURL(new Blob([bytes], { type: "image/gif" }));
      const img = new Image();
      img.src = url;
      await Promise.race([img.decode(), timeout(10000)]);

      const canvas = new OffscreenCanvas(img.naturalWidth, img.naturalHeight);
      const context = canvas.getContext("2d");

      context.drawImage(img, 0, 0);

      result.img = {
        width: img.naturalWidth,
        height: img.naturalHeight,
        pixels: toBase64(
          context.getImageData(0, 0, img.naturalWidth, img.naturalHeight).data,
        ),
      };
    } catch (error) {
      result.img = { error: String(error) };
    }
  }

  return result;
}

async function decodeWith(browserName, files, withImg) {
  const browser = await playwright[browserName].launch();
  const page = await browser.newPage();
  // ImageDecoder needs a secure context
  await page.route("https://reference.test/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "<!doctype html>" }),
  );
  await page.goto("https://reference.test/");

  const results = {};

  for (const file of files) {
    const base64 = readFileSync(path.join(corpus, file)).toString("base64");
    const raw = (await page
      .evaluate(decodeInPage, { base64, withImg })
      .catch((error) => ({ error: String(error), frames: [] }))) ?? {
      error: "The browser returned nothing",
      frames: [],
    };
    const frames = raw.frames.map((frame) =>
      frame.error
        ? { error: frame.error }
        : {
            width: frame.width,
            height: frame.height,
            delay:
              frame.duration === null
                ? null
                : Math.round(frame.duration / 1000),
            ...(frame.complete ? {} : { incomplete: true }),
            hash: hashPixels(Buffer.from(frame.pixels, "base64")),
          },
    );
    const result = {
      ...(raw.error ? { error: raw.error } : {}),
      loop: toLoop(raw.repetitionCount, frames.length),
      frames,
    };

    if (raw.img) {
      result.img = raw.img.error
        ? { error: raw.img.error }
        : {
            width: raw.img.width,
            height: raw.img.height,
            hash: hashPixels(Buffer.from(raw.img.pixels, "base64")),
          };
    }

    results[file] = result;
  }

  await browser.close();
  return results;
}

function decodeWithImageMagick(file) {
  const input = path.join(corpus, file);

  try {
    const info = execFileSync(
      "magick",
      [input, "-coalesce", "-format", "%w %h %T\n", "info:"],
      { stdio: ["ignore", "pipe", "ignore"], timeout: 30000 },
    )
      .toString()
      .trim()
      .split("\n")
      .map((line) => line.split(" ").map(Number));
    const rgba = execFileSync(
      "magick",
      [input, "-coalesce", "-depth", "8", "rgba:-"],
      {
        stdio: ["ignore", "pipe", "ignore"],
        timeout: 30000,
        maxBuffer: 1 << 30,
      },
    );
    let offset = 0;

    return {
      frames: info.map(([width, height, delay]) => {
        const size = width * height * 4;
        const pixels = rgba.subarray(offset, offset + size);
        offset += size;
        return { width, height, delay: delay * 10, hash: hashPixels(pixels) };
      }),
    };
  } catch (error) {
    return { error: String(error.message).split("\n")[0] };
  }
}

const files = readdirSync(corpus, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .flatMap((dir) =>
    readdirSync(path.join(corpus, dir.name))
      .filter((name) => name.endsWith(".gif"))
      .map((name) => `${dir.name}/${name}`),
  )
  .sort();

console.log(`Decoding ${files.length} GIFs with Chromium`);
const chromium = await decodeWith("chromium", files, true);
console.log("Decoding with Firefox");
const firefox = await decodeWith("firefox", files, false);
console.log("Decoding with ImageMagick");

const reference = {};

for (const file of files) {
  reference[file] = {
    chromium: chromium[file],
    firefox: firefox[file],
    imagemagick: decodeWithImageMagick(file),
  };
}

writeFileSync(
  path.join(corpus, "reference.json"),
  JSON.stringify(reference, null, 1) + "\n",
);
console.log(`Wrote ${path.join(corpus, "reference.json")}`);
