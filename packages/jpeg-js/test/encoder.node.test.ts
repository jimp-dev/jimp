import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import {
  decodeJpeg,
  encodeJpeg,
  type EncodeJpegOptions,
} from "../src/index.js";

const photo = decodeJpeg(
  readFileSync(new URL("corpus/libjpeg-turbo/testorig.jpg", import.meta.url)),
);

/** Peak signal-to-noise ratio of the RGB channels, in dB. */
function psnr(a: Uint8Array, b: Uint8Array) {
  let sum = 0;
  let count = 0;

  for (let i = 0; i < a.length; i++) {
    if (i % 4 !== 3) {
      sum += (a[i]! - b[i]!) ** 2;
      count++;
    }
  }

  return 10 * Math.log10((255 * 255) / (sum / count));
}

/** The marker segments before the first scan. */
function segments(data: Uint8Array) {
  const list: { code: number; data: Uint8Array }[] = [];
  let offset = 2;

  while (offset < data.length) {
    const code = data[offset + 1]!;
    const end = offset + 2 + ((data[offset + 2]! << 8) | data[offset + 3]!);

    list.push({ code, data: data.subarray(offset + 4, end) });

    if (code === 0xda) {
      break;
    }

    offset = end;
  }

  return list;
}

/** Sampling factors of each component, e.g. ["2x2", "1x1", "1x1"]. */
function sampling(data: Uint8Array) {
  const sof = segments(data).find((s) => s.code === 0xc0 || s.code === 0xc2)!;
  const count = sof.data[5]!;

  return Array.from({ length: count }, (_, i) => {
    const factors = sof.data[7 + i * 3]!;

    return `${factors >> 4}x${factors & 15}`;
  });
}

function encodeDecode(
  image: { width: number; height: number; data: Uint8Array },
  options: EncodeJpegOptions,
) {
  const encoded = encodeJpeg(image, options);

  return { encoded, decoded: decodeJpeg(encoded, { tolerantDecoding: false }) };
}

describe("encoder", () => {
  test("writes a JFIF header first", () => {
    const data = encodeJpeg(photo);
    const [app0] = segments(data);

    expect([...data.subarray(0, 2)]).toEqual([0xff, 0xd8]);
    expect(app0!.code).toBe(0xe0);
    expect(Buffer.from(app0!.data.subarray(0, 5)).toString("latin1")).toBe(
      "JFIF\0",
    );
    expect([...data.subarray(data.length - 2)]).toEqual([0xff, 0xd9]);
  });

  test("subsamples the chroma below quality 90", () => {
    expect(sampling(encodeJpeg(photo, { quality: 89 }))).toEqual([
      "2x2",
      "1x1",
      "1x1",
    ]);
    expect(sampling(encodeJpeg(photo, { quality: 90 }))).toEqual([
      "1x1",
      "1x1",
      "1x1",
    ]);
    expect(
      sampling(encodeJpeg(photo, { quality: 50, chromaSubsampling: "4:2:2" })),
    ).toEqual(["2x1", "1x1", "1x1"]);
    expect(
      sampling(encodeJpeg(photo, { quality: 95, chromaSubsampling: "4:2:0" })),
    ).toEqual(["2x2", "1x1", "1x1"]);
  });

  test.each([10, 50, 75, 90, 100])(
    "quality %i: optimized, standard and progressive Huffman coding give the same pixels",
    (quality) => {
      for (const chromaSubsampling of ["4:4:4", "4:2:2", "4:2:0"] as const) {
        const options = { quality, chromaSubsampling };
        const optimized = encodeDecode(photo, options);
        const standard = encodeDecode(photo, {
          ...options,
          optimizeHuffman: false,
        });
        const progressive = encodeDecode(photo, {
          ...options,
          progressive: true,
        });

        expect(optimized.encoded.length).toBeLessThan(standard.encoded.length);
        expect(optimized.decoded.data).toEqual(standard.decoded.data);
        expect(progressive.decoded.data).toEqual(standard.decoded.data);
      }
    },
  );

  test("quality trades size for fidelity", () => {
    let lastSize = 0;
    let lastPsnr = 0;

    for (const quality of [10, 30, 50, 70, 90, 100]) {
      const { encoded, decoded } = encodeDecode(photo, { quality });
      const fidelity = psnr(photo.data, decoded.data);

      expect(encoded.length).toBeGreaterThan(lastSize);
      expect(fidelity).toBeGreaterThan(lastPsnr);
      lastSize = encoded.length;
      lastPsnr = fidelity;
    }

    expect(lastPsnr).toBeGreaterThan(45);
  });

  test("encodes greyscale and RGB input", () => {
    const pixels = photo.width * photo.height;
    const grey = new Uint8Array(pixels);
    const rgb = new Uint8Array(pixels * 3);

    for (let i = 0; i < pixels; i++) {
      grey[i] = photo.data[i * 4 + 1]!;
      rgb.set(photo.data.subarray(i * 4, i * 4 + 3), i * 3);
    }

    const size = { width: photo.width, height: photo.height };
    const greyJpeg = encodeJpeg({ ...size, data: grey }, { quality: 90 });

    expect(sampling(greyJpeg)).toEqual(["1x1"]);
    expect(decodeJpeg(greyJpeg).data[1]).toBeCloseTo(grey[0]!, -1);
    expect(encodeJpeg({ ...size, data: rgb })).toEqual(encodeJpeg(photo));
  });

  test.each([
    "1x1",
    "2x2",
    "3x5",
    "7x9",
    "8x8",
    "9x9",
    "16x16",
    "17x17",
    "33x7",
  ])("encodes %s images in every mode", (size) => {
    const [width, height] = size.split("x").map(Number) as [number, number];
    const data = new Uint8Array(width * height * 4);

    for (let i = 0; i < data.length; i++) {
      data[i] = (i * 37) % 256;
    }

    for (const chromaSubsampling of ["4:4:4", "4:2:2", "4:2:0"] as const) {
      for (const progressive of [false, true]) {
        const { decoded } = encodeDecode(
          { width, height, data },
          { chromaSubsampling, progressive, quality: 80 },
        );

        expect(decoded.width).toBe(width);
        expect(decoded.height).toBe(height);
      }
    }
  });

  test("writes comments and EXIF after the JFIF header", () => {
    const exif = Buffer.from("MM\0*\0\0\0\x08\0\0", "latin1");
    const data = encodeJpeg(photo, { comments: ["hello"], exif });
    const list = segments(data);

    expect(list.map((s) => s.code).slice(0, 3)).toEqual([0xe0, 0xfe, 0xe1]);
    expect(decodeJpeg(data).comments).toEqual(["hello"]);
    // "Exif\0" is added in front, and the decoder returns what follows it
    expect(decodeJpeg(data).exifBuffer).toEqual(Uint8Array.from(exif));
  });

  test("rejects input it can't encode (jpeg-js #37)", () => {
    const data = new Uint8Array(16);

    expect(() => encodeJpeg({ width: 0, height: 2, data })).toThrow(RangeError);
    expect(() => encodeJpeg({ width: 1.5, height: 2, data })).toThrow(
      RangeError,
    );
    expect(() => encodeJpeg({ width: 70000, height: 1, data })).toThrow(
      RangeError,
    );
    expect(() => encodeJpeg({ width: 4, height: 4, data })).not.toThrow();
    expect(() => encodeJpeg({ width: 5, height: 4, data })).toThrow(RangeError);
    expect(() =>
      encodeJpeg({ width: 4, height: 4, data }, { quality: Number.NaN }),
    ).toThrow(TypeError);
    expect(() =>
      encodeJpeg(
        { width: 4, height: 4, data },
        { chromaSubsampling: "4:1:1" as "4:2:0" },
      ),
    ).toThrow(RangeError);
    expect(() =>
      encodeJpeg({
        width: 4,
        height: 4,
        data: "hello" as unknown as Uint8Array,
      }),
    ).toThrow(TypeError);
  });
});
