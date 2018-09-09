#!/usr/bin/env node

import * as yargs from 'yargs';
import Jimp = require('jimp');
import { log, greenCheck } from './log';

export async function loadFont(font: string): Promise<Jimp.Font> {
  if (font) {
    log(` 🔤  Loading font: ${font} ...`);
    return await Jimp.loadFont(Jimp[font] || font);
  }

  return;
}

function runActions(image: Jimp, actions: string[], font: Jimp.Font) {
  if (actions) {
    actions.map(action => {
      const [fn, ...args] = /\[([\S\s]*)\]/.exec(action)[1].split(',');

      const typedArgs: any[] = args.map(arg => {
        if (/^\d+$/.test(arg)) {
          return Number(arg);
        }

        return arg;
      });

      const argsString = typedArgs.length
        ? ` with args: [ ${typedArgs.join(', ')} ]`
        : '';
      log(`️🖍️  Applying ${fn}${argsString}`);

      if (fn === 'print') {
        typedArgs.unshift(font);
      }

      image[fn](...typedArgs);
    });
  }
}

export interface ICliOptions extends yargs.Arguments {
  src: string;
  dist: string;
  actions: string[];
  loadFont?: string;
}

export async function processImage({
  src,
  dist,
  actions,
  loadFont: font
}: ICliOptions) {
  log(` 📷  Loading source image: ${src} ...`);

  const image = await Jimp.read(src);
  const loadedFont = await loadFont(font);

  runActions(image, actions, loadedFont);

  if (dist) {
    image.write(dist, error => {
      if (error) {
        throw error;
      }

      log(` ${greenCheck}️ Image successfully written to: ${dist}`);
    });
  }
}
