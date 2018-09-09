#!/usr/bin/env node

import * as yargs from 'yargs';
// import * as log from 'log-update';
import * as logSymbols from 'log-symbols';
import chalk from 'chalk';
import Jimp = require('jimp');

const greenCheck = chalk.green(`${logSymbols.success} `);
const log = (message, verbose = argv && argv.verbose) =>
  verbose && console.log(message);

const yargsConfig = yargs
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
  .alias('h', 'help');

const omitFunctions = [
  'read',
  'create',
  'appendConstructorOption',
  'distance', // need to make sure it works
  'diff', // need to make sure it works
  'loadFont'
];

Object.keys(Jimp).map(x => {
  if (omitFunctions.indexOf(x) > -1) {
    return;
  }

  const utilityFunction = Jimp[x];
  if (typeof utilityFunction === 'function') {
    yargsConfig.command(
      x,
      `Jimp utility function ${x}`,
      {},
      async ({ _, font }) => {
        const args: any[] = _.slice(1);

        if (x === 'measureText' || x === 'measureTextHeight') {
          const loadedFont = await loadFont(font);
          args.unshift(loadedFont);
        }

        const result = utilityFunction(...args);

        if (result !== undefined) {
          console.log(
            `${greenCheck}  Result of running '${x}': ${JSON.stringify(result)}`
          );
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
