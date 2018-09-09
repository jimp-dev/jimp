#!/usr/bin/env node

import Jimp = require('jimp');
import { log, greenCheck } from './log';
import { loadFont } from './load-font';

export interface ICliOptions {
  src?: string;
  dist?: string;
  actions?: string[];
  verbose?: boolean;
  loadFont?: string;
}

function runActions(
  image: Jimp,
  loadedFont: Jimp.Font,
  { actions, verbose }: ICliOptions
) {
  if (actions) {
    actions.map(action => {
      const hasArgs = /\[([\S\s]*)\]/.exec(action);
      const [fn, ...args] = hasArgs ? hasArgs[1].split(',') : [action];

      const typedArgs: any[] = args.map(arg => {
        if (/^\d+$/.test(arg)) {
          return Number(arg);
        }

        if (arg === 'true') {
          return true;
        }

        if (arg === 'false') {
          return false;
        }

        if (arg.indexOf('{') > -1 || arg.indexOf('[') > -1) {
          try {
            return JSON.parse(arg);
          } catch (error) {}
        }

        return arg;
      });

      const argsString = typedArgs.length
        ? ` with args: [ ${typedArgs.join(', ')} ]`
        : '';
      log(`️🖍️  Applying ${fn}${argsString}`, verbose);

      if (fn === 'print') {
        typedArgs.unshift(loadedFont);
      }

      image[fn](...typedArgs);
    });
  }
}

export async function processImage({
  src,
  dist,
  actions,
  verbose,
  loadFont: font
}: ICliOptions) {
  log(` 📷  Loading source image: ${src} ...`, verbose);

  const image = await Jimp.read(src);
  const loadedFont = await loadFont(font, verbose);

  runActions(image, loadedFont, { actions, verbose });

  if (dist) {
    await image.writeAsync(dist);
    log(` ${greenCheck}️ Image successfully written to: ${dist}`, verbose);
  }
}
