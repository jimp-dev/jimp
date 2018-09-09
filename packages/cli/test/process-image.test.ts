import * as fs from 'fs';
import * as should from 'should/as-function';

import makePath from './utils/makePath';
import { loadFont, processImage } from '../src/process-image';

describe('loadFont', () => {
  it('do nothing when no font set', async () => {
    const font = await loadFont();
    should(font).be.exactly(undefined);
  });

  it('load font constant', async () => {
    const font = await loadFont('FONT_SANS_32_WHITE');
    should(font).not.be.exactly(undefined);
  });

  it('load font path', async () => {
    const font = await loadFont(
      makePath(
        __dirname,
        '../../plugin-print/fonts/open-sans/open-sans-8-black/open-sans-8-black.fnt'
      )
    );
    should(font).not.be.exactly(undefined);
  });
});

describe('processImage', () => {
  it('write files correctly', async () => {
    const output = 'write.png';
    await processImage({ src: makePath(__dirname, './images/tiny-qr.png') });
    should(fs.existsSync(output)).be.exactly(false);

    await processImage({
      src: makePath(__dirname, './images/tiny-qr.png'),
      dist: output
    });
    should(fs.existsSync(output)).be.exactly(true);
    fs.unlinkSync(output);
  });

  it('runs action with args', async () => {
    const output = 'action-1.png';

    await processImage({
      src: makePath(__dirname, './images/tiny-qr.png'),
      dist: output,
      actions: ['[resize,20,20]']
    });

    should(fs.readFileSync(output)).be.deepEqual(
      fs.readFileSync(makePath(__dirname, `./images/${output}`))
    );
    fs.unlinkSync(output);
  });

  it('runs action without args', async () => {
    const output = 'action-2.png';

    await processImage({
      src: makePath(__dirname, './images/tiny-qr.png'),
      dist: output,
      actions: ['greyscale']
    });

    should(fs.readFileSync(output)).be.deepEqual(
      fs.readFileSync(makePath(__dirname, `./images/${output}`))
    );
    fs.unlinkSync(output);
  });

  it('runs print', async () => {
    const output = 'action-print.png';

    await processImage({
      src: makePath(__dirname, './images/tiny-qr.png'),
      loadFont: 'FONT_SANS_8_WHITE',
      dist: output,
      actions: ['[print,0,0,This is a test string!,50]']
    });

    should(fs.readFileSync(output)).be.deepEqual(
      fs.readFileSync(makePath(__dirname, `./images/${output}`))
    );
    fs.unlinkSync(output);
  });
});
