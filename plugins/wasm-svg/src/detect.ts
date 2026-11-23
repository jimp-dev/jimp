/**
 * How much of the data to look at. The root element comes after the XML
 * declaration, comments and a doctype, which editors like Illustrator fill
 * with entities, but not much further in.
 */
const SNIFF_LENGTH = 16 * 1024;

/** `<svg` or a prefixed `<svg:svg`, then whitespace, `>` or `/` */
const SVG_ROOT = /^<(?:[A-Za-z_][\w.-]*:)?svg[\s/>]/;

function isWhitespace(char: string | undefined) {
  return char === " " || char === "\t" || char === "\n" || char === "\r";
}

/** The index after the first `token` from `from`, or -1 when there's none */
function after(text: string, token: string, from: number) {
  const index = text.indexOf(token, from);
  return index === -1 ? -1 : index + token.length;
}

/**
 * Whether the data starts like an SVG document: an optional UTF-8 BOM, then
 * any XML declaration, processing instructions, comments and doctype before
 * an `<svg>` root element. It only looks at the start, and doesn't parse it.
 */
export function isSvg(data: Uint8Array) {
  // Maps each byte to a character, so the markup can be found without
  // decoding UTF-8
  const text = new TextDecoder("latin1").decode(data.subarray(0, SNIFF_LENGTH));
  let i = text.startsWith("\xef\xbb\xbf") ? 3 : 0;

  while (i < text.length) {
    while (isWhitespace(text[i])) {
      i++;
    }

    let end: number;

    if (text.startsWith("<?", i)) {
      end = after(text, "?>", i + 2);
    } else if (text.startsWith("<!--", i)) {
      end = after(text, "-->", i + 4);
    } else if (text.startsWith("<!DOCTYPE", i)) {
      const subset = text.indexOf("[", i);
      const close = text.indexOf(">", i);
      // An internal subset's declarations contain `>` too
      const from =
        subset !== -1 && subset < close ? after(text, "]", subset) : i;
      end = from === -1 ? -1 : after(text, ">", from);
    } else {
      return SVG_ROOT.test(text.slice(i, i + 64));
    }

    // Cut off before the end of the markup
    if (end === -1) {
      return false;
    }

    i = end;
  }

  return false;
}
