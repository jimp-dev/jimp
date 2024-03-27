import { existsSync, promises as fs } from "fs";
import path from "path";
import { loadBitmapFont } from "./load-bitmap-font.js";
import { createJimp } from "@jimp/core";
import png from "@jimp/js-png";

const CharacterJimp = createJimp({ formats: [png] });

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
 * image.print(font, 10, 10, "Hello world!");
 * ```
 */
export async function loadFont(file: string) {
  const isLocalFile = existsSync(file);
  const font = await loadBitmapFont(
    isLocalFile ? await fs.readFile(file) : file
  );

  return {
    ...font,
    pages: await Promise.all(
      font.pages.map(async (page) => {
        const filepath = path.join(path.dirname(file), page);

        if (isLocalFile) {
          const pageBuffer = await fs.readFile(filepath);
          return CharacterJimp.fromBuffer(pageBuffer);
        } else {
          return CharacterJimp.read(filepath);
        }
      })
    ),
  };
}
