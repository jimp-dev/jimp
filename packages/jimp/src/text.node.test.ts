import { describe, expect, test } from "vitest";
import { createRequire } from "module";
import path from "path";

import { Jimp, measureVectorText } from "./index.js";
import { loadTTF } from "./load-ttf.js";

const require = createRequire(import.meta.url);
const font = path.join(
  path.dirname(require.resolve("@jimp/plugin-print/package.json")),
  "fixtures/Inter-Regular.otf",
);

describe("vector text", () => {
  test("prints text with a font from jimp/load-ttf", async () => {
    const vectorFont = await loadTTF(font);
    const image = new Jimp({ width: 100, height: 40, color: "white" });
    const { width } = measureVectorText(vectorFont, 20, "Hello");

    image.printText({ font: vectorFont, size: 20, x: 0, y: 0, text: "Hello" });

    expect(width).toBeGreaterThan(40);
    expect(image.getPixelColor(0, 0)).toBe(0xffffffff);
    expect(
      image.bitmap.data.some((value, i) => i % 4 !== 3 && value < 128),
    ).toBe(true);
  });
});
