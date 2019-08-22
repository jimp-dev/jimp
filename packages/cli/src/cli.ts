#!/usr/bin/env node

import yargs from 'yargs';
import custom from '@jimp/custom';
import Jimp from 'jimp';

import { logResult, log } from './log';
import { loadFont } from './load-font';

const omitFunctions = [
  'read', // configured below
  'create',
  'appendConstructorOption',
  'distance', // configured below
  'diff', // configured below
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

function load(type: string, toLoad: string[], verbose: boolean) {
  return toLoad.map(entry => {
    try {
      const result = require(entry);
      log(` 🔌  Loaded ${type}: ${entry}`, verbose);
      return result;
    } catch (error) {
      log(`Couldn't load ${type} [${entry}]. Make sure it's installed.`, true);
    }
  });
}

function loadConfiguration(
  plugins: string[],
  types: string[],
  verbose: boolean
) {
  if (!plugins.length && !types.length) {
    return;
  }

  log(` 🔄  Loading custom types/plugins into Jimp...`, verbose);

  const loadedPlugins = load('plugin', plugins, verbose);
  const loadedTypes = load('type', types, verbose);

  custom({ types: loadedTypes, plugins: loadedPlugins }, Jimp);
}

function getArgs(args: string[], variations: string[]) {
  return args
    .map(
      (arg, index) => (variations.indexOf(arg) > -1 ? args[index + 1] : null)
    )
    .filter(Boolean);
}

export default function setUpCli(args?: string[], log = logResult) {
  // can't call argv before done setting up
  const verbose = !!args.find(arg => arg === '-v' || arg === '--verbose');
  const plugins = getArgs(args, ['--plugins', '-p']);
  const types = getArgs(args, ['--types', '-t']);

  loadConfiguration(plugins, types, verbose);

  const yargsConfig = yargs(args)
    .scriptName('jimp')
    .option('plugins', {
      alias: 'p',
      type: 'array',
      describe: 'Jimp plugins to load.'
    })
    .option('types', {
      alias: 't',
      type: 'array',
      describe: 'Jimp types to load.'
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
    .group(['plugins', 'types', 'loadFont'], 'Jimp Configuration:')
    .example(
      '$0 read path/to/image.png --output output.jpg',
      'Convert images from one type to another. See more under jimp read --help'
    )
    .alias('font', 'loadFont')
    .demandCommand(1, 'You need at least one command before moving on')
    .command({
      command: 'read [img]',
      describe: 'Read and image into jimp. (PNG, JPEG, TIFF, BMP, or GIF)',
      builder: yargs =>
        yargs
          .group(['output', 'actions'], 'Jimp Configuration:')
          .option('output', {
            alias: 'o',
            describe: 'file to output from jimp. (PNG, JPEG, TIFF, or BMP)'
          })
          .option('actions', {
            alias: 'a',
            type: 'array',
            describe: `actions (image manipulation) to run on the input image. Loaded functions ${Object.keys(
              Jimp.prototype
            )
              .sort()
              .join(', ')}`
          })
          .example(
            '$0 read path/to/image.png -a greyscale -a  resize 150 -1 --output output.jpg',
            'Apply image manipulations functions'
          )
          .example(
            '$0 read path/to/image.png --loadFont FONT_SANS_8_WHITE -a yarnprint 0 0 "Some text" --output output.jpg',
            'Use fonts'
          )
          .example(
            '$0 read path/to/image.png --plugins @jimp/plugin-circle -a circle --output output.jpg',
            'Use plugins'
          )
          .example(
            '$0 read path/to/image.png -a blit /path/to/image.png 0 0 --output output.jpg',
            'Use blit composite or mask'
          )
    })
    .command({
      command: 'create',
      describe: 'Create a new image',
      builder: yargs =>
        yargs
          .group(['width', 'height', 'background'], 'New Image Configuration:')
          .group(['output', 'actions'], 'Jimp Configuration:')
          .demandOption(
            ['width', 'height'],
            'Please provide both height and width to create new image'
          )
          .option('width', {
            alias: 'w',
            type: 'number',
            describe: 'Width of new image'
          })
          .option('height', {
            alias: 'he',
            type: 'number',
            describe: 'Height of new image'
          })
          .option('background', {
            alias: 'b',
            describe: 'Background color - either hex value or css string'
          })
          .option('output', {
            alias: 'o',
            describe: 'file to output from jimp. (PNG, JPEG, TIFF, or BMP)'
          })
          .option('actions', {
            alias: 'a',
            type: 'array',
            describe: `actions (image manipulation) to run on the input image. Loaded functions ${Object.keys(
              Jimp.prototype
            )
              .sort()
              .join(', ')}`
          })
          .example(
            '$0 create -w 100 -he 300 -o output.jpg',
            'create a blank image'
          )
          .example(
            '$0 create -w 100 -he 300 -b 0xff0000ff -o output.jpg',
            'create a red image'
          )
          .example(
            '$0 create -w 100 -he 300 -b "#FFJJED" -o output.jpg',
            'create a css color image'
          )
          .example(
            '$0 create -w 100 -he 300 -b 0xff0000ff --loadFont FONT_SANS_8_WHITE -a print 0 0 "Some text" -o output.jpg',
            'Run actions on the new image'
          )
          .example(
            '$0 create path/to/image.png -a blit /path/to/image.png 0 0 --output output.jpg',
            'Use blit composite or mask'
          )
    })
    .command({
      command: 'distance [img1] [img2]',
      describe:
        'Calculates the hamming distance of two images based on their perceptual hash',
      builder: function(yargs) {
        return yargs
          .example('$0 distance path/to/image.png path/to/another.png', '')
          .hide('version')
          .hide('font');
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
          .hide('font');
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
        descriptions[x],
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
