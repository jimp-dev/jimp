/**
 * Method categories. They group the sidebar, the sticker sheets on /methods/
 * and the playground's ops, and set the sticker color on each method page.
 *
 * The keys are the values allowed in a method page's `category` frontmatter.
 */
export const categories = {
  io: { label: "Loading & saving", color: "#5cc8ff" },
  shape: { label: "Size & shape", color: "#3fe0b5" },
  effects: { label: "Blur & effects", color: "#ffd83a" },
  color: { label: "Color", color: "#ff9ccf" },
  compose: { label: "Compositing", color: "#ffb35c" },
  text: { label: "Text", color: "#c9a8ff" },
  pixels: { label: "Pixels", color: "#8ff0c8" },
  compare: { label: "Comparing", color: "#ff8f8f" },
  utils: { label: "Utilities", color: "#d9d6ea" },
} as const;

export type CategoryId = keyof typeof categories;

export const categoryIds = Object.keys(categories) as [
  CategoryId,
  ...CategoryId[],
];
