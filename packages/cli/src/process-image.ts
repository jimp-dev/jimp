#!/usr/bin/env node

import Jimp from 'jimp';
import { log, greenCheck } from './log';
import { loadFont } from './load-font';

export interface ICliOptions {
  img?: string;
  output?: string;
  actions?: any;
  verbose?: boolean;
  loadFont?: string;
  width?: number;
  height?: number;
  background?: string | number;
}

async function runAction(
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

  if (action === 'composite' || action === 'blit' || action === 'mask') {
    parsedArgs[0] = await Jimp.read(parsedArgs[0]);
  }

  image[action](...parsedArgs);
}

async function runActions(
  image: typeof Jimp,
  loadedFont: any,
  { actions, verbose }: ICliOptions
) {
  if (actions) {
    if (Array.isArray(actions[0])) {
      await Promise.all(
        (actions as [string, ...any[]][]).map(action =>
          runAction(image, verbose, loadedFont, action)
        )
      );
    } else {
      await runAction(image, verbose, loadedFont, actions as [
        string,
        ...any[]
      ]);
    }
  }
}

async function processImage(image, font, actions, output, verbose) {
  const loadedFont = await loadFont(font, verbose);

  await runActions(image, loadedFont, { actions, verbose });

  if (output) {
    await image.writeAsync(output);
    log(` ${greenCheck}️ Image successfully written to: ${output}`, verbose);
  }
}

export async function manipulateImage({
  img,
  output,
  actions,
  verbose,
  loadFont: font
}: ICliOptions) {
  log(` 📷  Loading source image: ${img} ...`, verbose);

  const image = await Jimp.read(img);

  await processImage(image, font, actions, output, verbose);
}
export async function createImage({
  width,
  height,
  background,
  output,
  actions,
  verbose,
  loadFont: font
}: ICliOptions) {
  const backgroundString = background ? ` with background ${background}` : '';
  log(` 📷  Creating image: [${width} ${height}]${backgroundString}`, verbose);

  let image;

  if (background) {
    image = await Jimp.create(width, height, background);
  } else {
    image = await Jimp.create(width, height);
  }

  await processImage(image, font, actions, output, verbose);
}
