// Regression tests for bugs reported against pngjs, by issue or PR number on
// github.com/pngjs/pngjs. These run in Node.js and browsers.
import { describe, expect, test } from "vitest";

import {
  buildPng,
  concat,
  gradient,
  idat,
  iend,
  ihdr,
  makeChunk,
  packToBytes,
  readChunks,
} from "../test/helpers.js";
import { ColorType, PNG, adjustGamma, decode, encode } from "./index.js";
import { deflate } from "./zlib.js";

/** A 2x2 RGBA image: red, green, blue, transparent */
function smallImage() {
  return {
    width: 2,
    height: 2,
    data: new Uint8Array([
      255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 0, 0, 0, 0,
    ]),
  };
}

function parse(data: Uint8Array, options = {}) {
  return new Promise<PNG>((resolve, reject) => {
    new PNG(options).parse(data, (error, png) =>
      error ? reject(error) : resolve(png!),
    );
  });
}

function catchError(fn: () => unknown) {
  try {
    fn();
  } catch (error) {
    return error as Error;
  }

  throw new Error("Expected an error");
}

describe("decoding", () => {
  test("#298: a file without IEND decodes", () => {
    const png = encode(gradient(8, 8));
    const withoutIend = png.subarray(0, png.length - 12);

    expect(decode(withoutIend).data).toEqual(decode(png).data);
    expect(PNG.sync.read(withoutIend).data).toEqual(PNG.sync.read(png).data);
  });

  test("#136: a wrong Adler-32 checksum doesn't stop the image loading, sync or async", async () => {
    // 8 lines of 8 pixels, each with filter type 0 and every sample 7
    const raw = new Uint8Array(8 * (1 + 8 * 4)).fill(7);

    for (let y = 0; y < 8; y++) {
      raw[y * 33] = 0;
    }

    const compressed = deflate(raw, { level: 9 }).slice();

    // Break the checksum at the end of the zlib stream
    compressed[compressed.length - 1] ^= 0xff;

    const png = buildPng(ihdr(8, 8), makeChunk("IDAT", compressed), iend());

    expect(decode(png).data[0]).toBe(7);
    expect((await parse(png)).data[0]).toBe(7);
  });

  test("#122: non-PNG data, like a JPEG, says it's not a PNG", () => {
    const jpeg = new Uint8Array([
      0xff, 0xd8, 0xff, 0xe0, 0, 16, 74, 70, 73, 70,
    ]);

    expect(catchError(() => decode(jpeg)).message).toBe(
      "Invalid file signature: not a PNG file",
    );
  });

  test("#209: a truncated file says so", () => {
    const png = encode(gradient(64, 64), { deflateLevel: 0 });
    const error = catchError(() => decode(png.subarray(0, png.length / 2)));

    expect(error.constructor).toBe(Error);
    expect(error.message).toBe("Unexpected end of file in IDAT chunk");
  });

  test("#146: the ICC profile is exposed, so colours can be converted like browsers do", () => {
    const profile = new Uint8Array(200).map((_, i) => i);
    const png = encode(gradient(4, 4), {
      iccProfile: { name: "Display P3", data: profile },
    });

    const { iccProfile } = decode(png);

    expect(iccProfile?.name).toBe("Display P3");
    expect([...iccProfile!.data]).toEqual([...profile]);
  });

  test("#394: a huge image size in a tiny file throws without allocating it", () => {
    const png = buildPng(
      ihdr(100000, 100000),
      idat(new Uint8Array(16)),
      iend(),
    );
    const error = catchError(() => decode(png));

    expect(error.constructor).toBe(Error);
    expect(error.message).toMatch(/^Not enough image data/);
  });

  test("#394: zero and oversized dimensions are rejected", () => {
    expect(
      catchError(() =>
        decode(buildPng(ihdr(0, 8), idat(new Uint8Array(9)), iend())),
      ).message,
    ).toBe("Invalid image size 0x8");
    expect(
      catchError(() =>
        decode(buildPng(ihdr(2 ** 31, 1), idat(new Uint8Array(9)), iend())),
      ).message,
    ).toMatch(/too large/);
  });

  test("short image data is an error, not uninitialised memory", () => {
    // 4x4 RGBA needs 4 * 17 bytes, give it 5
    const png = buildPng(ihdr(4, 4), idat(new Uint8Array(5)), iend());

    expect(catchError(() => decode(png)).message).toBe(
      "Not enough image data: expected 68 bytes, got 5",
    );
  });

  test("an invalid filter type is an Error in the async API, not a crash", async () => {
    const raw = new Uint8Array(4 * 17);

    raw[0] = 5;

    const png = buildPng(ihdr(4, 4), idat(raw), iend());

    await expect(parse(png)).rejects.toThrow("Invalid filter type 5");
  });

  test("a CRC error in a metadata chunk skips the chunk", () => {
    const text = makeChunk("tEXt", new TextEncoder().encode("Title\0Hello"));

    text[text.length - 1] ^= 1;

    const png = encode(gradient(2, 2));
    const broken = concat(png.subarray(0, 33), text, png.subarray(33));

    expect(decode(broken).text).toEqual([]);
    expect(decode(broken).data).toEqual(decode(png).data);
  });

  test("a CRC error in a critical chunk throws unless checkCRC is false", () => {
    const png = encode(gradient(2, 2)).slice();

    // The last byte of IHDR's CRC
    png[32] ^= 1;

    expect(catchError(() => decode(png)).message).toBe(
      "CRC error in IHDR chunk",
    );
    expect(decode(png, { checkCRC: false }).width).toBe(2);
  });

  test("data after IEND is ignored", () => {
    const png = encode(gradient(4, 4));
    const withJunk = concat(png, new Uint8Array([1, 2, 3, 4, 5]));

    expect(decode(withJunk).data).toEqual(decode(png).data);
  });

  test("#389: the palette is exposed", () => {
    const png = encode(smallImage(), { colorType: ColorType.PALETTE });

    expect(decode(png).palette).toEqual([
      [0, 0, 0, 0],
      [255, 0, 0, 255],
      [0, 255, 0, 255],
      [0, 0, 255, 255],
    ]);
    expect(PNG.sync.read(png).palette).toEqual(decode(png).palette);
  });

  test("#90: palette images can be read as indices", () => {
    const png = encode(smallImage(), { colorType: ColorType.PALETTE });

    expect([...PNG.sync.read(png, { keepIndexed: true }).data]).toEqual([
      1, 2, 3, 0,
    ]);
  });
});

describe("gamma", () => {
  test("#9: adjustGamma works on 16-bit data, without rounding to 8 bits first", () => {
    const samples = new Uint16Array([1000, 30000, 65000, 65535]);
    const image = { width: 1, height: 1, data: samples.slice(), gamma: 1 };

    adjustGamma(image);

    expect(image.gamma).toBe(0);
    expect([...image.data]).toEqual([
      Math.round(Math.pow(1000 / 65535, 1 / 2.2) * 65535),
      Math.round(Math.pow(30000 / 65535, 1 / 2.2) * 65535),
      Math.round(Math.pow(65000 / 65535, 1 / 2.2) * 65535),
      65535,
    ]);
  });

  test("#9: PNG.adjustGamma uses the 16-bit range for skipRescale data", () => {
    const png = encode(
      {
        width: 1,
        height: 1,
        data: new Uint16Array([1000, 30000, 65000, 65535]),
      },
      { gamma: 1 },
    );
    const image = PNG.sync.read(png, { skipRescale: true });

    PNG.adjustGamma(image);

    expect(image.data[0]).toBe(
      Math.round(Math.pow(1000 / 65535, 1 / 2.2) * 65535),
    );
  });

  test("#178: adjustGamma takes the display gamma", () => {
    const image = {
      width: 1,
      height: 1,
      data: new Uint8Array([128, 128, 128, 255]),
      gamma: 0.5,
    };

    adjustGamma(image, 1);

    expect(image.data[0]).toBe(Math.round(Math.pow(128 / 255, 2) * 255));
  });

  test("gAMA is rounded, not floored, on write", () => {
    const png = PNG.sync.write({ ...gradient(1, 1), gamma: 1 / 2.2 });

    expect(PNG.sync.read(png).gamma).toBe(0.45455);
  });
});

describe("encoding", () => {
  test("#390: IEND is the standard 12 bytes", () => {
    const png = PNG.sync.write(gradient(2, 2));

    expect([...png.subarray(png.length - 12)]).toEqual([
      0, 0, 0, 0, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
  });

  test("#285: filterType 0 with transparent pixels", () => {
    const image = gradient(16, 16);

    image.data.fill(0);

    const png = PNG.sync.write(image, { filterType: 0 });

    expect([...PNG.sync.read(png).data]).toEqual([...image.data]);
  });

  test("#360, #81: writing grayscale from gray input", () => {
    const gray = new Uint8Array([0, 64, 128, 255]);
    const png = PNG.sync.write(
      { width: 2, height: 2, data: gray },
      { colorType: 0, inputColorType: 0 },
    );
    const result = PNG.sync.read(png);

    expect(result.colorType).toBe(0);
    expect([...result.data]).toEqual([
      0, 0, 0, 255, 64, 64, 64, 255, 128, 128, 128, 255, 255, 255, 255, 255,
    ]);
  });

  test("#360: writing 16-bit grayscale", () => {
    const gray = new Uint16Array([0, 1000, 40000, 65535]);
    const png = PNG.sync.write(
      { width: 2, height: 2, data: new Uint8Array(gray.buffer) },
      { colorType: 0, inputColorType: 0, bitDepth: 16 },
    );

    expect(
      [...decode(png, { outputDepth: 16 }).data].filter((_, i) => i % 4 === 0),
    ).toEqual([...gray]);
  });

  test("#81: colour to gray rounds the mean instead of truncating it", () => {
    const png = PNG.sync.write(
      { width: 1, height: 1, data: new Uint8Array([255, 255, 254, 255]) },
      { colorType: 0 },
    );

    expect(PNG.sync.read(png).data[0]).toBe(255);
  });

  test("#252: packing the same image twice gives two valid PNGs", async () => {
    const png = new PNG({ width: 4, height: 4 });

    png.data.set(gradient(4, 4).data);

    const first = await packToBytes(png);
    const second = await packToBytes(png);

    expect([...second]).toEqual([...first]);
    expect([...decode(second).data]).toEqual([...gradient(4, 4).data]);
  });

  test("filterType takes a list of filters, as documented", () => {
    const image = gradient(16, 16);
    const png = PNG.sync.write(image, { filterType: [1, 2] });

    expect([...PNG.sync.read(png).data]).toEqual([...image.data]);
    expect(() => PNG.sync.write(image, { filterType: [7] })).toThrow(
      "Invalid filterType [7]",
    );
  });

  test("16-bit input is read from the Buffer's offset", () => {
    const samples = new Uint16Array([1, 2, 3, 65535]);
    const backing = new Uint8Array(16);

    backing.set(new Uint8Array(samples.buffer), 8);

    const png = PNG.sync.write(
      { width: 1, height: 1, data: backing.subarray(8) },
      { bitDepth: 16 },
    );

    expect([...decode(png, { outputDepth: 16 }).data]).toEqual([
      1, 2, 3, 65535,
    ]);
  });

  test("new PNG({ bitDepth: 16 }) allocates 8 bytes a pixel", () => {
    expect(new PNG({ width: 2, height: 2, bitDepth: 16 }).data.length).toBe(32);
  });

  test("inputHasAlpha: false reads RGB input without shifting the pixels", () => {
    const rgb = new Uint8Array([10, 20, 30, 40, 50, 60]);
    const png = PNG.sync.write(
      { width: 2, height: 1, data: rgb },
      { inputHasAlpha: false },
    );

    expect([...PNG.sync.read(png).data]).toEqual([
      10, 20, 30, 255, 40, 50, 60, 255,
    ]);
  });

  test("bitblt rejects negative coordinates", () => {
    const src = new PNG({ width: 2, height: 2 });
    const dst = new PNG({ width: 2, height: 2 });

    expect(() => PNG.bitblt(src, dst, -1, 0, 1, 1, 0, 0)).toThrow(
      "bitblt reading outside image",
    );
    expect(() => src.bitblt(dst, 0, 0, 1, 1, -1, 0)).toThrow(
      "bitblt writing outside image",
    );
  });
});

describe("palette images (#225, #90)", () => {
  test("PNG.sync.write with colorType 3 writes a palette", () => {
    const png = PNG.sync.write(smallImage(), { colorType: 3 });
    const types = readChunks(png).map(([type]) => type);

    expect(types).toEqual(["IHDR", "PLTE", "tRNS", "IDAT", "IEND"]);
    expect(PNG.sync.read(png).depth).toBe(2);
    expect(PNG.sync.read(png).data).toEqual(
      PNG.sync.read(PNG.sync.write(smallImage())).data,
    );
  });

  test("palette writing fails with more than 256 colours", () => {
    expect(() => PNG.sync.write(gradient(32, 32), { colorType: 3 })).toThrow(
      /more than 256 colors/,
    );
  });
});

describe("metadata", () => {
  test("#383, #384: pHYs is read and written", () => {
    const physical = { x: 3780, y: 3780, unit: "meter" as const };
    const png = encode(gradient(2, 2), { physical });

    expect(decode(png).physical).toEqual(physical);
    expect(PNG.sync.read(png).physical).toEqual(physical);
  });

  test("#385: the image data can be split into several IDAT chunks", () => {
    const image = gradient(64, 64);
    const png = encode(image, { idatChunkSize: 1000 });
    const idats = readChunks(png).filter(([type]) => type === "IDAT");

    expect(idats.length).toBeGreaterThan(1);
    expect(idats.slice(0, -1).every(([, data]) => data.length === 1000)).toBe(
      true,
    );
    expect([...decode(png).data]).toEqual([...image.data]);
  });

  test("#115: text chunks are read and written", () => {
    const text = [
      { keyword: "Title", text: "Hello" },
      { keyword: "Comment", text: "A".repeat(500), compressed: true },
      { keyword: "Author", text: "Zoë 🎨" },
      {
        keyword: "Description",
        text: "Ein Bild",
        language: "de",
        translatedKeyword: "Beschreibung",
      },
    ];
    const png = encode(gradient(2, 2), { text });

    expect(readChunks(png).map(([type]) => type)).toContain("zTXt");
    expect(decode(png).text).toEqual([
      { keyword: "Title", text: "Hello" },
      { keyword: "Comment", text: "A".repeat(500), compressed: true },
      {
        keyword: "Author",
        text: "Zoë 🎨",
        compressed: false,
        language: "",
        translatedKeyword: "",
      },
      {
        keyword: "Description",
        text: "Ein Bild",
        compressed: false,
        language: "de",
        translatedKeyword: "Beschreibung",
      },
    ]);
  });
});
