import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import {
  decodeJpeg,
  JpegError,
  JpegFormatError,
  JpegLimitError,
  JpegUnsupportedError,
} from "../src/index.js";

const read = (path: string) =>
  new Uint8Array(readFileSync(new URL(path, import.meta.url)));
const corpus = (name: string) => read(`corpus/${name}`);
const fixture = (name: string) => read(`fixtures/${name}`);
const hex = (value: string) => Uint8Array.from(Buffer.from(value, "hex"));

/** Offsets and codes of the marker segments before the first SOS. */
function segments(data: Uint8Array) {
  const list: { code: number; start: number; end: number }[] = [];
  let offset = 2;

  while (offset < data.length && data[offset] === 0xff) {
    const code = data[offset + 1]!;
    const end = offset + 2 + ((data[offset + 2]! << 8) | data[offset + 3]!);

    list.push({ code, start: offset, end });

    if (code === 0xda) {
      break;
    }

    offset = end;
  }

  return list;
}

function concat(...parts: Uint8Array[]) {
  const out = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  let offset = 0;

  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }

  return out;
}

/** SOI and a baseline SOF with 3 components and the given sampling. */
function frameHeader(width: number, height: number, sampling = 0x11) {
  return Uint8Array.from([
    0xff,
    0xd8,
    0xff,
    0xc0,
    0,
    17,
    8,
    height >> 8,
    height & 0xff,
    width >> 8,
    width & 0xff,
    3,
    1,
    sampling,
    0,
    2,
    0x11,
    1,
    3,
    0x11,
    1,
  ]);
}

function expectSamePixels(a: Uint8Array, b: Uint8Array) {
  expect(a.length).toBe(b.length);
  expect(Buffer.compare(a, b)).toBe(0);
}

describe("crashes reported on jpeg-js", () => {
  // All of these threw TypeErrors from inside jpeg-js
  test.each([
    ["#63 (SOS before SOF)", "ffd8ffffffda"],
    ["#94 (SOS before SOF)", "ffd8ffdaffd863dada"],
    [
      "#95 (unknown component in SOS)",
      "ffd8ffffffc0d8e00080d8000600ffffffdad8ff7fefaad8",
    ],
    ["#112 (SOS before SOF)", "ffd8ffdaffff0001"],
    ["#112 (SOS before SOF, second case)", "ffd8ffdaff04aeff68"],
    [
      "#96 (fuzzed header)",
      "ffd8ffffffc2d88c2b008400e803ffda8c2b0000ffd8ffd9d8ef00000000b3d8",
    ],
    [
      "#97 (fuzzed header)",
      "ffd8ffffffc2d80500ff0500e803ffe8032bff000000ffda8c2b032b0000000000aad80fc876",
    ],
  ])("%s throws a JpegFormatError", (_, data) => {
    expect(() => decodeJpeg(hex(data))).toThrow(JpegFormatError);
  });

  test("#96: a missing quantization table throws a JpegFormatError", () => {
    expect(() =>
      decodeJpeg(fixture("issue-96-missing-dqt-valid-sampling.jpg")),
    ).toThrow(/Quantization table 0 is missing/);
  });

  test("#97: a missing Huffman table throws a JpegFormatError", () => {
    expect(() =>
      decodeJpeg(fixture("issue-97-missing-dht-valid-sampling.jpg")),
    ).toThrow(/Huffman table missing/);
  });

  test("#81: a progressive JPEG cut off between scans decodes", () => {
    const image = decodeJpeg(corpus("issues/issue-81-marker0.jpg"));

    expect(image.width).toBe(900);
    expect(image.height).toBe(1600);
  });

  test("#109: decodes (the error came from corrupted input)", () => {
    const image = decodeJpeg(corpus("issues/issue-109-markerf6c0.jpg"));

    expect(image.width).toBe(1184);
    expect(image.height).toBe(730);
  });

  test("#21: a short last restart interval in a non-interleaved scan", () => {
    const image = decodeJpeg(
      corpus("issues/issue-21-prog420-dri7-short-last-interval.jpg"),
    );

    expect(image.width).toBeGreaterThan(0);
  });

  test("#117: extra restart markers after the last interval", () => {
    const withRst = decodeJpeg(
      corpus("issues/issue-117-extra-trailing-rst.jpg"),
    );

    expect(withRst.width).toBeGreaterThan(0);
  });

  test("restart markers don't change the image", () => {
    expectSamePixels(
      decodeJpeg(corpus("jpeg-js/redbox-with-rst.jpg")).data,
      decodeJpeg(corpus("jpeg-js/redbox.jpg")).data,
    );
  });

  test("#115: an Adobe RGB JPEG isn't colour-transformed", () => {
    const data = corpus("jpeg-js/truecolor.jpg");
    const image = decodeJpeg(data);
    const forced = decodeJpeg(data, { colorTransform: false });

    expectSamePixels(image.data, forced.data);
    expect(
      Buffer.compare(
        image.data,
        decodeJpeg(data, { colorTransform: true }).data,
      ),
    ).not.toBe(0);
  });
});

describe("recovery from malformed JPEGs", () => {
  const original = corpus("libjpeg-turbo/testorig.jpg");
  const expected = decodeJpeg(original).data;

  test("a missing EOI marker", () => {
    const image = decodeJpeg(original.subarray(0, original.length - 2));

    expectSamePixels(image.data, expected);
  });

  test("junk between segments (Jimp #994)", () => {
    const app0 = segments(original)[0]!;
    const junk = Buffer.from(
      "IM\x04\x04\x00\x00\x00\x008BIM\x04%\xff\x00",
      "latin1",
    );
    const data = concat(
      original.subarray(0, app0.end),
      junk,
      original.subarray(app0.end),
    );

    expectSamePixels(decodeJpeg(data).data, expected);
    expect(() => decodeJpeg(data, { tolerantDecoding: false })).toThrow(
      JpegFormatError,
    );
  });

  test("a marker that lost its 0xFF (jpeg-js #84)", () => {
    const bad = corpus("jpeg-js/table-with-bad-e1.jpg");
    const good = bad.slice();

    // The fixed copy of the file has 0xFF at that offset
    good[0x4c] = 0xff;
    expectSamePixels(decodeJpeg(bad).data, decodeJpeg(good).data);
  });

  test("fill bytes before markers", () => {
    const image = decodeJpeg(corpus("jpeg-js/fillbytes.jpg"));

    expect(image.width).toBe(704);
  });

  test("trailing bytes after the image", () => {
    const data = concat(original, Uint8Array.from([1, 2, 3, 0xff, 0x00, 4]));

    expectSamePixels(decodeJpeg(data).data, expected);
  });

  test("Motion JPEG frames without Huffman tables", () => {
    // Drop the DHT segments: the standard tables are used, as cjpeg wrote
    const data = corpus("generated/b-420.jpg");
    const parts = [data.subarray(0, 2)];

    for (const { code, start, end } of segments(data)) {
      if (code === 0xda) {
        parts.push(data.subarray(start));
        break;
      }

      if (code !== 0xc4) {
        parts.push(data.subarray(start, end));
      }
    }

    expectSamePixels(decodeJpeg(concat(...parts)).data, decodeJpeg(data).data);
  });

  test("abbreviated JPEGs with separate tables (#85)", () => {
    const tables = [Uint8Array.from([0xff, 0xd8])];
    const image = [original.subarray(0, 2)];

    for (const { code, start, end } of segments(original)) {
      if (code === 0xda) {
        image.push(original.subarray(start));
        break;
      }

      (code === 0xdb || code === 0xc4 ? tables : image).push(
        original.subarray(start, end),
      );
    }

    tables.push(Uint8Array.from([0xff, 0xd9]));

    const abbreviated = concat(...image);

    expect(() => decodeJpeg(abbreviated)).toThrow(JpegFormatError);
    expectSamePixels(
      decodeJpeg(abbreviated, { tables: concat(...tables) }).data,
      expected,
    );
  });
});

describe("truncated JPEGs", () => {
  const original = corpus("libjpeg-turbo/testorig.jpg");

  test("throw a JpegFormatError", () => {
    expect(() => decodeJpeg(original.subarray(0, original.length / 2))).toThrow(
      /truncated/,
    );
    expect(() =>
      decodeJpeg(fixture("issue-81-truncated-midscan-baseline.jpg")),
    ).toThrow(/truncated/);
    expect(() =>
      decodeJpeg(fixture("issue-81-truncated-midscan-progressive.jpg")),
    ).toThrow(/truncated/);
  });

  test("decode with allowTruncated, like browsers show them", () => {
    const image = decodeJpeg(original.subarray(0, original.length / 2), {
      allowTruncated: true,
    });

    expect(image.width).toBe(227);
    expect(image.height).toBe(149);

    for (const name of [
      "issue-81-truncated-midscan-baseline.jpg",
      "issue-81-truncated-midscan-progressive.jpg",
    ]) {
      expect(decodeJpeg(fixture(name), { allowTruncated: true }).width).toBe(
        203,
      );
    }
  });

  test("decode when only a few bits of the last row are missing", () => {
    // Drop EOI and the last 2 bytes of image data
    const image = decodeJpeg(original.subarray(0, original.length - 4));

    expect(image.width).toBe(227);
  });

  test("only garbage after SOI", () => {
    const data = concat(
      Uint8Array.from([0xff, 0xd8]),
      new Uint8Array(1000).fill(0x42),
    );

    expect(() => decodeJpeg(data)).toThrow(JpegFormatError);
  });

  test("a tiny file claiming a huge image fails before allocating it", () => {
    // 65000x65000 pixels and a scan of a few bytes
    const data = corpus("generated/b-420-8x8.jpg").slice();
    const sof = segments(data).find((s) => s.code === 0xc0)!;

    data[sof.start + 5] = 0xfd;
    data[sof.start + 6] = 0xe8;
    data[sof.start + 7] = 0xfd;
    data[sof.start + 8] = 0xe8;

    const start = performance.now();

    expect(() =>
      decodeJpeg(data, {
        maxResolutionInMP: Infinity,
        maxMemoryUsageInMB: Infinity,
      }),
    ).toThrow(/truncated/);
    expect(performance.now() - start).toBeLessThan(1000);
  });
});

describe("limits", () => {
  test("maxResolutionInMP (jpeg-js #53)", () => {
    expect(() => decodeJpeg(frameHeader(65000, 60000))).toThrow(
      "maxResolutionInMP limit exceeded by 3800MP",
    );
    expect(() =>
      decodeJpeg(frameHeader(2000, 1000), { maxResolutionInMP: 1 }),
    ).toThrow("maxResolutionInMP limit exceeded by 1MP");
  });

  test("maxMemoryUsageInMB", () => {
    expect(() =>
      decodeJpeg(frameHeader(20000, 20000), { maxResolutionInMP: 500 }),
    ).toThrow(/maxMemoryUsageInMB limit exceeded by at least \d+MB/);

    expect(() =>
      decodeJpeg(corpus("jpeg-js/grumpycat.jpg"), { maxMemoryUsageInMB: 0.1 }),
    ).toThrow(JpegLimitError);
    // The limit is per decode
    expect(() => decodeJpeg(corpus("jpeg-js/grumpycat.jpg"))).not.toThrow();
  });

  test("a large image within the limits", () => {
    const image = decodeJpeg(corpus("jpeg-js/black-6000x6000.jpg"));

    expect(image.width).toBe(6000);
    expect(image.height).toBe(6000);
  });

  test("invalid sampling factors (jpeg-js #105)", () => {
    expect(() => decodeJpeg(frameHeader(16, 16, 0x01))).toThrow(
      "Invalid sampling factor, expected values above 0",
    );
    expect(() => decodeJpeg(frameHeader(16, 16, 0x51))).toThrow(
      JpegFormatError,
    );
  });
});

describe("errors", () => {
  test("are JpegError subclasses with a name", () => {
    const cases: [Uint8Array, typeof JpegError][] = [
      [Uint8Array.from([1, 2, 3]), JpegFormatError],
      [corpus("generated/unsupported-lossless.jpg"), JpegUnsupportedError],
      [frameHeader(65000, 60000), JpegLimitError],
    ];

    for (const [data, type] of cases) {
      try {
        decodeJpeg(data);
        expect.unreachable();
      } catch (error) {
        expect(error).toBeInstanceOf(type);
        expect(error).toBeInstanceOf(JpegError);
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe(type.name);
      }
    }
  });

  test("tolerantDecoding: false rejects corrupt data", () => {
    expect(() =>
      decodeJpeg(corpus("jpeg-js/table-with-bad-e1.jpg"), {
        tolerantDecoding: false,
      }),
    ).toThrow(JpegFormatError);
  });
});

describe("fuzzing", () => {
  // Small JPEGs of every kind the decoder supports
  const seeds = [
    "generated/b-420.jpg",
    "generated/p-420.jpg",
    "generated/b-mixed.jpg",
    "generated/p-411.jpg",
    "generated/b-restart7b.jpg",
    "generated/p-restart1.jpg",
    "generated/b-12bit.jpg",
    "generated/p-12bit-grey.jpg",
    "generated/b-non-interleaved-restart.jpg",
    "generated/b-16bit-dqt.jpg",
    "generated/ycck-progressive.jpg",
    "generated/p-420-17x17.jpg",
    "jpeg-js/cmyktest.jpg",
    "pdfjs/cmykjpeg-1.jpg",
    "pdfjs/issue7406-1.jpg",
  ].map((name) => corpus(name));

  /** xorshift32, so every run tests the same inputs. */
  function random(seed: number) {
    let state = seed;

    return (max: number) => {
      state ^= state << 13;
      state >>>= 0;
      state ^= state >>> 17;
      state ^= state << 5;
      state >>>= 0;

      return Math.floor((state / 4294967296) * max);
    };
  }

  function mutate(data: Uint8Array, next: (max: number) => number) {
    let out = data.slice();
    const count = 1 + next(8);

    switch (next(6)) {
      case 0: // Flip bits anywhere
        for (let i = 0; i < count; i++) {
          const at = next(out.length);

          out[at] = out[at]! ^ (1 << next(8));
        }

        break;
      case 1: // Random bytes anywhere
        for (let i = 0; i < count; i++) {
          out[next(out.length)] = next(256);
        }

        break;
      case 2: // Truncate
        out = out.subarray(0, next(out.length));
        break;
      case 3: // Interesting bytes in the headers
        for (let i = 0; i < count; i++) {
          out[next(Math.min(700, out.length))] = [0, 1, 0x7f, 0x80, 0xfe, 0xff][
            next(6)
          ]!;
        }

        break;
      case 4: {
        // Repeat a chunk
        const start = next(out.length);
        const end = Math.min(out.length, start + next(200));

        out = concat(out.subarray(0, end), out.subarray(start));
        break;
      }
      default: {
        // Insert a marker
        const at = next(out.length);

        out = concat(
          out.subarray(0, at),
          Uint8Array.from([0xff, next(256)]),
          out.subarray(at),
        );
      }
    }

    return out;
  }

  test("mutated JPEGs decode or throw a JpegError, quickly", () => {
    const next = random(0x5eed);
    const results = { decoded: 0, rejected: 0 };
    let slowest = 0;

    for (let i = 0; i < 4000; i++) {
      const data = mutate(seeds[next(seeds.length)]!, next);
      const options = {
        tolerantDecoding: next(5) > 0,
        allowTruncated: next(3) === 0,
        maxResolutionInMP: 16,
        maxMemoryUsageInMB: 256,
      };
      const start = performance.now();

      try {
        decodeJpeg(data, options);
        results.decoded++;
      } catch (error) {
        // "Failed to decode JPEG" wraps errors that aren't JpegErrors
        if (
          !(error instanceof JpegError) ||
          error.message.startsWith("Failed to decode JPEG")
        ) {
          throw new Error(
            `Mutation ${i} (${Buffer.from(data).toString("base64")}) threw ${String(error)}`,
            { cause: error },
          );
        }

        results.rejected++;
      }

      slowest = Math.max(slowest, performance.now() - start);
    }

    expect(results.decoded).toBeGreaterThan(500);
    expect(results.rejected).toBeGreaterThan(500);
    expect(slowest).toBeLessThan(2000);
  }, 120_000);
});
