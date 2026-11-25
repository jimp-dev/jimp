// Renders the images in the "Open Graph images" guide
// (src/content/docs/guides/og-images.mdx) with the guide's own code, into
// public/layout/. Run it from packages/docs after `pnpm build`:
//
//   node scripts/layout-guide-images.mjs
import { Jimp } from "jimp";
import { loadTTF } from "jimp/load-ttf";
import { render } from "@jimp/layout";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const fonts = new URL("../../layout/fixtures/", import.meta.url);
const out = new URL("../public/layout/", import.meta.url);

const regular = await loadTTF(new URL("Inter-Regular.otf", fonts));
const bold = await loadTTF(new URL("Inter-Bold.otf", fonts));
const avatar = await Jimp.read(
  fileURLToPath(new URL("../public/sticker.png", import.meta.url)),
);

const post = {
  title: "Generating Open Graph images with plain JavaScript",
  description:
    "Lay out text and images like CSS flexbox, then draw them with Jimp.",
  site: "jimp-dev.github.io",
  tags: ["jimp", "layout", "og-images"],
};

// Step 1: the background
const background = {
  type: "box",
  padding: 72,
  background: { type: "linear", angle: 135, stops: ["#1b1840", "#3a2d7a"] },
  font: regular,
  color: "white",
};

// Step 2: the title and description
const body = {
  type: "box",
  gap: 24,
  children: [
    {
      type: "text",
      text: post.title,
      font: bold,
      fontSize: 72,
      lineHeight: 84,
      maxLines: 2,
    },
    { type: "text", text: post.description, fontSize: 32, color: "#c9c4f0" },
  ],
};

// Step 3: the header
const header = {
  type: "box",
  direction: "row",
  align: "center",
  gap: 20,
  children: [
    {
      type: "image",
      src: avatar,
      width: 64,
      height: 64,
      radius: 32,
      fit: "cover",
      borderWidth: 3,
      borderColor: "white",
      background: "white",
    },
    { type: "text", text: post.site, fontSize: 28, color: "#c9c4f0" },
  ],
};

// Step 4: the tags
const tag = (label) => ({
  type: "box",
  padding: [10, 22],
  radius: 999,
  background: "#ffd83a",
  shadow: { y: 6, blur: 12, color: "rgba(0, 0, 0, 0.35)" },
  children: [
    { type: "text", text: `#${label}`, font: bold, fontSize: 24, color: "#1b1840" },
  ],
});

const tags = {
  type: "box",
  direction: "row",
  gap: 12,
  children: post.tags.map(tag),
};

const steps = {
  "step-1-background": { ...background, children: [] },
  "step-2-text": { ...background, children: [body] },
  "step-3-header": {
    ...background,
    justify: "space-between",
    children: [header, body],
  },
  "og-card": {
    ...background,
    justify: "space-between",
    children: [header, body, tags],
  },
};

await mkdir(out, { recursive: true });

for (const [name, tree] of Object.entries(steps)) {
  const card = await render(tree, { width: 1200, height: 630, Jimp });

  // The finished card at full size, the steps at half size
  if (name !== "og-card") {
    card.resize({ w: 600 });
  }

  await card.write(fileURLToPath(new URL(`${name}.png`, out)));
}
