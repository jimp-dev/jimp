export function measureText(font, text) {
  let x = 0;

  for (let i = 0; i < text.length; i++) {
    if (font.chars[text[i]]) {
      const kerning =
        font.kernings[text[i]] && font.kernings[text[i]][text[i + 1]]
          ? font.kernings[text[i]][text[i + 1]]
          : 0;

      x += (font.chars[text[i]].xadvance || 0) + kerning;
    }
  }

  return x;
}

export function splitLines(font, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = [];
  let longestLine = 0;

  words.forEach((word) => {
    const line = [...currentLine, word].join(" ");
    const length = measureText(font, line);

    if (length <= maxWidth) {
      if (length > longestLine) {
        longestLine = length;
      }

      currentLine.push(word);
    } else {
      lines.push(currentLine);
      currentLine = [word];
    }
  });

  lines.push(currentLine);

  return {
    lines,
    longestLine,
  };
}

export function measureTextHeight(font, text, maxWidth) {
  const { lines } = splitLines(font, text, maxWidth);

  return lines.length * font.common.lineHeight;
}
