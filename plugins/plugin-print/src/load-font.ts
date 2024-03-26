import { existsSync, promises as fs } from "fs";
import path from "path";
import { loadBitmapFont } from "./load-bitmap-font.js";
import { createJimp } from "@jimp/core";
import png from "@jimp/js-png";

const CharacterJimp = createJimp({ formats: [png] });

/**
 * Loads a Bitmap Font from a file.
 * The results is a collection of Jimp images that can be used to print text.
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
          return CharacterJimp.fromUrl(filepath);
        }
      })
    ),
  };
}
