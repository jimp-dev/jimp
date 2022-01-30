import { Jimp, mkJGD } from '@jimp/test-utils';
import configure from '@jimp/custom';
import resize from '../../plugin-resize/src';
import sharpen from '../src';

const jimp = configure({ plugins: [sharpen, resize] }, Jimp);

describe('sharpen', () => {
  it('sharpen image', async () => {
    const imgSrc = await jimp.read(mkJGD('1'));

    imgSrc
      .sharpen(3)
      .getJGDSync()
      .should.be.sameJGD(mkJGD('1'));
  });
});
