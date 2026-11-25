/**
 * Points each page's Open Graph and Twitter image at the one rendered for it
 * by src/pages/og/, instead of the share banner set in astro.config.mjs.
 */
import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

import { hasOgImage, ogImageName } from "./og/pages";
import { HEIGHT, WIDTH } from "./og/size";

export const onRequest = defineRouteMiddleware((context) => {
  const { entry, head } = context.locals.starlightRoute;

  if (!hasOgImage(entry.id) || !context.site) {
    return;
  }

  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  const image = new URL(`${base}og/${ogImageName(entry.id)}.png`, context.site);

  for (const tag of head) {
    const { property, name } = tag.attrs ?? {};

    if (
      tag.tag === "meta" &&
      (property === "og:image" || name === "twitter:image")
    ) {
      tag.attrs!.content = image.href;
    }
  }

  head.push(
    {
      tag: "meta",
      attrs: { property: "og:image:width", content: String(WIDTH) },
    },
    {
      tag: "meta",
      attrs: { property: "og:image:height", content: String(HEIGHT) },
    },
  );
});
