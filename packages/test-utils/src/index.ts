import { expect } from "vitest";
import { Bitmap } from "@jimp/types";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hashForEach<Hash extends Record<string, any>>(
  hash: Hash,
  func: (key: keyof Hash, value: Hash[keyof Hash]) => void
) {
  for (const key in hash)
    if (key in hash) {
      func(key, hash[key]);
    }
}

function throwUndefinedChar(char: string) {
  const cList: string[] = [];

  hashForEach(colors, (k, c) => {
    cList.push(k + "=" + c.toString(16).padStart(8, "0"));
  });

  throw new Error(
    'The char "' +
      char +
      '" do not defines a color. ' +
      "This are the valid chars: " +
      cList.join(" ")
  );
}

const colors: Record<string | number, number> = {
  "▴": 0xff0000ff, // Red
  "▵": 0xff00007f, // Red half-alpha
  "▸": 0x00ff00ff, // Green
  "▹": 0x00ff007f, // Green half-alpha
  "▾": 0x0000ffff, // Blue
  "▿": 0x0000ff7f, // Blue half-alpha
  "◆": 0xffff00ff, // Yellow
  "◇": 0xffff007f, // Yellow half-alpha
  "▪": 0x00ffffff, // Cyan
  "▫": 0x00ffff7f, // Cyan half-alpha
  "▰": 0xff00ffff, // Magenta
  "▱": 0xff00ff7f, // Magenta half-alpha
  " ": 0x00000000, // Transparent black
  "■": 0x000000ff, // Black
  0: 0x000000ff, // Black
  1: 0x111111ff,
  2: 0x222222ff,
  3: 0x333333ff,
  "▩": 0x404040ff, // Dark gray (1/4 white)
  4: 0x444444ff,
  5: 0x555555ff,
  "!": 0x5f5f5fff,
  6: 0x666666ff,
  7: 0x777777ff,
  8: 0x888888ff,
  "▦": 0x808080ff, // Half gray (1/2 white)
  9: 0x999999ff,
  A: 0xaaaaaaff,
  B: 0xbbbbbbff,
  "▥": 0xbfbfbfff, // Light gray (3/4 white)
  C: 0xccccccff,
  D: 0xddddddff,
  E: 0xeeeeeeff,
  F: 0xffffffff, // White
  "□": 0xffffffff, // White
};

/* Build a test image from a list of strings */
export function makeTestImage(...args: string[]) {
  const initialWidth = args[args.length - 1]?.length || 0;
  const testImage: Bitmap = {
    width: initialWidth,
    height: args.length,
    data: Buffer.alloc(initialWidth * args.length * 4),
  };

  for (let y = 0; y < testImage.height; y++) {
    const line = args[y]!;
    testImage.width = line.length;
    const w = testImage.width;

    for (let x = 0; x < w; x++) {
      const char = line[x]!;
      const color = colors[char];

      if (typeof color === "undefined") {
        throwUndefinedChar(char);
      } else {
        testImage.data.writeUInt32BE(color, 4 * (y * w + x));
      }
    }
  }

  return testImage;
}

const sup = "⁰¹²³⁴⁵⁶⁷⁸⁹ᵃᵇᶜᵈᵉᶠ";

export function testImageReadableMatrix(img: Bitmap) {
  const len = img.data.length / 4;

  const rMatrix = [];
  let line = [];

  for (let i = 0; i < len; i++) {
    const pix = img.data
      .readUint32BE(i * 4)
      .toString(16)
      .toUpperCase()
      .padStart(8, "0");

    line.push(
      pix.replace(/(..)(..)(..)(.)(.)/, (sel, r, g, b, a1, a2) => {
        const a = sup[parseInt(a1, 16)]! + sup[parseInt(a2, 16)]!;
        return r + "-" + g + "-" + b + a;
      })
    );
    if (i > 0 && (i + 1) % img.width === 0) {
      rMatrix.push(line.join(" "));
      line = [];
    }
  }

  return rMatrix.join("\n");
}

/** Helps to debug image data */
export function testImgToStr(testImage: Bitmap) {
  const colors2: Record<number, string | number> = {};
  const w = testImage.width;

  hashForEach(colors, (k, c) => {
    colors2[c] = k;
  });

  const unknownColors = new Set<number>();

  for (let y = 0; y < testImage.height; y++) {
    for (let x = 0; x < w; x++) {
      const cell = testImage.data.readUInt32BE(4 * (y * w + x));

      if (!colors2[cell]) {
        unknownColors.add(cell);
      }
    }
  }

  const unknownColorMap: Record<number, string | number> = {};
  const possibleColors = Object.keys(colors);

  unknownColors.forEach((c, i) => {
    const color = possibleColors[i % possibleColors.length]!;
    unknownColorMap[c] = color;
  });

  const lines: string[] = [];

  for (let y = 0; y < testImage.height; y++) {
    let line = "";

    for (let x = 0; x < w; x++) {
      const cell = testImage.data.readUInt32BE(4 * (y * w + x))!;
      const k = colors2[cell] || unknownColorMap[cell] || "?";
      line += k;
    }

    lines[y] = line;
  }

  return lines.join("\n");
}

export function makeDonutTestImage(_: number, i: number, X: number) {
  return {
    width: 10,
    height: 10,
    // prettier-ignore
    data: [
      _,_,_,_,_,_,_,_,_,_,
      _,_,_,i,X,X,i,_,_,_,
      _,_,X,X,X,X,X,X,_,_,
      _,i,X,X,i,i,X,X,i,_,
      _,X,X,i,_,_,i,X,X,_,
      _,X,X,i,_,_,i,X,X,_,
      _,i,X,X,i,i,X,X,i,_,
      _,_,X,X,X,X,X,X,_,_,
      _,_,_,i,X,X,i,_,_,_,
      _,_,_,_,_,_,_,_,_,_,
    ],
  };
}

expect.addSnapshotSerializer({
  serialize(val) {
    const bitmap = "bitmap" in val ? val.bitmap : val;
    return `Visualization:\n\n${testImgToStr(bitmap)}\n\nData:\n\n${testImageReadableMatrix(bitmap)}`;
  },
  test(val) {
    if ("bitmap" in val) {
      return true;
    }

    return val && val.width && val.height && val.data;
  },
});

export function getTestImagePath(
  name:
    | "cops.jpg"
    | "dice.png"
    | "flower.gif"
    | "animated.gif"
    | "mask.png"
    | "panoramic.jpg"
    | "rgb.tiff"
    | "windows95.png"
    | "windows95.bmp"
    | "fillbytes.jpg"
    | "hands.jpg"
    | "hands_mx200_rp255.jpg"
) {
  if (typeof window !== "undefined") {
    return `/${name}`;
  }

  return path.join(__dirname, "../../images", name);
}
