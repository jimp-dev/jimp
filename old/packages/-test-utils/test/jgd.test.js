import { Jimp, donutJGD } from "../src";
import expect from "@storybook/expect";

const donut = donutJGD(
  // RRGGBBAA
  0xffffff00,
  0xff880088,
  0xff8800ff
);

const donutPngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAaUlEQVR" +
  "4AY3BwY3DMBAEMEpwz6MSvFXvOZAN53GPkKO7/eLwrcaJ2Ep6uU2PGo" +
  "14RY12mz5qnF6F8qhxukxbbCW9pBfKFpfpR4etEEQNt9jKZfpIL68gH" +
  "unlMj3SA+VV0sPt8C29sPzjD0ceIlrXDNOFAAAAAElFTkSuQmCC";

const donutPngBuffer = Buffer.from(donutPngBase64, "base64");

describe("JGD - JS Graphic Description", () => {
  it("Jimp loads JGD", async () => {
    const image = await Jimp.read(donut);
    const buffer = await image.getBufferAsync("image/png");

    expect(buffer.toString("base64")).toBe(donutPngBase64);
  });

  it("Jimp exports JGD sync", async () => {
    const image = await Jimp.read(donutPngBuffer);

    expect(image.getJGDSync()).toEqual(donut);
  });

  it("Jimp exports JGD async", async () => {
    const image = await Jimp.read(donutPngBuffer);
    const jgd = await image.getJGD();

    expect(jgd.data.length).toBe(donut.data.length);
    expect(jgd).toEqual(donut);
  });
});
