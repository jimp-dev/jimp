var {Jimp, mkJGD, getTestDir} = require("./test-helper");

describe("Events", ()=> {

    describe("on initialized", ()=> {

        it("initializes", (done)=> {
            new Jimp(mkJGD('▴▵'))
            .on("initialized", function (data) {
                this.getJGDSync().should.be.sameJGD(mkJGD('▴▵'));
                data.methodName.should.be.equal("constructor");
                done();
            })
            .on("error", done)
        });

        it("initializes with a file", (done)=> {
            new Jimp(getTestDir()+"/samples/lenna.png")
            .on("initialized", function () {
                this.bitmap.width.should.be.equal(512);
                done();
            })
            .on("error", done)
        });

    });

    describe("on change", ()=> {

        it("call before-change without callback", (done)=> {
            var img = new Jimp(8, 8).on("before-change", function (data) {
                this.should.be.instanceof(Jimp);
                data.methodName.should.be.equal("crop");
                this.bitmap.width.should.be.equal(8, "not changed yet");
                done();
            });
            img.crop(0, 0, 4, 4);
        });

        it("call changed without callback", (done)=> {
            var img = new Jimp(8, 8).on("changed", function (data) {
                this.should.be.instanceof(Jimp);
                data.methodName.should.be.equal("crop");
                this.bitmap.width.should.be.equal(4, "just changed!");
                done();
            });
            img.crop(0, 0, 4, 4);
        });

        it("call before-change with callback", (done)=> {
            var eventEmited = false;
            var img = new Jimp(8, 8).on("before-change", function (data) {
                this.should.be.instanceof(Jimp);
                data.methodName.should.be.equal("crop");
                this.bitmap.width.should.be.equal(8, "not changed yet");
                eventEmited = true;
            });
            img.crop(0, 0, 4, 4, function () {
                eventEmited.should.be.ok();
                done();
            });
        });

        it("call changed with callback", (done)=> {
            var eventEmited = false;
            var img = new Jimp(8, 8).on("changed", function (data) {
                this.should.be.instanceof(Jimp);
                data.methodName.should.be.equal("crop");
                this.bitmap.width.should.be.equal(4, "just changed!");
                eventEmited = true;
            });
            img.crop(0, 0, 4, 4, function () {
                eventEmited.should.be.ok();
                done();
            });
        });

        it("call consistent with method chain", (done)=> {
            var widthSequence = [];
            var img = new Jimp(8, 8)
            .on("before-change", function () {
                widthSequence.push('in:'+this.bitmap.width);
            })
            .on("changed", function () {
                widthSequence.push('out:'+this.bitmap.width);
                if (widthSequence.length === 6) {
                    widthSequence.should.be.deepEqual([
                        "in:8", "out:6",
                        "in:6", "out:4",
                        "in:4", "out:2"
                    ]);
                    done();
                }
            });
            img.crop(0, 0, 6, 6).crop(0, 0, 4, 4).crop(0, 0, 2, 2);
        });

        it("call consistent with callback chain", (done)=> {
            var widthSequence = [];
            var img = new Jimp(8, 8)
            .on("before-change", function () {
                widthSequence.push('in:'+this.bitmap.width);
            })
            .on("changed", function () {
                widthSequence.push('out:'+this.bitmap.width);
                if (widthSequence.length === 6) {
                    widthSequence.should.be.deepEqual([
                        "in:8", "out:6",
                        "in:6", "out:4",
                        "in:4", "out:2"
                    ]);
                    done();
                }
            });
            img.crop(0, 0, 6, 6, (err, img)=> {
                if (err) done(err);
                img.crop(0, 0, 4, 4, (err, img)=> {
                    if (err) done(err);
                    img.crop(0, 0, 2, 2);
                });
            });
        });

    });

    describe("on error", ()=> {

        it("init fail on inextent image", (done)=> {
            new Jimp("/invalid/path/inextent.png")
            .on("initialized", function () {
                throw Error("must not init!");
            })
            .on("error", function (err) {
                err.should.be.instanceof(Error);
                err.methodName.should.be.equal("constructor");
                done();
            });
        });

        it("call crop without parameters", (done)=> {
            var evBeforeChangeEmited = false;
            var img = new Jimp(8, 8)
            .on("before-change", function () { evBeforeChangeEmited = true })
            .on("changed", function () { throw Error("must not emit!") })
            .on("error", function (err) {
                setTimeout(()=> { // Give some time to ensure `changed` will not emit.
                    err.methodName.should.be.equal("crop");
                    evBeforeChangeEmited.should.be.ok();
                    done();
                }, 300);
            });
            img.crop();
        });

    });

    describe("on clone", ()=> {

        it("emit clone events without callback", (done)=> {
            var evBeforeCloneEmited = false;
            var eventsEmited = [];
            Jimp.read(mkJGD('▴▵')).then((img)=> {
                img.on("clone", function (data) {
                    eventsEmited.push(data.eventName);
                })
                img.on("before-clone", function (data) {
                    this.should.be.instanceof(Jimp);
                    data.methodName.should.be.equal("clone");
                    evBeforeCloneEmited = true;
                });
                img.on("cloned", function (data) {
                    evBeforeCloneEmited.should.be.ok();
                    eventsEmited.should.be.deepEqual(["before-clone", "cloned"]);
                    this.should.be.equal(img, "this is NOT the clone! Is the emitter.");
                    data.methodName.should.be.equal("clone");
                    data.clone.should.be.instanceof(Jimp);
                    data.clone.getJGDSync().should.be.sameJGD(mkJGD('▴▵'));
                    done();
                });
                img.clone();
            })
            .catch(done);
        });

        it("emit clone events with callback", (done)=> {
            var evBeforeCloneEmited = false;
            var evClonedEmited = false;
            var eventsEmited = [];
            Jimp.read(mkJGD('▴▵')).then((img)=> {
                img.on("clone", function (data) {
                    eventsEmited.push(data.eventName);
                })
                .on("before-clone", function (data) {
                    this.should.be.instanceof(Jimp);
                    data.methodName.should.be.equal("clone");
                    evBeforeCloneEmited = true;
                })
                .on("cloned", function (data) {
                    this.should.be.equal(img, "this is NOT the clone! Is the emitter.");
                    data.methodName.should.be.equal("clone");
                    data.clone.should.be.instanceof(Jimp);
                    data.clone.getJGDSync().should.be.sameJGD(mkJGD('▴▵'));
                    evClonedEmited = true;
                });
                img.clone(function (clone) {
                    evBeforeCloneEmited.should.be.ok();
                    evClonedEmited.should.be.ok();
                    eventsEmited.should.be.deepEqual(["before-clone", "cloned"]);
                    done();
                });
            })
            .catch(done);
        });

    });

});
