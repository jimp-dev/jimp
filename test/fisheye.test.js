var {Jimp, donutJGD, jgdToStr} = require("./test-helper");

describe("Fisheye", ()=> {

    var imgs = [
        Jimp.read(donutJGD()),
        Jimp.read(donutJGD())
    ];
    var imgNormal, imgBulged;

    before((done)=> {
        Promise.all(imgs).then((imgs)=> {
            imgNormal = imgs[0];
            imgBulged = imgs[1];
            done();
        }).catch(done);
    });

    it("Lemma with fisheye filter", (done)=> {
        console.info(jgdToStr(imgBulged));
        console.log(jgdToStr(imgNormal.clone().fisheye()));
        /*imgNormal.clone()
              .fisheye()
              .getJGDSync().should.be.sameJGD(imgBulged);*/
        done();
    });

});
