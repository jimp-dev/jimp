import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";

import * as blur from "./index.js";

const Jimp = createJimp({ plugins: [blur.methods] });

// An opaque 0xffcc00ff square on a transparent black canvas
function makeSquare() {
  const image = new Jimp({ width: 40, height: 40, color: 0x00000000 });

  image.scan(15, 15, 10, 10, (_, __, idx) => {
    image.bitmap.data.set([0xff, 0xcc, 0x00, 0xff], idx);
  });

  return image;
}

function pixelAt(image: ReturnType<typeof makeSquare>, x: number, y: number) {
  const idx = (y * image.bitmap.width + x) << 2;
  return [...image.bitmap.data.subarray(idx, idx + 4)];
}

describe.each([
  ["blur", (image: ReturnType<typeof makeSquare>) => image.blur(4)],
  ["gaussian", (image: ReturnType<typeof makeSquare>) => image.gaussian(3)],
])("%s with transparency", (_, applyBlur) => {
  test("keeps the color of the edge instead of darkening it", () => {
    const [r, g, b, a] = pixelAt(applyBlur(makeSquare()), 11, 20);

    expect(r).toBe(0xff);
    expect(g).toBeGreaterThanOrEqual(0xcc - 4);
    expect(g).toBeLessThanOrEqual(0xcc + 4);
    expect(b).toBe(0x00);
    expect(a).toBeGreaterThan(0);
    expect(a).toBeLessThan(0xff);
  });

  test("does not add a dark fringe anywhere", () => {
    const { data } = applyBlur(makeSquare()).bitmap;

    for (let idx = 0; idx < data.length; idx += 4) {
      if (data[idx + 3]! > 0) {
        expect(data[idx]).toBe(0xff);
        expect(data[idx + 2]).toBe(0x00);
      }
    }
  });
});
