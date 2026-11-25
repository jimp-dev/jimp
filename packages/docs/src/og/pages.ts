/**
 * Which pages get a generated Open Graph image, and what goes on it. Shared
 * by the image endpoint (src/pages/og/) and the route middleware that points
 * each page's `og:image` at its image (src/routeData.ts).
 */
import jimpPackage from "jimp/package.json";

import { categoryIcons, guideIcons } from "../components/icons";
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
  /** the method whose result to show, from the playground */
  demo?: string;
  /**
   * the sticker icon to show when there's no picture: markup from
   * src/components/icons.ts
   */
  icon?: string;
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

/** The method each concept page shows, like a method page does */
const conceptDemos: Record<string, string> = {
  "concepts/colors-and-pixels": "color",
  "concepts/compositing": "composite",
  "concepts/drawing": "drawPath",
  "concepts/text-and-fonts": "print",
};

const sections = new Map([
  ...startHere.map((page) => [page.slug, "Start here"] as const),
  ...concepts.map((page) => [page.slug, "Concept"] as const),
  ...guides.map((page) => [page.slug, "Guide"] as const),
]);

/**
 * Packages that aren't part of `jimp`, so pages about them install them, by
 * what `jimp` depends on
 */
const notInJimp = (pkg: string) => !(pkg in jimpPackage.dependencies);

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
      demo: data.method,
      // card.tsx prefers the method's own icon, like the stickers on /methods/
      icon: categoryIcons[data.category],
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
      demo: conceptDemos[id],
      icon: guideIcons[docPage.icon],
    };
  }

  if (id === TYPE_REFERENCE.id) {
    return {
      ...page,
      label: "API",
      color: "#d9d6ea",
      code: false,
      install,
      icon: guideIcons.api,
    };
  }

  return {
    ...page,
    label: "Docs",
    color: "#ffd83a",
    code: false,
    install,
    // The method index lists methods; the playground is where you try them
    icon: id === "playground" ? guideIcons.wand : guideIcons.list,
  };
}
