const { Jimp, mkJGD } = require('./test-helper');

describe('Normalize', () => {
    it('change grayscale image', done => {
        new Jimp(mkJGD('36▦', '6▦9', '▦9C'), function(err) {
            if (err) done(err);
            this.normalize()
                .getJGDSync()
                .should.be.sameJGD(mkJGD('■5▦', '5▦A', '▦A□'));
            done();
        });
    });

    it('change red/blue image', done => {
        new Jimp(
            {
                width: 3,
                height: 2,
                data: [
                    0x000000ff,
                    0x400022ff,
                    0x40002200,
                    0x400000ff,
                    0x000022ff,
                    0x800055ff
                ]
            },
            function(err) {
                if (err) done(err);
                this.normalize()
                    .getJGDSync()
                    .should.be.sameJGD({
                        width: 3,
                        height: 2,
                        data: [
                            0x000000ff,
                            0x7f0066ff,
                            0x7f006600,
                            0x7f0000ff,
                            0x000066ff,
                            0xff00ffff
                        ]
                    });
                done();
            }
        );
    });
});
