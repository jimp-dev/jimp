import { Jimp, getTestDir } from '@jimp/test-utils';
import configure from '@jimp/custom';
import plugins from '@jimp/plugins';

const jimp = configure({ plugins: [plugins] }, Jimp);

describe('Load files', () => {
  it('Load images', async () => {
    const p1 = await jimp.read(getTestDir(__dirname) + '/samples/lenna.png');
    const p2 = await jimp.read(getTestDir(__dirname) + '/samples/cops.jpg');

    p1.getMIME().should.be.equal('image/png');
    p2.getMIME().should.be.equal('image/jpeg');
  });

  it('Load font', async () => {
    const font = await jimp.loadFont(jimp.FONT_SANS_16_BLACK);
    font.chars.A.id.should.be.equal(65);
  });
});
