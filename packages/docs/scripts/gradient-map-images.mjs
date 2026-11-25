// Renders the example images on the gradientMap() page
// (src/content/docs/methods/gradient-map.mdx) into public/gradient-map/, with
// the code from its examples. Run it from packages/docs after `pnpm build`:
//
//   node scripts/gradient-map-images.mjs
import { Jimp } from "jimp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const out = new URL("../public/gradient-map/", import.meta.url);
const photo = await Jimp.read(
  fileURLToPath(new URL("../public/dice.png", import.meta.url)),
);

photo.resize({ w: 400 });

const examples = {
  duotone: (image) => image.gradientMap(["#1e3264", "#f037a5"]),
  "three-stops": (image) =>
    image.gradientMap(["#000000", "#d9381e", "#ffe08a"]),
  offsets: (image) =>
    image.gradientMap([
      { offset: 0.3, color: "#0b3d2e" },
      { offset: 0.7, color: "#c6f432" },
    ]),
  amount: (image) =>
    image.gradientMap({ stops: ["#1e3264", "#f037a5"], amount: 0.5 }),
};

await mkdir(out, { recursive: true });

for (const [name, edit] of Object.entries(examples)) {
  const image = photo.clone();

  edit(image);
  await image.write(fileURLToPath(new URL(`${name}.png`, out)));
}
