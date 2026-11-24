import { categories, type CategoryId } from "./data/categories";
import { methods } from "./data/methods";
import { concepts, guides, startHere, type DocPage } from "./data/pages";

/**
 * The complete sidebar. Content pages are listed explicitly so the order is
 * stable; add new pages to src/data/pages.ts or src/data/methods.ts.
 *
 * Link `attrs` are read by src/overrides/Sidebar.astro:
 * - `data-dot`: color of the dot shown before the label
 * - `data-code`: render the label in the code font
 */
const pageLink = (page: DocPage) => ({
  label: page.title,
  link: `/${page.slug}/`,
  attrs: { "data-dot": page.color },
});

const methodGroup = (category: CategoryId) => ({
  label: categories[category].label,
  items: methods
    .filter((entry) => entry.category === category)
    .map((entry) => ({
      label: entry.label,
      link: `/methods/${entry.slug}/`,
      attrs: { "data-code": "" },
    })),
});

export function createSidebar<T>(typeReference: T) {
  return [
    {
      label: "Start here",
      items: [
        ...startHere.map(pageLink),
        { label: "Concepts", items: concepts.map(pageLink) },
      ],
    },
    { label: "Guides", items: guides.map(pageLink) },
    {
      label: "Methods",
      items: [
        {
          label: "All methods",
          link: "/methods/",
          attrs: { "data-dot": "#ffd83a" },
        },
        ...(Object.keys(categories) as CategoryId[]).map(methodGroup),
      ],
    },
    typeReference,
  ];
}
