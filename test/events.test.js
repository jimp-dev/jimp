var {Jimp, mkJGD, getTestDir} = require("./test-helper");

describe("Events", ()=> {

    describe("on initialized", ()=> {

        it("initializes", (done)=> {
            new Jimp(mkJGD('▴▵'))
            .on("initialized", function () {
                this.getJGDSync().should.be.sameJGD(mkJGD('▴▵'));
                done()
            })
            .on("error", done)
        });

        it("initializes with a file", (done)=> {
            new Jimp(getTestDir()+"/samples/lenna.png")
            .on("initialized", function () {
                this.bitmap.width.should.be.equal(512);
                done()
            })
            .on("error", done)
        });

        it("recive init fail on inextent image", (done)=> {
            new Jimp("/invalid/path/inextent.png")
            .on("initialized", function () {
                throw Error("must not init!");
            })
            .on("error", function (err) {
                err.should.be.instanceof(Error);
                done()
            });
        });

    });

});
