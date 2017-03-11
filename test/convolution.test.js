var {Jimp, mkJGD} = require("./test-helper");

describe("Convolution", ()=> {

    var imgs = [
        Jimp.read(mkJGD(
            '22222222',
            '22222222',
            '22888822',
            '22888822',
            '22888822',
            '22888822',
            '22222222',
            '22222222'
        )),
        Jimp.read(mkJGD(
            '88222222',
            '88222222',
            '22222222',
            '22222222',
            '22222222',
            '22222222',
            '22222222',
            '22222222'
        ))
    ];

    var imgMid, imgTopLeft; // stores the Jimp instances of the JGD images above.
    before((done)=> {
        Promise.all(imgs).then((imgs)=> {
            imgMid = imgs[0];
            imgTopLeft = imgs[1];
            done();
        }).catch(done);
    });

    var sharpM = [
        [-1,-1, 0],
        [-1, 1, 1],
        [ 0, 1, 1]
    ];

    it("3x3 sharp matrix on EDGE_EXTEND", (done)=> {
        imgMid.clone().convolution(sharpM).getJGDSync().should.be.sameJGD(mkJGD(
            '22222222',
            '28EEE822',
            '2EFFF802',
            '2EF88002',
            '2EF88002',
            '28800002',
            '22000002',
            '22222222'
        ), "Mid light block");
        imgTopLeft.clone().convolution(sharpM).getJGDSync().should.be.sameJGD(mkJGD(
            '80022222',
            '00022222',
            '00022222',
            '22222222',
            '22222222',
            '22222222',
            '22222222',
            '22222222'
        ), "Top left light block");
        done();
    });

    it("3x3 sharp matrix on EDGE_WRAP", (done)=> {
        imgMid.clone().convolution(sharpM, Jimp.EDGE_WRAP).getJGDSync().should.be.sameJGD(mkJGD(
            '66666666',
            '28EEE822',
            '2EFFF802',
            '2EF88002',
            '2EF88002',
            '28800002',
            '22000002',
            '22222222'
        ), "Mid light block");
        imgTopLeft.clone().convolution(sharpM, Jimp.EDGE_WRAP).getJGDSync().should.be.sameJGD(mkJGD(
            'FC06666F',
            '80022228',
            '00022222',
            '22222222',
            '22222222',
            '22222222',
            '22222222',
            'E8222228'
        ), "Top left light block");
        done();
    });

    it("3x3 sharp matrix on EDGE_CROP", (done)=> {
        imgMid.clone().convolution(sharpM, Jimp.EDGE_CROP).getJGDSync().should.be.sameJGD(mkJGD(
            '86666662',
            '68EEE820',
            '6EFFF800',
            '6EF88000',
            '6EF88000',
            '68800000',
            '62000000',
            '20000000'
        ), "Mid light block");
        imgTopLeft.clone().convolution(sharpM, Jimp.EDGE_CROP).getJGDSync().should.be.sameJGD(mkJGD(
            'FC066662',
            'C0022220',
            '00022220',
            '62222220',
            '62222220',
            '62222220',
            '62222220',
            '20000000'
        ), "Top left light block");
        done();
    });

});
