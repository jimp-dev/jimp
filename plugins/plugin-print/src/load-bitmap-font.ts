import parseASCII from "parse-bmfont-ascii";
import parseXML from "parse-bmfont-xml";
import readBinary from "parse-bmfont-binary";
import { BmCharacter, BmKerning, BmFont, BmCommonProps } from "./types.js";

const HEADER = Buffer.from([66, 77, 70, 3]);

function isBinary(buf: Buffer | string) {
  if (typeof buf === "string") {
    return buf.substring(0, 3) === "BMF";
  }

  const startOfHeader = buf.slice(0, 4);

  return (
    buf.length > 4 &&
    startOfHeader[0] === HEADER[0] &&
    startOfHeader[1] === HEADER[1] &&
    startOfHeader[2] === HEADER[2]
  );
}

function parseFont(
  file: string,
  data: Buffer | string,
): {
  chars: BmCharacter[];
  kernings: BmKerning[];
  common: BmCommonProps;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: Record<string, any>;
  pages: string[];
} {
  if (isBinary(data)) {
    if (typeof data === "string") {
      data = Buffer.from(data, "binary");
    }

    return readBinary(data);
  }

  data = data.toString().trim();

  if (/.json$/.test(file) || data.charAt(0) === "{") {
    return JSON.parse(data);
  }

  if (/.xml$/.test(file) || data.charAt(0) === "<") {
    return parseXML(data);
  }

  return parseASCII(data);
}

/**
 *
 * @param bufferOrUrl A URL to a file or a buffer
 * @returns
 */
async function loadBitmapFontData(bufferOrUrl: string | Buffer) {
  if (typeof bufferOrUrl === "string") {
    const res = await fetch(bufferOrUrl);
    const text = await res.text();

    return parseFont(bufferOrUrl, text);
  } else {
    return parseFont("", bufferOrUrl);
  }
}

type RawFont = Awaited<ReturnType<typeof loadBitmapFontData>>;

export async function loadBitmapFont(
  bufferOrUrl: string | Buffer,
): Promise<Omit<BmFont, "pages"> & Pick<RawFont, "pages">> {
  const font = await loadBitmapFontData(bufferOrUrl);
  const chars: Record<string, BmCharacter> = {};
  const kernings: Record<string, BmKerning> = {};

  for (let i = 0; i < font.chars.length; i++) {
    const char = font.chars[i]!;
    chars[String.fromCharCode(char.id)] = char;
  }

  for (let i = 0; i < font.kernings.length; i++) {
    const firstString = String.fromCharCode(font.kernings[i]!.first);

    kernings[firstString] = kernings[firstString]! || {};
    kernings[firstString]![String.fromCharCode(font.kernings[i]!.second)] =
      font.kernings[i]!.amount;
  }

  return {
    ...font,
    chars,
    kernings,
  };
}
