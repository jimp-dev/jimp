#!/usr/bin/env node

import * as yargs from 'yargs';
// import * as log from 'log-update';
import * as logSymbols from 'log-symbols';
import chalk from 'chalk';
import Jimp = require('jimp');

const greenCheck = chalk.green(`${logSymbols.success} `);

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
    type: 'string',
    describe: 'Path of font to load and be used in text operations'
  })
  .alias('h', 'help');

const omitFunctions = [
  'read',
  'create',
  'appendConstructorOption',
  'diff', // need to make sure it works
  'measureText', // figure out font loading
  'measureTextHeight', // figure out font loading
  'loadFont' // figure out font loading
];

Object.keys(Jimp).map(x => {
  if (omitFunctions.indexOf(x) > -1) {
    return;
  }

  const utilityFunction = Jimp[x];
  if (typeof utilityFunction === 'function') {
    yargsConfig.command(x, `Jimp utility function ${x}`, {}, ({ _ }) => {
      const result = utilityFunction(..._.slice(1));

      if (result !== undefined) {
        console.log(
          `${greenCheck}  Result of running '${x}': ${JSON.stringify(result)}`
        );
      }
    });
  }
});

const { argv } = yargsConfig;

const log = message => argv.verbose && console.log(message);

function runActions(
  image: Jimp,
  actions: string[],
  { font }: { font: Jimp.Font }
) {
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
}

async function loadFont(): Promise<Jimp.Font> {
  if (argv.loadFont) {
    log(` 🔤  Loading font: ${argv.loadFont} ...`);
    return await Jimp.loadFont(Jimp[argv.loadFont] || argv.loadFont);
  }

  return;
}

async function processImage({ src, dist, actions }: ICliOptions) {
  log(` 📷  Loading source image: ${src} ...`);

  const image = await Jimp.read(src);
  const font = await loadFont();

  runActions(image, actions, { font });

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
