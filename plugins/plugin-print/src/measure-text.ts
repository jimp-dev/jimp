import { BmFont } from "./types.js";

export function measureText(font: BmFont, text: string) {
  let x = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;
    const fontChar = font.chars[char];

    if (fontChar) {
      const fontKerning = font.kernings[char];
      const nextChar = text[i + 1];
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
    const nextChar = text[0];

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
          currentLastChar = char[char.length - 1];
        } else if (length > maxWidth) {
          lines.push([...currentLine, current]);
          currentLine = [];
          current = char;
          currentWidth = measureText(font, char);
          currentLastChar = char[char.length - 1];
        } else {
          lines.push([...currentLine, current + char]);
          currentLine = [];
          current = "";
          currentWidth = 0;
          currentLastChar = undefined;
        }
      }

      if (currentLine.length === 0) {
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
      lineLastChar = appended[appended.length - 1];
    } else {
      const nextLine = word.replace("\n", "");

      lines.push(currentLine);
      currentLine = [nextLine];
      lineWidth = measureText(font, nextLine);
      lineLastChar = nextLine[nextLine.length - 1];
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
