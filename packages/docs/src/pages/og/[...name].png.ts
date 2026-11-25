/**
 * The Open Graph images, one PNG per docs page, rendered at build time with
 * @jimp/layout. src/routeData.ts points each page's `og:image` here.
 */
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";

import { renderOgImage } from "../../og/card";
import {
  hasOgImage,
  ogImageName,
  ogPage,
  TYPE_REFERENCE,
  type DocsEntry,
} from "../../og/pages";

export const getStaticPaths = (async () => {
  const entries = new Map<string, DocsEntry>([
    [TYPE_REFERENCE.id, TYPE_REFERENCE],
  ]);

  for (const entry of await getCollection("docs")) {
    if (hasOgImage(entry.id) && ogImageName(entry.id) === entry.id) {
      entries.set(entry.id, entry);
    }
  }

  return [...entries].map(([name, entry]) => ({
    params: { name },
    props: { entry },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage(ogPage(props.entry as DocsEntry));

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
