/**
 * Playground ops: size and shape.
 *
 * ─── How to add an op ────────────────────────────────────────────────────
 *
 * Every file in this folder default-exports an array of ops; the playground
 * and sticker sheets pick them up automatically (src/components/playground/
 * registry.ts). Add yours to the file your area owns, or create a new file.
 *
 *   import { ResizeStrategy } from "jimp";
 *   import { defineOp, type ImageSize } from "../types";
 *   import { js, raw } from "../code";
 *
 *   export default [
 *     defineOp({
 *       id: "scale",                 // unique; the method name when it demos one method
 *       label: "scale",              // tool button text
 *       icon: "resize",              // key from toolIcons (src/components/icons.ts) or raw <svg> inner markup (32x32)
 *       group: "shape",              // category id from src/data/categories.ts
 *       description: "Scale the image by a factor.",
 *       controls: [
 *         { type: "slider", key: "f", min: 0.1, max: 2, step: 0.05 },
 *       ],
 *       defaults: { f: 0.5 },        // or ({ width, height }: ImageSize) => ({ ... }) for size-based values
 *       apply: (image, { f }) => {   // mutate the image; may be async; throw to show an error
 *         image.scale(f);
 *       },
 *       code: ({ f }) => `image.scale(${js(f)});`,  // statements using a variable named `image`
 *       imports: () => ({}),         // optional: { jimp: ["ResizeStrategy"], "jimp/fonts": ["SANS_32_BLACK"] }
 *       thumbnail: { f: 0.6 },       // optional: options for the sticker, or false for an icon
 *     }),
 *   ];
 *
 * Control types: slider, number, toggle, select, color ("#rrggbb"),
 * xy ({ x, y }: click on the image) and rect ({ x, y, w, h }: drag on the
 * image). Any control can have `when: (opts) => boolean` to show it only for
 * some option values. The code must be valid Jimp v1 that produces the same
 * result as `apply`.
 * ─────────────────────────────────────────────────────────────────────────
 */
import { ResizeStrategy } from "jimp";
import { centeredRect, js, raw } from "../code";
import { defineOp, type ImageSize } from "../types";

const strategies = Object.keys(ResizeStrategy) as (keyof typeof ResizeStrategy)[];

export default [
  defineOp({
    id: "resize",
    label: "resize",
    icon: "resize",
    group: "shape",
    description:
      "Resize to a width and/or height. With only one side set, the other keeps the aspect ratio.",
    controls: [
      { type: "slider", key: "w", min: 16, max: 720, step: 4, unit: "px" },
      { type: "toggle", key: "keepRatio", label: "keep ratio" },
      { type: "slider", key: "h", min: 16, max: 720, step: 4, unit: "px", when: (o) => !o.keepRatio },
      {
        type: "select",
        key: "mode",
        options: [
          { value: "", label: "default" },
          ...strategies.map((s) => ({ value: s, label: `ResizeStrategy.${s}` })),
        ],
      },
    ],
    defaults: ({ width, height }: ImageSize) => ({
      w: Math.round(width / 2),
      h: Math.round(height / 2),
      keepRatio: true,
      mode: "",
    }),
    apply: (image, { w, h, keepRatio, mode }) => {
      const strategy = mode ? ResizeStrategy[mode as keyof typeof ResizeStrategy] : undefined;
      image.resize(keepRatio ? { w, mode: strategy } : { w, h, mode: strategy });
    },
    code: ({ w, h, keepRatio, mode }) =>
      `image.resize(${js({
        w,
        h: keepRatio ? undefined : h,
        mode: mode ? raw(`ResizeStrategy.${mode}`) : undefined,
      })});`,
    imports: ({ mode }) => (mode ? { jimp: ["ResizeStrategy"] } : {}),
    thumbnail: { mode: "NEAREST_NEIGHBOR" },
  }),

  defineOp({
    id: "crop",
    label: "crop",
    icon: "crop",
    group: "shape",
    description: "Cut out a rectangle. Drag on the image to choose it.",
    controls: [{ type: "rect", key: "region" }],
    defaults: ({ width, height }: ImageSize) => ({ region: centeredRect(width, height, 0.6) }),
    apply: (image, { region }) => {
      image.crop(region);
    },
    code: ({ region }) => `image.crop(${js(region)});`,
  }),

  defineOp({
    id: "rotate",
    label: "rotate",
    icon: "rotate",
    group: "shape",
    description:
      "Rotate counter-clockwise by any angle. With mode true the canvas grows to fit; with false it keeps its size and clips the corners.",
    controls: [
      { type: "slider", key: "deg", min: -180, max: 180, step: 5, unit: "°" },
      {
        type: "select",
        key: "mode",
        options: [
          { value: "true", label: "true (grow canvas)" },
          { value: "false", label: "false (keep size)" },
        ],
      },
    ],
    defaults: { deg: 45, mode: "true" },
    apply: (image, { deg, mode }) => {
      if (mode === "true") image.rotate(deg);
      else image.rotate({ deg, mode: false });
    },
    code: ({ deg, mode }) =>
      mode === "true"
        ? `image.rotate(${js(deg)});`
        : `image.rotate(${js({ deg, mode: raw("false") })});`,
    thumbnail: { deg: 30 },
  }),

  defineOp({
    id: "flip",
    label: "flip",
    icon: "flip",
    group: "shape",
    description: "Mirror the image horizontally, vertically or both.",
    controls: [
      { type: "toggle", key: "horizontal" },
      { type: "toggle", key: "vertical" },
    ],
    defaults: { horizontal: true, vertical: false },
    apply: (image, { horizontal, vertical }) => {
      image.flip({ horizontal, vertical });
    },
    code: ({ horizontal, vertical }) => `image.flip(${js({ horizontal, vertical })});`,
  }),

  defineOp({
    id: "fisheye",
    label: "fisheye",
    icon: "fisheye",
    group: "shape",
    description: "Bulge the center of the image like a fisheye lens.",
    controls: [{ type: "slider", key: "radius", min: 1, max: 5, step: 0.1 }],
    defaults: { radius: 2.5 },
    apply: (image, { radius }) => {
      image.fisheye({ radius });
    },
    code: ({ radius }) => `image.fisheye(${js({ radius })});`,
  }),

  defineOp({
    id: "circle",
    label: "circle",
    icon: "circle",
    group: "shape",
    description: "Make every pixel outside a circle transparent. Click the image to move the center.",
    controls: [
      { type: "xy", key: "center", label: "x, y" },
      { type: "slider", key: "radius", min: 10, max: 360, step: 1, unit: "px" },
    ],
    defaults: ({ width, height }: ImageSize) => ({
      center: { x: Math.round(width / 2), y: Math.round(height / 2) },
      radius: Math.round(Math.min(width, height) / 2),
    }),
    apply: (image, { center, radius }) => {
      image.circle({ radius, x: center.x, y: center.y });
    },
    code: ({ center, radius }) => `image.circle(${js({ radius, x: center.x, y: center.y })});`,
  }),
];
