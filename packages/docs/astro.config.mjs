import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightTypeDoc, { typeDocSidebarGroup } from "starlight-typedoc";
import react from "@astrojs/react";
import path from "path";
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
      components: {
        Head: "./src/overwrite-components/head.astro",
      },
      sidebar: [
        {
          label: "Docs",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Getting Started", link: "/guides/getting-started/" },
            { label: "Using in Browser", link: "/guides/browser/" },
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
                path.dirname(import.meta.url).replace("file:", ""),
                "./src/typedoc-plugin.js"
              ),
              "typedoc-plugin-zod",
              path.join(
                path.dirname(import.meta.url).replace("file:", ""),
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
