import { describe, it } from 'mocha';

import * as fs from 'fs';
import * as should from 'should/as-function';
import { mockConsole } from './utils/mock-console';
import makePath from './utils/makePath';
import { runCLI } from '../src/index';

function run(...args) {
  process.argv = ['', '', ...args];
  return runCLI();
}

describe('index', () => {
  it('outputs nothing normally', async () => {
    const { calls, reset } = mockConsole();
    const output = 'verbose-off.png';

    await run(
      '--src',
      makePath(__dirname, './images/tiny-qr.png'),
      '--dist',
      output
    );

    reset();
    should(calls.length).be.exactly(0);
    fs.unlinkSync(output);
  });

  it('outputs in verbose mode', async () => {
    const { calls, reset } = mockConsole(Infinity);
    const output = 'verbose-on.png';

    await run(
      '--src',
      makePath(__dirname, './images/tiny-qr.png'),
      '--dist',
      output,
      '-v'
    );

    reset();
    should(calls.length).be.exactly(2);
    fs.unlinkSync(output);
  });
});
