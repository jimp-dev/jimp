const fs = require('fs');
const should = require('should');
const { Jimp, getTestDir } = require('./test-helper');

describe('composite', () => {
    const image = getTestDir() + '/samples/cops.jpg';
    const expectedImg = getTestDir() + '/samples/cops-masked.jpg';

    it('can apply more than one color transformation', async () => {
        if (process.env.ENV === 'browser') {
            return;
        }

        const testPath = image.replace('.jpg', '-test.jpg');
        const mask = await Jimp.create(100, 100, 0x0000ff);
        const cops = await Jimp.read(image);

        cops.composite(mask, 0, 0, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacitySource: 0.5,
            opacityDest: 0.5
        });

        const one = fs.readFileSync(expectedImg);
        const two = fs.readFileSync(testPath);

        fs.unlink(testPath);

        should.deepEqual(one, two);
    });
});
