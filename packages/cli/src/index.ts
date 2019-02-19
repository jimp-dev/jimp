#!/usr/bin/env node

import setUpCli from './cli';
import { manipulateImage, createImage } from './process-image';

export async function runCLI(args = process.argv) {
  const argv = setUpCli(args.slice(2)).argv;

  if (argv._.includes('read')) {
    await manipulateImage(argv);
  }

  if (argv._.includes('create')) {
    await createImage(argv);
  }
}

runCLI();
