#!/usr/bin/env node

import * as yargs from 'yargs';
import Jimp = require('jimp');

import { logResult } from './log';
import { loadFont } from './load-font';

const omitFunctions = [
  'read',
  'create',
  'appendConstructorOption',
  'distance', // configured above
  'diff', // configured above
  'loadFont' // loaded as flag
];

const descriptions = {
  rgbaToInt:
    'A static helper method that converts RGBA values to a single integer value. args: r, g, b, a (0 - 255)',
  intToRGBA:
    'A static helper method that converts RGBA values to a single integer value. args: num (eg 0xFF0000FF)',
  cssColorToHex:
    ' Converts a css color (Hex, 8-digit (RGBA) Hex, RGB, RGBA, HSL, HSLA, HSV, HSVA, Named) to a hex number',
  limit255: 'Limits a number to between 0 or 255. args: num',
  compareHashes:
    ' Calculates the hamming distance of two images based on their perceptual hash. args: hash1, hash2',
  colorDiff:
    'Compute color difference. args: color1, color2 ({r:val, g:val, b:val, a:val})',
  measureText: 'Measure how wide printing a string will be. args: text',
  measureTextHeight:
    'Measure how tall printing a string will be. args: text, width'
};

export default function setUpCli(args?: string[], log = logResult) {
  const yargsConfig = yargs(args)
    .scriptName('jimp')
    .option('src', {
      alias: 's',
      describe: 'src file to load into jimp. (PNG, JPEG, TIFF, BMP, or GIF)'
    })
    .option('dist', {
      alias: 'd',
      describe: 'dist file to output from jimp. (PNG, JPEG, TIFF, or BMP)'
    })
    .option('actions', {
      alias: 'a',
      type: 'array',
      describe: 'actions (image manipulation) to run on the input image'
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      describe: 'enable more logging'
    })
    .option('loadFont', {
      alias: 'f',
      type: 'string',
      describe: 'Path of font to load and be used in text operations'
    })
    .alias('font', 'loadFont')
    .alias('h', 'help')
    .command({
      command: 'distance [img1] [img2]',
      describe:
        'Calculates the hamming distance of two images based on their perceptual hash',
      builder: function(yargs) {
        return yargs
          .example('$0 distance path/to/image.png path/to/another.png', '')
          .hide('version')
          .hide('src')
          .hide('dist')
          .hide('font')
          .hide('actions');
      },
      handler: async ({ img1, img2 }) => {
        const base = await Jimp.read(img1);
        const compare = await Jimp.read(img2);
        const distance = Jimp.distance(base, compare);

        log('distance', distance);
      }
    })
    .command({
      command: 'diff [img1] [img2]',
      describe: 'Diffs two images',
      builder: function(yargs) {
        return yargs
          .example('$0 diff [img1] [img2]', '-o')
          .option('outputDiff', {
            alias: 'o',
            describe: 'File to output diff to.'
          })
          .hide('version')
          .hide('src')
          .hide('dist')
          .hide('font')
          .hide('actions');
      },
      handler: async ({ img1, img2, outputDiff }) => {
        const base = await Jimp.read(img1);
        const compare = await Jimp.read(img2);
        const diff = Jimp.diff(base, compare);
        log('diff', diff.percent);

        if (outputDiff) {
          diff.image.writeAsync(outputDiff === true ? 'diff.png' : outputDiff);
        }
      }
    });

  Object.keys(Jimp).map(x => {
    if (omitFunctions.indexOf(x) > -1) {
      return;
    }

    const utilityFunction = Jimp[x];

    if (typeof utilityFunction === 'function') {
      yargsConfig.command(
        x,
        descriptions[x] || `Jimp utility function ${x}`,
        {},
        async ({ _, font, verbose }) => {
          const args: any[] = _.slice(1);

          if (x === 'measureText' || x === 'measureTextHeight') {
            const loadedFont = await loadFont(font, verbose);
            args.unshift(loadedFont);
          }

          const result = utilityFunction(...args);

          log(x, result);
        }
      );
    }
  });

  return yargsConfig;
}
