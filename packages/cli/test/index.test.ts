import 'should';
import { describe, it } from 'mocha';

import * as fs from 'fs';
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
    calls.length.should.be.exactly(0);
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
    calls.length.should.be.exactly(2);
    fs.unlinkSync(output);
  });

  describe('plugins', () => {
    it('errors if plugin not found', async () => {
      const { reset } = mockConsole(Infinity);

      try {
        await run(
          '--src',
          makePath(__dirname, './images/tiny-qr.png'),
          '-p',
          '@jimp/plugin-non-existant'
        );
        reset();
      } catch (error) {
        reset();
        error.should.be.ok();
      }
    });

    it('loads plugins', async () => {
      const { calls, reset } = mockConsole(Infinity);
      const output = 'plugins-on.png';

      await run(
        '--src',
        makePath(__dirname, './images/tiny-qr.png'),
        '--dist',
        output,
        '-v',
        '-p',
        '@jimp/plugin-circle'
      );

      reset();
      calls.length.should.be.exactly(4);
      fs.unlinkSync(output);
    });
  });
});
