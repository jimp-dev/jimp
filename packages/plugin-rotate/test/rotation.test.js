import { Jimp, mkJGD } from "@jimp/test-utils";
import configure from "@jimp/custom";
import blit from "@jimp/plugin-blit";
import crop from "@jimp/plugin-crop";
import resize from "@jimp/plugin-resize";

import rotate from "../src";
import { expectToBeJGD } from "@jimp/test-utils/src";

const jimp = configure({ plugins: [rotate, blit, crop, resize] }, Jimp);

describe("Rotate a image with even size", () => {
  let imgSrc = null;

  before((done) => {
    jimp
      .read(
        mkJGD(
          "▰▴▴▴▪▪▪▰",
          "▴▴▴▴▪▪▪▪",
          "▴▴▴▴▪▪▪▪",
          "▴▴▴▴▪▪▪▪",
          "▪▪▪▪▴▴▴▴",
          "▪▪▪▪▴▴▴▴",
          "▪▪▪▪▴▴▴▴",
          "▦▪▪▪▴▴▴▦"
        )
      )
      .then((imgJimp) => {
        imgSrc = imgJimp;
        done();
      })
      .catch(done);
  });

  it("1 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(1, true).getJGDSync(),
      mkJGD(
        "▰▴▴▴▪▪▪▰  ",
        "▴▴▴▴▪▪▪▪  ",
        "▴▴▴▴▪▪▪▪  ",
        "▴▴▴▴▪▪▪▪  ",
        "▪▪▪▪▴▴▴▴  ",
        "▪▪▪▪▴▴▴▴  ",
        "▪▪▪▪▴▴▴▴  ",
        "▦▪▪▪▴▴▴▦  ",
        "          ",
        "          "
      )
    );
  });

  it("91 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(91, true).getJGDSync(),
      mkJGD(
        "          ",
        "▰▪▪▪▴▴▴▦  ",
        "▪▪▪▪▴▴▴▴  ",
        "▪▪▪▪▴▴▴▴  ",
        "▪▪▪▪▴▴▴▴  ",
        "▴▴▴▴▪▪▪▪  ",
        "▴▴▴▴▪▪▪▪  ",
        "▴▴▴▴▪▪▪▪  ",
        "▰▴▴▴▪▪▪▦  ",
        "          "
      )
    );
  });

  it("30 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(30, true).getJGDSync(),
      mkJGD(
        "     ▰▰     ",
        "   ▪▪▪▪     ",
        "  ▴▪▪▪▪▪    ",
        "▴▴▴▴▪▪▪▪    ",
        "▴▴▴▴▪▪▴▴▴   ",
        "▴▴▴▴▪▴▴▴▴▴  ",
        " ▴▴▪▪▴▴▴▴▦  ",
        " ▪▪▪▪▪▴▴▴   ",
        "  ▪▪▪▪▪     ",
        "   ▪▪▪      ",
        "   ▦        ",
        "            "
      )
    );
  });

  it("45 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(45, true).getJGDSync(),
      mkJGD(
        "              ",
        "     ▰        ",
        "    ▪▪▪       ",
        "   ▪▪▪▪▪      ",
        "  ▴▴▪▪▪▪▴     ",
        " ▴▴▴▴▪▪▴▴▴    ",
        "▰▰▴▴▴▴▴▴▴▴▦   ",
        " ▴▴▴▴▪▪▴▴▴    ",
        "  ▴▴▪▪▪▪▴     ",
        "   ▪▪▪▪▪      ",
        "    ▪▪▪       ",
        "     ▦        ",
        "              ",
        "              "
      )
    );
  });

  it("60 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(60, true).getJGDSync(),
      mkJGD(
        "   ▰        ",
        "   ▪▪▪      ",
        "  ▪▪▪▪▪     ",
        " ▪▪▪▪▪▴▴▴   ",
        " ▴▴▪▪▴▴▴▴▦  ",
        "▴▴▴▴▪▴▴▴▴▴  ",
        "▴▴▴▴▪▪▴▴▴   ",
        "▴▴▴▴▪▪▪▪    ",
        "  ▴▪▪▪▪▪    ",
        "   ▪▪▪▪     ",
        "     ▦▦     ",
        "            "
      )
    );
  });

  it("90 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(90, true).getJGDSync(),
      mkJGD(
        "          ",
        "▰▪▪▪▴▴▴▦  ",
        "▪▪▪▪▴▴▴▴  ",
        "▪▪▪▪▴▴▴▴  ",
        "▪▪▪▪▴▴▴▴  ",
        "▴▴▴▴▪▪▪▪  ",
        "▴▴▴▴▪▪▪▪  ",
        "▴▴▴▴▪▪▪▪  ",
        "▰▴▴▴▪▪▪▦  ",
        "          "
      )
    );
  });

  it("120 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(120, true).getJGDSync(),
      mkJGD(
        "            ",
        "     ▴▦     ",
        "    ▴▴▴▴    ",
        "  ▪▪▴▴▴▴    ",
        "▰▪▪▪▴▴▴▴▪   ",
        "▰▪▪▪▪▴▴▪▪▪  ",
        " ▪▪▪▪▪▪▪▪▪  ",
        " ▪▪▴▴▴▪▪▪▪▦ ",
        "  ▴▴▴▴▴▪▪   ",
        "   ▴▴▴▴▪    ",
        "   ▴▴▴      ",
        "            "
      )
    );
  });

  it("135 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(135, true).getJGDSync(),
      mkJGD(
        "              ",
        "              ",
        "      ▦       ",
        "     ▴▴▴      ",
        "    ▴▴▴▴▴     ",
        "   ▪▪▴▴▴▪▪    ",
        "  ▪▪▪▪▴▪▪▪▪   ",
        " ▰▪▪▪▪▴▪▪▪▪▦  ",
        "  ▪▪▪▴▴▴▪▪▪   ",
        "   ▪▴▴▴▴▴▪    ",
        "    ▴▴▴▴▴     ",
        "     ▴▰▴      ",
        "      ▰       ",
        "              "
      )
    );
  });

  it("180 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(180, true).getJGDSync(),
      mkJGD(
        "          ",
        " ▦▴▴▴▪▪▪▦ ",
        " ▴▴▴▴▪▪▪▪ ",
        " ▴▴▴▴▪▪▪▪ ",
        " ▴▴▴▴▪▪▪▪ ",
        " ▪▪▪▪▴▴▴▴ ",
        " ▪▪▪▪▴▴▴▴ ",
        " ▪▪▪▪▴▴▴▴ ",
        " ▰▪▪▪▴▴▴▰ ",
        "          "
      )
    );
  });

  it("225 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(225, true).getJGDSync(),
      mkJGD(
        "              ",
        "       ▦      ",
        "      ▪▪▪     ",
        "     ▪▪▪▪▪    ",
        "    ▴▪▪▪▪▴▴   ",
        "   ▴▴▴▪▪▴▴▴▴  ",
        "  ▦▴▴▴▴▴▴▴▴▰▰ ",
        "   ▴▴▴▪▪▴▴▴▴  ",
        "    ▴▪▪▪▪▴▴   ",
        "     ▪▪▪▪▪    ",
        "      ▪▪▪     ",
        "       ▰      ",
        "              ",
        "              "
      )
    );
  });

  it("270 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(270, true).getJGDSync(),
      mkJGD(
        " ▦▪▪▪▴▴▴▰ ",
        " ▪▪▪▪▴▴▴▴ ",
        " ▪▪▪▪▴▴▴▴ ",
        " ▪▪▪▪▴▴▴▴ ",
        " ▴▴▴▴▪▪▪▪ ",
        " ▴▴▴▴▪▪▪▪ ",
        " ▴▴▴▴▪▪▪▪ ",
        " ▦▴▴▴▪▪▪▰ ",
        "          ",
        "          "
      )
    );
  });

  it("315 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(315, true).getJGDSync(),
      mkJGD(
        "      ▰       ",
        "     ▴▰▴      ",
        "    ▴▴▴▴▴     ",
        "   ▪▴▴▴▴▴▪    ",
        "  ▪▪▪▴▴▴▪▪▪   ",
        " ▦▪▪▪▪▴▪▪▪▪▰  ",
        "  ▪▪▪▪▴▪▪▪▪   ",
        "   ▪▪▴▴▴▪▪    ",
        "    ▴▴▴▴▴     ",
        "     ▴▴▴      ",
        "      ▦       ",
        "              ",
        "              ",
        "              "
      )
    );
  });

  it("360 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(360, true).getJGDSync(),
      mkJGD(
        "▰▴▴▴▪▪▪▰  ",
        "▴▴▴▴▪▪▪▪  ",
        "▴▴▴▴▪▪▪▪  ",
        "▴▴▴▴▪▪▪▪  ",
        "▪▪▪▪▴▴▴▴  ",
        "▪▪▪▪▴▴▴▴  ",
        "▪▪▪▪▴▴▴▴  ",
        "▦▪▪▪▴▴▴▦  ",
        "          ",
        "          "
      )
    );
  });
});

describe("Rotate a image with odd size", () => {
  let imgSrc = null;
  before((done) => {
    jimp
      .read(
        mkJGD(
          "▴▴▴▦▪▪▪",
          "▴▴▴▦▪▪▪",
          "▴▴▴▦▪▪▪",
          "▦▦▦▦▦▦▦",
          "▴▴▴▦▴▴▴",
          "▴▴▴▦▴▴▴",
          "▴▴▴▦▴▴▴"
        )
      )
      .then((imgJimp) => {
        imgSrc = imgJimp;
        done();
      })
      .catch(done);
  });

  it("45 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(45, true).getJGDSync(),
      mkJGD(
        "            ",
        "     ▪      ",
        "    ▪▪▪     ",
        "   ▦▪▪▪▦    ",
        "  ▴▴▦▪▦▴▴   ",
        " ▴▴▴▴▦▴▴▴▴  ",
        "  ▴▴▦▴▦▴▴   ",
        "   ▦▴▴▴▦    ",
        "    ▴▴▴     ",
        "     ▴      ",
        "            ",
        "            "
      )
    );
  });

  it("135 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(135, true).getJGDSync(),
      mkJGD(
        "            ",
        "     ▴      ",
        "    ▴▴▴     ",
        "   ▦▴▴▴▦    ",
        "  ▪▪▦▴▦▴▴   ",
        " ▪▪▪▪▦▴▴▴▴  ",
        "  ▪▪▦▴▦▴▴   ",
        "   ▦▴▴▴▦    ",
        "    ▴▴▴     ",
        "     ▴      ",
        "            ",
        "            "
      )
    );
  });

  it("225 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(225, true).getJGDSync(),
      mkJGD(
        "            ",
        "     ▴      ",
        "    ▴▴▴     ",
        "   ▦▴▴▴▦    ",
        "  ▴▴▦▴▦▴▴   ",
        " ▴▴▴▴▦▴▴▴▴  ",
        "  ▴▴▦▪▦▴▴   ",
        "   ▦▪▪▪▦    ",
        "    ▪▪▪     ",
        "     ▪      ",
        "            ",
        "            "
      )
    );
  });

  it("315 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(315, true).getJGDSync(),
      mkJGD(
        "            ",
        "     ▴      ",
        "    ▴▴▴     ",
        "   ▦▴▴▴▦    ",
        "  ▴▴▦▴▦▪▪   ",
        " ▴▴▴▴▦▪▪▪▪  ",
        "  ▴▴▦▴▦▪▪   ",
        "   ▦▴▴▴▦    ",
        "    ▴▴▴     ",
        "     ▴      ",
        "            ",
        "            "
      )
    );
  });
});

describe("Rotate a non-square image", () => {
  let imgSrc = null;
  before((done) => {
    jimp
      .read(mkJGD("▴▴▴▴▪▪▪▪", "▴▴▴▴▪▪▪▪", "▦▦▦▦▴▴▴▴", "▦▦▦▦▴▴▴▴"))
      .then((imgJimp) => {
        imgSrc = imgJimp;
        done();
      })
      .catch(done);
  });

  it("1 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(1, true).getJGDSync(),
      mkJGD(
        "▴▴▴▴▪▪▪▪  ",
        "▴▴▴▴▪▪▪▪  ",
        "▦▦▦▦▴▴▴▴  ",
        "▦▦▦▦▴▴▴▴  ",
        "          ",
        "          "
      )
    );
  });

  it("10 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(10, true).getJGDSync(),
      mkJGD(
        "       ▪  ",
        " ▴▴▴▪▪▪▪  ",
        "▴▴▴▴▪▪▪▴  ",
        "▴▴▦▦▴▴▴▴  ",
        "▦▦▦▦▴▴▴   ",
        "▦▦        ",
        "          ",
        "          "
      )
    );
  });

  it("30 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(30, true).getJGDSync(),
      mkJGD(
        "          ",
        "     ▪▪   ",
        "   ▪▪▪▪   ",
        " ▴▴▪▪▴▴▴  ",
        "▴▴▴▦▴▴▴   ",
        "▴▴▦▦▴▴    ",
        "▦▦▦▦      ",
        " ▦        ",
        "          ",
        "          "
      )
    );
  });

  it("45 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(45, true).getJGDSync(),
      mkJGD(
        "          ",
        "    ▪▪    ",
        "   ▪▪▪▴   ",
        "  ▴▪▪▴▴▴  ",
        " ▴▴▴▴▴▴   ",
        "▴▴▴▦▦▴    ",
        "▴▴▦▦▦     ",
        " ▦▦▦      ",
        "  ▦       ",
        "          "
      )
    );
  });

  it("90 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(90, true).getJGDSync(),
      mkJGD(
        "      ",
        "▪▪▴▴  ",
        "▪▪▴▴  ",
        "▪▪▴▴  ",
        "▪▪▴▴  ",
        "▴▴▦▦  ",
        "▴▴▦▦  ",
        "▴▴▦▦  ",
        "▴▴▦▦  ",
        "      "
      )
    );
  });

  it("135 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(135, true).getJGDSync(),
      mkJGD(
        "          ",
        "   ▴      ",
        "  ▴▴▴     ",
        " ▪▪▴▴▴    ",
        " ▪▪▪▴▦▦   ",
        "  ▪▪▴▦▦▦  ",
        "   ▴▴▴▦▦▦ ",
        "    ▴▴▴▦  ",
        "     ▴▴   ",
        "          "
      )
    );
  });

  it("180 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(180, true).getJGDSync(),
      mkJGD(
        "          ",
        " ▴▴▴▴▦▦▦▦ ",
        " ▴▴▴▴▦▦▦▦ ",
        " ▪▪▪▪▴▴▴▴ ",
        " ▪▪▪▪▴▴▴▴ ",
        "          "
      )
    );
  });

  it("225 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(225, true).getJGDSync(),
      mkJGD(
        "      ▦   ",
        "     ▦▦▦  ",
        "    ▦▦▦▴▴ ",
        "   ▴▦▦▴▴▴ ",
        "  ▴▴▴▴▴▴  ",
        " ▴▴▴▪▪▴   ",
        "  ▴▪▪▪    ",
        "   ▪▪     ",
        "          ",
        "          "
      )
    );
  });

  it("315 degrees", () => {
    expectToBeJGD(
      imgSrc.clone().rotate(315, true).getJGDSync(),
      mkJGD(
        "  ▴▴      ",
        " ▦▴▴▴     ",
        "▦▦▦▴▴▴    ",
        " ▦▦▦▴▪▪   ",
        "  ▦▦▴▪▪▪  ",
        "   ▴▴▴▪▪  ",
        "    ▴▴▴   ",
        "     ▴    ",
        "          ",
        "          "
      )
    );
  });
});
