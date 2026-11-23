/**
 * Guides and concept pages, in sidebar order. Used by the sidebar, the page
 * header sticker colors and the documentation cards on the home page.
 */
export interface DocPage {
  slug: string;
  title: string;
  /** One line shown on the home page cards */
  blurb: string;
  color: string;
  /** Key in `guideIcons` from src/components/icons.ts */
  icon: string;
}

export const startHere: DocPage[] = [
  {
    slug: "guides/getting-started",
    title: "Getting Started",
    blurb: "Install Jimp and learn the load, manipulate, save workflow.",
    color: "#ff4b4b",
    icon: "start",
  },
  {
    slug: "guides/browser",
    title: "Using in Browser",
    blurb: "Use Jimp from a CDN, with uploads, canvas and web workers.",
    color: "#5cc8ff",
    icon: "browser",
  },
];

export const concepts: DocPage[] = [
  {
    slug: "concepts/reading-and-writing",
    title: "Reading and writing",
    blurb: "Load images from files, URLs and buffers, and encode them again.",
    color: "#ffd83a",
    icon: "file",
  },
  {
    slug: "concepts/formats",
    title: "Formats",
    blurb: "The built-in formats, the WASM plugins and what each supports.",
    color: "#3fe0b5",
    icon: "formats",
  },
  {
    slug: "concepts/colors-and-pixels",
    title: "Colors and pixels",
    blurb: "The bitmap layout, reading and writing pixels, and color helpers.",
    color: "#ff9ccf",
    icon: "pixels",
  },
  {
    slug: "concepts/compositing",
    title: "Compositing",
    blurb: "Layer images with composite, blit and mask, and blend modes.",
    color: "#ffb35c",
    icon: "layers",
  },
  {
    slug: "concepts/text-and-fonts",
    title: "Text and fonts",
    blurb: "Print text with bitmap fonts, measure it and align it.",
    color: "#c9a8ff",
    icon: "text",
  },
  {
    slug: "concepts/chaining-and-async",
    title: "Chaining and async",
    blurb: "Which methods mutate, which return promises, and when to clone.",
    color: "#5cc8ff",
    icon: "chain",
  },
  {
    slug: "concepts/errors-and-validation",
    title: "Errors and validation",
    blurb: "How options are validated and what common errors mean.",
    color: "#ff8f8f",
    icon: "alert",
  },
  {
    slug: "concepts/constants",
    title: "Constants and enums",
    blurb: "ResizeStrategy, BlendMode, alignment, MIME types and more.",
    color: "#8ff0c8",
    icon: "list",
  },
  {
    slug: "concepts/typescript",
    title: "TypeScript",
    blurb: "Image types, option types and typing your own plugins.",
    color: "#3a7bff",
    icon: "ts",
  },
];

export const guides: DocPage[] = [
  {
    slug: "guides/reading-large-images",
    title: "Reading Large Images",
    blurb: "Pass decode options, including the size limits for each format.",
    color: "#ffd83a",
    icon: "large",
  },
  {
    slug: "guides/exif",
    title: "EXIF",
    blurb: "How Jimp reads, rotates and writes EXIF metadata.",
    color: "#3fe0b5",
    icon: "exif",
  },
  {
    slug: "guides/writing-plugins",
    title: "Writing Plugins",
    blurb: "Add new image formats or manipulation methods.",
    color: "#ff9ccf",
    icon: "plugin",
  },
  {
    slug: "guides/custom-jimp",
    title: "Custom Jimp",
    blurb: "Build a Jimp with only the plugins and formats you need.",
    color: "#c9a8ff",
    icon: "custom",
  },
  {
    slug: "guides/webp",
    title: "WEBP / WASM",
    blurb: "Add WEBP, AVIF and other formats with WASM plugins.",
    color: "#22c76b",
    icon: "wasm",
  },
  {
    slug: "guides/migrate-to-v1",
    title: "Migrate to v1",
    blurb: "What changed from v0, and how to update your code.",
    color: "#ff8f1f",
    icon: "migrate",
  },
];

export const allPages = [...startHere, ...concepts, ...guides];
export const pagesBySlug = new Map(allPages.map((page) => [page.slug, page]));
