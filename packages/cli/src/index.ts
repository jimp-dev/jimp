#!/usr/bin/env node

import * as yargs from 'yargs';
// import * as log from 'log-update';
import * as logSymbols from 'log-symbols';
import chalk from 'chalk';
import Jimp = require('jimp');

const { argv } = yargs
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
  .alias('h', 'help');

const log = message => argv.verbose && console.log(message);

function runActions(image: Jimp, actions: string[]) {
  if (actions) {
    actions.map(action => {
      const [fn, ...args] = /\[(\S+)+\]/.exec(action)[1].split(',');

      const typedArgs = args.map(arg => {
        if (/^\d+$/.test(arg)) {
          return Number(arg);
        }

        return arg;
      });

      const argsString = typedArgs.length
        ? ` with args: [ ${typedArgs.join(', ')} ]`
        : '';
      log(`️🖍️  Applying ${fn}${argsString}`);

      image[fn](...typedArgs);
    });
  }
}

interface ICliOptions extends yargs.Arguments {
  src: string;
  dist: string;
  actions: string[];
}

async function processImage({ src, dist, actions }: ICliOptions) {
  log(` 📷  Loading ${src} ...`);

  const image = await Jimp.read(src);
  const greenCheck = chalk.green(`${logSymbols.success} `);

  runActions(image, actions);

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
