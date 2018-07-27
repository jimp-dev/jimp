const { Jimp, mkJGD } = require('./test-helper');

describe('Autocrop', () => {
    it('image with transparent surround color', done => {
        new Jimp(
            mkJGD(
                '          ',
                '    ◆◆    ',
                '   ◆▦▦◆   ',
                '  ◆▦▦▦▦◆  ',
                '   ◆▦▦◆   ',
                '    ◆◆    ',
                '          '
            )
        )
            .then(imgSrc => {
                imgSrc
                    .autocrop()
                    .getJGDSync()
                    .should.be.sameJGD(
                        mkJGD('  ◆◆  ', ' ◆▦▦◆ ', '◆▦▦▦▦◆', ' ◆▦▦◆ ', '  ◆◆  ')
                    );
                done();
            })
            .catch(done);
    });

    it('image with opaque surround color', done => {
        new Jimp(
            mkJGD(
                '▥▥▥▥▥▥▥▥▥▥',
                '▥▥▥▥◆◆▥▥▥▥',
                '▥▥▥◆▦▦◆▥▥▥',
                '▥▥◆▦▦▦▦◆▥▥',
                '▥▥▥◆▦▦◆▥▥▥',
                '▥▥▥▥◆◆▥▥▥▥',
                '▥▥▥▥▥▥▥▥▥▥'
            )
        )
            .then(imgSrc => {
                imgSrc
                    .autocrop()
                    .getJGDSync()
                    .should.be.sameJGD(
                        mkJGD('▥▥◆◆▥▥', '▥◆▦▦◆▥', '◆▦▦▦▦◆', '▥◆▦▦◆▥', '▥▥◆◆▥▥')
                    );
                done();
            })
            .catch(done);
    });

    it('image with one color border', done => {
        new Jimp(
            mkJGD(
                '▥▥▥▥▥▥▥▥▥▥▥▥',
                '▥▥▥▥▥▥▥▥▥▥▥▥',
                '▥▥   ◆◆   ▥▥',
                '▥▥  ◆▦▦◆  ▥▥',
                '▥▥ ◆▦▦▦▦◆ ▥▥',
                '▥▥  ◆▦▦◆  ▥▥',
                '▥▥   ◆◆   ▥▥',
                '▥▥▥▥▥▥▥▥▥▥▥▥',
                '▥▥▥▥▥▥▥▥▥▥▥▥'
            )
        )
            .then(imgSrc => {
                imgSrc
                    .autocrop()
                    .getJGDSync()
                    .should.be.sameJGD(
                        mkJGD(
                            '   ◆◆   ',
                            '  ◆▦▦◆  ',
                            ' ◆▦▦▦▦◆ ',
                            '  ◆▦▦◆  ',
                            '   ◆◆   '
                        )
                    );
                done();
            })
            .catch(done);
    });

    it('image border with small variation', done => {
        new Jimp(
            mkJGD(
                '323232323232',
                '232323232323',
                '32   ◆◆   32',
                '23  ◆▦▦◆  23',
                '32 ◆▦▦▦▦◆ 32',
                '23  ◆▦▦◆  23',
                '32   ◆◆   32',
                '232323232323',
                '323232323232'
            )
        )
            .then(imgSrc => {
                imgSrc
                    .clone()
                    .autocrop()
                    .getJGDSync()
                    .should.be.sameJGD(
                        mkJGD(
                            '323232323232',
                            '232323232323',
                            '32   ◆◆   32',
                            '23  ◆▦▦◆  23',
                            '32 ◆▦▦▦▦◆ 32',
                            '23  ◆▦▦◆  23',
                            '32   ◆◆   32',
                            '232323232323',
                            '323232323232'
                        )
                    );

                imgSrc
                    .clone()
                    .autocrop(0.005)
                    .getJGDSync()
                    .should.be.sameJGD(
                        mkJGD(
                            '   ◆◆   ',
                            '  ◆▦▦◆  ',
                            ' ◆▦▦▦▦◆ ',
                            '  ◆▦▦◆  ',
                            '   ◆◆   '
                        )
                    );
                done();
            })
            .catch(done);
    });
});
