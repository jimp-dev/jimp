/**
 * More size & shape ops: scale, scaleToFit, cover, contain, autocrop,
 * roundCorners, border, displace. See ops/shape.ts for how to add an op.
 */
import { HorizontalAlign, ResizeStrategy, VerticalAlign } from "jimp";
import { hexToInt, intToHexLiteral, js, num, raw } from "../code";
import { defineOp, type ImageSize } from "../types";

const strategies = Object.keys(ResizeStrategy) as (keyof typeof ResizeStrategy)[];

const modeControl = {
  type: "select" as const,
  key: "mode" as const,
  options: [
    { value: "", label: "default" },
    ...strategies.map((s) => ({ value: s, label: `ResizeStrategy.${s}` })),
  ],
};

const toMode = (mode: string) =>
  mode ? ResizeStrategy[mode as keyof typeof ResizeStrategy] : undefined;
const modeCode = (mode: string) => (mode ? raw(`ResizeStrategy.${mode}`) : undefined);

/* ---------- Alignment for cover and contain ---------- */

const hAligns = ["LEFT", "CENTER", "RIGHT"] as const;
const vAligns = ["TOP", "MIDDLE", "BOTTOM"] as const;

/**
 * `align` is either one flag from each enum, or `{ x, y }` fractions from 0
 * (left/top) to 1 (right/bottom), like CSS `object-position`.
 */
const alignControls = [
  {
    type: "select" as const,
    key: "alignBy" as const,
    label: "align with",
    options: [
      { value: "flags", label: "flags" },
      { value: "fractions", label: "{ x, y } fractions" },
    ],
  },
  {
    type: "select" as const,
    key: "alignH" as const,
    label: "horizontal",
    options: hAligns.map((a) => ({ value: a, label: `HorizontalAlign.${a}` })),
    when: (o: AlignOptions) => o.alignBy === "flags",
  },
  {
    type: "select" as const,
    key: "alignV" as const,
    label: "vertical",
    options: vAligns.map((a) => ({ value: a, label: `VerticalAlign.${a}` })),
    when: (o: AlignOptions) => o.alignBy === "flags",
  },
  {
    type: "slider" as const,
    key: "alignX" as const,
    label: "x",
    min: 0,
    max: 1,
    step: 0.05,
    when: (o: AlignOptions) => o.alignBy === "fractions",
  },
  {
    type: "slider" as const,
    key: "alignY" as const,
    label: "y",
    min: 0,
    max: 1,
    step: 0.05,
    when: (o: AlignOptions) => o.alignBy === "fractions",
  },
];

interface AlignOptions {
  alignBy: string;
  alignH: string;
  alignV: string;
  alignX: number;
  alignY: number;
}

const alignDefaults = {
  alignBy: "flags",
  alignH: "CENTER",
  alignV: "MIDDLE",
  alignX: 0.5,
  alignY: 0.2,
};

const isDefaultAlign = (o: AlignOptions) =>
  o.alignBy === "flags" && o.alignH === "CENTER" && o.alignV === "MIDDLE";

const alignValue = (o: AlignOptions) => {
  if (isDefaultAlign(o)) return undefined;
  if (o.alignBy === "fractions") return { x: num(o.alignX), y: num(o.alignY) };
  return (
    HorizontalAlign[o.alignH as keyof typeof HorizontalAlign] |
    VerticalAlign[o.alignV as keyof typeof VerticalAlign]
  );
};

const alignCode = (o: AlignOptions) => {
  if (isDefaultAlign(o)) return undefined;
  if (o.alignBy === "fractions") return { x: o.alignX, y: o.alignY };
  return raw(`HorizontalAlign.${o.alignH} | VerticalAlign.${o.alignV}`);
};

const boxImports = (mode: string, o: AlignOptions) => {
  const names: string[] = [];
  if (mode) names.push("ResizeStrategy");
  if (o.alignBy === "flags" && !isDefaultAlign(o)) names.push("HorizontalAlign", "VerticalAlign");
  return names.length ? { jimp: names } : {};
};

/** Tolerances are small, so keep four decimals (`js()` rounds to two). */
const round4 = (n: number) => Number(n.toFixed(4));

/* ---------- Icons (32x32 inner SVG markup) ---------- */

const S = `stroke="#1b1840" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;
const icons = {
  scale: `<rect x="4" y="4" width="24" height="24" rx="3" fill="none" ${S} stroke-dasharray="3 3.6"/><rect x="4" y="14" width="14" height="14" rx="2" fill="#3fe0b5" ${S}/><path d="M15 17l10-10M18 7h7v7" fill="none" ${S}/>`,
  scaleToFit: `<rect x="3" y="5" width="26" height="22" rx="2" fill="none" ${S} stroke-dasharray="3 3.4"/><rect x="9" y="5" width="14" height="22" rx="2" fill="#ffd83a" ${S}/>`,
  cover: `<rect x="8" y="2" width="16" height="28" rx="2" fill="#ffb35c" opacity=".45"/><rect x="8" y="2" width="16" height="28" rx="2" fill="none" ${S} stroke-dasharray="3 3.4"/><rect x="4" y="9" width="24" height="14" rx="2" fill="#ffb35c" ${S}/>`,
  contain: `<rect x="4" y="4" width="24" height="24" rx="3" fill="#fff" ${S}/><rect x="4" y="10" width="24" height="12" fill="#ff5fb0" ${S}/>`,
  autocrop: `<rect x="10" y="10" width="12" height="12" rx="2" fill="#22c76b" ${S}/><path d="M4 10V4h6M22 4h6v6M28 22v6h-6M10 28H4v-6" fill="none" ${S}/>`,
  roundCorners: `<rect x="4" y="4" width="24" height="24" rx="10" fill="#c9a8ff" ${S}/><path d="M4 10V4h6" fill="none" ${S} stroke-dasharray="2 3"/>`,
  border: `<rect x="3" y="3" width="26" height="26" rx="5" fill="#ff4b4b" ${S}/><rect x="9" y="9" width="14" height="14" rx="1.5" fill="#fff" ${S}/>`,
  displace: `<rect x="3" y="4" width="26" height="24" rx="3" fill="#a9e4ff" ${S}/><path d="M7 10q3-3 6 0t6 0 6 0M7 16q3 3 6 0t6 0 6 0M7 22q3-3 6 0t6 0 6 0" fill="none" ${S} stroke-width="2.2"/>`,
};

/* ---------- Ops ---------- */

export default [
  defineOp({
    id: "scale",
    label: "scale",
    icon: icons.scale,
    group: "shape",
    description: "Multiply the width and height by the same factor.",
    controls: [{ type: "slider", key: "f", min: 0.1, max: 2, step: 0.05 }, modeControl],
    defaults: { f: 0.5, mode: "" },
    apply: (image, { f, mode }) => {
      image.scale(mode ? { f, mode: toMode(mode) } : f);
    },
    code: ({ f, mode }) =>
      mode ? `image.scale(${js({ f, mode: modeCode(mode) })});` : `image.scale(${js(f)});`,
    imports: ({ mode }) => (mode ? { jimp: ["ResizeStrategy"] } : {}),
    thumbnail: { f: 0.7 },
  }),

  defineOp({
    id: "scaleToFit",
    label: "scaleToFit",
    icon: icons.scaleToFit,
    group: "shape",
    description:
      "Scale up or down to the largest size that fits inside a w x h box, keeping the aspect ratio.",
    controls: [
      { type: "slider", key: "w", min: 16, max: 720, step: 4, unit: "px" },
      { type: "slider", key: "h", min: 16, max: 720, step: 4, unit: "px" },
      modeControl,
    ],
    defaults: { w: 200, h: 200, mode: "" },
    apply: (image, { w, h, mode }) => {
      image.scaleToFit({ w, h, mode: toMode(mode) });
    },
    code: ({ w, h, mode }) => `image.scaleToFit(${js({ w, h, mode: modeCode(mode) })});`,
    imports: ({ mode }) => (mode ? { jimp: ["ResizeStrategy"] } : {}),
  }),

  defineOp({
    id: "cover",
    label: "cover",
    icon: icons.cover,
    group: "shape",
    description:
      "Scale the image until it fills a w x h box, then crop the overflow. The alignment picks which part is kept.",
    controls: [
      { type: "slider", key: "w", min: 16, max: 360, step: 4, unit: "px" },
      { type: "slider", key: "h", min: 16, max: 360, step: 4, unit: "px" },
      ...alignControls,
      modeControl,
    ],
    defaults: { w: 160, h: 240, ...alignDefaults, mode: "" },
    apply: (image, o) => {
      image.cover({ w: o.w, h: o.h, align: alignValue(o), mode: toMode(o.mode) });
    },
    code: (o) =>
      `image.cover(${js({ w: o.w, h: o.h, align: alignCode(o), mode: modeCode(o.mode) })});`,
    imports: (o) => boxImports(o.mode, o),
  }),

  defineOp({
    id: "contain",
    label: "contain",
    icon: icons.contain,
    group: "shape",
    description:
      "Scale the image to fit inside a w x h box and fill the rest with the background color.",
    controls: [
      { type: "slider", key: "w", min: 16, max: 360, step: 4, unit: "px" },
      { type: "slider", key: "h", min: 16, max: 360, step: 4, unit: "px" },
      ...alignControls,
      { type: "toggle", key: "fill", label: "set background" },
      { type: "color", key: "background", when: (o) => o.fill },
      modeControl,
    ],
    defaults: {
      w: 240,
      h: 240,
      ...alignDefaults,
      fill: true as boolean,
      background: "#ffd83a",
      mode: "",
    },
    apply: (image, o) => {
      if (o.fill) image.background = hexToInt(o.background);
      image.contain({ w: o.w, h: o.h, align: alignValue(o), mode: toMode(o.mode) });
    },
    code: (o) => {
      const call = `image.contain(${js({ w: o.w, h: o.h, align: alignCode(o), mode: modeCode(o.mode) })});`;
      return o.fill ? `image.background = ${intToHexLiteral(hexToInt(o.background))};\n${call}` : call;
    },
    imports: (o) => boxImports(o.mode, o),
  }),

  defineOp({
    id: "autocrop",
    label: "autocrop",
    icon: icons.autocrop,
    group: "shape",
    description:
      "Trim the border that matches the top-left pixel. The dice image has a transparent border to trim.",
    controls: [
      { type: "slider", key: "tolerance", min: 0, max: 0.05, step: 0.0002 },
      { type: "slider", key: "leaveBorder", min: 0, max: 40, step: 1, unit: "px" },
      { type: "toggle", key: "cropOnlyFrames" },
      { type: "toggle", key: "cropSymmetric" },
    ],
    defaults: { tolerance: 0.0002, leaveBorder: 0, cropOnlyFrames: true, cropSymmetric: false },
    apply: (image, { tolerance, leaveBorder, cropOnlyFrames, cropSymmetric }) => {
      image.autocrop({ tolerance: round4(tolerance), leaveBorder, cropOnlyFrames, cropSymmetric });
    },
    code: ({ tolerance, leaveBorder, cropOnlyFrames, cropSymmetric }) => {
      const opts = {
        tolerance: round4(tolerance) === 0.0002 ? undefined : raw(String(round4(tolerance))),
        leaveBorder: leaveBorder || undefined,
        cropOnlyFrames: cropOnlyFrames ? undefined : false,
        cropSymmetric: cropSymmetric || undefined,
      };
      const set = Object.values(opts).some((v) => v !== undefined);
      return set ? `image.autocrop(${js(opts)});` : `image.autocrop();`;
    },
  }),

  defineOp({
    id: "roundCorners",
    label: "roundCorners",
    icon: icons.roundCorners,
    group: "shape",
    description:
      "Make the corners transparent with an antialiased curve. Radii too big for the image are scaled down like CSS.",
    controls: [
      { type: "toggle", key: "perCorner", label: "per corner" },
      { type: "slider", key: "radius", min: 0, max: 140, step: 1, unit: "px", when: (o) => !o.perCorner },
      { type: "slider", key: "topLeft", min: 0, max: 140, step: 1, unit: "px", when: (o) => o.perCorner },
      { type: "slider", key: "topRight", min: 0, max: 140, step: 1, unit: "px", when: (o) => o.perCorner },
      { type: "slider", key: "bottomRight", min: 0, max: 140, step: 1, unit: "px", when: (o) => o.perCorner },
      { type: "slider", key: "bottomLeft", min: 0, max: 140, step: 1, unit: "px", when: (o) => o.perCorner },
    ],
    defaults: ({ width, height }: ImageSize) => {
      const r = Math.round(Math.min(width, height) / 6);
      return {
        perCorner: false,
        radius: r,
        topLeft: r * 2,
        topRight: 0,
        bottomRight: r * 2,
        bottomLeft: 0,
      };
    },
    apply: (image, { perCorner, radius, topLeft, topRight, bottomRight, bottomLeft }) => {
      image.roundCorners({
        radius: perCorner ? { topLeft, topRight, bottomRight, bottomLeft } : radius,
      });
    },
    code: ({ perCorner, radius, topLeft, topRight, bottomRight, bottomLeft }) =>
      `image.roundCorners(${js({
        radius: perCorner ? { topLeft, topRight, bottomRight, bottomLeft } : radius,
      })});`,
    // The dice photo's corners are already transparent, so a thumbnail wouldn't show the effect
    thumbnail: false,
  }),

  defineOp({
    id: "border",
    label: "border",
    icon: icons.border,
    group: "shape",
    description:
      "Draw a border outside the image, so it grows by width on every side. A radius rounds the corners.",
    controls: [
      { type: "slider", key: "width", min: 0, max: 40, step: 1, unit: "px" },
      { type: "color", key: "color" },
      { type: "slider", key: "radius", min: 0, max: 100, step: 1, unit: "px" },
    ],
    defaults: { width: 12, color: "#1b1840", radius: 0 },
    apply: (image, { width, color, radius }) => {
      image.border({ width, color, radius: radius || undefined });
    },
    code: ({ width, color, radius }) =>
      `image.border(${js({ width, color, radius: radius || undefined })});`,
    thumbnail: { width: 24, color: "#ff4b4b", radius: 40 },
  }),

  defineOp({
    id: "displace",
    label: "displace",
    icon: icons.displace,
    group: "shape",
    description:
      "Move each pixel right by up to x pixels (the map's red channel) and down by up to y pixels (its green channel), using a wavy gray map image.",
    controls: [
      { type: "slider", key: "x", min: -60, max: 60, step: 1, unit: "px" },
      { type: "slider", key: "y", min: -60, max: 60, step: 1, unit: "px" },
    ],
    defaults: { x: 20, y: 0 },
    apply: async (image, { x, y }, ctx) => {
      const map = await ctx.loadImage("displace-waves.png");
      image.displace({ map, offset: y ? { x: x || undefined, y } : x });
    },
    code: ({ x, y }) =>
      [
        `const map = await Jimp.read("displace-waves.png");`,
        `image.displace(${js({ map: raw("map"), offset: y ? { x: x || undefined, y } : x })});`,
      ].join("\n"),
  }),
];
