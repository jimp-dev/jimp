var {Jimp, mkJGD} = require("./test-helper");

describe("Mask", ()=> {

    var imgSrcOpaq, imgSrcAlpa, maskGrayBig, maskGraySmall, maskColor;

    before((done)=> {
        Promise.all([
            Jimp.read(mkJGD(
                '▴□▾□■□',
                '■▴■▾■□',
                '■□▴□▾□',
                '■□■▴■▾'
            )),
            Jimp.read(mkJGD(
                '▴▵▾▿',
                '▴▵▾▿',
                '▴▵▾▿'
            )),
            Jimp.read(mkJGD(
                '048840',
                '8CFFC8',
                '8CFFC8',
                '048840'
            )),
            Jimp.read(mkJGD(
                '0369',
                '369C',
                '69CF'
            )),
            Jimp.read(mkJGD(
                '▴▴▾▾',
                '▪▪▰▰',
                '□□□□'
            ))
        ]).then((imgs)=> {
            imgSrcOpaq    = imgs[0];
            imgSrcAlpa    = imgs[1];
            maskGrayBig   = imgs[2];
            maskGraySmall = imgs[3];
            maskColor     = imgs[4];
            done();
        }).catch(done);
    });

    it("Affect opaque image with a gray mask with the same size", ()=> {
        imgSrcOpaq.clone().mask(maskGrayBig).getJGDSync().should.be.sameJGD({
            width: 6,
            height: 4,
            data: [
                0xFF000000, 0xFFFFFF44, 0x0000FF88, 0xFFFFFF88, 0x00000044, 0xFFFFFF00,
                0x00000088, 0xFF0000CC, 0x000000FF, 0x0000FFFF, 0x000000CC, 0xFFFFFF88,
                0x00000088, 0xFFFFFFCC, 0xFF0000FF, 0xFFFFFFFF, 0x0000FFCC, 0xFFFFFF88,
                0x00000000, 0xFFFFFF44, 0x00000088, 0xFF000088, 0x00000044, 0x0000FF00
            ]
        });
    });

    it("Affect opaque image with a gray mask with the same size, blited", ()=> {
        imgSrcOpaq.clone().mask(maskGrayBig, 1, 1).getJGDSync().should.be.sameJGD({
            width: 6,
            height: 4,
            data: [
                0xFF0000FF, 0xFFFFFFFF, 0x0000FFFF, 0xFFFFFFFF, 0x000000FF, 0xFFFFFFFF,
                0x000000FF, 0xFF000000, 0x00000044, 0x0000FF88, 0x00000088, 0xFFFFFF44,
                0x000000FF, 0xFFFFFF88, 0xFF0000CC, 0xFFFFFFFF, 0x0000FFFF, 0xFFFFFFCC,
                0x000000FF, 0xFFFFFF88, 0x000000CC, 0xFF0000FF, 0x000000FF, 0x0000FFCC
            ]
        });
    });

    it("Affect opaque image with a gray mask with the same size, blited negative", ()=> {
        imgSrcOpaq.clone().mask(maskGrayBig, -1, -1).getJGDSync().should.be.sameJGD({
            width: 6,
            height: 4,
            data: [
                0xFF0000CC, 0xFFFFFFFF, 0x0000FFFF, 0xFFFFFFCC, 0x00000088, 0xFFFFFFFF,
                0x000000CC, 0xFF0000FF, 0x000000FF, 0x0000FFCC, 0x00000088, 0xFFFFFFFF,
                0x00000044, 0xFFFFFF88, 0xFF000088, 0xFFFFFF44, 0x0000FF00, 0xFFFFFFFF,
                0x000000FF, 0xFFFFFFFF, 0x000000FF, 0xFF0000FF, 0x000000FF, 0x0000FFFF
            ]
        });
    });

    it("Affect opaque image with a smaller gray mask", ()=> {
        imgSrcOpaq.clone().mask(maskGraySmall).getJGDSync().should.be.sameJGD({
            width: 6,
            height: 4,
            data: [
                0xFF000000, 0xFFFFFF33, 0x0000FF66, 0xFFFFFF99, 0x000000FF, 0xFFFFFFFF,
                0x00000033, 0xFF000066, 0x00000099, 0x0000FFCC, 0x000000FF, 0xFFFFFFFF,
                0x00000066, 0xFFFFFF99, 0xFF0000CC, 0xFFFFFFFF, 0x0000FFFF, 0xFFFFFFFF,
                0x000000FF, 0xFFFFFFFF, 0x000000FF, 0xFF0000FF, 0x000000FF, 0x0000FFFF
            ]
        });
    });

    it("Affect opaque image with a smaller gray mask, blited", ()=> {
        imgSrcOpaq.clone().mask(maskGraySmall, 1, 1).getJGDSync().should.be.sameJGD({
            width: 6,
            height: 4,
            data: [
                0xFF0000FF, 0xFFFFFFFF, 0x0000FFFF, 0xFFFFFFFF, 0x000000FF, 0xFFFFFFFF,
                0x000000FF, 0xFF000000, 0x00000033, 0x0000FF66, 0x00000099, 0xFFFFFFFF,
                0x000000FF, 0xFFFFFF33, 0xFF000066, 0xFFFFFF99, 0x0000FFCC, 0xFFFFFFFF,
                0x000000FF, 0xFFFFFF66, 0x00000099, 0xFF0000CC, 0x000000FF, 0x0000FFFF
            ]
        });
    });

    it("Affect alpha image with a bigger gray mask", ()=> {
        imgSrcAlpa.clone().mask(maskGrayBig).getJGDSync().should.be.sameJGD({
            width: 4,
            height: 3,
            data: [
                0xFF000000, 0xFF000021, 0x0000FF88, 0x0000FF43,
                0xFF000088, 0xFF000065, 0x0000FFFF, 0x0000FF7F,
                0xFF000088, 0xFF000065, 0x0000FFFF, 0x0000FF7F
            ]
        });
    });

    it("Affect alpha image with a bigger gray mask, blited", ()=> {
        imgSrcAlpa.clone().mask(maskGrayBig, -1, -1).getJGDSync().should.be.sameJGD({
            width: 4,
            height: 3,
            data: [
                0xFF0000CC, 0xFF00007F, 0x0000FFFF, 0x0000FF65,
                0xFF0000CC, 0xFF00007F, 0x0000FFFF, 0x0000FF65,
                0xFF000044, 0xFF000043, 0x0000FF88, 0x0000FF21
            ]
        });
    });

    it("Affect opaque image with a colored mask", ()=> {
        imgSrcOpaq.clone().mask(maskColor, 1, 1).getJGDSync().should.be.sameJGD({
            width: 6,
            height: 4,
            data: [
                0xFF0000FF, 0xFFFFFFFF, 0x0000FFFF, 0xFFFFFFFF, 0x000000FF, 0xFFFFFFFF,
                0x000000FF, 0xFF000055, 0x00000055, 0x0000FF55, 0x00000055, 0xFFFFFFFF,
                0x000000FF, 0xFFFFFFAA, 0xFF0000AA, 0xFFFFFFAA, 0x0000FFAA, 0xFFFFFFFF,
                0x000000FF, 0xFFFFFFFF, 0x000000FF, 0xFF0000FF, 0x000000FF, 0x0000FFFF
            ]
        });
    });

});
