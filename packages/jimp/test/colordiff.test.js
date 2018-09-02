import { Jimp } from '@jimp/test-utils';

// Convert [0..1] float to a percent value with only one decimal.
const pct = n => ((n * 1000) << 0) / 10;

describe('compute color difference', () => {
  it('totally opaque (no alpha defined)', () => {
    Jimp.colorDiff(
      { r: 255, g: 0, b: 0 },
      { r: 255, g: 0, b: 0 }
    ).should.be.equal(0, 'both red');

    pct(
      Jimp.colorDiff({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 0 })
    ).should.be.equal(33.3, 'red x black');

    pct(
      Jimp.colorDiff({ r: 255, g: 0, b: 0 }, { r: 0, g: 255, b: 0 })
    ).should.be.equal(66.6, 'red x green');

    Jimp.colorDiff(
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 255, b: 255 }
    ).should.be.equal(1, 'red x cyan');

    Jimp.colorDiff(
      { r: 0, g: 0, b: 0 },
      { r: 255, g: 255, b: 255 }
    ).should.be.equal(1, 'black x white');
  });

  it('totally transparent', () => {
    Jimp.colorDiff(
      { r: 255, g: 0, b: 0, a: 0 },
      { r: 255, g: 0, b: 0, a: 0 }
    ).should.be.equal(0, 'both transparent red');

    Jimp.colorDiff(
      { r: 0, g: 0, b: 0, a: 0 },
      { r: 255, g: 255, b: 255, a: 0 }
    ).should.be.equal(1, 'transparent black x transparent white');
  });

  it('different alpha', () => {
    pct(
      Jimp.colorDiff(
        { r: 255, g: 0, b: 0, a: 100 },
        { r: 255, g: 0, b: 0, a: 150 }
      )
    ).should.be.equal(3.8, 'both red');

    Jimp.colorDiff(
      { r: 0, g: 0, b: 0, a: 0 },
      { r: 255, g: 255, b: 255, a: 255 }
    ).should.be.equal(1, 'transparent black x transparent white');
  });
});
