/** Playground ops: blur and effects. See ops/shape.ts for how to add an op. */
import { centeredRect, js } from "../code";
import { defineOp, type ImageSize } from "../types";

export default [
  defineOp({
    id: "blur",
    label: "blur",
    icon: "blur",
    group: "effects",
    description: "A fast blur that looks close to a Gaussian blur. r is the radius in pixels.",
    controls: [{ type: "slider", key: "r", min: 1, max: 40, step: 1, unit: "px" }],
    defaults: { r: 6 },
    apply: (image, { r }) => {
      image.blur(r);
    },
    code: ({ r }) => `image.blur(${js(r)});`,
  }),

  defineOp({
    id: "gaussian",
    label: "gaussian",
    icon: "gaussian",
    group: "effects",
    description:
      "A true Gaussian blur. r is the standard deviation in pixels and may be fractional. Slower as r grows.",
    controls: [{ type: "slider", key: "r", min: 1, max: 10, step: 0.5, unit: "px" }],
    defaults: { r: 3 },
    apply: (image, { r }) => {
      image.gaussian(r);
    },
    code: ({ r }) => `image.gaussian(${js(r)});`,
  }),

  defineOp({
    id: "pixelate",
    label: "pixelate",
    icon: "pixelate",
    group: "effects",
    description:
      "Pixelate the whole image, or only a region of it. Drag on the image to choose the region.",
    controls: [
      { type: "slider", key: "size", min: 2, max: 40, step: 1, unit: "px" },
      { type: "toggle", key: "useRegion", label: "region only" },
      { type: "rect", key: "region", when: (o) => o.useRegion },
    ],
    defaults: ({ width, height }: ImageSize) => ({
      size: 8,
      useRegion: false,
      region: centeredRect(width, height, 0.5),
    }),
    apply: (image, { size, useRegion, region }) => {
      image.pixelate(useRegion ? { size, ...region } : size);
    },
    code: ({ size, useRegion, region }) =>
      `image.pixelate(${useRegion ? js({ size, ...region }) : js(size)});`,
    thumbnail: { size: 6 },
  }),

  defineOp({
    id: "dither",
    label: "dither",
    icon: "dither",
    group: "effects",
    description:
      "Add a 4×4 ordered dither pattern. On its own the change is subtle; posterize afterwards to see it break up banding.",
    controls: [
      { type: "toggle", key: "thenPosterize", label: "then posterize" },
      {
        type: "slider",
        key: "levels",
        label: "levels",
        min: 2,
        max: 32,
        step: 1,
        when: (o) => o.thenPosterize,
      },
    ],
    defaults: { thenPosterize: true, levels: 17 },
    apply: (image, { thenPosterize, levels }) => {
      image.dither();
      if (thenPosterize) image.posterize(levels);
    },
    code: ({ thenPosterize, levels }) =>
      thenPosterize ? `image.dither();\nimage.posterize(${js(levels)});` : `image.dither();`,
    thumbnail: { thenPosterize: true, levels: 6 },
  }),
];
