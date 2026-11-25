// Renders the images in the "Open Graph images" guide
// (src/content/docs/guides/og-images.mdx) and on the render() page
// (src/content/docs/methods/render.mdx) into public/layout/, with the code
// from their "Objects" tabs. Run it from packages/docs after `pnpm build`:
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

// Step 1
const card = (children = []) => ({
  type: "box",
  padding: 72,
  justify: "space-between",
  background: { type: "linear", angle: 135, stops: ["#1b1840", "#3a2d7a"] },
  font: regular,
  color: "white",
  children,
});

// Step 2
const post = {
  title: "Generating Open Graph images with plain JavaScript",
  description:
    "Lay out text and images like CSS flexbox, then draw them with Jimp.",
  site: "jimp-dev.github.io",
  tags: ["jimp", "layout", "og-images"],
};

const body = (title, description) => ({
  type: "box",
  gap: 24,
  children: [
    {
      type: "text",
      text: title,
      font: bold,
      fontSize: 72,
      lineHeight: 84,
      maxLines: 2,
    },
    { type: "text", text: description, fontSize: 32, color: "#c9c4f0" },
  ],
});

// Step 3
const header = (site) => ({
  type: "box",
  direction: "row",
  align: "center",
  gap: 20,
  children: [
    {
      type: "image",
      src: avatar,
      width: 64,
      aspectRatio: 1,
      fit: "cover",
      radius: 32,
      borderWidth: 3,
      borderColor: "white",
      background: "white",
    },
    { type: "text", text: site, fontSize: 28, color: "#c9c4f0" },
  ],
});

// Step 4
const tag = (label) => ({
  type: "box",
  padding: [10, 22],
  radius: 999,
  background: "#ffd83a",
  shadow: { y: 6, blur: 12, color: "rgba(0, 0, 0, 0.35)" },
  children: [
    {
      type: "text",
      text: `#${label}`,
      font: bold,
      fontSize: 24,
      color: "#1b1840",
    },
  ],
});

const tags = (labels) => ({
  type: "box",
  direction: "row",
  wrap: true,
  gap: 12,
  children: labels.map(tag),
});

const steps = {
  "step-1-background": card(),
  "step-2-text": card([body(post.title, post.description)]),
  "step-3-header": card([header(post.site), body(post.title, post.description)]),
  "og-card": card([
    header(post.site),
    body(post.title, post.description),
    tags(post.tags),
  ]),
};

await mkdir(out, { recursive: true });

const write = (image, name) =>
  image.write(fileURLToPath(new URL(`${name}.png`, out)));

for (const [name, tree] of Object.entries(steps)) {
  const image = await render(tree, { width: 1200, height: 630, Jimp });

  // The finished card at full size, the steps at half size
  if (name !== "og-card") {
    image.resize({ w: 600 });
  }

  await write(image, name);
}

// The render() page's examples
const font = bold;
const photo = await Jimp.read(
  fileURLToPath(new URL("../public/dice.png", import.meta.url)),
);

const badge = await render(
  {
    type: "box",
    direction: "row",
    radius: 6,
    overflow: "hidden",
    font,
    fontSize: 14,
    color: "white",
    children: [
      { type: "text", text: "build", padding: [4, 8], background: "#555555" },
      { type: "text", text: "passing", padding: [4, 8], background: "#22c76b" },
    ],
  },
  { Jimp },
);

await write(badge, "badge");

const labels = [
  "layout",
  "flexbox",
  "open graph",
  "typescript",
  "no wasm",
  "jimp",
  "cards",
];
const wrapped = await render(
  {
    type: "box",
    direction: "row",
    padding: 16,
    gap: 16,
    align: "start",
    background: "#f4f1ea",
    font: bold,
    fontSize: 14,
    children: [
      {
        type: "image",
        src: photo,
        width: 96,
        aspectRatio: 1,
        fit: "cover",
        radius: 12,
      },
      {
        type: "box",
        grow: 1,
        direction: "row",
        wrap: true,
        gap: 8,
        children: labels.map((tag) => ({
          type: "text",
          text: tag,
          padding: [4, 10],
          radius: 999,
          background: "#3a2d7a",
          color: "white",
        })),
      },
    ],
  },
  { width: 360, Jimp },
);

await write(wrapped, "wrap");
