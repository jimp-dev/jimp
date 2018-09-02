import { Jimp, donutJGD } from '../src';

const donut = donutJGD(
  // RRGGBBAA
  0xffffff00,
  0xff880088,
  0xff8800ff
);

const donutPngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAaUlEQVR' +
  '4AY3BwY3DMBAEMEpwz6MSvFXvOZAN53GPkKO7/eLwrcaJ2Ep6uU2PGo' +
  '14RY12mz5qnF6F8qhxukxbbCW9pBfKFpfpR4etEEQNt9jKZfpIL68gH' +
  'unlMj3SA+VV0sPt8C29sPzjD0ceIlrXDNOFAAAAAElFTkSuQmCC';

const donutPngBuffer = Buffer.from(donutPngBase64, 'base64');

describe('JGD - JS Graphic Description', () => {
  it('Jimp loads JGD', async () => {
    const image = await Jimp.read(donut);
    const buffer = await image.getBufferAsync('image/png');

    buffer.toString('base64').should.be.equal(donutPngBase64);
  });

  it('Jimp exports JGD sync', async () => {
    const image = await Jimp.read(donutPngBuffer);

    image.getJGDSync().should.be.deepEqual(donut);
  });

  it('Jimp exports JGD async', async () => {
    const image = await Jimp.read(donutPngBuffer);
    const jgd = await image.getJGD();

    jgd.data.length.should.be.equal(donut.data.length);
    jgd.should.be.deepEqual(donut);
  });
});
