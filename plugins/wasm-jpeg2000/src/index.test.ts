import { describe, expect, test } from "vitest";
import { makeTestImage } from "@jimp/test-utils";
import { createJimp } from "@jimp/core";

import jpeg2000, { j2c, jpx } from "./index.js";

const format = jpeg2000();
const codestream = j2c();
const image = makeTestImage(
  "▴▴▴▴▸▸▸▸",
  "▴▴▴▴▸▸▸▸",
  "▾▾▾▾◆◆◆◆",
  "▾▾▾▾◆◆◆◆",
  "▪▪▰▰■■▩▩",
  "▪▪▰▰■■▩▩",
);

describe("WASM JPEG 2000", () => {
  test("rejects options it doesn't support", async () => {
    await expect(
      // @ts-expect-error JPEG 2000 has a compression ratio, not a quality
      format.encode(image, { quality: 80 }),
    ).rejects.toThrow();
  });

  test.each([
    ["JP2", format],
    ["codestream", codestream],
  ])("round-trips a %s losslessly", async (_, format) => {
    // Run two of each at once so both race to initialize the codec
    const [buffer] = await Promise.all([
      format.encode(image),
      format.encode(image),
    ]);
    const [decoded] = await Promise.all([
      format.decode(buffer),
      format.decode(buffer),
    ]);

    expect(decoded.width).toBe(image.width);
    expect(decoded.height).toBe(image.height);
    expect(decoded.data).toEqual(image.data);
  });

  test("writes JP2 boxes around the codestream", async () => {
    const jp2 = await format.encode(image);
    const raw = await codestream.encode(image);

    expect(jp2.toString("latin1", 4, 8)).toBe("jP  ");
    expect(jp2.toString("latin1", 20, 24)).toBe("jp2 ");
    expect(jp2.subarray(jp2.length - raw.length)).toEqual(raw);
    // Codestreams start with the SOC and SIZ markers
    expect(raw.readUInt32BE(0)).toBe(0xff4fff51);
  });

  test("encodes lossy with a compression ratio", async () => {
    const lossless = await format.encode(image);
    const lossy = await format.encode(image, { compressionRatio: 20 });
    const decoded = await format.decode(lossy);

    expect(lossy.length).toBeLessThan(lossless.length);
    expect(decoded.width).toBe(image.width);
    expect(decoded.data).not.toEqual(image.data);
  });

  test("encodes images too small for the default decompositions", async () => {
    const tiny = makeTestImage("▴");
    const decoded = await format.decode(await format.encode(tiny));

    expect(decoded.data).toEqual(tiny.data);
  });

  test("decodes at a lower resolution with reduce", async () => {
    // 8x6 halves to 4x3, then 2x2: 6 / 2 rounds up
    const buffer = await format.encode(image);
    const half = await format.decode(buffer, { reduce: 1 });
    const quarter = await format.decode(buffer, { reduce: 2 });

    expect([half.width, half.height]).toEqual([4, 3]);
    expect(half.data.length).toBe(4 * 3 * 4);
    expect([quarter.width, quarter.height]).toEqual([2, 2]);
  });

  test("clamps reduce to the image's decompositions", async () => {
    const buffer = await format.encode(image, { decompositions: 1 });
    const decoded = await format.decode(buffer, { reduce: 5 });

    expect([decoded.width, decoded.height]).toEqual([4, 3]);
  });

  test("rejects images larger than maxResolutionInMP", async () => {
    const buffer = await format.encode(image);

    await expect(
      format.decode(buffer, { maxResolutionInMP: 0.00002 }),
    ).rejects.toThrow(
      "JPEG 2000 dimensions 8x6 exceed the maximum resolution of 0.00002 megapixels",
    );
    // 4x3 fits
    await expect(
      format.decode(buffer, { maxResolutionInMP: 0.00002, reduce: 1 }),
    ).resolves.toMatchObject({ width: 4, height: 3 });
  });

  test("throws a clear error for data that isn't JPEG 2000", async () => {
    await expect(
      format.decode(Buffer.from("not a JPEG 2000 image")),
    ).rejects.toThrow(
      "Invalid JPEG 2000 image: the codestream's main header can't be read",
    );
  });

  test("throws OpenJPEG's error for a broken codestream", async () => {
    const buffer = await codestream.encode(image);
    // Keep the main header, up to the first tile's SOT marker
    const header = buffer.subarray(
      0,
      buffer.indexOf(Buffer.from([0xff, 0x90])),
    );

    await expect(codestream.decode(header)).rejects.toThrow(
      /^Failed to decode the JPEG 2000 image/,
    );
  });

  test("can't write JPX", async () => {
    await expect(jpx().encode()).rejects.toThrow("Writing JPX isn't supported");
  });

  describe("Jimp", () => {
    const Jimp = createJimp({ formats: [jpeg2000, j2c] });

    test.each(["image/jp2", "image/j2c"] as const)(
      "detects %s",
      async (mime) => {
        const jimp = Jimp.fromBitmap(image);
        const decoded = await Jimp.read(await jimp.getBuffer(mime));

        expect(decoded.mime).toBe(mime);
        expect(decoded.bitmap.data).toEqual(image.data);
      },
    );

    test("passes decode options", async () => {
      const jimp = Jimp.fromBitmap(image);
      const decoded = await Jimp.read(await jimp.getBuffer("image/jp2"), {
        "image/jp2": { reduce: 1 },
      });

      expect(decoded.width).toBe(4);
    });

    test("flattens transparency onto the background", async () => {
      const jimp = new Jimp({ width: 2, height: 2, color: 0xff000080 });

      jimp.background = 0xffffffff;

      const decoded = await Jimp.read(await jimp.getBuffer("image/jp2"));

      expect(decoded.getPixelColor(0, 0).toString(16)).toBe("ff7f7fff");
    });
  });
});
