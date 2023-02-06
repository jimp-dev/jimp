import { Jimp } from "@jimp/test-utils";
import expect from "@storybook/expect";

// Convert [0..1] float to a percent value with only one decimal.
const pct = (n) => ((n * 1000) << 0) / 10;

describe("compute color difference", () => {
  it("totally opaque (no alpha defined)", () => {
    expect(
      Jimp.colorDiff({ r: 255, g: 0, b: 0 }, { r: 255, g: 0, b: 0 })
    ).toEqual(0);

    expect(
      pct(Jimp.colorDiff({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 0 }))
    ).toEqual(33.3);

    expect(
      pct(Jimp.colorDiff({ r: 255, g: 0, b: 0 }, { r: 0, g: 255, b: 0 }))
    ).toEqual(66.6);

    expect(
      Jimp.colorDiff({ r: 255, g: 0, b: 0 }, { r: 0, g: 255, b: 255 })
    ).toEqual(1);

    expect(
      Jimp.colorDiff({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })
    ).toEqual(1);
  });

  it("totally transparent", () => {
    expect(
      Jimp.colorDiff({ r: 255, g: 0, b: 0, a: 0 }, { r: 255, g: 0, b: 0, a: 0 })
    ).toEqual(0);

    expect(
      Jimp.colorDiff(
        { r: 0, g: 0, b: 0, a: 0 },
        { r: 255, g: 255, b: 255, a: 0 }
      )
    ).toEqual(1);
  });

  it("different alpha", () => {
    expect(
      pct(
        Jimp.colorDiff(
          { r: 255, g: 0, b: 0, a: 100 },
          { r: 255, g: 0, b: 0, a: 150 }
        )
      )
    ).toEqual(3.8);

    expect(
      Jimp.colorDiff(
        { r: 0, g: 0, b: 0, a: 0 },
        { r: 255, g: 255, b: 255, a: 255 }
      )
    ).toEqual(1);
  });
});
