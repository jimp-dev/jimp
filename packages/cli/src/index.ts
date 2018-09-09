#!/usr/bin/env node

import setUpCli from './cli';
import { ICliOptions, processImage } from './process-image';

export async function runCLI() {
  const { argv } = setUpCli(process.argv.slice(2));

  if (argv.src) {
    await processImage(argv as ICliOptions);
  }
}

runCLI();
