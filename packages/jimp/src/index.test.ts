// import { expect, test } from "vitest";
import { promises as fs } from "fs";
import path from "path";

import { Jimp } from "./index.js";

// test("adds 1 + 2 to equal 3", () => {
//   expect(1 + 2).toBe(3);
// });

async function run() {
  const imageBuffer = await fs.readFile(
    path.join(__dirname, "../../../../images/GIgFDCFbAAA0zlg.png"),
  );

  const image = new Jimp();
  await image.fromBuffer(imageBuffer);

  const image2 = new Jimp();
  await image2.fromBuffer(imageBuffer);

  image
    // First crop
    .crop(100, 100, 150, 100)
    // then put the other image on top
    .blit({ src: image2, x: 100, y: 100 });

  const outputBuffer = await image.toBuffer("image/png");
  const outPath = path.join(__dirname, "./out.png");

  await fs.writeFile(outPath, outputBuffer);
  console.log(outPath);
}

run();
