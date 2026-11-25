/** Playground ops: color. See ops/shape.ts for how to add an op. */
import type { ColorAction } from "jimp";
import { js, num } from "../code";
import { defineOp } from "../types";

const INK = "#1b1840";
const S = `stroke="${INK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;

/** Half a sun, half a shadow, with plus and minus. */
const exposureIcon = `<circle cx="16" cy="16" r="12" fill="#ffd83a" ${S}/><path d="M16 4a12 12 0 010 24z" fill="${INK}"/><path d="M6.5 16h6M9.5 13v6" ${S} stroke-width="2.2"/><path d="M19.5 16h6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>`;

/** A muted swatch growing into a vivid one. */
const vibranceIcon = `<rect x="3" y="10" width="11" height="13" rx="3" fill="#d6a7b8" ${S}/><rect x="18" y="5" width="11" height="22" rx="3" fill="#ff2f86" ${S}/><path d="M13 16h6" ${S} stroke-width="2.2"/>`;

/** A swatch fading from navy to pink, the two colors of a duotone. */
const gradientMapIcon = `<defs><linearGradient id="gradient-map-icon" x1="0" x2="1"><stop offset="0" stop-color="#1e3264"/><stop offset="1" stop-color="#f037a5"/></linearGradient></defs><rect x="3" y="7" width="26" height="18" rx="3" fill="url(#gradient-map-icon)" ${S}/>`;

/** Ops that take no options. */
const simple = (id: "greyscale" | "invert" | "normalize", description: string) =>
  defineOp({
    id,
    label: id,
    icon: id,
    group: "color",
    description,
    controls: [],
    defaults: {},
    apply: (image) => {
      image[id]();
    },
    code: () => `image.${id}();`,
  });

const degreeActions = ["hue", "spin"];
const percentActions = ["lighten", "darken", "brighten", "saturate", "desaturate", "tint", "shade"];
const channelActions = ["red", "green", "blue"];
const colorActions = ["mix", "xor"];

type ColorOpts = {
  apply: string;
  degrees: number;
  amount: number;
  value: number;
  color: string;
  mixAmount: number;
  r: number;
  g: number;
  b: number;
};

/** The `color()` action described by the playground's options. */
function toAction({ apply, degrees, amount, value, color, mixAmount, r, g, b }: ColorOpts) {
  if (degreeActions.includes(apply)) return { apply, params: [degrees] };
  if (percentActions.includes(apply)) return { apply, params: [amount] };
  if (channelActions.includes(apply)) return { apply, params: [value] };
  if (apply === "mix") return { apply, params: [color, mixAmount] };
  if (apply === "xor") return { apply, params: [color] };
  if (apply === "multiply") return { apply, params: [num(r), num(g), num(b)] };
  return { apply };
}

type ComboOpts = {
  hue: number;
  saturation: number;
  lightness: number;
  mixColor: string;
  mixAmount: number;
};

/** The actions for the combined op, skipping any whose amount is 0. */
function comboActions({ hue, saturation, lightness, mixColor, mixAmount }: ComboOpts) {
  const actions: { apply: string; params: unknown[] }[] = [];
  if (hue) actions.push({ apply: "hue", params: [hue] });
  if (saturation > 0) actions.push({ apply: "saturate", params: [saturation] });
  if (saturation < 0) actions.push({ apply: "desaturate", params: [-saturation] });
  if (lightness > 0) actions.push({ apply: "lighten", params: [lightness] });
  if (lightness < 0) actions.push({ apply: "darken", params: [-lightness] });
  if (mixAmount) actions.push({ apply: "mix", params: [mixColor, mixAmount] });
  return actions;
}

/** A 0 to 2 slider for one of multiply's factors. */
const factor = (key: "r" | "g" | "b", i: number) => ({
  type: "slider" as const,
  key,
  label: `params[${i}]`,
  min: 0,
  max: 2,
  step: 0.05,
  when: (o: ColorOpts) => o.apply === "multiply",
});

export default [
  defineOp({
    id: "color",
    label: "color",
    icon: "color",
    group: "color",
    description:
      "Apply one color action. mix and xor take a CSS color; multiply scales red, green and blue by three factors.",
    controls: [
      {
        type: "select",
        key: "apply",
        label: "apply",
        options: [
          ...degreeActions,
          ...percentActions,
          "greyscale",
          ...channelActions,
          ...colorActions,
          "multiply",
        ],
      },
      {
        type: "slider",
        key: "degrees",
        label: "params[0]",
        min: -360,
        max: 360,
        step: 5,
        unit: "°",
        when: (o) => degreeActions.includes(o.apply),
      },
      {
        type: "slider",
        key: "amount",
        label: "params[0]",
        min: 0,
        max: 100,
        step: 1,
        when: (o) => percentActions.includes(o.apply),
      },
      {
        type: "slider",
        key: "value",
        label: "params[0]",
        min: -255,
        max: 255,
        step: 5,
        when: (o) => channelActions.includes(o.apply),
      },
      {
        type: "color",
        key: "color",
        label: "params[0]",
        when: (o) => colorActions.includes(o.apply),
      },
      {
        type: "slider",
        key: "mixAmount",
        label: "params[1]",
        min: 0,
        max: 100,
        step: 1,
        when: (o) => o.apply === "mix",
      },
      factor("r", 0),
      factor("g", 1),
      factor("b", 2),
    ],
    defaults: {
      apply: "hue",
      degrees: 90,
      amount: 30,
      value: 80,
      color: "#ff5fb0",
      mixAmount: 50,
      r: 1.2,
      g: 1,
      b: 0.8,
    },
    apply: (image, opts) => {
      image.color([toAction(opts) as ColorAction]);
    },
    code: (opts) => `image.color([${js(toAction(opts))}]);`,
  }),

  defineOp({
    id: "color-combo",
    method: "color",
    label: "color (combined)",
    icon: "color",
    group: "color",
    description:
      "Apply several color actions in one color() call. Actions run in order; a slider at 0 leaves its action out.",
    controls: [
      { type: "slider", key: "hue", label: "hue", min: -180, max: 180, step: 5, unit: "°" },
      { type: "slider", key: "saturation", label: "saturate / desaturate", min: -100, max: 100, step: 5 },
      { type: "slider", key: "lightness", label: "lighten / darken", min: -100, max: 100, step: 5 },
      { type: "color", key: "mixColor", label: "mix color" },
      { type: "slider", key: "mixAmount", label: "mix amount", min: 0, max: 100, step: 5 },
    ],
    defaults: { hue: 40, saturation: 40, lightness: 0, mixColor: "#ff8f1f", mixAmount: 20 },
    apply: (image, opts) => {
      image.color(comboActions(opts) as ColorAction[]);
    },
    code: (opts) => `image.color(${js(comboActions(opts))});`,
    thumbnail: false,
  }),

  defineOp({
    id: "brightness",
    label: "brightness",
    icon: "brightness",
    group: "color",
    description: "Multiply each color channel by a factor. 1 leaves the image unchanged.",
    controls: [{ type: "slider", key: "val", min: 0, max: 2, step: 0.05 }],
    defaults: { val: 1.3 },
    apply: (image, { val }) => {
      image.brightness(num(val));
    },
    code: ({ val }) => `image.brightness(${js(val)});`,
  }),

  defineOp({
    id: "contrast",
    label: "contrast",
    icon: "contrast",
    group: "color",
    description: "Adjust the contrast, from -1 (flat gray) to +1 (maximum). 0 leaves the image unchanged.",
    controls: [{ type: "slider", key: "val", min: -1, max: 1, step: 0.05 }],
    defaults: { val: 0.4 },
    apply: (image, { val }) => {
      image.contrast(num(val));
    },
    code: ({ val }) => `image.contrast(${js(val)});`,
  }),

  defineOp({
    id: "exposure",
    label: "exposure",
    icon: exposureIcon,
    group: "color",
    description: "Change the exposure in stops, in linear light: 1 doubles the light and -1 halves it.",
    controls: [{ type: "slider", key: "stops", min: -3, max: 3, step: 0.1 }],
    defaults: { stops: 1 },
    apply: (image, { stops }) => {
      image.exposure(num(stops));
    },
    code: ({ stops }) => `image.exposure(${js(stops)});`,
  }),

  defineOp({
    id: "vibrance",
    label: "vibrance",
    icon: vibranceIcon,
    group: "color",
    description: "Boost muted colors more than vivid ones. -1 mutes the colors, 0 changes nothing.",
    controls: [{ type: "slider", key: "amount", min: -1, max: 1, step: 0.05 }],
    defaults: { amount: 0.8 },
    apply: (image, { amount }) => {
      image.vibrance(num(amount));
    },
    code: ({ amount }) => `image.vibrance(${js(amount)});`,
  }),

  simple("greyscale", "Remove all color, keeping the perceived brightness of each pixel."),
  simple("invert", "Invert the red, green and blue channels. Alpha is unchanged."),

  defineOp({
    id: "sepia",
    label: "sepia",
    icon: "sepia",
    group: "color",
    description: "Apply a warm sepia tone. amount blends from the original (0) to full sepia (1).",
    controls: [{ type: "slider", key: "amount", min: 0, max: 1, step: 0.05 }],
    defaults: { amount: 1 },
    apply: (image, { amount }) => {
      if (num(amount) === 1) image.sepia();
      else image.sepia(num(amount));
    },
    code: ({ amount }) => (num(amount) === 1 ? "image.sepia();" : `image.sepia(${js(amount)});`),
  }),

  defineOp({
    id: "gradientMap",
    label: "gradientMap",
    icon: gradientMapIcon,
    group: "color",
    description:
      "Map each pixel's luminance to a gradient: shadows get the first color, highlights the last. Two colors make a duotone.",
    controls: [
      { type: "color", key: "shadows" },
      { type: "toggle", key: "midtone" },
      { type: "color", key: "midtones", when: (o) => o.midtone },
      { type: "color", key: "highlights" },
      { type: "slider", key: "amount", min: 0, max: 1, step: 0.05 },
    ],
    defaults: { shadows: "#1e3264", midtone: false, midtones: "#d9381e", highlights: "#f037a5", amount: 1 },
    apply: (image, { shadows, midtone, midtones, highlights, amount }) => {
      const stops = midtone ? [shadows, midtones, highlights] : [shadows, highlights];
      image.gradientMap({ stops, amount: num(amount) });
    },
    code: ({ shadows, midtone, midtones, highlights, amount }) => {
      const stops = js(midtone ? [shadows, midtones, highlights] : [shadows, highlights]);
      return num(amount) === 1
        ? `image.gradientMap(${stops});`
        : `image.gradientMap({ stops: ${stops}, amount: ${js(amount)} });`;
    },
  }),

  simple("normalize", "Stretch each channel so its values use the full 0 to 255 range."),

  defineOp({
    id: "posterize",
    label: "posterize",
    icon: "posterize",
    group: "color",
    description: "Round each color channel to the nearest of n levels.",
    controls: [{ type: "slider", key: "n", min: 2, max: 12, step: 1 }],
    defaults: { n: 4 },
    apply: (image, { n }) => {
      image.posterize(n);
    },
    code: ({ n }) => `image.posterize(${js(n)});`,
  }),

  defineOp({
    id: "threshold",
    label: "threshold",
    icon: "threshold",
    group: "color",
    description:
      "Convert to greyscale, then set every pixel at or above max to replace. Darker pixels keep their gray value.",
    controls: [
      { type: "toggle", key: "otsu", label: 'max: "otsu"' },
      { type: "slider", key: "max", min: 0, max: 255, step: 1, when: (o) => !o.otsu },
      { type: "slider", key: "replace", min: 0, max: 255, step: 1 },
      { type: "toggle", key: "autoGreyscale" },
    ],
    defaults: { otsu: false, max: 140, replace: 255, autoGreyscale: true },
    apply: (image, { otsu, max, replace, autoGreyscale }) => {
      image.threshold({ max: otsu ? "otsu" : max, replace, autoGreyscale });
    },
    code: ({ otsu, max, replace, autoGreyscale }) =>
      `image.threshold(${js({
        max: otsu ? "otsu" : max,
        replace: replace === 255 ? undefined : replace,
        autoGreyscale: autoGreyscale ? undefined : false,
      })});`,
  }),

  defineOp({
    id: "opacity",
    label: "opacity",
    icon: "opacity",
    group: "color",
    description: "Multiply the alpha channel of every pixel by f, from 0 (transparent) to 1.",
    controls: [{ type: "slider", key: "f", min: 0, max: 1, step: 0.05 }],
    defaults: { f: 0.5 },
    apply: (image, { f }) => {
      image.opacity(num(f));
    },
    code: ({ f }) => `image.opacity(${js(f)});`,
  }),
];
