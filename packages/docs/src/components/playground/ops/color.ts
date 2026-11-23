/** Playground ops: color. See ops/shape.ts for how to add an op. */
import type { ColorAction } from "jimp";
import { hexToRgb, js, num } from "../code";
import { defineOp } from "../types";

/** Ops that take no options. */
const simple = (id: "greyscale" | "invert" | "sepia" | "normalize", description: string) =>
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
};

/** The `color()` action described by the playground's options. */
function toAction({ apply, degrees, amount, value, color, mixAmount }: ColorOpts) {
  if (degreeActions.includes(apply)) return { apply, params: [degrees] };
  if (percentActions.includes(apply)) return { apply, params: [amount] };
  if (channelActions.includes(apply)) return { apply, params: [value] };
  if (apply === "mix") return { apply, params: [hexToRgb(color), mixAmount] };
  if (apply === "xor") return { apply, params: [hexToRgb(color)] };
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
  if (mixAmount) actions.push({ apply: "mix", params: [hexToRgb(mixColor), mixAmount] });
  return actions;
}

export default [
  defineOp({
    id: "color",
    label: "color",
    icon: "color",
    group: "color",
    description:
      "Apply one color action. mix and xor take an { r, g, b } color, not a CSS string.",
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
    ],
    defaults: { apply: "hue", degrees: 90, amount: 30, value: 80, color: "#ff5fb0", mixAmount: 50 },
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

  simple("greyscale", "Remove all color, keeping the perceived brightness of each pixel."),
  simple("invert", "Invert the red, green and blue channels. Alpha is unchanged."),
  simple("sepia", "Apply a warm sepia tone."),
  simple("normalize", "Stretch each channel so its values use the full 0 to 255 range."),

  defineOp({
    id: "posterize",
    label: "posterize",
    icon: "posterize",
    group: "color",
    description: "Reduce each color channel to n levels.",
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
      { type: "slider", key: "max", min: 0, max: 255, step: 1 },
      { type: "slider", key: "replace", min: 0, max: 255, step: 1 },
      { type: "toggle", key: "autoGreyscale" },
    ],
    defaults: { max: 140, replace: 255, autoGreyscale: true },
    apply: (image, opts) => {
      image.threshold(opts);
    },
    code: ({ max, replace, autoGreyscale }) =>
      `image.threshold(${js({
        max,
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
