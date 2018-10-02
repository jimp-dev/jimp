import Jimp = require('jimp');
import { log } from './log';

export async function loadFont(
  font?: string,
  verbose?: boolean
): Promise<Jimp.Font> {
  if (font) {
    log(` 🔤  Loading font: ${font} ...`, verbose);
    return await Jimp.loadFont(Jimp[font] || font);
  }

  return;
}
