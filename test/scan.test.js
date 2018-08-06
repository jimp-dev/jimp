const { Jimp, mkJGD } = require('./test-helper');

describe('Scan (pixel matrix modification)', () => {
    const barsJGD = mkJGD('▴▴▸▸▾▾◆◆', '▴▴▸▸▾▾◆◆', '▵▵▹▹▿▿◇◇');

    it('draw bars with scan', done => {
        new Jimp(8, 3, function(err) {
            should.not.exist(err);
            this.scan(0, 0, this.bitmap.width, this.bitmap.height, function(
                x,
                y,
                idx
            ) {
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
            done();
        });
    });

    it('draw bars with (get|set)PixelColor', done => {
        new Jimp(barsJGD, function(err) {
            should.not.exist(err);
            for (let x = 0; x < this.bitmap.width; x++) {
                for (let y = 0; y < this.bitmap.height; y++) {
                    const hex = this.getPixelColor(x, y); // e.g. 0xFF000FF
                    const rgba = Jimp.intToRGBA(hex); // e.g. {r: 255, g: 255, b: 255, a:255}
                    const hex2 = Jimp.rgbaToInt(rgba.g, rgba.b, rgba.r, rgba.a);
                    this.setPixelColor(hex2, x, y);
                }
            }
            this.getJGDSync().should.be.sameJGD(
                mkJGD('▾▾▴▴▸▸▰▰', '▾▾▴▴▸▸▰▰', '▿▿▵▵▹▹▱▱'),
                'Replaced color bars'
            );
            done();
        });
    });

    it('create a image with plain color', done => {
        new Jimp(6, 3, 0xff0000ff, function(err) {
            should.not.exist(err);
            this.getJGDSync().should.be.sameJGD(
                mkJGD('▴▴▴▴▴▴', '▴▴▴▴▴▴', '▴▴▴▴▴▴'),
                'A pure red image'
            );
            done();
        });
    });
});
