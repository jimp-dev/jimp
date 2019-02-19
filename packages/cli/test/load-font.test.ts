import 'should';
import makePath from './utils/makePath';
import { loadFont } from '../src/load-font';

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
