var {Jimp, getTestDir} = require("./test-helper");

describe("Exif", ()=> {

    var imagesDir = getTestDir() + "/exif-orientation";

    var imgs, firstLandscapeImg, firstPortraitImg;
    before((done)=> {
        imgs = [];
        var i;
        for (i=1; i<=8; i++)
            imgs.push(Jimp.read(imagesDir+"/Landscape_"+i+".jpg"));
        for (i=1; i<=8; i++)
            imgs.push(Jimp.read(imagesDir+"/Portrait_"+i+".jpg"));
        Promise.all(imgs).then((loadedImgs)=> {
            imgs = loadedImgs;
            firstLandscapeImg = imgs[0];
            firstPortraitImg = imgs[8];
            done();
        }).catch(done);
    });

    it("read orientation in landscape picture", ()=> {
        Jimp.diff(firstLandscapeImg, firstPortraitImg).percent.should.be.above(0.7);
        if (typeof window !== 'undefined' && window.document)
            return console.warn("Browsers has no Exif orientation support.");
        for (var i=0; i<8; i++) {
            Jimp.diff(firstLandscapeImg, imgs[i]).percent.should.be.below(0.1);
        }
    });

    it("read orientation in portrait picture", ()=> {
        Jimp.diff(firstLandscapeImg, firstPortraitImg).percent.should.be.above(0.7);
        if (typeof window !== 'undefined' && window.document)
            return console.warn("Browsers has no Exif orientation support.");
        for (var i=8; i<16; i++) {
            Jimp.diff(firstPortraitImg, imgs[i]).percent.should.be.below(0.1);
        }
    });

});
