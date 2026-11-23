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
type Strategy = keyof typeof ResizeStrategy;

/* ---------- skew and affine ---------- */

/** `mode` for skew and affine: the nearest pixel by default, or a strategy that interpolates. */
const transformModeControl = {
  type: "select" as const,
  key: "mode" as const,
  options: [
    { value: "", label: "nearest pixel (default)" },
    ...strategies
      .filter((s) => s !== "NEAREST_NEIGHBOR")
      .map((s) => ({ value: s, label: `ResizeStrategy.${s}` })),
  ],
};

const toMode = (mode: string) => (mode ? ResizeStrategy[mode as Strategy] : undefined);
const modeCode = (mode: string) => (mode ? raw(`ResizeStrategy.${mode}`) : undefined);

type Matrix = [number, number, number, number, number, number];

/** Matrices with short decimals, so the code panel shows exactly what is applied. */
const affinePresets: Record<string, { label: string; matrix: Matrix }> = {
  shear: { label: "shear", matrix: [1, 0, 0.5, 1, 0, 0] },
  tilt: { label: "tilt (shear and squash)", matrix: [1, 0.2, -0.3, 0.8, 0, 0] },
  flipScale: { label: "flip and squash", matrix: [-1, 0, 0, 0.6, 0, 0] },
  rotate30: { label: "rotate 30°", matrix: [0.866, -0.5, 0.5, 0.866, 0, 0] },
};

const affineMatrix = (o: {
  preset: string;
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}): Matrix =>
  affinePresets[o.preset]?.matrix ?? [o.a, o.b, o.c, o.d, o.e, o.f];

const S = `stroke="#1b1840" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;
const icons = {
  skew: `<path d="M4 6h24" fill="none" ${S} stroke-dasharray="3 3.4"/><path d="M10 6h18l-6 20H4z" fill="#7aa7ff" ${S}/>`,
  affine: `<path d="M4 4h16v16H4z" fill="none" ${S} stroke-dasharray="3 3.4"/><path d="M10 12l16-4-2 18-16 2z" fill="#ffb35c" ${S}/><path d="M17 11l-1 16M9 20l16-3" fill="none" ${S} stroke-width="1.6"/>`,
};

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
      "Rotate counter-clockwise by any angle. true grows the canvas to fit, false keeps its size, and a ResizeStrategy grows it and smooths the edges.",
    controls: [
      { type: "slider", key: "deg", min: -180, max: 180, step: 5, unit: "°" },
      {
        type: "select",
        key: "mode",
        options: [
          { value: "true", label: "true (grow canvas)" },
          { value: "false", label: "false (keep size)" },
          ...strategies.map((s) => ({ value: s, label: `ResizeStrategy.${s}` })),
        ],
      },
    ],
    defaults: { deg: 45, mode: "true" },
    apply: (image, { deg, mode }) => {
      if (mode === "true") image.rotate(deg);
      else if (mode === "false") image.rotate({ deg, mode: false });
      else image.rotate({ deg, mode: ResizeStrategy[mode as Strategy] });
    },
    code: ({ deg, mode }) =>
      mode === "true"
        ? `image.rotate(${js(deg)});`
        : `image.rotate(${js({ deg, mode: raw(mode === "false" ? "false" : `ResizeStrategy.${mode}`) })});`,
    imports: ({ mode }) => (mode === "true" || mode === "false" ? {} : { jimp: ["ResizeStrategy"] }),
    thumbnail: { deg: 30, mode: "BILINEAR" },
  }),

  defineOp({
    id: "skew",
    label: "skew",
    icon: icons.skew,
    group: "shape",
    description:
      "Slant the image by an angle along x and/or y, like CSS skew(). The canvas grows to fit unless fit is off.",
    controls: [
      { type: "slider", key: "x", min: -60, max: 60, step: 1, unit: "°" },
      { type: "slider", key: "y", min: -60, max: 60, step: 1, unit: "°" },
      transformModeControl,
      { type: "toggle", key: "fit" },
    ],
    defaults: { x: 20, y: 0, mode: "", fit: true as boolean },
    apply: (image, { x, y, mode, fit }) => {
      image.skew({ x, y, mode: toMode(mode), fit });
    },
    code: ({ x, y, mode, fit }) =>
      `image.skew(${js({
        x: x || undefined,
        y: y || undefined,
        mode: modeCode(mode),
        fit: fit ? undefined : false,
      })});`,
    imports: ({ mode }) => (mode ? { jimp: ["ResizeStrategy"] } : {}),
    thumbnail: { x: 20, y: -10, mode: "BILINEAR" },
  }),

  defineOp({
    id: "affine",
    label: "affine",
    icon: icons.affine,
    group: "shape",
    description:
      "Transform the image with a 2D matrix [a, b, c, d, e, f] in CSS matrix() order. Pick a preset or enter your own.",
    controls: [
      {
        type: "select",
        key: "preset",
        options: [
          ...Object.entries(affinePresets).map(([value, { label }]) => ({ value, label })),
          { value: "custom", label: "custom matrix" },
        ],
      },
      ...(["a", "b", "c", "d", "e", "f"] as const).map((key) => ({
        type: "number" as const,
        key,
        step: 0.1,
        when: (o: { preset: string }) => o.preset === "custom",
      })),
      transformModeControl,
      { type: "toggle", key: "fit" },
    ],
    defaults: {
      preset: "shear",
      a: 1,
      b: 0.2,
      c: -0.3,
      d: 0.8,
      e: 0,
      f: 0,
      mode: "",
      fit: true as boolean,
    },
    apply: (image, opts) => {
      image.affine({ matrix: affineMatrix(opts), mode: toMode(opts.mode), fit: opts.fit });
    },
    code: (opts) =>
      `image.affine(${js({
        matrix: raw(`[${affineMatrix(opts).join(", ")}]`),
        mode: modeCode(opts.mode),
        fit: opts.fit ? undefined : false,
      })});`,
    imports: ({ mode }) => (mode ? { jimp: ["ResizeStrategy"] } : {}),
    thumbnail: { preset: "tilt", mode: "BILINEAR" },
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
