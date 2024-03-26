// import { expect, test } from "vitest";
import { promises as fs } from "fs";
import path from "path";

import { Jimp } from "./index.js";

// test("adds 1 + 2 to equal 3", () => {
//   expect(1 + 2).toBe(3);
// });

async function run() {
  const image = new Jimp();
  const imageBuffer = await fs.readFile(
    path.join(__dirname, "../../../../images/GIgFDCFbAAA0zlg.png")
  );
  await image.fromBuffer(imageBuffer);

  const image2 = new Jimp();
  const image2Buffer = await fs.readFile(
    path.join(__dirname, "../../../../images/discord.png")
  );
  await image2.fromBuffer(image2Buffer);

  image.blit({ src: image2, x: 100, y: 100 }).autocrop(0, 0);

  const outputBuffer = await image.getBuffer("image/png");
  const outPath = path.join(__dirname, "./out.png");

  await fs.writeFile(outPath, outputBuffer);
  console.log(outPath);
}

run();
