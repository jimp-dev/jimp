import { Jimp, mkJGD } from '@jimp/test-utils';

describe('Scan (pixel matrix modification)', () => {
  const barsJGD = mkJGD('▴▴▸▸▾▾◆◆', '▴▴▸▸▾▾◆◆', '▵▵▹▹▿▿◇◇');

  it('draw bars with scan', async () => {
    const image = await Jimp.create(8, 3);

    image
      .scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        const color = [
          [0xff, 0x00, 0x00],
          [0x00, 0xff, 0x00],
          [0x00, 0x00, 0xff],
          [0xff, 0xff, 0x00]
        ][Math.floor(x / (this.bitmap.width / 4))];

        this.bitmap.data[idx] = color[0];
        this.bitmap.data[idx + 1] = color[1];
        this.bitmap.data[idx + 2] = color[2];
        this.bitmap.data[idx + 3] = y === 2 ? 0x7f : 0xff;
      })
      .getJGDSync()
      .should.be.sameJGD(barsJGD, 'Color bars');
  });

  it('draw bars with iterate scan', async () => {
    const image = await Jimp.create(8, 3);

    for (const { x, y, idx, image } of image.scanIterator(
      0,
      0,
      image.bitmap.width,
      image.bitmap.height
    )) {
      const color = [
        [0xff, 0x00, 0x00],
        [0x00, 0xff, 0x00],
        [0x00, 0x00, 0xff],
        [0xff, 0xff, 0x00]
      ][Math.floor(x / (image.bitmap.width / 4))];

      image.bitmap.data[idx] = color[0];
      image.bitmap.data[idx + 1] = color[1];
      image.bitmap.data[idx + 2] = color[2];
      image.bitmap.data[idx + 3] = y === 2 ? 0x7f : 0xff;
    }

    image.getJGDSync().should.be.sameJGD(barsJGD, 'Color bars');
  });

  it('draw bars with (get|set)PixelColor', async () => {
    const image = await Jimp.read(barsJGD);

    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const hex = image.getPixelColor(x, y); // e.g. 0xFF000FF
        const rgba = Jimp.intToRGBA(hex); // e.g. {r: 255, g: 255, b: 255, a:255}
        const hex2 = Jimp.rgbaToInt(rgba.g, rgba.b, rgba.r, rgba.a);
        image.setPixelColor(hex2, x, y);
      }
    }

    image
      .getJGDSync()
      .should.be.sameJGD(
        mkJGD('▾▾▴▴▸▸▰▰', '▾▾▴▴▸▸▰▰', '▿▿▵▵▹▹▱▱'),
        'Replaced color bars'
      );
  });

  it('create a image with plain color', async () => {
    const image = await Jimp.create(6, 3, 0xff0000ff);

    image
      .getJGDSync()
      .should.be.sameJGD(
        mkJGD('▴▴▴▴▴▴', '▴▴▴▴▴▴', '▴▴▴▴▴▴'),
        'A pure red image'
      );
  });
});
