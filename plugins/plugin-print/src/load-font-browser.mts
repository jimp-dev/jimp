import { loadBitmapFont } from "./load-bitmap-font.js";
import { createJimp } from "@jimp/core";

const CharacterJimp = createJimp({});

export async function loadFont(url: string) {
  const font = await loadBitmapFont(url);

  return {
    ...font,
    pages: await Promise.all(font.pages.map(CharacterJimp.read)),
  };
}
