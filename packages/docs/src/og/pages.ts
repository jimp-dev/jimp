/**
 * Which pages get a generated Open Graph image, and what goes on it. Shared
 * by the image endpoint (src/pages/og/) and the route middleware that points
 * each page's `og:image` at its image (src/routeData.ts).
 */
import { categories, type CategoryId } from "../data/categories";
import { concepts, guides, pagesBySlug, startHere } from "../data/pages";

export interface OgPage {
  title: string;
  description?: string;
  /** the section, on the sticker, e.g. "Guide" or "Drawing" */
  label: string;
  /** the sticker's color */
  color: string;
  /** whether the title is code, like a method name */
  code: boolean;
  /** what to `npm install` to use what the page is about */
  install: string;
}

export interface DocsEntry {
  id: string;
  data: {
    title: string;
    description?: string;
    category?: CategoryId;
    method?: string;
    plugin?: string;
  };
}

/**
 * The home and 404 pages keep the hand-drawn share banner; every other page
 * gets its own image
 */
export function hasOgImage(id: string) {
  // The collection calls the home page "index"; Starlight's route data, ""
  return id !== "" && id !== "index" && id !== "404";
}

/** The type reference's pages are generated, so they share one image */
const isTypeReference = (id: string) => id.startsWith("api/");

/** The image for the type reference's pages */
export const TYPE_REFERENCE: DocsEntry = {
  id: "api",
  data: {
    title: "Type reference",
    description:
      "Every class, function, option and type in Jimp, generated from the source.",
  },
};

/** The name of a page's image, without `.png` */
export const ogImageName = (id: string) =>
  isTypeReference(id) ? TYPE_REFERENCE.id : id;

const sections = new Map([
  ...startHere.map((page) => [page.slug, "Start here"] as const),
  ...concepts.map((page) => [page.slug, "Concept"] as const),
  ...guides.map((page) => [page.slug, "Guide"] as const),
]);

/** Packages that aren't part of `jimp`, so pages about them install them */
const notInJimp = (pkg: string) =>
  pkg === "@jimp/layout" || pkg.startsWith("@jimp/wasm-");

export function ogPage({ id, data }: DocsEntry): OgPage {
  const page = { title: data.title, description: data.description };
  const install = data.plugin && notInJimp(data.plugin) ? data.plugin : "jimp";

  if (data.category) {
    const category = categories[data.category];

    return {
      ...page,
      label: category.label,
      color: category.color,
      code: true,
      install,
    };
  }

  const docPage = pagesBySlug.get(id);

  if (docPage) {
    return {
      ...page,
      label: sections.get(id) ?? "Guide",
      color: docPage.color,
      code: false,
      install,
    };
  }

  if (id === TYPE_REFERENCE.id) {
    return { ...page, label: "API", color: "#d9d6ea", code: false, install };
  }

  return { ...page, label: "Docs", color: "#ffd83a", code: false, install };
}
