#!/usr/bin/env node

import * as yargs from 'yargs';
import * as log from 'log-update';
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
  .alias('h', 'help');

interface ICliOptions extends yargs.Arguments {
  src: string;
  dist: string;
}

async function processImage({ src, dist, actions }: ICliOptions) {
  console.log(` 📷  Loading ${src} ...`);

  const image = await Jimp.read(src);
  const greenCheck = chalk.green(`${logSymbols.success} `);

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
      console.log(`️🖍️  Applying ${fn}${argsString}`);

      image[fn](...typedArgs);
    });
  }

  if (dist) {
    image.write(dist, (error, res) => {
      if (error) {
        throw error;
      }

      console.log(` ${greenCheck}️ Image successfully written to: ${dist}`);
    });
  }
}

if (argv.src) {
  console.log(argv);
  processImage(argv as ICliOptions);
}
