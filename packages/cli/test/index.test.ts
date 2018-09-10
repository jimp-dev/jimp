import 'should';
import { describe, it } from 'mocha';

import * as fs from 'fs';
import { mockConsole } from './utils/mock-console';
import makePath from './utils/makePath';
import { runCLI } from '../src/index';

function run(...args) {
  return runCLI(['', '', ...args]);
}

describe('index', () => {
  it('outputs nothing normally', async () => {
    const { calls, reset } = mockConsole();
    const output = 'verbose-off.png';

    await run(
      'read',
      makePath(__dirname, './images/tiny-qr.png'),
      '--output',
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
      'read',
      makePath(__dirname, './images/tiny-qr.png'),
      '--output',
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
          'read',
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
        'read',
        makePath(__dirname, './images/tiny-qr.png'),
        '--output',
        output,
        '-v',
        '-p',
        '@jimp/plugin-circle'
      );

      reset();
      calls.length.should.be.exactly(4);
      fs.unlinkSync(output);
    });

    it('blit', async () => {
      const output = 'blit.png';

      await run(
        'read',
        makePath(__dirname, './images/create.png'),
        '--output',
        output,
        '-a',
        ['blit', makePath(__dirname, './images/tiny-qr.png'), 0, 0],
        '-p',
        '@jimp/plugin-circle'
      );

      fs.readFileSync(output).should.be.deepEqual(
        fs.readFileSync(makePath(__dirname, `./images/${output}`))
      );
      fs.unlinkSync(output);
    });
  });

  describe('create', () => {
    it('should create an image with n o background', async () => {
      const output = 'create-blank.png';

      await run('create', '-w', '100', '--he', '200', '-o', output);

      fs.readFileSync(output).should.be.deepEqual(
        fs.readFileSync(makePath(__dirname, `./images/${output}`))
      );
      fs.unlinkSync(output);
    });

    it('should create an image with a background', async () => {
      const output = 'create.png';

      await run(
        'create',
        '-w',
        '100',
        '--he',
        '200',
        '-b',
        0xff0000ff,
        '-o',
        output
      );

      fs.readFileSync(output).should.be.deepEqual(
        fs.readFileSync(makePath(__dirname, `./images/${output}`))
      );
      fs.unlinkSync(output);
    });
  });
});
