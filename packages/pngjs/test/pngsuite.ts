import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { expect, test } from "vitest";

import { PNG, decode, encode } from "../src/index.js";

const dir = new URL("./pngsuite/", import.meta.url);

export const images = readdirSync(dir).filter((name) => name.endsWith(".png"));
export const validImages = images.filter((name) => !name.startsWith("x"));
export const corruptImages = images.filter((name) => name.startsWith("x"));

export function readImage(name: string) {
  return new Uint8Array(readFileSync(new URL(name, dir)));
}

/** The 16-bit RGBA reference pixels, see scripts/generate-pngsuite-reference.mjs */
export function readReference(name: string) {
  const data = gunzipSync(
    readFileSync(
      new URL(`reference/${name.replace(/\.png$/, ".rgba16.gz")}`, dir),
    ),
  );
  const samples = new Uint16Array(data.length / 2);

  for (let i = 0; i < samples.length; i++) {
    samples[i] = data.readUInt16BE(i * 2);
  }

  return samples;
}

/** Counts the samples that differ, so failures say how wrong an image is */
function countDifferences(
  actual: ArrayLike<number>,
  expected: ArrayLike<number>,
) {
  if (actual.length !== expected.length) {
    return `length ${actual.length}, expected ${expected.length}`;
  }

  let count = 0;

  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      count++;
    }
  }

  return count;
}

/** The conformance tests, run once per zlib backend */
export function testPngSuite() {
  test.each(validImages)("decodes %s", (name) => {
    const data = readImage(name);
    const reference = readReference(name);
    const reference8 = reference.map((v) => Math.round(v / 257));

    expect(
      countDifferences(decode(data, { outputDepth: 16 }).data, reference),
    ).toBe(0);
    expect(countDifferences(decode(data).data, reference8)).toBe(0);
    expect(countDifferences(PNG.sync.read(data).data, reference8)).toBe(0);
  });

  test.each(validImages)("round-trips %s", (name) => {
    const image = decode(readImage(name));
    const image16 = decode(readImage(name), { outputDepth: 16 });
    const expected = [...image.data];

    expect([...decode(encode(image)).data]).toEqual(expected);
    expect([...decode(encode(image, { interlace: true })).data]).toEqual(
      expected,
    );
    expect([...PNG.sync.read(PNG.sync.write(image)).data]).toEqual(expected);
    expect([
      ...decode(encode(image16), { outputDepth: 16 }).data,
    ]).toEqual([...image16.data]);
  });

  test.each(corruptImages)("rejects %s with an Error", (name) => {
    const data = readImage(name);
    let error: unknown;

    try {
      decode(data);
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).constructor).toBe(Error);
    expect((error as Error).message).toMatchSnapshot();
  });
}
