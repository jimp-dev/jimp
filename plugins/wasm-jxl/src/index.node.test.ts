import { describe, expect, test } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createJimp } from "@jimp/core";
import jpeg from "@jimp/js-jpeg";
import png from "@jimp/js-png";
import { Bitmap } from "@jimp/types";

import jxl from "./index.js";
import { readJxlHeader } from "./header.js";

const Jimp = createJimp({ formats: [png, jpeg, jxl] });

const fixture = (name: string) =>
  readFile(new URL(`./images/${name}`, import.meta.url));

/** The largest and mean differences between two bitmaps' samples */
function difference(a: Bitmap, b: Bitmap) {
  let max = 0;
  let total = 0;

  for (let i = 0; i < a.data.length; i++) {
    const difference = Math.abs(a.data[i]! - b.data[i]!);
    max = Math.max(max, difference);
    total += difference;
  }

  return { max, mean: total / a.data.length };
}

/** Wraps a codestream in a container, split over two jxlp boxes */
function toPartialBoxes(codestream: Buffer) {
  const box = (type: string, contents: Buffer) => {
    const header = Buffer.alloc(8);
    header.writeUInt32BE(8 + contents.length);
    header.write(type, 4, "latin1");
    return Buffer.concat([header, contents]);
  };
  const part = (index: number, contents: Buffer) => {
    const header = Buffer.alloc(4);
    header.writeUInt32BE(index);
    return box("jxlp", Buffer.concat([header, contents]));
  };

  return Buffer.concat([
    Buffer.from("0000000c4a584c200d0a870a", "hex"),
    box("ftyp", Buffer.from("jxl \0\0\0\0jxl ", "latin1")),
    // A codestream split in its header
    part(0, codestream.subarray(0, 5)),
    // The last part has the high bit of its index set
    part(0x80000001, codestream.subarray(5)),
  ]);
}

describe("WASM JPEG XL (Node)", () => {
  describe("decodes cjxl files", () => {
    // The codec converts to sRGB in floating point, which can put a few
    // samples of other encoders' lossless files 1 off
    test.each([
      ["rgb.jxl", "rgb.png"],
      ["rgba.jxl", "rgba.png"],
      ["grey.jxl", "grey.png"],
      ["animated.jxl", "rgba.png"],
    ])("%s", async (name, reference) => {
      const image = await Jimp.read(await fixture(name));
      const expected = await Jimp.read(await fixture(reference));

      expect(image.mime).toBe("image/jxl");
      expect(image.width).toBe(23);
      expect(image.height).toBe(17);
      expect(difference(image.bitmap, expected.bitmap).max).toBeLessThanOrEqual(
        1,
      );
    });

    test("16 bits per sample, scaled to 8", async () => {
      const image = await Jimp.read(await fixture("rgb16.jxl"));

      for (let y = 0; y < 17; y++) {
        for (let x = 0; x < 23; x++) {
          const i = (y * 23 + x) * 4;
          const samples = [x * 2909, y * 4093, (x * y * 397) % 65536];

          samples.forEach((sample, c) => {
            expect(
              Math.abs(image.bitmap.data[i + c]! - (sample * 255) / 65535),
            ).toBeLessThanOrEqual(1);
          });
          expect(image.bitmap.data[i + 3]).toBe(255);
        }
      }
    });

    // Compared with what djxl decodes them to. The codec's older libjxl
    // and its conversion to sRGB give slightly different pixels.
    test.each([
      ["lossy.jxl", "lossy.png"],
      ["jpeg.jxl", "jpeg.png"],
    ])("%s", async (name, reference) => {
      const image = await Jimp.read(await fixture(name));
      const expected = await Jimp.read(await fixture(reference));
      const { max, mean } = difference(image.bitmap, expected.bitmap);

      expect(max).toBeLessThanOrEqual(8);
      expect(mean).toBeLessThan(1);
    });

    test("Display P3, converted to sRGB", async () => {
      const image = await Jimp.read(await fixture("p3.jxl"));
      const p3 = await Jimp.read(await fixture("rgb.png"));
      const expected = new Jimp({
        ...p3.bitmap,
        data: Buffer.from(p3.bitmap.data),
        colorSpace: "display-p3",
      }).toColorSpace("srgb");

      expect(image.colorSpace).toBe("srgb");
      expect(image.iccProfile).toBeUndefined();
      expect(difference(image.bitmap, p3.bitmap).max).toBeGreaterThan(10);
      expect(difference(image.bitmap, expected.bitmap).max).toBeLessThanOrEqual(
        2,
      );
    });

    test("a codestream split over jxlp boxes", async () => {
      const buffer = toPartialBoxes(await fixture("rgb.jxl"));
      const image = await Jimp.read(buffer);
      const expected = await Jimp.read(await fixture("rgb.png"));

      expect(image.mime).toBe("image/jxl");
      expect(difference(image.bitmap, expected.bitmap).max).toBeLessThanOrEqual(
        1,
      );
    });
  });

  test.each([
    ["pq.jxl", "PQ"],
    ["hlg.jxl", "HLG"],
  ])("rejects HDR (%s)", async (name, transferFunction) => {
    await expect(Jimp.read(await fixture(name))).rejects.toThrow(
      `Unsupported JPEG XL image: HDR images (with the ${transferFunction} transfer function) can't be decoded, because the codec would convert them to 8-bit sRGB without tone mapping`,
    );
  });

  test("explains when the codec runs out of memory", async () => {
    // wasm has at most 2 GB, which isn't enough for this one
    const huge = await fixture("huge.jxl");

    expect(readJxlHeader(huge)).toMatchObject({ width: 7000, height: 7000 });
    await expect(Jimp.read(huge)).rejects.toThrow(
      "Failed to decode the 7000x7000 JPEG XL image: the codec ran out of memory",
    );

    // The codec was reset, and still works
    const image = await Jimp.read(await fixture("rgb.jxl"));
    expect(image.width).toBe(23);
  });

  describe("readJxlHeader", () => {
    test.each([
      ["rgb.jxl", 13],
      ["rgba.jxl", 13],
      ["grey.jxl", 13],
      ["rgb16.jxl", 13],
      ["lossy.jxl", 13],
      ["animated.jxl", 13],
      ["jpeg.jxl", 13],
      ["p3.jxl", 13],
      ["pq.jxl", 16],
      ["hlg.jxl", 18],
    ])("%s", async (name, transferFunction) => {
      expect(readJxlHeader(await fixture(name))).toEqual({
        width: 23,
        height: 17,
        transferFunction,
      });
    });

    test("reads split codestreams", async () => {
      expect(readJxlHeader(toPartialBoxes(await fixture("pq.jxl")))).toEqual({
        width: 23,
        height: 17,
        transferFunction: 16,
      });
    });

    test("returns only the size of a cut off header", async () => {
      expect(readJxlHeader((await fixture("pq.jxl")).subarray(0, 6))).toEqual({
        width: 23,
        height: 17,
      });
    });

    test("returns undefined for other data", async () => {
      expect(readJxlHeader(await fixture("rgb.png"))).toBeUndefined();
      expect(readJxlHeader(Buffer.from([0xff, 0x0a]))).toBeUndefined();
    });
  });

  describe("write", () => {
    test("picks JPEG XL from the .jxl extension", async () => {
      const dir = await mkdtemp(path.join(tmpdir(), "jimp-jxl-"));

      try {
        const output = path.join(dir, "image.jxl");
        const image = await Jimp.read(await fixture("rgba.png"));

        await image.write(output, { lossless: true });

        const written = await Jimp.read(output);
        expect(written.mime).toBe("image/jxl");
        expect(
          difference(written.bitmap, image.bitmap).max,
        ).toBeLessThanOrEqual(1);
      } finally {
        await rm(dir, { recursive: true });
      }
    });

    test("converts Display P3 images to sRGB", async () => {
      const image = new Jimp({
        width: 4,
        height: 4,
        color: 0xc04020ff,
        colorSpace: "display-p3",
      });
      const written = await Jimp.read(
        await image.getBuffer("image/jxl", { lossless: true }),
      );

      expect(written.colorSpace).toBe("srgb");
      expect(
        difference(written.bitmap, image.clone().toColorSpace("srgb").bitmap)
          .max,
      ).toBeLessThanOrEqual(1);
    });
  });
});
