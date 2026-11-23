import {
  isWebWorker,
  loadBitmapFontData,
  processBitmapFont,
  resolvePagePath,
} from "./load-bitmap-font.js";

// Strings Node can only load with fetch
const URL_LIKE = /^(https?|data|blob):/i;

/** Text that looks like a BMFont file (text, XML, JSON or binary) */
function looksLikeFontContents(file: string) {
  return (
    /[\r\n]/.test(file) ||
    /^\s*(<|\{|BMF|(info|common|pages?|chars?|kernings?)\s+\w+=)/.test(file)
  );
}

function preview(file: string, length: number) {
  return JSON.stringify(
    file.length > length ? `${file.slice(0, length)}...` : file,
  );
}

/**
 * Loads a Bitmap Font from a file.
 *
 * In Node.js `file` is a path to a `.fnt` file (or a `file:` URL). The font
 * and the `.png` pages next to it are read from disk, so no `fetch` is needed.
 * It can also be an `http:`, `https:` or `data:` URL, which is loaded with the
 * global `fetch`. In the browser `file` is always loaded with `fetch`.
 *
 * Pass the path, not the contents of the file: the pages are loaded relative
 * to the font's location.
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

  if (typeof window === "undefined" && !isWebWorker) {
    const { existsSync, promises: fs } = await import("fs");

    // Node's fetch can't load file: URLs, so read them from disk
    if (/^file:/i.test(file)) {
      const { fileURLToPath } = await import("url");
      file = fileURLToPath(file);
    }

    if (existsSync(file)) {
      const data = await loadBitmapFontData(await fs.readFile(file));

      // Otherwise Jimp.read would fall back to fetching a missing page
      for (const page of data.pages) {
        const pagePath = resolvePagePath(file, page);

        if (!existsSync(pagePath)) {
          throw new Error(
            `loadFont: font page not found: ${JSON.stringify(pagePath)}. Keep the .png pages next to the .fnt file.`,
          );
        }
      }

      return processBitmapFont(file, data);
    }

    if (looksLikeFontContents(file)) {
      throw new Error(
        `loadFont expects a path or URL to a font file, but received the contents of one: ${preview(file, 80)}. Pass the path to the .fnt file instead, its .png pages are loaded from the same directory.`,
      );
    }

    if (!URL_LIKE.test(file)) {
      throw new Error(
        `loadFont: font file not found: ${preview(file, 200)}. Pass a path to a .fnt file, a URL, or a SANS_* constant from jimp/fonts.`,
      );
    }
  }

  const data = await loadBitmapFontData(file);
  return processBitmapFont(file, data);
}
