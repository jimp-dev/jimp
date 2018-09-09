#!/usr/bin/env node

import setUpCli from './cli';
import { ICliOptions, loadFont, processImage } from './process-image';

const { argv } = setUpCli(process.argv.slice(2));

if (argv.src) {
  processImage(argv as ICliOptions);
}
