#!/usr/bin/env node

import * as yargs from 'yargs';
import * as logSymbols from 'log-symbols';
import chalk from 'chalk';
import Jimp = require('jimp');

const greenCheck = chalk.green(`${logSymbols.success} `);
const log = (message, verbose = argv && argv.verbose) =>
  verbose && console.log(message);
const logResult = (functionName, result) =>
  log(
    `${greenCheck}  Result of running '${functionName}': ${JSON.stringify(
      result
    )}`,
    true
  );

const yargsConfig = yargs
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
    handler: async ({ _ }) => {
      const args = _.slice(1);

      const img1 = await Jimp.read(args[0]);
      const img2 = await Jimp.read(args[1]);
      const distance = Jimp.distance(img1, img2);

      logResult('distance', distance);
    }
  })
  .command(
    'diff',
    'Diffs two images',
    function(yargs) {
      return yargs
        .example('$0 diff path/to/image.png path/to/another.png -o', '')
        .option('outputDiff', {
          alias: 'o',
          default: 'diff.png',
          describe: 'File to output diff to.'
        })
        .hide('version')
        .hide('src')
        .hide('dist')
        .hide('font')
        .hide('actions');
    },
    async ({ _, outputDiff }) => {
      const args = _.slice(1);

      const img1 = await Jimp.read(args[0]);
      const img2 = await Jimp.read(args[1]);
      const diff = Jimp.diff(img1, img2);

      logResult('diff', diff.percent);

      if (outputDiff) {
        diff.image.writeAsync(outputDiff === true ? 'diff.png' : outputDiff);
      }
    }
  );

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
      async ({ _, font }) => {
        const args: any[] = _.slice(1);

        if (x === 'measureText' || x === 'measureTextHeight') {
          const loadedFont = await loadFont(font);
          args.unshift(loadedFont);
        }

        const result = utilityFunction(...args);

        if (result !== undefined) {
          logResult(x, result);
        }
      }
    );
  }
});

const { argv } = yargsConfig;

async function loadFont(font: string): Promise<Jimp.Font> {
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

interface ICliOptions extends yargs.Arguments {
  src: string;
  dist: string;
  actions: string[];
  loadFont?: string;
}

async function processImage({
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

if (argv.src) {
  processImage(argv as ICliOptions);
}
