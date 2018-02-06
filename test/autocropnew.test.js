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
            imgSrc.autocropnew().getJGDSync().should.be.sameJGD(mkJGD(
                '  ◆◆  ',
                ' ◆▦▦◆ ',
                '◆▦▦▦▦◆',
                ' ◆▦▦◆ ',
                '  ◆◆  '
            ));
            done();
        }).catch(done);
    });

    it("image with opa", function (done) {
        Jimp.read(mkJGD(
            '▥▥▥▥▥▥▥▥▥▥',
            '▥▥▥▥◆◆▥▥▥▥',
            '▥▥▥◆▦▦◆▥▥▥',
            '▥▥◆▦▦▦▦◆▥▥',
            '▥▥▥◆▦▦◆▥▥▥',
            '▥▥▥▥◆◆▥▥▥▥',
            '▥▥▥▥▥▥▥▥▥▥'
        )).then((imgSrc)=> {
            imgSrc.autocropnew().getJGDSync().should.be.sameJGD(mkJGD(
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
            imgSrc.autocropnew().getJGDSync().should.be.sameJGD(mkJGD(
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
            imgSrc.clone().autocropnew().getJGDSync().should.be.sameJGD(mkJGD(
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

});
