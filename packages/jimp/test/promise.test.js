import { Jimp, getTestDir } from './test-helper';

describe('Load files', () => {
  it('Load images', async () => {
    const p1 = await Jimp.read(getTestDir() + '/samples/lenna.png');
    const p2 = await Jimp.read(getTestDir() + '/samples/cops.jpg');

    p1.getMIME().should.be.equal('image/png');
    p2.getMIME().should.be.equal('image/jpeg');
  });

  it('Load font', async () => {
    const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
    font.chars.A.id.should.be.equal(65);
  });
});
