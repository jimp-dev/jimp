import { expect, test, describe } from "vitest";
import { createJimp } from "@jimp/core";
import { getTestImagePath } from "@jimp/test-utils";

import jpeg from "./index.js";

const jimp = createJimp({ formats: [jpeg] });

describe("JPEG", () => {
  test("load JPG", async () => {
    const image = await jimp.read(getTestImagePath("cops.jpg"));

    expect(image.getPixelColor(10, 10)).toBe(0x3f4a02ff);
    expect(image.getPixelColor(220, 190)).toBe(0x5d94b6ff);
    expect(image.getPixelColor(350, 130)).toBe(0xdf7944ff);
  });

  test("load JPG with fill bytes", async () => {
    const image = await jimp.read(getTestImagePath("fillbytes.jpg"));

    expect(image.getPixelColor(10, 10)).toBe(0xaeb8c3ff);
    expect(image.getPixelColor(220, 190)).toBe(0x262b21ff);
    expect(image.getPixelColor(350, 130)).toBe(0x4e5d30ff);
  });

  test("export JPG", async () => {
    const image = jimp.fromBitmap({
      width: 3,
      height: 3,
      data: [
        0xff0000ff, 0xff0080ff, 0xff00ffff, 0xff0080ff, 0xff00ffff, 0x8000ffff,
        0xff00ffff, 0x8000ffff, 0x0000ffff,
      ],
    });

    const buffer = await image.getBuffer("image/jpeg", {
      quality: 50,
    });

    // eslint-disable-next-line no-control-regex
    expect(buffer.toString()).toMatch(/^.{3,9}JFIF\u0000/);
  });

  test("default quality is 80", async () => {
    const image = await jimp.read(getTestImagePath("cops.jpg"));

    const buffer = await image.getBuffer("image/jpeg");
    const quality80 = await image.getBuffer("image/jpeg", { quality: 80 });
    const quality100 = await image.getBuffer("image/jpeg", { quality: 100 });

    expect(buffer.equals(quality80)).toBe(true);
    expect(buffer.equals(quality100)).toBe(false);
  });

  test("color is subsampled below quality 90", async () => {
    const image = await jimp.read(getTestImagePath("cops.jpg"));

    expect(lumaSampling(await image.getBuffer("image/jpeg"))).toBe(0x22);
    expect(
      lumaSampling(await image.getBuffer("image/jpeg", { quality: 89 })),
    ).toBe(0x22);
    expect(
      lumaSampling(await image.getBuffer("image/jpeg", { quality: 90 })),
    ).toBe(0x11);
    expect(
      lumaSampling(
        await image.getBuffer("image/jpeg", {
          quality: 50,
          chromaSubsampling: "4:4:4",
        }),
      ),
    ).toBe(0x11);
    expect(
      lumaSampling(
        await image.getBuffer("image/jpeg", {
          quality: 100,
          chromaSubsampling: "4:2:0",
        }),
      ),
    ).toBe(0x22);
  });

  test("file size decreases as quality decreases", async () => {
    const image = await jimp.read(getTestImagePath("cops.jpg"));

    for (const chromaSubsampling of [undefined, "4:2:0", "4:4:4"] as const) {
      const sizes = [];

      for (const quality of [100, 90, 80, 70, 60, 40, 20, 1]) {
        const buffer = await image.getBuffer("image/jpeg", {
          quality,
          chromaSubsampling,
        });

        sizes.push(buffer.length);
      }

      for (let i = 1; i < sizes.length; i++) {
        expect(sizes[i]).toBeLessThan(sizes[i - 1]!);
      }
    }
  });

  test("4:2:0 gives a smaller file than 4:4:4", async () => {
    const image = await jimp.read(getTestImagePath("cops.jpg"));

    for (const quality of [100, 80, 50]) {
      const subsampled = await image.getBuffer("image/jpeg", {
        quality,
        chromaSubsampling: "4:2:0",
      });
      const full = await image.getBuffer("image/jpeg", {
        quality,
        chromaSubsampling: "4:4:4",
      });

      expect(subsampled.length).toBeLessThan(full.length);
    }
  });

  test.each([
    // Color is stored at half resolution, so its gradient is a bit off.
    ["4:2:0", 3],
    ["4:4:4", 1],
  ] as const)(
    "round trip with %s, including partial blocks",
    async (chromaSubsampling, maxError) => {
      const width = 37;
      const height = 21;
      const image = new jimp({ width, height });

      image.scan((x, y, idx) => {
        image.bitmap.data[idx] = x * 6;
        image.bitmap.data[idx + 1] = y * 12;
        image.bitmap.data[idx + 2] = (x + y) * 4;
        image.bitmap.data[idx + 3] = 0xff;
      });

      const buffer = await image.getBuffer("image/jpeg", {
        quality: 95,
        chromaSubsampling,
      });
      const decoded = await jimp.read(buffer);

      expect(decoded.bitmap.width).toBe(width);
      expect(decoded.bitmap.height).toBe(height);

      let error = 0;

      for (let i = 0; i < image.bitmap.data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
          error += Math.abs(
            image.bitmap.data[i + c]! - decoded.bitmap.data[i + c]!,
          );
        }
      }

      expect(error / (width * height * 3)).toBeLessThan(maxError);
    },
  );
});

/** The sampling factors of the first (luma) component in the SOF0 segment. */
function lumaSampling(buffer: Buffer) {
  const sof = buffer.indexOf(Buffer.from([0xff, 0xc0]));

  expect(sof).toBeGreaterThan(0);

  return buffer[sof + 11];
}
