import { defineConfig, fontProviders } from "astro/config";
import starlight from "@astrojs/starlight";
import { createStarlightTypeDocPlugin } from "starlight-typedoc";
import react from "@astrojs/react";
import path from "path";
import { fileURLToPath } from "url";
import { nodePolyfills } from "vite-plugin-node-polyfills";

import { jimpInkTheme } from "./src/code-theme.mjs";
import { createSidebar } from "./src/sidebar.ts";

const [starlightTypeDoc, typeDocSidebarGroup] = createStarlightTypeDocPlugin();
const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * The browser bundles need a Buffer polyfill, but vite-plugin-node-polyfills
 * configures every Vite environment. In the server build its `process` shim
 * breaks native modules such as Astro's Markdown processor, so only apply it
 * to the client.
 */
function clientOnly(plugins) {
  const isClient = (name) => name === "client";
  return plugins.map(({ config, ...plugin }) => ({
    ...plugin,
    applyToEnvironment: (environment) => isClient(environment.name),
    ...(config && {
      configEnvironment(name, options, env) {
        if (isClient(name)) return config.call(this, options, env);
      },
    }),
  }));
}

export default defineConfig({
  site: "https://jimp-dev.github.io",
  base: "jimp",
  // Keep Astro 4's whitespace handling. The default "jsx" mode drops the
  // space between text and an element on the next line.
  compressHTML: true,
  // The overrides' scoped styles were written against Starlight's old
  // zero-specificity `:where()` scoping.
  scopedStyleStrategy: "where",
  // Self-hosted at build time, with fallbacks sized to match each font so the
  // page doesn't shift when the web fonts finish loading. See Head.astro.
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Luckiest Guy",
      cssVariable: "--font-luckiest-guy",
      weights: [400],
      subsets: ["latin", "latin-ext"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Fredoka",
      cssVariable: "--font-fredoka",
      weights: [500, 600, 700],
      subsets: ["latin", "latin-ext"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Nunito Sans",
      cssVariable: "--font-nunito-sans",
      weights: [400, 600, 700, 800],
      styles: ["normal", "italic"],
      subsets: ["latin", "latin-ext"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      weights: [400, 600],
      subsets: ["latin", "latin-ext"],
      fallbacks: ["monospace"],
    },
  ],
  integrations: [
    react(),
    starlight({
      title: "Jimp",
      description:
        "Jimp reads, edits and writes images in Node.js and the browser, in plain JavaScript.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/jimp-dev/jimp",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/jimp-dev/jimp/edit/main/packages/docs/",
      },
      favicon: "/favicon.png",
      markdown: { headingLinks: false },
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
      customCss: [
        "./src/styles/tokens.css",
        "./src/styles/base.css",
        "./src/styles/starlight.css",
      ],
      components: {
        ContentPanel: "./src/overrides/ContentPanel.astro",
        Footer: "./src/overrides/Footer.astro",
        Head: "./src/overrides/Head.astro",
        Header: "./src/overrides/Header.astro",
        Hero: "./src/overrides/Hero.astro",
        PageFrame: "./src/overrides/PageFrame.astro",
        PageSidebar: "./src/overrides/PageSidebar.astro",
        PageTitle: "./src/overrides/PageTitle.astro",
        Pagination: "./src/overrides/Pagination.astro",
        Sidebar: "./src/overrides/Sidebar.astro",
        TableOfContents: "./src/overrides/TableOfContents.astro",
        ThemeSelect: "./src/overrides/ThemeSelect.astro",
        TwoColumnContent: "./src/overrides/TwoColumnContent.astro",
      },
      expressiveCode: {
        themes: [jimpInkTheme],
        useStarlightDarkModeSwitch: false,
        useStarlightUiThemeColors: false,
        styleOverrides: {
          borderRadius: "16px",
          borderWidth: "0px",
          codeFontFamily: "var(--jp-mono)",
          uiFontFamily: "var(--jp-ui)",
          codeFontSize: "14.5px",
          codeLineHeight: "1.65",
          codePaddingBlock: "20px",
          codePaddingInline: "20px",
          frames: {
            shadowColor: "transparent",
            frameBoxShadowCssValue: "none",
            editorActiveTabIndicatorTopColor: "transparent",
            editorActiveTabIndicatorBottomColor: "transparent",
          },
        },
      },
      sidebar: createSidebar(typeDocSidebarGroup),
      plugins: [
        starlightTypeDoc({
          entryPoints: [
            "../../packages/jimp/src/index.ts",
            "../../packages/jimp/src/fonts.ts",
            "../../packages/jimp/src/load-ttf.ts",
          ],
          tsconfig: "../../packages/jimp/tsconfig.docs.json",
          sidebar: { label: "Type reference", collapsed: true },
          typeDoc: {
            groupOrder: ["Classes", "Functions", "Enumerations", "Variables"],
            sort: ["static-first", "alphabetical"],
            plugin: [
              path.join(here, "./src/typedoc-plugin.js"),
              "typedoc-plugin-zod",
              path.join(here, "./src/typedoc-zod-extended.js"),
            ],
          },
        }),
      ],
    }),
  ],
  vite: {
    plugins: clientOnly(nodePolyfills({ include: ["buffer"] })),
    // Pre-bundling breaks the codec's relative .wasm fetch under `astro dev`.
    optimizeDeps: { exclude: ["@jsquash/webp"] },
  },
});
