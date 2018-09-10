#!/usr/bin/env node

import Jimp = require('jimp');
import { log, greenCheck } from './log';
import { loadFont } from './load-font';

export interface ICliOptions {
  img?: string;
  output?: string;
  actions?: any;
  verbose?: boolean;
  loadFont?: string;
}

function runAction(
  image,
  verbose,
  loadedFont,
  [action, ...args]: [string, ...any[]]
) {
  const argsString = args.length ? ` with args: [ ${args.join(', ')} ]` : '';
  log(`️🖍️  Applying ${action}${argsString}`, verbose);

  const parsedArgs = args.map(arg => {
    try {
      return JSON.parse(arg);
    } catch (error) {
      return arg;
    }
  });

  if (action === 'print') {
    parsedArgs.unshift(loadedFont);
  }

  image[action](...parsedArgs);
}

function runActions(
  image: Jimp,
  loadedFont: Jimp.Font,
  { actions, verbose }: ICliOptions
) {
  if (actions) {
    if (Array.isArray(actions[0])) {
      (actions as [string, ...any[]][]).map(action =>
        runAction(image, verbose, loadedFont, action)
      );
    } else {
      runAction(image, verbose, loadedFont, actions as [string, ...any[]]);
    }
  }
}

export async function processImage({
  img,
  output,
  actions,
  verbose,
  loadFont: font
}: ICliOptions) {
  log(` 📷  Loading source image: ${img} ...`, verbose);

  const image = await Jimp.read(img);
  const loadedFont = await loadFont(font, verbose);

  runActions(image, loadedFont, { actions, verbose });

  if (output) {
    await image.writeAsync(output);
    log(` ${greenCheck}️ Image successfully written to: ${output}`, verbose);
  }
}
