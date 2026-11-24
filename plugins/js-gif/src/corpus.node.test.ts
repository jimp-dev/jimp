import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { DecodedFrames } from "@jimp/types";

import gif from "./index.js";

/**
 * Compares the decoder with how browsers decode the GIFs in test/corpus. See
 * test/corpus/README.md for where they come from, and
 * scripts/generate-corpus-reference.mjs for how reference.json was made.
 */

const corpus = new URL("../test/corpus/", import.meta.url);

interface ReferenceFrame {
  width?: number;
  height?: number;
  delay?: number | null;
  incomplete?: boolean;
  hash?: string;
  error?: string;
}

interface BrowserResult {
  error?: string;
  loop?: number | null;
  frames: ReferenceFrame[];
  img?: { width?: number; height?: number; hash?: string; error?: string };
}

const reference: Record<
  string,
  { chromium: BrowserResult; firefox: BrowserResult }
> = JSON.parse(readFileSync(new URL("reference.json", corpus), "utf8"));

/**
 * Files where the decoder matches neither browser. The frames are what the
 * decoder gives, so changes still show up.
 */
const DIVERGENCES: Record<string, { reason: string; frames: string[] }> = {
  "image-gif/issue-117-out-of-range.gif": {
    reason:
      "LZW minimum code size 0 isn't valid, so nothing is drawn. Chromium draws two pixels of an odd color, Firefox shows a 256x513 image",
    frames: ["256x23850:af4e86bd496c9084"],
  },
  "libnsgif/frame-clipped-lzw.gif": {
    reason:
      "Frames 1 to 3 end early or have a bad LZW code. Chromium draws frame 3 over frame 0, skipping the incomplete frames between them, and Firefox fails frames 2 and 3. Each frame draws over the one before",
    frames: [
      "2x3:44a5f7891570e563",
      "2x3:8a9d6b24a8e78e82",
      "2x3:12c66afd293a240a",
      "2x3:12c66afd293a240a",
    ],
  },
  "libnsgif/lzw-no-eoi.gif": {
    reason:
      "Frames 1 and 2 end without an end of information code. Chromium fails them, Firefox draws neither and clears a row outside them. Ours is libnsgif's expected output",
    frames: [
      "3x2:09937779f7da014f",
      "3x2:e88c739875e7d2e8",
      "3x2:fa354df5b7ff6c0a",
    ],
  },
  "synthetic/lzw-min-code-size-1.gif": {
    reason:
      "LZW minimum code size 1 is outside the spec. Chromium fails it, Firefox grows the code size later than the encoder that wrote it. Ours matches ImageMagick",
    frames: ["4x3:2c0516bcab85b4be"],
  },
  "synthetic/truncated-interlaced.gif": {
    reason:
      "Browsers fill interlaced rows that weren't decoded from the rows above them, differently from each other. Rows that weren't decoded stay transparent",
    frames: ["4x8:149425c1d01e7e29"],
  },
};

/** Short hash of RGBA pixels, ignoring the color of transparent pixels */
function hashPixels(rgba: Uint8Array) {
  const pixels = Buffer.from(rgba);

  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] === 0) {
      pixels.fill(0, i, i + 4);
    }
  }

  return createHash("sha256").update(pixels).digest("hex").slice(0, 16);
}

/** What a decoder gives for a file, or the error it throws */
interface Summary {
  loop?: number | null;
  frames: {
    pixels: string | string[];
    delay?: number;
  }[];
}

function summarize({ frames, loop }: DecodedFrames): Summary {
  return {
    // Browsers don't give a loop count for single frame images
    loop: frames.length > 1 ? loop : undefined,
    frames: frames.map(({ bitmap, delay }) => ({
      pixels: `${bitmap.width}x${bitmap.height}:${hashPixels(bitmap.data)}`,
      delay,
    })),
  };
}

const describeFrame = (frame: ReferenceFrame) =>
  `${frame.width}x${frame.height}:${frame.hash}`;

/**
 * What Chromium shows. Chromium's ImageDecoder fails frames with bad data,
 * that its <img> or Firefox still show, so those frames can match either.
 */
function chromiumSummary({ chromium, firefox }: (typeof reference)[string]) {
  if (chromium.frames.length === 0) {
    return undefined;
  }

  const frames = chromium.frames.map((frame, i) => {
    if (!frame.error) {
      return { pixels: describeFrame(frame), delay: frame.delay ?? undefined };
    }

    const candidates: string[] = [];
    const img = chromium.img;
    const fallback = firefox.frames[i];

    if (i === 0 && img && !img.error) {
      candidates.push(describeFrame(img));
    }

    if (fallback && !fallback.error) {
      candidates.push(describeFrame(fallback));
    }

    return { pixels: candidates };
  });

  // Every browser failed to decode it
  if (frames.every(({ pixels }) => pixels.length === 0)) {
    return undefined;
  }

  return {
    loop: chromium.frames.length > 1 ? chromium.loop : undefined,
    frames,
  };
}

/** What Firefox shows, where it decodes every frame */
function firefoxSummary({ firefox }: (typeof reference)[string]) {
  if (
    firefox.frames.length === 0 ||
    firefox.frames.some((frame) => frame.error)
  ) {
    return undefined;
  }

  return {
    loop: firefox.frames.length > 1 ? firefox.loop : undefined,
    frames: firefox.frames.map((frame) => ({ pixels: describeFrame(frame) })),
  };
}

/**
 * Whether `ours` matches `expected`. Frames whose pixels are a list can
 * match any of them, and an empty list or a missing delay matches anything.
 */
function matches(ours: Summary, expected: Summary | undefined) {
  return (
    expected !== undefined &&
    ours.loop === expected.loop &&
    ours.frames.length === expected.frames.length &&
    ours.frames.every((frame, i) => {
      const { pixels, delay } = expected.frames[i]!;

      return (
        (Array.isArray(pixels)
          ? pixels.length === 0 || pixels.includes(frame.pixels as string)
          : pixels === frame.pixels) &&
        (delay === undefined || delay === frame.delay)
      );
    })
  );
}

function decode(file: string) {
  return gif().decodeFrames(readFileSync(new URL(file, corpus)));
}

const files = Object.keys(reference);
const curated = files.filter((file) => !file.startsWith("libnsgif-afl/"));
const fuzzed = files.filter((file) => file.startsWith("libnsgif-afl/"));

describe("GIF conformance corpus", () => {
  test.each(curated)("%s", async (file) => {
    const divergence = DIVERGENCES[file];
    const expected = chromiumSummary(reference[file]!);

    if (!expected && !divergence) {
      // No browser shows anything
      await expect(async () => decode(file)).rejects.toThrow(Error);
      return;
    }

    const ours = summarize(await decode(file));

    if (divergence) {
      expect(ours.frames.map(({ pixels }) => pixels)).toEqual(
        divergence.frames
      );
      return;
    }

    if (
      matches(ours, expected) ||
      matches(ours, firefoxSummary(reference[file]!))
    ) {
      return;
    }

    // Show how it differs from Chromium
    expect(ours).toEqual(expected);
  });

  test.each(fuzzed)("%s decodes or throws an Error", async (file) => {
    try {
      const { frames } = await gif().decodeFrames(
        readFileSync(new URL(file, corpus)),
        { maxResolutionInMP: 16 }
      );

      expect(frames.length).toBeGreaterThan(0);
    } catch (error) {
      expect((error as Error).constructor).toBe(Error);
    }
  });
});
