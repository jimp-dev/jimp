import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightTypeDoc, { typeDocSidebarGroup } from "starlight-typedoc";

export default defineConfig({
  integrations: [
    starlight({
      title: "Jimp",
      social: {
        github: "https://github.com/withastro/starlight",
      },
      sidebar: [
        {
          label: "Docs",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Example Guide", link: "/guides/example/" },
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
          tsconfig: "../../packages/jimp/tsconfig.json",
          typeDoc: {
            groupOrder: ["Classes", "Functions", "Enumerations", "Variables"],
          },
        }),
      ],
    }),
  ],
});
