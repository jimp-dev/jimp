import * as path from 'path';
import * as fs from 'fs';
import * as should from 'should/as-function';
import { loadFont, processImage } from '../src/process-image';

function makePath(file) {
  return path.resolve(path.join(__dirname, file));
}

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
        '../../plugin-print/fonts/open-sans/open-sans-8-black/open-sans-8-black.fnt'
      )
    );
    should(font).not.be.exactly(undefined);
  });
});

describe('processImage', () => {
  const output = 'output.png';

  it('write files correctly', async () => {
    await processImage({ src: makePath('./images/qr.jpg') });
    should(fs.existsSync(output)).be.exactly(false);

    await processImage({ src: makePath('./images/qr.jpg'), dist: output });
    should(fs.existsSync(output)).be.exactly(true);
    fs.unlinkSync(output);
  });
});
