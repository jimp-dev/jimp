var {Jimp, mkJGD} = require("./test-helper");

describe("Fisheye", ()=> {

    var imgs = [
        Jimp.read(mkJGD(
                "0000000000",
                "0001221000",
                "0022222200",
                "0122112210",
                "0221001220",
                "0221001220",
                "0122112210",
                "0022222200",
                "0001221000",
                "0000000000"
        )),
        Jimp.read(mkJGD(
                "0001221000",
                "0221112220",
                "0220000121",
                "1100000112",
                "2100000012",
                "2100000012",
                "1200000012",
                "0211000222",
                "0221111220",
                "0012222200"
        ))
    ];
    var imgNormal, imgBulged;

    before((done)=> {
        Promise.all(imgs).then((imgs)=> {
            imgNormal = imgs[0];
            imgBulged = imgs[1];
            done();
        }).catch(done);
    });

    it("should create fisheye lens to image", (done)=> {
        imgNormal.fisheye()
              .getJGDSync().should.be.sameJGD(imgBulged.getJGDSync());
        done();
    });

});
