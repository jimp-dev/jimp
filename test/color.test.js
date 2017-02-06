var {Jimp, donutJGD} = require("./test-helper");
var should = require("should");

describe("canvas color transformation", ()=> {

    var redDonutJGD = donutJGD(0x00000000, 0xFF000088, 0xFF0000FF);

    it("can apply more than one color transformation", (done)=> {
        new Jimp(redDonutJGD, (err, image)=> {
            should.not.exist(err);
            var newJGD = image.color([
                { apply: "hue", params: [-180] },
                { apply: "lighten", params: [25] }
            ]).getJGDSync();
            newJGD.should.be.sameJGD(donutJGD(0x40404000, 0x80FFFF88, 0x80FFFFFF));
            done()
        });
    });

    it("lighten", (done)=> {
        new Jimp(redDonutJGD, (err, image)=> {
            image.color([{ apply: "lighten", params: [25] }]).getJGDSync()
            .should.be.sameJGD(donutJGD(0x40404000, 0xFF808088, 0xFF8080FF));
            done()
        });
    });

    it("brighten", (done)=> {
        new Jimp(redDonutJGD, (err, image)=> {
            image.color([{ apply: "brighten", params: [25] }]).getJGDSync()
            .should.be.sameJGD(donutJGD(0x40404000, 0xFF404088, 0xFF4040FF));
            done()
        });
    });

    it("spin hue", (done)=> {
        new Jimp(redDonutJGD, (err, image)=> {
            image.color([{ apply: "hue", params: [150] }]).getJGDSync()
            .should.be.sameJGD(donutJGD(0x00000000, 0x00FF8088, 0x00FF80FF));
            done()
        });
    });

});
