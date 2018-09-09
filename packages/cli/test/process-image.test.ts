import 'should';
import * as fs from 'fs';

import makePath from './utils/makePath';
import { loadFont, processImage } from '../src/process-image';

describe('loadFont', () => {
  it('do nothing when no font set', async () => {
    const font = await loadFont();
    (font === undefined).should.be.exactly(true);
  });

  it('load font constant', async () => {
    const font = await loadFont('FONT_SANS_32_WHITE');
    font.should.not.be.exactly(undefined);
  });

  it('load font path', async () => {
    const font = await loadFont(
      makePath(
        __dirname,
        '../../plugin-print/fonts/open-sans/open-sans-8-black/open-sans-8-black.fnt'
      )
    );
    font.should.not.be.exactly(undefined);
  });
});

describe('processImage', () => {
  it('write files correctly', async () => {
    const output = 'write.png';
    await processImage({ src: makePath(__dirname, './images/tiny-qr.png') });
    fs.existsSync(output).should.be.exactly(false);

    await processImage({
      src: makePath(__dirname, './images/tiny-qr.png'),
      dist: output
    });
    fs.existsSync(output).should.be.exactly(true);
    fs.unlinkSync(output);
  });

  it('runs action with args', async () => {
    const output = 'action-1.png';

    await processImage({
      src: makePath(__dirname, './images/tiny-qr.png'),
      dist: output,
      actions: ['[resize,20,20]']
    });

    fs.readFileSync(output).should.be.deepEqual(
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

    fs.readFileSync(output).should.be.deepEqual(
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

    fs.readFileSync(output).should.be.deepEqual(
      fs.readFileSync(makePath(__dirname, `./images/${output}`))
    );
    fs.unlinkSync(output);
  });
});
