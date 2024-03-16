import fs from "fs";
import { Jimp, getTestDir } from "@jimp/test-utils";
import expect from "@storybook/expect";

const imagesDir = getTestDir(__dirname) + "/images";

describe("FileType", () => {
  it("write uses original MIME type", async () => {
    if (process.env.ENV === "browser") {
      return;
    }

    const writePath = "./test-result";
    const image = await Jimp.read(imagesDir + "/dice.png");
    const writtenImage = await image.writeAsync(writePath);

    expect(writtenImage).not.toBeUndefined();
    expect(fs.existsSync(writePath)).toBe(true);
    fs.unlinkSync(writePath);
  });

  it("should load from raw data", async () => {
    const image = await Jimp.read(imagesDir + "/dice.png");
    const imageFromBitmap = await Jimp.read({
      data: image.bitmap.data,
      width: image.getWidth(),
      height: image.getHeight(),
    });

    expect(imageFromBitmap).not.toBeUndefined();
  });

  it("clones with the correct MIME type", async () => {
    const image = await Jimp.read(imagesDir + "/cops.jpg");
    const clone = image.clone();

    expect(image.getMIME()).toBe(clone.getMIME());
  });

  it("clones gif with the correct MIME type", async () => {
    const image = await Jimp.read(imagesDir + "/flower.gif");
    const clone = image.clone();

    expect(image.getMIME()).toBe(clone.getMIME());
  });
});

describe("hasAlpha", () => {
  it("image with no alpha", async () => {
    const image = await Jimp.read(imagesDir + "/cops.jpg");

    expect(image.hasAlpha()).toBe(false);
  });

  it("image with alpha", async () => {
    const image = await Jimp.read(imagesDir + "/dice.png");

    expect(image.hasAlpha()).toBe(true);
  });
});
