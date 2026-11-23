import { describe, expect, test } from "vitest";
import { readFile } from "node:fs/promises";
import { inflateSync } from "node:zlib";

import { Jimp } from "./index.js";

const images = __dirname + "/images/icc-profile/";

// See images/icc-profile/README.md
const displayP3 = readFile(images + "display-p3.icc");
// Over 64 KB, so it's split over two APP2 segments
const displayP3Sampled = readFile(images + "display-p3-sampled.icc");

interface JpegSegment {
  marker: number;
  start: number;
  end: number;
}

/** Lists the JPEG segments before the start of scan */
function jpegSegments(jpeg: Buffer) {
  const segments: JpegSegment[] = [];
  let offset = 2;

  while (jpeg[offset + 1] !== 0xda) {
    const end = offset + 2 + jpeg.readUInt16BE(offset + 2);
    segments.push({ marker: jpeg[offset + 1]!, start: offset, end });
    offset = end;
  }

  return segments;
}

function iccSegments(jpeg: Buffer) {
  return jpegSegments(jpeg).filter(
    ({ marker, start }) =>
      marker === 0xe2 &&
      jpeg.toString("latin1", start + 4, start + 16) === "ICC_PROFILE\0",
  );
}

/** The ICC profile in a JPEG's APP2 segments, in sequence number order */
function jpegProfile(jpeg: Buffer) {
  const segments = iccSegments(jpeg);

  if (!segments.length) {
    return undefined;
  }

  return Buffer.concat(
    segments
      .map(({ start, end }) => ({
        sequence: jpeg[start + 16]!,
        count: jpeg[start + 17]!,
        data: jpeg.subarray(start + 18, end),
      }))
      .sort((a, b) => a.sequence - b.sequence)
      .map(({ data, count }) => {
        expect(count).toBe(segments.length);
        return data;
      }),
  );
}

/** Lists the PNG chunk types */
function pngChunks(png: Buffer) {
  const chunks: { type: string; data: Buffer }[] = [];
  let offset = 8;

  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    chunks.push({
      type: png.toString("latin1", offset + 4, offset + 8),
      data: png.subarray(offset + 8, offset + 8 + length),
    });
    offset += 12 + length;
  }

  return chunks;
}

/** The ICC profile in a PNG's iCCP chunk */
function pngProfile(png: Buffer) {
  const iccp = pngChunks(png).find(({ type }) => type === "iCCP");

  if (!iccp) {
    return undefined;
  }

  const nameEnd = iccp.data.indexOf(0);

  expect(iccp.data[nameEnd + 1]).toBe(0);
  return inflateSync(iccp.data.subarray(nameEnd + 2));
}

describe("ICC profile", () => {
  test("keeps a profile split over several JPEG segments", async () => {
    const image = await Jimp.read(images + "p3-two-segments.jpg");
    image.resize({ w: 32 });

    const output = await image.getBuffer("image/jpeg");

    expect(iccSegments(output)).toHaveLength(2);
    expect(jpegProfile(output)).toEqual(await displayP3Sampled);
    expect(output.length).toBeGreaterThan((await displayP3Sampled).length);

    const reread = await Jimp.read(output);

    expect(reread.width).toBe(32);
    expect(jpegProfile(await reread.getBuffer("image/jpeg"))).toEqual(
      await displayP3Sampled,
    );
  });

  test("keeps the profile of a PNG", async () => {
    const image = await Jimp.read(images + "p3.png");
    image.resize({ w: 32 });

    const output = await image.getBuffer("image/png");
    const chunks = pngChunks(output).map(({ type }) => type);

    expect(chunks.slice(0, 2)).toEqual(["IHDR", "iCCP"]);
    expect(chunks).not.toContain("sRGB");
    expect(pngProfile(output)).toEqual(await displayP3);

    // pngjs checks the CRC of every chunk
    const reread = await Jimp.read(output);

    expect(reread.width).toBe(32);
    expect(pngProfile(await reread.getBuffer("image/png"))).toEqual(
      await displayP3,
    );
  });

  test("converts between the JPEG and PNG containers", async () => {
    const jpeg = await Jimp.read(images + "p3-two-segments.jpg");
    const png = await Jimp.read(await jpeg.getBuffer("image/png"));

    expect(pngProfile(await png.getBuffer("image/png"))).toEqual(
      await displayP3Sampled,
    );

    const fromPng = await Jimp.read(images + "p3.png");

    expect(jpegProfile(await fromPng.getBuffer("image/jpeg"))).toEqual(
      await displayP3,
    );
  });

  test("leaves the profile out with icc: false", async () => {
    const jpeg = await Jimp.read(images + "p3-two-segments.jpg");
    const png = await Jimp.read(images + "p3.png");

    expect(
      jpegProfile(await jpeg.getBuffer("image/jpeg", { icc: false })),
    ).toBeUndefined();
    expect(
      pngProfile(await png.getBuffer("image/png", { icc: false })),
    ).toBeUndefined();
  });

  test("writes no profile for images without one", async () => {
    const image = new Jimp({ width: 4, height: 4, color: 0xff0000ff });

    expect(jpegProfile(await image.getBuffer("image/jpeg"))).toBeUndefined();
    expect(pngProfile(await image.getBuffer("image/png"))).toBeUndefined();
  });

  test("clone() copies the profile", async () => {
    const image = await Jimp.read(images + "p3.png");
    const clone = image.clone();

    expect(pngProfile(await clone.getBuffer("image/png"))).toEqual(
      await displayP3,
    );
  });

  test("writes the profile after the EXIF data", async () => {
    // Canon_240dpi_6.jpg with a Display P3 profile
    const image = await Jimp.read(images + "Canon_240dpi_6_p3.jpg");
    const output = await image.getBuffer("image/jpeg", { exif: true });
    const markers = jpegSegments(output).map(({ marker }) => marker);

    expect(markers.slice(0, 3)).toEqual([0xe0, 0xe1, 0xe2]);
    expect(jpegProfile(output)).toEqual(await displayP3);

    const reread = await Jimp.read(output);
    const { tags } = (
      reread as unknown as {
        _exif: { tags: Record<string, unknown> };
      }
    )._exif;

    expect(tags).toMatchObject({ Make: "Canon", Orientation: 1 });
    expect(reread.width).toBe(200);
    expect(jpegProfile(await reread.getBuffer("image/jpeg"))).toEqual(
      await displayP3,
    );
  });

  test("ignores a JPEG profile with a missing segment", async () => {
    const input = await readFile(images + "p3-two-segments.jpg");
    const [, second] = iccSegments(input);
    const truncated = Buffer.concat([
      input.subarray(0, second!.start),
      input.subarray(second!.end),
    ]);
    const image = await Jimp.read(truncated);

    expect(jpegProfile(await image.getBuffer("image/jpeg"))).toBeUndefined();
  });

  test("leaves an RGB profile out of a grayscale PNG", async () => {
    const image = await Jimp.read(images + "p3.png");
    image.greyscale();

    const output = await image.getBuffer("image/png");

    // The PNG encoder picks a grayscale colour type, which an RGB profile
    // can't describe
    expect(output[25]).toBe(0);
    expect(pngProfile(output)).toBeUndefined();
  });
});
