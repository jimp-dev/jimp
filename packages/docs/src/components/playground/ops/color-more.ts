/**
 * More color ops: quantize, otsuThreshold, fade, opaque. See ops/shape.ts for how to add an op.
 */
import { otsuThreshold } from "jimp";
import { js, num } from "../code";
import { defineOp } from "../types";

const INK = "#1b1840";
const S = `stroke="${INK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;

/** Three squares fading out, left to right. */
const fadeIcon = `<rect x="3" y="9" width="12" height="14" rx="2" fill="#8b46ff" ${S}/><rect x="11" y="9" width="12" height="14" rx="2" fill="#c9a8ff" ${S} stroke-opacity=".75"/><rect x="19" y="9" width="10" height="14" rx="2" fill="#efe6ff" ${S} stroke-opacity=".45"/>`;

/** A solid square over a checkerboard. */
const opaqueIcon = `<g fill="#d9d6ea"><rect x="3" y="3" width="6" height="6"/><rect x="15" y="3" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/><rect x="3" y="15" width="6" height="6"/></g><rect x="3" y="3" width="24" height="24" rx="3" fill="none" ${S}/><rect x="11" y="11" width="18" height="18" rx="3" fill="#3a7bff" ${S}/>`;

const paletteQuantizations = ["wuquant", "neuquant", "neuquant-float", "rgbquant"] as const;

const imageQuantizations = [
  "floyd-steinberg",
  "nearest",
  "riemersma",
  "false-floyd-steinberg",
  "stucki",
  "atkinson",
  "jarvis",
  "burkes",
  "sierra",
  "two-sierra",
  "sierra-lite",
] as const;

const colorDistanceFormulas = [
  "euclidean-bt709",
  "euclidean",
  "euclidean-bt709-noalpha",
  "manhattan",
  "manhattan-bt709",
  "manhattan-nommyde",
  "cie94-textiles",
  "cie94-graphic-arts",
  "ciede2000",
  "color-metric",
  "pngquant",
] as const;

/** A select whose first entry is the library default, which the code leaves out. */
const withDefault = (values: readonly string[]) =>
  values.map((value, i) => ({ value, label: i === 0 ? `${value} (default)` : value }));

type QuantizeOpts = {
  colors: number;
  paletteQuantization: string;
  imageQuantization: string;
  colorDistanceFormula: string;
};

/** The options object for `quantize()`, leaving out values that equal the defaults. */
function quantizeOptions({
  colors,
  paletteQuantization,
  imageQuantization,
  colorDistanceFormula,
}: QuantizeOpts) {
  return {
    colors,
    paletteQuantization:
      paletteQuantization === paletteQuantizations[0] ? undefined : paletteQuantization,
    imageQuantization: imageQuantization === imageQuantizations[0] ? undefined : imageQuantization,
    colorDistanceFormula:
      colorDistanceFormula === colorDistanceFormulas[0] ? undefined : colorDistanceFormula,
  };
}

export default [
  defineOp({
    id: "quantize",
    label: "quantize",
    icon: "palette",
    group: "color",
    description:
      "Reduce the image to a small palette of colors, with optional dithering.",
    controls: [
      { type: "slider", key: "colors", min: 2, max: 32, step: 1 },
      {
        type: "select",
        key: "paletteQuantization",
        options: withDefault(paletteQuantizations),
      },
      {
        type: "select",
        key: "imageQuantization",
        options: withDefault(imageQuantizations),
      },
      {
        type: "select",
        key: "colorDistanceFormula",
        options: withDefault(colorDistanceFormulas),
      },
    ],
    defaults: {
      colors: 6,
      paletteQuantization: "wuquant",
      imageQuantization: "floyd-steinberg",
      colorDistanceFormula: "euclidean-bt709",
    },
    apply: (image, opts) => {
      // The selects only offer valid names, so the cast is safe.
      image.quantize(quantizeOptions(opts) as Parameters<typeof image.quantize>[0]);
    },
    code: (opts) => `image.quantize(${js(quantizeOptions(opts))});`,
  }),

  defineOp({
    id: "otsuThreshold",
    label: "otsuThreshold",
    icon: "threshold",
    group: "color",
    description:
      "Pick the threshold cut-off with Otsu's method, then pass it to threshold. offset moves the cut-off from the level it picked.",
    controls: [{ type: "slider", key: "offset", min: -60, max: 60, step: 1 }],
    defaults: { offset: 0 },
    apply: (image, { offset }) => {
      const level = otsuThreshold(image);
      image.threshold({ max: offset ? Math.min(255, Math.max(0, level + offset)) : level });
    },
    code: ({ offset }) => {
      const max = offset
        ? `Math.min(255, Math.max(0, level ${offset < 0 ? "-" : "+"} ${Math.abs(offset)}))`
        : "level";
      return `const level = otsuThreshold(image);\nimage.threshold({ max: ${max} });`;
    },
    imports: () => ({ jimp: ["otsuThreshold"] }),
  }),

  defineOp({
    id: "fade",
    label: "fade",
    icon: fadeIcon,
    group: "color",
    description: "Make every pixel more transparent: 0 changes nothing, 1 makes it invisible.",
    controls: [{ type: "slider", key: "f", min: 0, max: 1, step: 0.05 }],
    defaults: { f: 0.5 },
    apply: (image, { f }) => {
      image.fade(num(f));
    },
    code: ({ f }) => `image.fade(${js(f)});`,
  }),

  defineOp({
    id: "opaque",
    label: "opaque",
    icon: opaqueIcon,
    group: "color",
    description:
      "Set every pixel's alpha to 255. Transparent areas show whatever color they store, often black.",
    controls: [],
    defaults: {},
    apply: (image) => {
      image.opaque();
    },
    code: () => "image.opaque();",
  }),
];
