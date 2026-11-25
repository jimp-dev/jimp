// Renders the smart cropping images on the cover() page
// (src/content/docs/methods/cover.mdx) into public/cover/. Run it from
// packages/docs after `pnpm build`:
//
//   node scripts/cover-images.mjs
import { Jimp } from "jimp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const photo = fileURLToPath(
  new URL("../../test-utils/images/cops.jpg", import.meta.url),
);
const out = new URL("../public/cover/", import.meta.url);

await mkdir(out, { recursive: true });

const image = await Jimp.read(photo);
const write = (result, name) =>
  result.write(fileURLToPath(new URL(name, out)), { quality: 80 });

await write(image.clone(), "original.jpg");

for (const align of ["center", "entropy", "attention"]) {
  await write(
    image
      .clone()
      .cover({ w: 150, h: 320, align: align === "center" ? undefined : align }),
    `${align}.jpg`,
  );
}
