import { Jimp, getTestDir } from "@jimp/test-utils";
import configure from "@jimp/custom";
import types from "@jimp/types";
import plugins from "@jimp/plugins";
import expect from "@storybook/expect";

const jimp = configure({ types: [types], plugins: [plugins] }, Jimp);

const imagesDir = getTestDir(__dirname) + "/images";

describe("hash", () => {
  it("base 2", async () => {
    const image = await jimp.read(imagesDir + "/dice.png");

    expect(image.hash(2)).toBe(
      "1100010000011111011010111110000000010101001011010101101000010010"
    );
  });

  it("base 10 (decimal)", async () => {
    const image = await jimp.read(imagesDir + "/cops.jpg");

    expect(image.hash(10)).toBe("13442314021806033441");
  });

  it("base 16 (hex)", async () => {
    const image = await jimp.read(imagesDir + "/rgb.tiff");

    expect(image.hash(16)).toBe("949800481007044c");
  });

  it("base 64", async () => {
    const image = await jimp.read(imagesDir + "/windows95.bmp");

    expect(image.hash(64)).toBe("fb0xj0Mw400");
  });

  it("base 23", async function () {
    // large image need large timeout, but this really seems to be an issue
    // with should. If I change the expected value it will complete quicker! :(
    this.timeout(10000);
    const image = await jimp.read(imagesDir + "/panoramic.jpg");

    expect(image.hash(23)).toBe("0m1m2id7l7cl4fb");
  });

  it("base 17", async () => {
    const image = await jimp.read(imagesDir + "/lenna.png");

    expect(image.hash(17)).toBe("4fa6aga5a64ad0c1");
  });
});

describe("pHash", () => {
  it("should calculate the distance using distanceFromHash", async function () {
    this.timeout(10000);
    const image1 = await Jimp.read(imagesDir + "/lenna.png");
    const image2 = await Jimp.read(imagesDir + "/mask.png");

    const hash = image1.pHash();
    expect(image2.distanceFromHash(hash)).toBe(Jimp.distance(image1, image2));
  });

  it("should calculate the distance using compareHashes.", async function () {
    this.timeout(10000);
    const image1 = await Jimp.read(imagesDir + "/lenna.png");
    const image2 = await Jimp.read(imagesDir + "/mask.png");

    const hash1 = image1.pHash();
    const hash2 = image2.pHash();

    expect(Jimp.compareHashes(hash1, hash2)).toBe(
      Jimp.distance(image1, image2)
    );
  });
});
