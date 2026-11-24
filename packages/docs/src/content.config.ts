import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { categoryIds } from "./data/categories";

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        /** Method category: sets the page sticker and its color. */
        category: z.enum(categoryIds).optional(),
        /** The API this page documents, e.g. "blur" or "Jimp.read". */
        method: z.string().optional(),
        /** The npm package the API comes from, e.g. "@jimp/plugin-blur". */
        plugin: z.string().optional(),
      }),
    }),
  }),
};
