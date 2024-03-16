import { Jimp as jimp, mkJGD, getTestDir } from "@jimp/test-utils";
import configure from "@jimp/custom";
import plugins from "@jimp/plugins";
import expect from "@storybook/expect";
import { expectToBeJGD } from "@jimp/test-utils/src";

const Jimp = configure({ plugins: [plugins] }, jimp);

describe("Events", () => {
  describe("on initialized", () => {
    it("initializes", (done) => {
      new Jimp(mkJGD("▴▵"))
        .on("initialized", function (data) {
          expectToBeJGD(this.getJGDSync(), mkJGD("▴▵"));
          expect(data.methodName).toBe("constructor");
          done();
        })
        .on("error", done);
    });

    it("initializes with a file", (done) => {
      new Jimp(getTestDir(__dirname) + "/images/lenna.png")
        .on("initialized", function () {
          expect(this.bitmap.width).toBe(512);
          done();
        })
        .on("error", done);
    });

    // (8bit Hex, Hex, RGB, RGBA, HSL, HSLA, HSV, HSVA, Named)
    it("initializes with a 8bit hex color", async () => {
      const image = await Jimp.create(2, 2, 0xffffffff);
      expect(image.getPixelColor(1, 1)).toBe(0xffffffff);
    });

    it("initializes with a css color (Hex)", async () => {
      const image = await Jimp.create(2, 2, "#FFFFFF");
      expect(image.getPixelColor(1, 1)).toBe(0xffffffff);
    });

    it("initializes with a css color (RGB)", async () => {
      const image = await Jimp.create(2, 2, "rgb (255, 255, 255)");
      expect(image.getPixelColor(1, 1)).toBe(0xffffffff);
    });

    it("initializes with a css color (RGBA)", async () => {
      const image = await Jimp.create(2, 2, "rgba (255, 255, 255, 1)");
      expect(image.getPixelColor(1, 1)).toBe(0xffffffff);
    });

    it("initializes with a css color (HSL)", async () => {
      const image = await Jimp.create(2, 2, "hsl (100%, 100%, 100%)");
      expect(image.getPixelColor(1, 1)).toBe(0xffffffff);
    });

    it("initializes with a css color (HSLA)", async () => {
      const image = await Jimp.create(2, 2, "hsla (100%, 100%, 100%, 1)");
      expect(image.getPixelColor(1, 1)).toBe(0xffffffff);
    });

    it("initializes with a css color (HSV)", async () => {
      const image = await Jimp.create(2, 2, "hsv (0%, 0%, 100%)");
      expect(image.getPixelColor(1, 1)).toBe(0xffffffff);
    });

    it("initializes with a css color (HSVA)", async () => {
      const image = await Jimp.create(2, 2, "hsva (0%, 0%, 100%, 1)");
      expect(image.getPixelColor(1, 1)).toBe(0xffffffff);
    });

    it("initializes with a css color (Named)", async () => {
      const image = await Jimp.create(2, 2, "WHITE");
      expect(image.getPixelColor(1, 1)).toBe(0xffffffff);
    });
  });

  describe("on change", () => {
    it("call before-change without callback", (done) => {
      const img = new Jimp(8, 8).on("before-change", function (data) {
        expect(this).toBeInstanceOf(Jimp);
        expect(data.methodName).toBe("crop");
        expect(this.bitmap.width).toBe(8);
        done();
      });
      img.crop(0, 0, 4, 4);
    });

    it("call changed without callback", (done) => {
      const img = new Jimp(8, 8).on("changed", function (data) {
        expect(this).toBeInstanceOf(Jimp);
        expect(data.methodName).toBe("crop");
        expect(this.bitmap.width).toBe(4);
        done();
      });
      img.crop(0, 0, 4, 4);
    });

    it("call before-change with callback", (done) => {
      let eventEmited = false;
      const img = new Jimp(8, 8).on("before-change", function (data) {
        expect(this).toBeInstanceOf(Jimp);
        expect(data.methodName).toBe("crop");
        expect(this.bitmap.width).toBe(8);
        eventEmited = true;
      });
      img.crop(0, 0, 4, 4, () => {
        expect(eventEmited).toBe(true);
        done();
      });
    });

    it("call changed with callback", (done) => {
      let eventEmited = false;
      const img = new Jimp(8, 8).on("changed", function (data) {
        expect(this).toBeInstanceOf(Jimp);
        expect(data.methodName).toBe("crop");
        expect(this.bitmap.width).toBe(4);
        eventEmited = true;
      });
      img.crop(0, 0, 4, 4, () => {
        expect(eventEmited).toBe(true);
        done();
      });
    });

    it("call consistent with method chain", (done) => {
      const widthSequence = [];
      const img = new Jimp(8, 8)
        .on("before-change", function () {
          widthSequence.push("in:" + this.bitmap.width);
        })
        .on("changed", function () {
          widthSequence.push("out:" + this.bitmap.width);
          if (widthSequence.length === 6) {
            expect(widthSequence).toEqual([
              "in:8",
              "out:6",
              "in:6",
              "out:4",
              "in:4",
              "out:2",
            ]);
            done();
          }
        });
      img.crop(0, 0, 6, 6).crop(0, 0, 4, 4).crop(0, 0, 2, 2);
    });

    it("call consistent with callback chain", (done) => {
      const widthSequence = [];
      const img = new Jimp(8, 8)
        .on("before-change", function () {
          widthSequence.push("in:" + this.bitmap.width);
        })
        .on("changed", function () {
          widthSequence.push("out:" + this.bitmap.width);
          if (widthSequence.length === 6) {
            expect(widthSequence).toEqual([
              "in:8",
              "out:6",
              "in:6",
              "out:4",
              "in:4",
              "out:2",
            ]);
            done();
          }
        });

      img.crop(0, 0, 6, 6).crop(0, 0, 4, 4).crop(0, 0, 2, 2);
    });
  });

  describe("on error", () => {
    it("init fail on inextent image", (done) => {
      new Jimp("/invalid/path/inextent.png")
        .on("initialized", () => {
          throw new Error("must not init!");
        })
        .on("error", (err) => {
          expect(err).toBeInstanceOf(Error);
          expect(err.methodName).toBe("constructor");
          done();
        });
    });

    it("call crop without parameters", (done) => {
      let evBeforeChangeEmited = false;
      const img = new Jimp(8, 8)
        .on("before-change", () => {
          evBeforeChangeEmited = true;
        })
        .on("changed", () => {
          throw new Error("must not emit!");
        })
        .on("error", (err) => {
          setTimeout(() => {
            // Give some time to ensure `changed` will not emit.
            expect(err.methodName).toBe("crop");
            expect(evBeforeChangeEmited).toBe(true);
            done();
          }, 300);
        });
      img.crop();
    });
  });

  describe("on clone", () => {
    it("emit clone events without callback", (done) => {
      let evBeforeCloneEmited = false;
      const eventsEmited = [];
      Jimp.read(mkJGD("▴▵"))
        .then((img) => {
          img.on("clone", (data) => {
            eventsEmited.push(data.eventName);
          });
          img.on("before-clone", function (data) {
            expect(this).toBeInstanceOf(Jimp);
            expect(data.methodName).toBe("clone");
            evBeforeCloneEmited = true;
          });
          img.on("cloned", function (data) {
            expect(evBeforeCloneEmited).toBe(true);
            expect(eventsEmited).toEqual(["before-clone", "cloned"]);
            expect(this).toEqual(img);
            expect(data.methodName).toBe("clone");
            expect(data.clone).toBeInstanceOf(Jimp);
            expectToBeJGD(data.clone.getJGDSync(), mkJGD("▴▵"));
            done();
          });
          img.clone();
        })
        .catch(done);
    });

    it("emit clone events with callback", (done) => {
      let evBeforeCloneEmited = false;
      let evClonedEmited = false;
      const eventsEmited = [];
      Jimp.read(mkJGD("▴▵"))
        .then((img) => {
          img
            .on("clone", (data) => {
              eventsEmited.push(data.eventName);
            })
            .on("before-clone", function (data) {
              expect(this).toBeInstanceOf(Jimp);

              expect(data.methodName).toBe("clone");
              evBeforeCloneEmited = true;
            })
            .on("cloned", function (data) {
              expect(this).toEqual(img);
              expect(data.methodName).toBe("clone");
              expect(data.clone).toBeInstanceOf(Jimp);
              expectToBeJGD(data.clone.getJGDSync(), mkJGD("▴▵"));
              evClonedEmited = true;
            });
          img.clone(() => {
            expect(evBeforeCloneEmited).toBe(true);
            expect(evClonedEmited).toBe(true);
            expect(eventsEmited).toEqual(["before-clone", "cloned"]);
            done();
          });
        })
        .catch(done);
    });
  });
});
