import { BmFont } from "./types.js";

/** Line breaks: `\n`, `\r\n` or `\r` */
const LINE_BREAK = /\r\n?|\n/;

/**
 * The last character of `text`. Characters outside the BMP are two UTF-16
 * code units long, so `text[text.length - 1]` would only be half of one.
 */
function lastCharacter(text: string) {
  const last = text.slice(-2);

  return last.length === 2 && last.codePointAt(0)! > 0xffff
    ? last
    : text.slice(-1) || undefined;
}

/**
 * The character `print` draws for `char`: `char` itself if the font has a
 * glyph for it, and `?` if it doesn't. Undefined for whitespace the font has
 * no glyph for, and when the font has no `?` either.
 */
export function glyphCharacter(font: BmFont, char: string) {
  if (font.chars[char]) {
    return char;
  }

  if (!/\s/.test(char) && font.chars["?"]) {
    return "?";
  }

  return undefined;
}

/**
 * The kerning between the glyphs drawn for `char` and `nextChar`. Like
 * `print`, it uses the kerning to `?` if `nextChar` is drawn as one.
 */
export function kerning(
  font: BmFont,
  char: string | undefined,
  nextChar: string | undefined,
) {
  const first = char && glyphCharacter(font, char);
  const second = nextChar && (glyphCharacter(font, nextChar) ?? nextChar);

  return (first && second && font.kernings[first]?.[second]) || 0;
}

/** The width of a single line of text */
function measureLine(font: BmFont, text: string) {
  // Glyphs are keyed by code point, so walk the text by code point too
  const characters = Array.from(text);
  let x = 0;

  for (let i = 0; i < characters.length; i++) {
    const char = glyphCharacter(font, characters[i]!);

    if (char) {
      x +=
        (font.chars[char]!.xadvance || 0) +
        kerning(font, char, characters[i + 1]);
    }
  }

  return x;
}

/**
 * Measures the width of `text` when printed with `font`. Line breaks
 * (`\n`, `\r\n` or `\r`) start a new line like they do in `print`, so this
 * is the width of the widest line. Empty lines are 0 wide.
 * @param font a bitmap font loaded with `loadFont`
 * @param text the text to measure
 * @returns the width in pixels
 */
export function measureText(font: BmFont, text: string) {
  return text
    .split(LINE_BREAK)
    .reduce((width, line) => Math.max(width, measureLine(font, line)), 0);
}

/**
 * Measures `text` appended to a string that is `width` wide and ends with
 * `lastChar`. Same result as measuring the joined string, without walking
 * the part that was already measured.
 */
function measureAppendedText(
  font: BmFont,
  width: number,
  lastChar: string | undefined,
  text: string,
) {
  const [nextChar] = text;

  return width + kerning(font, lastChar, nextChar) + measureLine(font, text);
}

/**
 * Splits `text` into lines at line breaks, keeping empty lines, and wraps
 * each of them at `maxWidth`. Each line is the list of its words, separated
 * by single spaces, so `line.join(" ")` is the text of the line.
 */
export function splitLines(font: BmFont, text: string, maxWidth: number) {
  const lines = text
    .split(LINE_BREAK)
    .flatMap((paragraph) => wrapLine(font, paragraph, maxWidth));

  // Measured once at the end so lines started by a wrap or a newline count too
  const longestLine = lines.reduce(
    (width, line) => Math.max(width, measureLine(font, line.join(" "))),
    0,
  );

  return {
    lines,
    longestLine,
  };
}

/** Whether a line, as a list of words, is empty or only spaces */
function isOnlySpaces(line: string[]) {
  return line.every((word) => word === "");
}

/** Wraps a line of text without line breaks at `maxWidth` */
function wrapLine(font: BmFont, text: string, maxWidth: number) {
  const words = text.split(" ");

  const lines: string[][] = [];
  let currentLine: string[] = [];
  // Width and last character of currentLine.join(" "), kept up to date so
  // the whole line is not re-measured for every word.
  let lineWidth = 0;
  let lineLastChar: string | undefined;

  words.forEach((word) => {
    const wordWidth = measureLine(font, word);

    // If a word is longer than the allowable width we need to split it across lines.
    if (wordWidth > maxWidth) {
      const characterIterator = word[Symbol.iterator]();

      let current = "";
      // Width and last character of [...currentLine, current].join(" ")
      let currentWidth = 0;
      let currentLastChar: string | undefined;

      if (currentLine.length > 0) {
        currentWidth = measureAppendedText(font, lineWidth, lineLastChar, " ");
        currentLastChar = " ";
      }

      for (const char of characterIterator) {
        const length = measureAppendedText(
          font,
          currentWidth,
          currentLastChar,
          char,
        );

        if (length < maxWidth) {
          current += char;
          currentWidth = length;
          currentLastChar = char;
        } else if (length > maxWidth) {
          lines.push([...currentLine, current]);
          currentLine = [];
          current = char;
          currentWidth = measureLine(font, char);
          currentLastChar = char;
        } else {
          lines.push([...currentLine, current + char]);
          currentLine = [];
          current = "";
          currentWidth = 0;
          currentLastChar = undefined;
        }
      }

      // Keep the rest of the word so following words continue after it.
      if (current) {
        currentLine.push(current);
        lineWidth = currentWidth;
        lineLastChar = currentLastChar;
      } else if (currentLine.length === 0) {
        lineWidth = 0;
        lineLastChar = undefined;
      }

      return;
    }

    const appended = currentLine.length > 0 ? ` ${word}` : word;
    const length = measureAppendedText(font, lineWidth, lineLastChar, appended);

    if (length <= maxWidth) {
      currentLine.push(word);
      lineWidth = length;
      lineLastChar = lastCharacter(appended);
    } else {
      // Spaces where the line wraps are dropped, not left on a line of their own
      if (!isOnlySpaces(currentLine)) {
        lines.push(currentLine);
      }

      currentLine = [word];
      lineWidth = wordWidth;
      lineLastChar = lastCharacter(word);
    }
  });

  // A line of only spaces is kept, unless it's the spaces left after a wrap
  if (lines.length === 0 || !isOnlySpaces(currentLine)) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Measures the height of `text` when printed with `font`, wrapped at
 * `maxWidth` like `print` does. Every line break starts a new line, so
 * `"a\n\nb"` is three lines high, and leading or trailing line breaks add
 * empty lines too.
 * @param font a bitmap font loaded with `loadFont`
 * @param text the text to measure
 * @param maxWidth the width to wrap the text at. Without it the text only
 * breaks at newlines.
 * @returns the height in pixels: the number of lines, including empty ones,
 * times the font's line height
 */
export function measureTextHeight(
  font: BmFont,
  text: string,
  maxWidth = Infinity,
) {
  const { lines } = splitLines(font, text, maxWidth);

  return lines.length * font.common.lineHeight;
}
