import { BmFont } from "./types.js";

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

export function measureText(font: BmFont, text: string) {
  // Glyphs are keyed by code point, so walk the text by code point too
  const characters = Array.from(text);
  let x = 0;

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i]!;
    const fontChar = font.chars[char];

    if (fontChar) {
      const fontKerning = font.kernings[char];
      const nextChar = characters[i + 1];
      const kerning =
        fontKerning && nextChar && fontKerning[nextChar]
          ? fontKerning[nextChar] || 0
          : 0;

      x += (fontChar.xadvance || 0) + kerning;
    }
  }

  return x;
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
  if (lastChar && font.chars[lastChar]) {
    const fontKerning = font.kernings[lastChar];
    const [nextChar] = text;

    width +=
      fontKerning && nextChar && fontKerning[nextChar]
        ? fontKerning[nextChar] || 0
        : 0;
  }

  return width + measureText(font, text);
}

export function splitLines(font: BmFont, text: string, maxWidth: number) {
  const words = text.replace(/[\r\n]+/g, " \n").split(" ");

  const lines: string[][] = [];
  let currentLine: string[] = [];
  let longestLine = 0;
  // Width and last character of currentLine.join(" "), kept up to date so
  // the whole line is not re-measured for every word.
  let lineWidth = 0;
  let lineLastChar: string | undefined;

  words.forEach((word) => {
    const wordWidth = measureText(font, word + (words.length > 1 ? " " : ""));

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
          currentWidth = measureText(font, char);
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

    if (length <= maxWidth && !word.includes("\n")) {
      if (length > longestLine) {
        longestLine = length;
      }

      currentLine.push(word);
      lineWidth = length;
      lineLastChar = lastCharacter(appended);
    } else {
      const nextLine = word.replace("\n", "");

      lines.push(currentLine);
      currentLine = [nextLine];
      lineWidth = measureText(font, nextLine);
      lineLastChar = lastCharacter(nextLine);
    }
  });

  lines.push(currentLine);

  return {
    lines,
    longestLine,
  };
}

export function measureTextHeight(
  font: BmFont,
  text: string,
  maxWidth: number,
) {
  const { lines } = splitLines(font, text, maxWidth);

  return lines.length * font.common.lineHeight;
}
