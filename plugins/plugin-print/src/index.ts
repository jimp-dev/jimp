import { HorizontalAlign, VerticalAlign } from "@jimp/core";
import { JimpClass } from "@jimp/types";
import { blit } from "@jimp/plugin-blit";

import { measureText, measureTextHeight, splitLines } from "./measure-text.js";
import { BmFont } from "./types.js";

export { measureText, measureTextHeight } from "./measure-text.js";

function xOffsetBasedOnAlignment<I extends JimpClass>(
  font: BmFont<I>,
  line: string,
  maxWidth: number,
  alignment: HorizontalAlign
) {
  if (alignment === HorizontalAlign.LEFT) {
    return 0;
  }

  if (alignment === HorizontalAlign.CENTER) {
    return (maxWidth - measureText(font, line)) / 2;
  }

  return maxWidth - measureText(font, line);
}

function drawCharacter<I extends JimpClass>(
  image: I,
  font: BmFont<I>,
  x: number,
  y: number,
  char: any
) {
  if (char.width > 0 && char.height > 0) {
    const characterPage = font.pages[char.page];

    if (characterPage) {
      image = blit(image, {
        src: characterPage,
        x: x + char.xoffset,
        y: y + char.yoffset,
        srcX: char.x,
        srcY: char.y,
        srcW: char.width,
        srcH: char.height,
      });
    }
  }

  return image;
}

function printText<I extends JimpClass>(
  image: I,
  font: BmFont<I>,
  x: number,
  y: number,
  text: string,
  defaultCharWidth: number
) {
  for (let i = 0; i < text.length; i++) {
    const stringChar = text[i]!;

    let char;

    if (font.chars[stringChar]) {
      char = stringChar;
    } else if (/\s/.test(stringChar)) {
      char = "";
    } else {
      char = "?";
    }

    const fontChar = font.chars[char] || { xadvance: undefined };
    const fontKerning = font.kernings[char];

    drawCharacter(image, font, x, y, fontChar || {});

    const nextChar = text[i + 1];
    const kerning =
      fontKerning && nextChar && fontKerning[nextChar]
        ? fontKerning[nextChar] || 0
        : 0;

    x += kerning + (fontChar.xadvance || defaultCharWidth);
  }
}

function print<I extends JimpClass>(
  image: I,
  font: BmFont<I>,
  x: number,
  y: number,
  text:
    | string
    | number
    | {
        text: string | number;
        alignmentX?: HorizontalAlign;
        alignmentY?: VerticalAlign;
      },
  maxWidth: number = Infinity,
  maxHeight: number = Infinity,
  cb: (options: { x: number; y: number }) => void = () => {}
) {
  if (typeof font !== "object") {
    throw new Error("font must be a font loaded with loadFont");
  }

  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    typeof maxWidth !== "number"
  ) {
    throw new Error("x, y and maxWidth must be numbers");
  }

  if (typeof maxWidth !== "number") {
    throw new Error("maxWidth must be a number");
  }

  if (typeof maxHeight !== "number") {
    throw new Error("maxHeight must be a number");
  }

  let alignmentX: HorizontalAlign;
  let alignmentY: VerticalAlign;

  if (
    typeof text === "object" &&
    text.text !== null &&
    text.text !== undefined
  ) {
    alignmentX = text.alignmentX || HorizontalAlign.LEFT;
    alignmentY = text.alignmentY || VerticalAlign.TOP;
    ({ text } = text);
  } else {
    alignmentX = HorizontalAlign.LEFT;
    alignmentY = VerticalAlign.TOP;
    text = text.toString();
  }

  if (typeof text === "number") {
    text = text.toString();
  }

  if (maxHeight !== Infinity && alignmentY === VerticalAlign.BOTTOM) {
    y += maxHeight - measureTextHeight(font, text, maxWidth);
  } else if (maxHeight !== Infinity && alignmentY === VerticalAlign.MIDDLE) {
    y += maxHeight / 2 - measureTextHeight(font, text, maxWidth) / 2;
  }

  const defaultCharWidth = Object.entries(font.chars).find(
    (c) => c[1].xadvance
  )?.[1].xadvance;

  if (typeof defaultCharWidth !== "number") {
    throw new Error("Could not find default character width");
  }

  const { lines, longestLine } = splitLines(font, text, maxWidth);

  lines.forEach((line) => {
    const lineString = line.join(" ");
    const alignmentWidth = xOffsetBasedOnAlignment(
      font,
      lineString,
      maxWidth,
      alignmentX
    );

    printText(image, font, x + alignmentWidth, y, lineString, defaultCharWidth);
    y += font.common.lineHeight;
  });

  cb({ x: x + longestLine, y });

  return image;
}

export default function printPlugin() {
  return {
    /**
     * Draws a text on a image on a given boundary
     * @param font a bitmap font loaded from `Jimp.loadFont` command
     * @param x the x position to start drawing the text
     * @param y the y position to start drawing the text
     * @param text the text to draw (string or object with `text`, `alignmentX`, and/or `alignmentY`)
     * @param maxWidth the boundary width to draw in
     * @param maxHeight the boundary height to draw in
     * @param cb (optional) a callback for when complete that ahs the end co-ordinates of the text
     */
    print,
  };
}

export * from "./types.js";
