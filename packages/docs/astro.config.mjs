import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightTypeDoc, { typeDocSidebarGroup } from "starlight-typedoc";
import react from "@astrojs/react";
import path from "path";
import { fileURLToPath } from "url";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  site: "https://jimp-dev.github.io",
  base: "jimp",
  integrations: [
    react(),
    starlight({
      title: "Jimp",
      social: {
        github: "https://github.com/jimp-dev/jimp",
      },
      favicon: "/favicon.png",
      head: [
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content: "https://jimp-dev.github.io/jimp/share-banner.png",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:image",
            content: "https://jimp-dev.github.io/jimp/share-banner.png",
          },
        },
      ],
      sidebar: [
        {
          label: "Docs",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Getting Started", link: "/guides/getting-started/" },
            { label: "Using in Browser", link: "/guides/browser/" },
            {
              label: "Reading Large Images",
              link: "/guides/reading-large-images/",
            },
            { label: "EXIF", link: "/guides/exif/" },
            { label: "Colour Spaces", link: "/guides/color-spaces/" },
            { label: "Writing Plugins", link: "/guides/writing-plugins/" },
            { label: "Custom Jimp", link: "/guides/custom-jimp/" },
            { label: "Migrate to v1", link: "/guides/migrate-to-v1/" },
            { label: "WEBP/WASM", link: "/guides/webp/" },
          ],
        },
        typeDocSidebarGroup,
      ],
      plugins: [
        starlightTypeDoc({
          entryPoints: [
            "../../packages/jimp/src/index.ts",
            "../../packages/jimp/src/fonts.ts",
          ],
          tsconfig: "../../packages/jimp/tsconfig.docs.json",
          typeDoc: {
            groupOrder: ["Classes", "Functions", "Enumerations", "Variables"],
            sort: ["static-first", "alphabetical"],
            plugin: [
              path.join(
                path.dirname(fileURLToPath(import.meta.url)),
                "./src/typedoc-plugin.js"
              ),
              "typedoc-plugin-zod",
              path.join(
                path.dirname(fileURLToPath(import.meta.url)),
                "./src/typedoc-zod-extended.js"
              ),
            ],
          },
        }),
      ],
    }),
  ],
  vite: {
    plugins: [nodePolyfills({ include: ["buffer"] })],
  },
});
