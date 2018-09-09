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
  .alias('h', 'help');

interface ICliOptions extends yargs.Arguments {
  src: string;
  dist: string;
}

async function processImage({ src, dist }: ICliOptions) {
  log(`📷   Loading ${src} ...`);

  const image = await Jimp.read(src);
  const greenCheck = chalk.green(`${logSymbols.success} `);

  if (dist) {
    image.write(dist, (error, res) => {
      if (error) {
        throw error;
      }

      log(`${greenCheck}️ Image successfully written to: ${dist}`);
    });
  }
}

if (argv.src) {
  processImage(argv as ICliOptions);
}
