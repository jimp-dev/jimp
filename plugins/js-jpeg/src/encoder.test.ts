import { expect, test, describe } from "vitest";

import { buildHuffmanTable } from "./encoder.js";

function check(frequencies: Uint32Array) {
  const table = buildHuffmanTable(frequencies);
  const used = frequencies.filter((f) => f > 0).length;
  let kraft = 0;

  expect(table.counts).toHaveLength(16);
  expect(table.symbols).toHaveLength(used);

  for (const symbol of table.symbols) {
    const length = table.lengths[symbol]!;

    expect(frequencies[symbol]).toBeGreaterThan(0);
    expect(length).toBeGreaterThanOrEqual(1);
    expect(length).toBeLessThanOrEqual(16);
    // No code is all ones.
    expect(table.codes[symbol]).not.toBe(2 ** length - 1);

    kraft += 2 ** -length;
  }

  // Room is left for the code point that was reserved.
  expect(kraft).toBeLessThan(1);

  return table;
}

describe("buildHuffmanTable", () => {
  test("single symbol", () => {
    const frequencies = new Uint32Array(256);
    frequencies[0] = 100;

    const table = check(frequencies);

    expect(table.lengths[0]).toBe(1);
  });

  test("more frequent symbols get shorter codes", () => {
    const frequencies = new Uint32Array(256);
    frequencies[0x00] = 1000;
    frequencies[0x01] = 100;
    frequencies[0x11] = 10;
    frequencies[0xf0] = 1;

    const table = check(frequencies);

    expect(table.lengths[0x00]).toBeLessThan(table.lengths[0x01]!);
    expect(table.lengths[0x01]).toBeLessThan(table.lengths[0x11]!);
  });

  test("limits codes to 16 bits", () => {
    // Fibonacci frequencies give the deepest possible tree.
    const frequencies = new Uint32Array(256);
    let a = 1;
    let b = 1;

    for (let i = 0; i < 40; i++) {
      frequencies[i] = a;
      [a, b] = [b, Math.min(a + b, 2 ** 31)];
    }

    check(frequencies);
  });

  test("all symbols", () => {
    check(new Uint32Array(256).map((_, i) => 1 + ((i * 7919) % 1000)));
  });
});
