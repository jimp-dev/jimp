import { expect, test } from "vitest";
import { Jimp, JimpOptions } from "./index.js";
import { promises as fs } from "fs";
import { Bitmap, Format } from "@jimp/types";

test("adds 1 + 2 to equal 3", () => {
  expect(1 + 2).toBe(3);
});

function manipulatePlugin() {
  return {
    /** Adjust the scale of the image */
    scale: (img: Jimp, factor: number): Jimp => {
      return img;
    },
    /** Rotate the image counter-clockwise by a number of degrees. */
    rotate: (img: Jimp, deg: number): Jimp => {
      return img;
    },
    /** Flip the image horizontally or vertically */
    flip: (img: Jimp, horiz: boolean, vert: boolean): Jimp => {
      return img;
    },
  };
}

function png(jimp: Jimp, options: JimpOptions) {
  return {
    mime: "image/png",
    encode: async (image) => {
      return Buffer.from("test");
    },
    decode: async (data) => {
      return {
        data,
        width: 10,
        height: 10,
      };
    },
  } as Format<"image/png">;
}

function jpg(jimp: Jimp, options: JimpOptions) {
  return {
    mime: "image/jpg" as const,
    encode: async (image: Bitmap) => {
      return Buffer.from("test");
    },
    decode: async (data: Buffer) => {
      return {
        data,
        width: 10,
        height: 10,
      };
    },
  };
}

const MyJimp = Jimp.addFormat(jpg); //.addFormat(png).plugin(manipulatePlugin);

async function run() {
  const imageBuffer = await fs.readFile("./some.png");
  const image = new MyJimp();

  await image.fromBuffer(imageBuffer);

  // image.scale(2).rotate(90).flip(true, false);

  const outputBuffer = await image.toBuffer("image/jpg");

  await fs.writeFile("./out.png", outputBuffer);
}
