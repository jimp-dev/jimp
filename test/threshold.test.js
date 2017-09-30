var {Jimp, getTestDir} = require("./test-helper");

describe("Threshold", function () {

    this.timeout(15000);

    var originalRenditionPath = getTestDir() + "/samples/hands.jpg";
    var lighterRenditionPath = getTestDir() + "/samples/threshold-samples/hands_mx200_rp255.jpg";

    var originalRendition, lighterRendition;
    before((done)=> {
        var imgs = [];
        imgs.push(Jimp.read(originalRenditionPath));
        imgs.push(Jimp.read(lighterRenditionPath));
        Promise.all(imgs).then((loadedImgs)=> {
            originalRendition = loadedImgs[0];
            lighterRendition = loadedImgs[1];
            done();
        }).catch(done);
    });

    it("defines default threshold for lighter backgrounds", ()=> {
        var transformedOriginalRendition = originalRendition.threshold(200, 255);
        transformedOriginalRendition.hash().should.be.equal(lighterRendition.hash());
    });

});
