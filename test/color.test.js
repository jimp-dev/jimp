const should = require('should');
const { Jimp, donutJGD } = require('./test-helper');

describe('canvas color transformation', () => {
    const redDonutJGD = donutJGD(0x00000000, 0xff000088, 0xff0000ff);

    it('can apply more than one color transformation', done => {
        new Jimp(redDonutJGD)
            .then(image => {
                const newJGD = image
                    .color([
                        { apply: 'hue', params: [-180] },
                        { apply: 'lighten', params: [25] }
                    ])
                    .getJGDSync();
                newJGD.should.be.sameJGD(
                    donutJGD(0x40404000, 0x80ffff88, 0x80ffffff)
                );
                done();
            })
            .catch(err => should.not.exist(err));
    });

    it('lighten', done => {
        new Jimp(redDonutJGD)
            .then(image => {
                image
                    .color([{ apply: 'lighten', params: [25] }])
                    .getJGDSync()
                    .should.be.sameJGD(
                        donutJGD(0x40404000, 0xff808088, 0xff8080ff)
                    );
                done();
            })
            .catch(err => should.not.exist(err));
    });

    it('brighten', done => {
        new Jimp(redDonutJGD)
            .then(image => {
                image
                    .color([{ apply: 'brighten', params: [25] }])
                    .getJGDSync()
                    .should.be.sameJGD(
                        donutJGD(0x40404000, 0xff404088, 0xff4040ff)
                    );
                done();
            })
            .catch(err => should.not.exist(err));
    });

    it('spin hue', done => {
        new Jimp(redDonutJGD)
            .then(image => {
                image
                    .color([{ apply: 'hue', params: [150] }])
                    .getJGDSync()
                    .should.be.sameJGD(
                        donutJGD(0x00000000, 0x00ff8088, 0x00ff80ff)
                    );
                done();
            })
            .catch(err => should.not.exist(err));
    });
});
