#!/usr/bin/env node

import setUpCli from './cli';
import { processImage } from './process-image';

export async function runCLI(args = process.argv) {
  const argv = setUpCli(args.slice(2)).argv;

  if (argv._.includes('read')) {
    await processImage(argv);
  }
}

runCLI();
