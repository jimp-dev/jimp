const { Jimp, donutJGD } = require('./test-helper');

describe('composite', () => {
    const redDonutJGD = donutJGD(0x00000000, 0xff000088, 0xff0000ff);

    it('can apply more than one color transformation', done => {
        Jimp.create(10, 10, 0x0000ff)
            .then(blueMask => {
                Jimp.read(redDonutJGD).then(redDonut => {
                    redDonut.getPixelColor(10, 10).should.be.equal(0x00000000);

                    redDonut
                        .composite(blueMask, 0, 0, {
                            mode: Jimp.BLEND_MULTIPLY,
                            opacitySource: 0.5,
                            opacityDest: 0.5
                        })
                        .write('test.png', () => {});

                    redDonut.getPixelColor(10, 10).should.be.equal(0x0000007f);

                    done();
                });
            })
            .catch(err => err.should.not.exist());
    });
});
