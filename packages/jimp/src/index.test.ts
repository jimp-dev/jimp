// import { expect, test } from "vitest";
import { promises as fs } from "fs";
import path from "path";

import { Jimp } from "./index.js";

async function run() {
  const imageBuffer = await fs.readFile(
    path.join(__dirname, "../../../../images/GIgFDCFbAAA0zlg.png")
  );
  const image = await Jimp.fromBuffer(imageBuffer);

  const image2Buffer = await fs.readFile(
    path.join(__dirname, "../../../../images/discord.png")
  );
  const image2 = await Jimp.fromBuffer(image2Buffer);

  image.blit({ src: image2, x: 100, y: 100 }).autocrop();

  const outputBuffer = await image.getBuffer("image/png");
  const outPath = path.join(__dirname, "./out.png");

  await fs.writeFile(outPath, outputBuffer);
  console.log(outPath);
}

run();
