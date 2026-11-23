import { Buffer } from "buffer";
import { expect, test, describe } from "vitest";
import { makeTestImage } from "@jimp/test-utils";
import png from "@jimp/js-png";
import jpeg from "@jimp/js-jpeg";
import { Edge } from "@jimp/types";
import { createJimp } from "@jimp/core";

import { methods } from "./index.js";

const jimp = createJimp({ formats: [png, jpeg], plugins: [methods] });

describe("Convolution", function () {
  const imgMid = jimp.fromBitmap(
    makeTestImage(
      "22222222",
      "22222222",
      "22888822",
      "22888822",
      "22888822",
      "22888822",
      "22222222",
      "22222222",
    ),
  );
  /** stores the Jimp instances of the JGD images above. */
  const imgTopLeft = jimp.fromBitmap(
    makeTestImage(
      "88222222",
      "88222222",
      "22222222",
      "22222222",
      "22222222",
      "22222222",
      "22222222",
      "22222222",
    ),
  );

  const sharpM = [
    [-1, -1, 0],
    [-1, 1, 1],
    [0, 1, 1],
  ];

  test("3x3 sharp matrix on EDGE_EXTEND", () => {
    expect(imgMid.clone().convolution(sharpM)).toMatchSnapshot();
    expect(imgTopLeft.clone().convolution(sharpM)).toMatchSnapshot();
  });

  test("3x3 sharp matrix on EDGE_WRAP", () => {
    expect(
      imgMid.clone().convolution({ kernel: sharpM, edgeHandling: Edge.WRAP }),
    ).toMatchSnapshot();
    expect(
      imgTopLeft
        .clone()
        .convolution({ kernel: sharpM, edgeHandling: Edge.WRAP }),
    ).toMatchSnapshot();
  });

  test("3x3 sharp matrix on EDGE_CROP", () => {
    expect(
      imgMid.clone().convolution({ kernel: sharpM, edgeHandling: Edge.CROP }),
    ).toMatchSnapshot();
    expect(
      imgTopLeft
        .clone()
        .convolution({ kernel: sharpM, edgeHandling: Edge.CROP }),
    ).toMatchSnapshot();
  });
});

describe("Convolution divisor and bias", () => {
  // A 3x1 image with a brighter, more opaque pixel in the middle
  const makeImage = () =>
    jimp.fromBitmap({
      width: 3,
      height: 1,
      data: Buffer.from([10, 20, 30, 200, 100, 120, 140, 240, 10, 20, 30, 200]),
    });

  // Every row is the same, so with EXTEND edges an end pixel's sum is
  // 12 * itself + 4 * the middle, and the middle's is 8 * end + 8 * itself.
  const kernel = [
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1],
  ];

  test("convolution divides the sum and adds the bias", () => {
    // 520 / 16 = 32.5, 720 / 16 = 45, 920 / 16 = 57.5 at the ends
    expect([
      ...makeImage().convolution({ kernel, divisor: 16 }).bitmap.data,
    ]).toEqual([32, 45, 57, 200, 55, 70, 85, 240, 32, 45, 57, 200]);
    expect([
      ...makeImage().convolution({ kernel, divisor: 16, bias: -30 }).bitmap
        .data,
    ]).toEqual([2, 15, 27, 200, 25, 40, 55, 240, 2, 15, 27, 200]);
  });

  test("convolute divides the sum and adds the bias to the colors", () => {
    // Alpha is convolved too: 3360 / 16 = 210 and 3520 / 16 = 220
    expect([
      ...makeImage().convolute({ kernel, divisor: 16 }).bitmap.data,
    ]).toEqual([32, 45, 57, 210, 55, 70, 85, 220, 32, 45, 57, 210]);
    expect([
      ...makeImage().convolute({ kernel, divisor: 16, bias: 100 }).bitmap.data,
    ]).toEqual([132, 145, 157, 210, 155, 170, 185, 220, 132, 145, 157, 210]);
  });

  test("a negative divisor with a bias inverts the image", () => {
    expect([
      ...makeImage().convolution({ kernel: [[1]], divisor: -1, bias: 255 })
        .bitmap.data,
    ]).toEqual([245, 235, 225, 200, 155, 135, 115, 240, 245, 235, 225, 200]);
  });

  test("the default divisor and bias leave the output unchanged", () => {
    const width = 16;
    const height = 16;
    const data = Buffer.from(
      Array.from({ length: width * height * 4 }, (_, i) => (i * 97 + 13) % 256),
    );
    const image = jimp.fromBitmap({ width, height, data });
    const kernel = [
      [0.1, -0.7, 0.3],
      [-1.1, 2.9, -0.2],
      [0.05, -0.6, 0.4],
    ];

    expect(
      image.clone().convolution({ kernel, divisor: 1, bias: 0 }).bitmap.data,
    ).toEqual(image.clone().convolution(kernel).bitmap.data);
    expect(
      image.clone().convolute({ kernel, divisor: 1, bias: 0 }).bitmap.data,
    ).toEqual(image.clone().convolute(kernel).bitmap.data);
  });

  test("rejects a divisor of 0", () => {
    expect(() => makeImage().convolution({ kernel, divisor: 0 })).toThrow(
      "divisor must not be 0",
    );
    expect(() => makeImage().convolute({ kernel, divisor: 0 })).toThrow(
      "divisor must not be 0",
    );
  });
});

// A plain 2D correlation with EXTEND edges: kernel[row][col] weights the
// pixel (x + col - originX, y + row - originY), with the origin at
// floor((size - 1) / 2). This matches ImageMagick's
// `-morphology Correlate '<W>x<H>: ...'` with its default origin.
function referenceConvolution(
  image: { bitmap: { width: number; height: number; data: Uint8Array } },
  kernel: number[][],
  channels: number,
  divisor = 1,
  bias = 0,
) {
  const { width, height, data } = image.bitmap;
  const originY = Math.floor((kernel.length - 1) / 2);
  const originX = Math.floor((kernel[0]!.length - 1) / 2);
  const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max);
  const out = [...data];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < channels; c++) {
        let sum = 0;

        kernel.forEach((row, ky) =>
          row.forEach((weight, kx) => {
            const xi = clamp(x + kx - originX, width - 1);
            const yi = clamp(y + ky - originY, height - 1);
            sum += weight * data[(yi * width + xi) * 4 + c]!;
          }),
        );

        out[(y * width + x) * 4 + c] = Math.floor(
          clamp(sum / divisor + (c < 3 ? bias : 0), 255),
        );
      }
    }
  }

  return out;
}

// An opaque grey image whose value at (x, y) is 10 * y + x + 1:
//    1  2  3  4
//   11 12 13 14
//   21 22 23 24
function makeGreyImage() {
  const width = 4;
  const height = 3;
  const data = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      data.set(
        [10 * y + x + 1, 10 * y + x + 1, 10 * y + x + 1, 255],
        (y * width + x) * 4,
      );
    }
  }

  return jimp.fromBitmap({ width, height, data });
}

// The red channel as rows, after checking the image is still grey and opaque
function greyRows(image: ReturnType<typeof makeGreyImage>) {
  const { width, height, data } = image.bitmap;
  const rows: number[][] = [];

  for (let y = 0; y < height; y++) {
    rows.push([]);

    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      expect([data[i + 1], data[i + 2], data[i + 3]]).toEqual([
        data[i],
        data[i],
        255,
      ]);
      rows[y]!.push(data[i]!);
    }
  }

  return rows;
}

describe("Convolution kernel orientation", () => {
  // Deterministic noise, with varying alpha for convolute
  const makeNoise = () => {
    const width = 9;
    const height = 7;
    const data = Buffer.from(
      Array.from({ length: width * height * 4 }, (_, i) => (i * 73 + 41) % 256),
    );
    return jimp.fromBitmap({ width, height, data });
  };

  const sobelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ];

  test("sobel-x responds to vertical edges in both methods", () => {
    // Left half black, right half white
    const vertical = jimp.fromBitmap(
      makeTestImage("0000FFFF", "0000FFFF", "0000FFFF", "0000FFFF"),
    );
    // Top half black, bottom half white
    const horizontal = jimp.fromBitmap(
      makeTestImage("00000000", "00000000", "FFFFFFFF", "FFFFFFFF"),
    );

    for (const method of ["convolution", "convolute"] as const) {
      const v = vertical.clone()[method]({ kernel: sobelX, divisor: 8 });
      const h = horizontal.clone()[method]({ kernel: sobelX, divisor: 8 });

      // 4 * 255 / 8 = 127.5 either side of the edge, 0 elsewhere. Only the
      // colors are checked: convolute also convolves alpha, which sobel-x
      // turns to 0.
      expect(v.bitmap.data.readUInt32BE(4 * 3) >>> 8, method).toBe(0x7f7f7f);
      expect(v.bitmap.data.readUInt32BE(4 * 4) >>> 8, method).toBe(0x7f7f7f);
      expect(v.bitmap.data.readUInt32BE(0) >>> 8, method).toBe(0);
      // A horizontal edge has no x gradient
      expect(
        [...h.bitmap.data].every((v, i) => i % 4 === 3 || v === 0),
        method,
      ).toBe(true);
    }
  });

  test.each([
    ["3x3 sobel-x", sobelX],
    [
      "2x2",
      [
        [1, -2],
        [3, 0],
      ],
    ],
    [
      "4x4",
      [
        [1, -2, 0, 3],
        [0, 4, -1, 0],
        [2, 0, 0, -3],
        [0, -1, 5, 1],
      ],
    ],
    [
      "3x5",
      [
        [1, 0, -2, 0, 3],
        [0, 4, 0, -1, 0],
        [-3, 0, 2, 0, 1],
      ],
    ],
    [
      "5x3",
      [
        [1, 0, -2],
        [0, 4, 0],
        [-3, 2, 0],
        [0, -1, 1],
        [2, 0, -1],
      ],
    ],
    ["1x4", [[1, 3, -2, -1]]],
  ])("%s kernel matches a reference correlation", (_, kernel) => {
    const image = makeNoise();
    const sum = kernel.flat().reduce((a, b) => a + Math.abs(b), 0);
    const options = { kernel, divisor: sum, bias: 128 };

    // convolution leaves alpha alone, convolute convolves it too
    expect([...image.clone().convolution(options).bitmap.data]).toEqual(
      referenceConvolution(image, kernel, 3, sum, 128),
    );
    expect([...image.clone().convolute(options).bitmap.data]).toEqual(
      referenceConvolution(image, kernel, 4, sum, 128),
    );
  });

  test("a transposed image and kernel give the transposed result", () => {
    const image = makeNoise();
    const { width, height } = image.bitmap;
    const transposed = jimp.fromBitmap({
      width: height,
      height: width,
      data: Buffer.alloc(width * height * 4),
    });
    image.scan((x, y) => {
      transposed.setPixelColor(image.getPixelColor(x, y), y, x);
    });

    const kernel = [
      [1, 0, -2, 0, 3],
      [0, 4, 0, -1, 0],
      [-3, 0, 2, 0, 1],
    ];
    const kernelT = kernel[0]!.map((_, c) => kernel.map((row) => row[c]!));

    for (const method of ["convolution", "convolute"] as const) {
      const out = image.clone()[method]({ kernel, divisor: 16, bias: 128 });
      const outT = transposed
        .clone()
        [method]({ kernel: kernelT, divisor: 16, bias: 128 });

      out.scan((x, y) => {
        expect(outT.getPixelColor(y, x)).toBe(out.getPixelColor(x, y));
      });
    }
  });

  // Snapshots taken before the orientation fix. These kernels equal their own
  // transpose, so neither method's output may change.
  test("symmetric kernels give the same output as before", () => {
    const image = makeNoise();
    const sharpM = [
      [-1, -1, 0],
      [-1, 1, 1],
      [0, 1, 1],
    ];
    const blur5 = [
      [0.01, 0.02, 0.04, 0.02, 0.01],
      [0.02, 0.04, 0.09, 0.04, 0.02],
      [0.04, 0.09, 0.15, 0.09, 0.04],
      [0.02, 0.04, 0.09, 0.04, 0.02],
      [0.01, 0.02, 0.04, 0.02, 0.01],
    ];
    const box4 = Array.from({ length: 4 }, () => Array(4).fill(1 / 7));

    expect(image.clone().convolution(sharpM)).toMatchSnapshot();
    expect(image.clone().convolute(sharpM)).toMatchSnapshot();
    expect(image.clone().convolution(blur5)).toMatchSnapshot();
    expect(image.clone().convolute(blur5)).toMatchSnapshot();
    // convolute already handled square even-sized kernels (by rounding
    // +-0.5 offsets), so its output is unchanged too
    expect(image.clone().convolute(box4)).toMatchSnapshot();
  });
});

describe("Convolution kernel sizes (#749)", () => {
  // Each expected value is worked out on the grey image from makeGreyImage,
  // whose value at (x, y) is 10 * y + x + 1, with EXTEND edges.
  test.each(["convolution", "convolute"] as const)(
    "%s supports a 2x2 kernel",
    (method) => {
      // The origin is the top left entry, so the output at (x, y) is
      // p(x, y) + 2 p(x+1, y) + 3 p(x, y+1) + 4 p(x+1, y+1).
      // At (0, 0): 1 + 2*2 + 3*11 + 4*12 = 86.
      // At (3, 2): 24 + 2*24 + 3*24 + 4*24 = 240, all clamped to (3, 2).
      const kernel = [
        [1, 2],
        [3, 4],
      ];

      expect(greyRows(makeGreyImage()[method](kernel))).toEqual([
        [86, 96, 106, 110],
        [186, 196, 206, 210],
        [216, 226, 236, 240],
      ]);
    },
  );

  test.each(["convolution", "convolute"] as const)(
    "%s supports a 4x4 kernel",
    (method) => {
      // The origin is [1][1], so offsets run from -1 to 2. The output at
      // (x, y) is p(x-1, y-1) + 2 p(x+2, y-1) + 3 p(x, y+2).
      // At (0, 0): p(0, 0) + 2 p(2, 0) + 3 p(0, 2) = 1 + 6 + 63 = 70.
      // At (3, 2): p(2, 1) + 2 p(3, 1) + 3 p(3, 2) = 13 + 28 + 72 = 113.
      const kernel = [
        [1, 0, 0, 2],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 3, 0, 0],
      ];

      expect(greyRows(makeGreyImage()[method](kernel))).toEqual([
        [70, 75, 79, 83],
        [70, 75, 79, 83],
        [100, 105, 109, 113],
      ]);
    },
  );

  test.each(["convolution", "convolute"] as const)(
    "%s supports a 3x5 kernel",
    (method) => {
      // 3 rows of 5, so the origin is [1][2]: x offsets run from -2 to 2 and
      // y offsets from -1 to 1. The output at (x, y) is
      // p(x-2, y-1) + 2 p(x+2, y) + 3 p(x+1, y+1).
      // At (1, 1): p(0, 0) + 2 p(3, 1) + 3 p(2, 2) = 1 + 28 + 69 = 98.
      const kernel = [
        [1, 0, 0, 0, 0],
        [0, 0, 0, 0, 2],
        [0, 0, 0, 3, 0],
      ];

      expect(greyRows(makeGreyImage()[method](kernel))).toEqual([
        [43, 48, 51, 52],
        [93, 98, 101, 102],
        [123, 128, 131, 132],
      ]);
    },
  );

  test("an even-sized kernel matches the odd one padded at the start", () => {
    // Matlab's example from #749: [0.25 0.75 -0.75 -0.25] is centred on
    // 0.75, the same as [0 0.25 0.75 -0.75 -0.25]
    const image = jimp.fromBitmap(
      makeTestImage("02468ACE", "13579BDF", "FEDCBA98"),
    );
    const even = { kernel: [[0.25, 0.75, -0.75, -0.25]], bias: 128 };
    const odd = { kernel: [[0, 0.25, 0.75, -0.75, -0.25]], bias: 128 };

    expect(image.clone().convolution(even).bitmap.data).toEqual(
      image.clone().convolution(odd).bitmap.data,
    );
    expect(image.clone().convolute(even).bitmap.data).toEqual(
      image.clone().convolute(odd).bitmap.data,
    );
  });

  test("rejects ragged and empty kernels", () => {
    const ragged = [
      [1, 2, 1],
      [2, 4],
      [1, 2, 1],
    ];

    expect(() => makeGreyImage().convolution(ragged)).toThrow(
      "kernel rows must all have the same length",
    );
    expect(() => makeGreyImage().convolute({ kernel: ragged })).toThrow(
      "kernel rows must all have the same length",
    );
    expect(() => makeGreyImage().convolution([])).toThrow(
      "kernel must be a matrix",
    );
    expect(() => makeGreyImage().convolute([])).toThrow(
      "kernel must be a matrix",
    );
  });
});
