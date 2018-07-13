var {Jimp, mkJGD} = require("./test-helper");

describe("Autocrop", ()=> {

    it("image with transparent surround color", function (done) {
        Jimp.read(mkJGD(
            '          ',
            '    ◆◆    ',
            '   ◆▦▦◆   ',
            '  ◆▦▦▦▦◆  ',
            '   ◆▦▦◆   ',
            '    ◆◆    ',
            '          '
        )).then((imgSrc)=> {
            imgSrc.autocrop().getJGDSync().should.be.sameJGD(mkJGD(
                '  ◆◆  ',
                ' ◆▦▦◆ ',
                '◆▦▦▦▦◆',
                ' ◆▦▦◆ ',
                '  ◆◆  '
            ));
            done();
        }).catch(done);
    });

    it("image with opaque surround color", function (done) {
        Jimp.read(mkJGD(
            '▥▥▥▥▥▥▥▥▥▥',
            '▥▥▥▥◆◆▥▥▥▥',
            '▥▥▥◆▦▦◆▥▥▥',
            '▥▥◆▦▦▦▦◆▥▥',
            '▥▥▥◆▦▦◆▥▥▥',
            '▥▥▥▥◆◆▥▥▥▥',
            '▥▥▥▥▥▥▥▥▥▥'
        )).then((imgSrc)=> {
            imgSrc.autocrop().getJGDSync().should.be.sameJGD(mkJGD(
                '▥▥◆◆▥▥',
                '▥◆▦▦◆▥',
                '◆▦▦▦▦◆',
                '▥◆▦▦◆▥',
                '▥▥◆◆▥▥'
            ));
            done();
        }).catch(done);
    });

    it("image with one color border", function (done) {
        Jimp.read(mkJGD(
            '▥▥▥▥▥▥▥▥▥▥▥▥',
            '▥▥▥▥▥▥▥▥▥▥▥▥',
            '▥▥   ◆◆   ▥▥',
            '▥▥  ◆▦▦◆  ▥▥',
            '▥▥ ◆▦▦▦▦◆ ▥▥',
            '▥▥  ◆▦▦◆  ▥▥',
            '▥▥   ◆◆   ▥▥',
            '▥▥▥▥▥▥▥▥▥▥▥▥',
            '▥▥▥▥▥▥▥▥▥▥▥▥'
        )).then((imgSrc)=> {
            imgSrc.autocrop().getJGDSync().should.be.sameJGD(mkJGD(
                '   ◆◆   ',
                '  ◆▦▦◆  ',
                ' ◆▦▦▦▦◆ ',
                '  ◆▦▦◆  ',
                '   ◆◆   '
            ));
            done();
        }).catch(done);
    });

    it("image border with small variation", function (done) {
        Jimp.read(mkJGD(
            '323232323232',
            '232323232323',
            '32   ◆◆   32',
            '23  ◆▦▦◆  23',
            '32 ◆▦▦▦▦◆ 32',
            '23  ◆▦▦◆  23',
            '32   ◆◆   32',
            '232323232323',
            '323232323232'
        )).then((imgSrc)=> {
            imgSrc.clone().autocrop().getJGDSync().should.be.sameJGD(mkJGD(
                '323232323232',
                '232323232323',
                '32   ◆◆   32',
                '23  ◆▦▦◆  23',
                '32 ◆▦▦▦▦◆ 32',
                '23  ◆▦▦◆  23',
                '32   ◆◆   32',
                '232323232323',
                '323232323232'
            ));
            imgSrc.clone().autocrop(0.005).getJGDSync().should.be.sameJGD(mkJGD(
                '   ◆◆   ',
                '  ◆▦▦◆  ',
                ' ◆▦▦▦▦◆ ',
                '  ◆▦▦◆  ',
                '   ◆◆   '
            ));
            done();
        }).catch(done);
    });

    it("image border with small variation configured by options", function (done) {
        Jimp.read(mkJGD(
            '323232323232',
            '232323232323',
            '32   ◆◆   32',
            '23  ◆▦▦◆  23',
            '32 ◆▦▦▦▦◆ 32',
            '23  ◆▦▦◆  23',
            '32   ◆◆   32',
            '232323232323',
            '323232323232'
        )).then((imgSrc)=> {
            imgSrc.clone().autocrop().getJGDSync().should.be.sameJGD(mkJGD(
                '323232323232',
                '232323232323',
                '32   ◆◆   32',
                '23  ◆▦▦◆  23',
                '32 ◆▦▦▦▦◆ 32',
                '23  ◆▦▦◆  23',
                '32   ◆◆   32',
                '232323232323',
                '323232323232'
            ));
            imgSrc.clone().autocrop({tolerance: 0.005}).getJGDSync().should.be.sameJGD(mkJGD(
                '   ◆◆   ',
                '  ◆▦▦◆  ',
                ' ◆▦▦▦▦◆ ',
                '  ◆▦▦◆  ',
                '   ◆◆   '
            ));
            done();
        }).catch(done);
    });

    it("image without frame", function (done) {
        Jimp.read(mkJGD(
            '▥▥   ◆◆   ',
            '▥▥  ◆▦▦◆  ',
            '▥▥ ◆▦▦▦▦◆ ',
            '▥▥  ◆▦▦◆  ',
            '▥▥   ◆◆   ',
            '▥▥▥▥▥▥▥▥▥▥',
            '▥▥▥▥▥▥▥▥▥▥'
        )).then((imgSrc)=> {
            imgSrc.autocrop(false).getJGDSync().should.be.sameJGD(mkJGD(
                '   ◆◆   ',
                '  ◆▦▦◆  ',
                ' ◆▦▦▦▦◆ ',
                '  ◆▦▦◆  ',
                '   ◆◆   '
            ));
            done();
        }).catch(done);
    });

    it("image without frame configured by options", function (done) {
        Jimp.read(mkJGD(
            '▥▥   ◆◆   ',
            '▥▥  ◆▦▦◆  ',
            '▥▥ ◆▦▦▦▦◆ ',
            '▥▥  ◆▦▦◆  ',
            '▥▥   ◆◆   ',
            '▥▥▥▥▥▥▥▥▥▥',
            '▥▥▥▥▥▥▥▥▥▥'
        )).then((imgSrc)=> {
            imgSrc.autocrop({cropOnlyFrames: false}).getJGDSync().should.be.sameJGD(mkJGD(
                '   ◆◆   ',
                '  ◆▦▦◆  ',
                ' ◆▦▦▦▦◆ ',
                '  ◆▦▦◆  ',
                '   ◆◆   '
            ));
            done();
        }).catch(done);
    });

    it("image with symmetric border configured by options", function (done) {
        Jimp.read(mkJGD(
            '▥▥▥▥▥▥▥▥▥▥▥▥▥▥',
            '▥▥   ◆◆   ▥▥▥▥',
            '▥▥  ◆▦▦◆  ▥▥▥▥',
            '▥▥ ◆▦▦▦▦◆ ▥▥▥▥',
            '▥▥  ◆▦▦◆  ▥▥▥▥',
            '▥▥   ◆◆   ▥▥▥▥',
            '▥▥▥▥▥▥▥▥▥▥▥▥▥▥',
            '▥▥▥▥▥▥▥▥▥▥▥▥▥▥'
        )).then((imgSrc)=> {
            imgSrc.autocrop({cropSymmetric: true}).getJGDSync().should.be.sameJGD(mkJGD(
                '   ◆◆   ▥▥',
                '  ◆▦▦◆  ▥▥',
                ' ◆▦▦▦▦◆ ▥▥',
                '  ◆▦▦◆  ▥▥',
                '   ◆◆   ▥▥',
                '▥▥▥▥▥▥▥▥▥▥'
            ));
            done();
        }).catch(done);
    });
    it("image wihtout frame and with symmetric border configured by options", function (done) {
        Jimp.read(mkJGD(
            '▥▥   ◆◆   ▥▥▥▥',
            '▥▥  ◆▦▦◆  ▥▥▥▥',
            '▥▥ ◆▦▦▦▦◆ ▥▥▥▥',
            '▥▥  ◆▦▦◆  ▥▥▥▥',
            '▥▥   ◆◆   ▥▥▥▥',
            '▥▥▥▥▥▥▥▥▥▥▥▥▥▥',
            '▥▥▥▥▥▥▥▥▥▥▥▥▥▥'
        )).then((imgSrc)=> {
            imgSrc.autocrop({cropSymmetric: true, cropOnlyFrames: false}).getJGDSync().should.be.sameJGD(mkJGD(
                '   ◆◆   ▥▥',
                '  ◆▦▦◆  ▥▥',
                ' ◆▦▦▦▦◆ ▥▥',
                '  ◆▦▦◆  ▥▥',
                '   ◆◆   ▥▥',
                '▥▥▥▥▥▥▥▥▥▥',
                '▥▥▥▥▥▥▥▥▥▥'
            ));
            done();
        }).catch(done);
    });

});
