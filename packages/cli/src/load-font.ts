import Jimp from 'jimp';
import { log } from './log';

export async function loadFont(font?: string, verbose?: boolean) {
  if (font) {
    log(` 🔤  Loading font: ${font} ...`, verbose);
    return await Jimp.loadFont((Jimp[font] as unknown as string) || font);
  }

  return;
}
