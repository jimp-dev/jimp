import { expect, test, describe } from "vitest";

import { methods as color } from "./index.js";

function scanImage(data: number[]) {
  return {
    bitmap: { data: Uint8Array.from(data), width: data.length / 4, height: 1 },
    scan(cb: (x: number, y: number, idx: number) => void) {
      for (let idx = 0; idx < this.bitmap.data.length; idx += 4) {
        cb(idx / 4, 0, idx);
      }
      return this;
    },
  };
}

describe("sepia", () => {
  test("computes each output channel from the original pixel", () => {
    const image = scanImage([255, 0, 0, 255]);

    color.sepia(image as any);

    expect(Array.from(image.bitmap.data)).toEqual([100, 88, 69, 255]);
  });
});
