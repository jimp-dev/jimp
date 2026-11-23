import { Buffer } from "buffer";
import { describe, expect, test } from "vitest";

import {
  colorSpaceFromProfile,
  convertColor,
  createColorConverter,
  cssColorToHex,
  DISPLAY_P3,
  DISPLAY_P3_PROFILE,
  SRGB,
} from "./index.js";

/** A minimal RGB matrix/TRC ICC profile */
function makeProfile(columns: number[][], curve: Buffer) {
  const s15 = (v: number) => {
    const b = Buffer.alloc(4);
    b.writeInt32BE(Math.round(v * 65536));
    return b;
  };
  const xyz = (values: number[]) =>
    Buffer.concat([Buffer.from("XYZ \0\0\0\0", "latin1"), ...values.map(s15)]);
  const tags: [string, Buffer][] = [
    ["rXYZ", xyz(columns[0]!)],
    ["gXYZ", xyz(columns[1]!)],
    ["bXYZ", xyz(columns[2]!)],
    ["rTRC", curve],
    ["gTRC", curve],
    ["bTRC", curve],
  ];
  const table = Buffer.alloc(4 + tags.length * 12);
  const data: Buffer[] = [];
  let offset = 128 + table.length;

  table.writeUInt32BE(tags.length, 0);
  tags.forEach(([signature, body], i) => {
    const padded = Buffer.concat([
      body,
      Buffer.alloc((4 - (body.length % 4)) % 4),
    ]);
    table.write(signature, 4 + i * 12, "latin1");
    table.writeUInt32BE(offset, 8 + i * 12);
    table.writeUInt32BE(body.length, 12 + i * 12);
    data.push(padded);
    offset += padded.length;
  });

  const header = Buffer.alloc(128);
  header.writeUInt32BE(offset, 0);
  header.write("mntrRGB XYZ ", 12, "latin1");
  header.write("acsp", 36, "latin1");

  return Buffer.concat([header, table, ...data]);
}

/** A `curv` tag with a single gamma value */
function gammaCurve(gamma: number) {
  const curve = Buffer.from("curv\0\0\0\0\0\0\0\x01\0\0", "latin1");
  curve.writeUInt16BE(Math.round(gamma * 256), 12);
  return curve;
}

// Adobe RGB (1998): D50-adapted colorants and a gamma of 563/256
const adobeRgb = makeProfile(
  [
    [0.6097, 0.3111, 0.0195],
    [0.2053, 0.6257, 0.0609],
    [0.1492, 0.0632, 0.7446],
  ],
  gammaCurve(563 / 256),
);

const to255 = (rgb: number[]) => rgb.map((v) => Math.round(v * 255));

describe("colour spaces", () => {
  test("builds the ICC D50 matrices for sRGB and Display P3", () => {
    // The sRGB matrix ICC profiles use, e.g. sRGB IEC61966-2.1
    const expected = [
      [0.4361, 0.3851, 0.1431],
      [0.2225, 0.7169, 0.0606],
      [0.0139, 0.0971, 0.7141],
    ];

    SRGB.toXyz!.forEach((row, i) =>
      row.forEach((v, j) => expect(v).toBeCloseTo(expected[i]![j]!, 3)),
    );
    expect(DISPLAY_P3.toXyz![0]![0]).toBeCloseTo(0.5151, 3);
  });

  test("recognises sRGB and Display P3 profiles", () => {
    expect(colorSpaceFromProfile(undefined)).toBe(SRGB);
    expect(colorSpaceFromProfile(DISPLAY_P3_PROFILE)).toBe(DISPLAY_P3);

    const custom = colorSpaceFromProfile(adobeRgb);

    expect(custom.name).toBe("custom");
    expect(custom.toXyz).toBeDefined();
  });

  test("can't convert profiles it doesn't understand", () => {
    const broken = colorSpaceFromProfile(Buffer.from("not a profile"));
    const cmyk = Buffer.from(DISPLAY_P3_PROFILE);
    cmyk.write("CMYK", 16, "latin1");

    expect(broken).toEqual({ name: "custom" });
    expect(colorSpaceFromProfile(cmyk)).toEqual({ name: "custom" });
    expect(createColorConverter(broken, SRGB)).toBeUndefined();
    expect(convertColor([1, 0, 0], broken, SRGB)).toEqual([1, 0, 0]);
  });

  test("converts colours between spaces", () => {
    // The values CSS gives color(srgb 1 0 0) in display-p3
    expect(to255(convertColor([1, 0, 0], SRGB, DISPLAY_P3))).toEqual([
      234, 51, 35,
    ]);
    // Display P3 red is outside sRGB, so it's clipped
    expect(to255(convertColor([1, 0, 0], DISPLAY_P3, SRGB))).toEqual([
      255, 0, 0,
    ]);
    // White and grays are the same in every space with a D65 white point
    expect(to255(convertColor([1, 1, 1], SRGB, DISPLAY_P3))).toEqual([
      255, 255, 255,
    ]);

    const gray = to255(
      convertColor([0.5, 0.5, 0.5], SRGB, colorSpaceFromProfile(adobeRgb)),
    );

    // The rounded colorants add up to D50 give or take 0.0001
    expect(Math.max(...gray) - Math.min(...gray)).toBeLessThanOrEqual(1);
  });

  test("converts pixel data like it converts colours", () => {
    const colors = [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [12, 200, 90],
      [128, 128, 128],
      [3, 1, 250],
      [0, 0, 0],
      [255, 255, 255],
    ];
    const data = Buffer.from(colors.flatMap((c) => [...c, 77]));

    for (const [from, to] of [
      [SRGB, DISPLAY_P3],
      [DISPLAY_P3, SRGB],
      [colorSpaceFromProfile(adobeRgb), DISPLAY_P3],
    ] as const) {
      const converted = Buffer.from(data);

      createColorConverter(from, to)!(converted);

      colors.forEach((color, i) => {
        const expected = to255(
          convertColor(
            color.map((v) => v / 255) as [number, number, number],
            from,
            to,
          ),
        );

        for (let c = 0; c < 3; c++) {
          expect(
            Math.abs(converted[i * 4 + c]! - expected[c]!),
          ).toBeLessThanOrEqual(1);
        }

        // Alpha is left alone
        expect(converted[i * 4 + 3]).toBe(77);
      });
    }
  });

  test("doesn't convert between the same space", () => {
    expect(createColorConverter(SRGB, SRGB)).toBeUndefined();
    expect(
      createColorConverter(
        colorSpaceFromProfile(DISPLAY_P3_PROFILE),
        DISPLAY_P3,
      ),
    ).toBeUndefined();
  });
});

describe("cssColorToHex", () => {
  test("returns sRGB colors as before", () => {
    expect(cssColorToHex("#ff0000")).toBe(0xff0000ff);
    expect(cssColorToHex("rgba(255, 0, 0, 0.5)")).toBe(0xff000080);
    expect(cssColorToHex("red", SRGB)).toBe(0xff0000ff);
    expect(cssColorToHex(0x12345678, DISPLAY_P3)).toBe(0x12345678);
  });

  test("converts sRGB colors to the image's colour space", () => {
    expect(cssColorToHex("#ff0000", DISPLAY_P3)).toBe(0xea3323ff);
    expect(cssColorToHex("rgba(255, 0, 0, 0.5)", DISPLAY_P3)).toBe(0xea332380);
    expect(cssColorToHex("white", DISPLAY_P3)).toBe(0xffffffff);
  });

  test("reads color(display-p3 ...) and color(srgb ...)", () => {
    expect(cssColorToHex("color(display-p3 1 0 0)", DISPLAY_P3)).toBe(
      0xff0000ff,
    );
    // Clipped to sRGB
    expect(cssColorToHex("color(display-p3 1 0 0)")).toBe(0xff0000ff);
    expect(cssColorToHex("color(srgb 1 0 0)", DISPLAY_P3)).toBe(0xea3323ff);
    expect(cssColorToHex("color(srgb 100% 50% 0% / 50%)")).toBe(0xff800080);
    expect(cssColorToHex("COLOR(Display-P3 0 0 0 / 0.25)")).toBe(0x00000040);
  });

  test("throws for invalid colors", () => {
    expect(() => cssColorToHex("notacolor")).toThrow(
      'Invalid color "notacolor"',
    );
    expect(() => cssColorToHex("notacolor", DISPLAY_P3)).toThrow(
      'Invalid color "notacolor"',
    );
    expect(() => cssColorToHex("")).toThrow('Invalid color ""');
    expect(() => cssColorToHex("color(rec2020 1 0 0)")).toThrow(
      'Invalid color "color(rec2020 1 0 0)"',
    );
    expect(() => cssColorToHex("color(display-p3 foo 0 0)")).toThrow(
      'Invalid color "color(display-p3 foo 0 0)": bad channel "foo"',
    );
  });
});
