import {
  isWebWorker,
  loadBitmapFontData,
  processBitmapFont,
} from "./load-bitmap-font.js";

/**
 * Loads a Bitmap Font from a file.
 * @param file A path or URL to a font file
 * @returns A collection of Jimp images that can be used to print text
 * @example
 * ```ts
 * import { Jimp, loadFont } from "jimp";
 * import { SANS_10_BLACK } from "jimp/fonts";
 *
 * const font = await loadFont(SANS_10_BLACK);
 * const image = new Jimp({ width: 200, height: 100, color: 0xffffffff });
 *
 * image.print({ font, x: 10, y: 10, text: "Hello world!" });
 * ```
 */
export async function loadFont(file: string) {
  // v0 code like `loadFont(Jimp.FONT_SANS_32_BLACK)` passes undefined
  if (typeof file !== "string") {
    throw new Error(
      `loadFont expects a path or URL to a font file, but received ${
        file === null ? "null" : typeof file
      }. Fonts are named exports of "jimp/fonts" in v1, for example: import { SANS_32_BLACK } from "jimp/fonts";`,
    );
  }

  let fileOrBuffer: string | Buffer = file;

  if (typeof window === "undefined" && !isWebWorker) {
    const { existsSync, promises: fs } = await import("fs");

    if (existsSync(file)) {
      fileOrBuffer = await fs.readFile(file);
    }
  }

  const data = await loadBitmapFontData(fileOrBuffer);
  return processBitmapFont(file, data);
}
