import { gposKerning, readTable } from "./kerning.js";
import type { OpenTypeFont } from "./opentype.js";

/**
 * A TrueType, OpenType or WOFF font loaded with {@link loadTTF}, for
 * `print`, `measureText` and `measureTextHeight`.
 */
export interface VectorFont {
  /**
   * The font parsed by [opentype.js](https://github.com/opentypejs/opentype.js),
   * for anything Jimp doesn't do with it. It's typed with only the parts Jimp
   * uses; cast it to opentype.js's `Font` type for the rest.
   */
  readonly opentype: OpenTypeFont;
  /**
   * The kerning between two glyphs, by glyph index, in font units. Usually
   * negative, to move the second glyph closer to the first.
   */
  kerning(left: number, right: number): number;
}

/** What {@link loadTTF} can load a font from */
export type FontSource = string | URL | ArrayBuffer | ArrayBufferView;

const isWebWorker = typeof self !== "undefined" && self.document === undefined;

// Strings Node can only load with fetch
const URL_LIKE = /^(https?|data|blob):/i;

function describe(value: unknown) {
  return value === null ? "null" : typeof value;
}

function preview(file: string, length = 200) {
  return JSON.stringify(
    file.length > length ? `${file.slice(0, length)}...` : file,
  );
}

async function fetchFont(url: string) {
  // Some Node.js-like runtimes (e.g. Raycast) don't provide fetch
  if (typeof globalThis.fetch !== "function") {
    throw new Error(
      `loadTTF: can't load ${preview(url)} because this runtime has no global fetch. Pass a path or the font's bytes instead, or install a fetch polyfill.`,
    );
  }

  let response: Response;

  try {
    response = await fetch(url);
  } catch (error) {
    throw new Error(
      `loadTTF: couldn't fetch ${preview(url)}: ${(error as Error).message}`,
      { cause: error },
    );
  }

  // Otherwise the error page is parsed as a font
  if (!response.ok) {
    throw new Error(
      `loadTTF: couldn't load ${preview(url)}: HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`,
    );
  }

  return new Uint8Array(await response.arrayBuffer());
}

/** The bytes of the font at a path or URL, or in a buffer */
async function readSource(source: FontSource) {
  if (source instanceof ArrayBuffer) {
    return new Uint8Array(source);
  }

  if (ArrayBuffer.isView(source)) {
    return new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
  }

  if (source instanceof URL) {
    source = source.href;
  }

  if (typeof source !== "string") {
    throw new Error(
      `loadTTF expects a path, URL, Buffer or ArrayBuffer, but received ${describe(source)}.`,
    );
  }

  if (typeof window === "undefined" && !isWebWorker) {
    const { existsSync, promises: fs } = await import("fs");
    let file = source;

    // Node's fetch can't load file: URLs, so read them from disk
    if (/^file:/i.test(file)) {
      const { fileURLToPath } = await import("url");
      file = fileURLToPath(file);
    }

    if (existsSync(file)) {
      return new Uint8Array(await fs.readFile(file));
    }

    if (!URL_LIKE.test(file)) {
      throw new Error(
        `loadTTF: font file not found: ${preview(file)}. Pass a path to a .ttf, .otf or .woff file, a URL, or the font's bytes.`,
      );
    }
  }

  return fetchFont(source);
}

const SIGNATURES: Record<string, string> = {
  "\x00\x01\x00\x00": "TrueType",
  true: "TrueType",
  OTTO: "OpenType",
  wOFF: "WOFF",
};

function signature(data: Uint8Array) {
  return String.fromCharCode(...data.subarray(0, 4));
}

/**
 * Loads a TrueType (`.ttf`), OpenType (`.otf`) or WOFF (`.woff`) font, to draw
 * text with `print`. Fonts are parsed with
 * [opentype.js](https://github.com/opentypejs/opentype.js), which is only
 * loaded the first time this is called.
 *
 * In Node.js `source` can be a path, a `file:` URL, an `http:`, `https:` or
 * `data:` URL (loaded with the global `fetch`), or the font's bytes in a
 * `Buffer`. In the browser it can be a URL, which is loaded with `fetch`, or
 * the font's bytes in an `ArrayBuffer` or typed array.
 *
 * WOFF2 fonts aren't supported: decoding them needs a Brotli decompressor.
 * Convert them to WOFF or TTF first.
 * @param source a path or URL to a font file, or its bytes
 * @returns the font, for `print`, `measureText` and `measureTextHeight`
 * @example
 * ```ts
 * import { Jimp } from "jimp";
 * import { loadTTF } from "jimp/load-ttf";
 *
 * const font = await loadTTF("fonts/Inter-Regular.ttf");
 * const image = new Jimp({ width: 400, height: 100, color: "white" });
 *
 * image.print({ font, size: 32, x: 10, y: 10, text: "Hello world!" });
 * ```
 */
export async function loadTTF(source: FontSource): Promise<VectorFont> {
  const data = await readSource(source);
  const kind = SIGNATURES[signature(data)];

  if (!kind) {
    const isWoff2 = signature(data) === "wOF2";

    throw new Error(
      isWoff2
        ? "loadTTF: WOFF2 fonts aren't supported. Convert the font to WOFF, TTF or OTF, for example with fonttools: `fonttools ttLib.woff2 decompress font.woff2`"
        : `loadTTF: the data isn't a TrueType, OpenType or WOFF font (${data.length === 0 ? "it's empty" : `it starts with ${JSON.stringify(signature(data))}`}).`,
    );
  }

  // opentype.js has no "exports": Node loads its CommonJS build, which has
  // only a default export, and bundlers its ES module, which has no default
  const opentypeModule = await import("opentype.js");
  const { parse } =
    (opentypeModule as unknown as { default?: typeof opentypeModule })
      .default ?? opentypeModule;
  // opentype.js reads the font from the start of the ArrayBuffer
  const buffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  ) as ArrayBuffer;
  let font: OpenTypeFont;

  try {
    font = parse(buffer) as OpenTypeFont;
  } catch (error) {
    throw new Error(
      `loadTTF: couldn't read the ${kind} font: ${(error as Error).message}`,
      { cause: error },
    );
  }

  let gpos: DataView | undefined;

  try {
    gpos = await readTable(data, "GPOS");
  } catch {
    // opentype.js has read the font, so carry on without kerning
  }

  const kerning =
    (gpos && gposKerning(gpos)) ??
    ((left: number, right: number) =>
      font.kerningPairs?.[`${left},${right}`] ?? 0);

  return { opentype: font, kerning };
}
