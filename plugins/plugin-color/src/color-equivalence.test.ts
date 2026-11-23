import { describe, expect, test } from "vitest";
import tinyColor from "tinycolor2";
import { createJimp } from "@jimp/core";
import { limit255 } from "@jimp/utils";
import { RGBColor } from "@jimp/types";

import { ColorAction, methods as color } from "./index.js";

const jimp = createJimp({ plugins: [color] });

function mix(clr: RGBColor, clr2: RGBColor, p = 50) {
  return {
    r: (clr2.r - clr.r) * (p / 100) + clr.r,
    g: (clr2.g - clr.g) * (p / 100) + clr.g,
    b: (clr2.b - clr.b) * (p / 100) + clr.b,
  };
}

/**
 * color() as it was before it stopped using tinycolor2 per pixel (#1207).
 * The new implementation must produce exactly the same bytes, except for
 * greyscale, which now matches greyscale() instead of tinycolor.
 */
function referenceColor(data: Buffer, actions: ColorAction[]) {
  actions = actions.map((action) => {
    if (action.apply === "xor" || action.apply === "mix") {
      const params = [...action.params] as typeof action.params;
      params[0] = tinyColor(params[0]).toRgb();
      return { ...action, params } as ColorAction;
    }

    return action;
  });

  for (let idx = 0; idx < data.length; idx += 4) {
    let clr: RGBColor = { r: data[idx]!, g: data[idx + 1]!, b: data[idx + 2]! };

    const colorModifier = (i: "r" | "g" | "b", amount: number) =>
      limit255(clr[i] + amount);

    actions.forEach((action) => {
      if (action.apply === "mix") {
        clr = mix(clr, action.params[0] as RGBColor, action.params[1]);
      } else if (action.apply === "tint") {
        clr = mix(clr, { r: 255, g: 255, b: 255 }, action.params?.[0]);
      } else if (action.apply === "shade") {
        clr = mix(clr, { r: 0, g: 0, b: 0 }, action.params?.[0]);
      } else if (action.apply === "xor") {
        const xor = action.params[0] as RGBColor;
        clr = {
          r: clr.r! ^ xor.r,
          g: clr.g! ^ xor.g,
          b: clr.b! ^ xor.b,
        };
      } else if (action.apply === "red") {
        clr.r = colorModifier("r", action.params[0]);
      } else if (action.apply === "green") {
        clr.g = colorModifier("g", action.params[0]);
      } else if (action.apply === "blue") {
        clr.b = colorModifier("b", action.params[0]);
      } else if (action.apply === "saturate" || action.apply === "desaturate") {
        const amount = (action.params?.[0] ?? 10) / 100;
        const hsl = tinyColor(clr).toHsl();

        hsl.s = Math.min(
          1,
          hsl.s * (action.apply === "saturate" ? 1 + amount : 1 - amount),
        );
        clr = tinyColor(hsl).toRgb();
      } else if (action.apply === "lighten" || action.apply === "darken") {
        const target = action.apply === "lighten" ? 255 : 0;
        const { r, g, b } = mix(
          clr,
          { r: target, g: target, b: target },
          action.params?.[0] ?? 10,
        );

        clr = { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
      } else if (action.apply === "greyscale") {
        // The same as greyscale() rather than tinycolor's greyscale
        const grey = limit255(
          Math.round(0.2126 * clr.r + 0.7152 * clr.g + 0.0722 * clr.b),
        );

        clr = { r: grey, g: grey, b: grey };
      } else if (action.apply !== "multiply") {
        // multiply isn't a tinycolor method and isn't compared here
        const name = action.apply === "hue" ? "spin" : action.apply;
        const tnyClr = tinyColor(clr);
        const fn = tnyClr[name].bind(tnyClr);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        clr = (fn as any)(...(action.params || [])).toRgb();
      }
    });

    data[idx] = clr.r;
    data[idx + 1] = clr.g;
    data[idx + 2] = clr.b;
  }
}

/** The test colours, one pixel each, with varied alpha */
function makeColors() {
  const colors: number[][] = [];

  // 16 levels per channel (0, 17, ..., 255): 4096 colours
  for (let r = 0; r < 256; r += 17) {
    for (let g = 0; g < 256; g += 17) {
      for (let b = 0; b < 256; b += 17) {
        colors.push([r, g, b]);
      }
    }
  }

  // Values next to the edges and the middle, where rounding and clamping
  // are most likely to differ
  const edges = [1, 2, 127, 128, 129, 253, 254];
  for (const r of edges) {
    for (const g of edges) {
      for (const b of edges) {
        colors.push([r, g, b]);
      }
    }
  }

  // Every grey, and every value of each channel on its own
  for (let v = 0; v < 256; v++) {
    colors.push([v, v, v], [v, 0, 0], [0, v, 0], [0, 0, v], [255, v, 0]);
  }

  // Random colours
  let seed = 1207;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed & 255;
  };
  for (let i = 0; i < 2000; i++) {
    colors.push([rand(), rand(), rand()]);
  }

  const data = Buffer.alloc(colors.length * 4);
  colors.forEach(([r, g, b], i) => {
    data[i * 4] = r!;
    data[i * 4 + 1] = g!;
    data[i * 4 + 2] = b!;
    data[i * 4 + 3] = (i * 37) & 255;
  });

  return data;
}

const percentages = [
  undefined,
  0,
  0.0000001,
  0.001,
  1,
  10,
  12.5,
  25,
  33.3,
  50,
  66.67,
  99,
  99.7,
  99.999,
  // Scales saturation down to below 1e-10, where tinycolor's parseInt()
  // reads the exponential form of the percentage
  99.99999999,
  100,
];
const degrees = [
  -360, -270, -180, -90.5, -1, -0.001, 0, 0.001, 1, 45, 90, 120, 180, 200,
  359.999, 359.9999999, 360,
];
const channelDeltas = [-255, -100, -1.5, -0.4, 0, 0.4, 1, 10.5, 100, 255];
const mixColors = [
  { r: 0, g: 0, b: 0 },
  { r: 255, g: 255, b: 255 },
  { r: 0, g: 102, b: 221 },
  { r: 12.4, g: 200.5, b: 254.6 },
  { r: 0.4, g: 0.5, b: 254.5 },
];

function withPercentage(
  apply: "lighten" | "darken" | "brighten" | "tint" | "shade",
): ColorAction[] {
  return percentages.map((p) =>
    p === undefined ? { apply } : { apply, params: [p] },
  );
}

const singleActions: Record<string, ColorAction[]> = {
  lighten: withPercentage("lighten"),
  darken: withPercentage("darken"),
  brighten: withPercentage("brighten"),
  tint: withPercentage("tint"),
  shade: withPercentage("shade"),
  saturate: percentages.map((p) =>
    p === undefined
      ? { apply: "saturate" }
      : { apply: "saturate", params: [p] },
  ),
  desaturate: percentages.map((p) =>
    p === undefined
      ? { apply: "desaturate" }
      : { apply: "desaturate", params: [p] },
  ),
  greyscale: [{ apply: "greyscale" }, { apply: "greyscale", params: [] }],
  spin: degrees.map((d) => ({ apply: "spin", params: [d] })),
  hue: degrees.map((d) => ({ apply: "hue", params: [d] })),
  mix: mixColors.flatMap((c) =>
    [undefined, 0, 1, 33.3, 50, 99.999, 100].map(
      (p): ColorAction =>
        p === undefined
          ? { apply: "mix", params: [c] }
          : { apply: "mix", params: [c, p] },
    ),
  ),
  xor: mixColors.map((c) => ({ apply: "xor", params: [c] })),
  red: channelDeltas.map((d) => ({ apply: "red", params: [d] })),
  green: channelDeltas.map((d) => ({ apply: "green", params: [d] })),
  blue: channelDeltas.map((d) => ({ apply: "blue", params: [d] })),
};

// Chains feed the non-integer results of mix/tint/shade/red/green/blue into
// the HSL actions, which exercises tinycolor's input rounding and clamping.
const chains: ColorAction[][] = [
  [
    { apply: "desaturate", params: [90] },
    { apply: "darken", params: [40] },
  ],
  [
    { apply: "hue", params: [-180] },
    { apply: "lighten", params: [25] },
  ],
  [
    { apply: "tint", params: [33.3] },
    { apply: "spin", params: [77] },
    { apply: "saturate", params: [40] },
  ],
  [
    { apply: "shade", params: [99.7] },
    { apply: "spin", params: [10] },
  ],
  [
    { apply: "shade", params: [99.7] },
    { apply: "desaturate", params: [50] },
  ],
  [{ apply: "tint", params: [99.7] }, { apply: "greyscale" }],
  [
    { apply: "tint", params: [99.999] },
    { apply: "brighten", params: [7] },
  ],
  [
    { apply: "mix", params: [{ r: 12.4, g: 200.5, b: 254.6 }, 33.3] },
    { apply: "xor", params: [{ r: 1, g: 2, b: 3 }] },
    { apply: "hue", params: [200] },
  ],
  [
    { apply: "shade", params: [12.5] },
    { apply: "brighten", params: [7] },
    { apply: "greyscale" },
  ],
  [
    { apply: "red", params: [10.5] },
    { apply: "green", params: [-0.4] },
    { apply: "desaturate", params: [33] },
    { apply: "hue", params: [200] },
  ],
  [
    { apply: "mix", params: [{ r: 255, g: 0, b: 0 }, 0.0000001] },
    { apply: "spin", params: [0] },
  ],
  [
    { apply: "blue", params: [0.4] },
    { apply: "saturate", params: [100] },
    { apply: "mix", params: [{ r: 0, g: 102, b: 221 }] },
  ],
  [
    { apply: "lighten" },
    { apply: "darken" },
    { apply: "brighten" },
    { apply: "tint" },
    { apply: "shade" },
    { apply: "saturate" },
    { apply: "desaturate" },
  ],
];

function expectSameAsReference(actions: ColorAction[]) {
  const input = makeColors();
  const expected = Buffer.from(input);
  referenceColor(expected, actions);

  const image = jimp.fromBitmap({
    width: input.length / 4,
    height: 1,
    data: Buffer.from(input),
  });
  image.color(actions);

  const actual = image.bitmap.data;

  for (let i = 0; i < input.length; i += 4) {
    const got = [actual[i], actual[i + 1], actual[i + 2], actual[i + 3]];
    const want = [expected[i], expected[i + 1], expected[i + 2], input[i + 3]];

    if (got.some((v, j) => v !== want[j])) {
      // Name the first failing colour rather than dumping the whole buffer
      expect(
        { input: [...input.subarray(i, i + 4)], output: got },
        JSON.stringify(actions),
      ).toStrictEqual({ input: [...input.subarray(i, i + 4)], output: want });
    }
  }
}

describe("color() matches the tinycolor2 implementation", () => {
  for (const [name, actions] of Object.entries(singleActions)) {
    test(name, () => {
      for (const action of actions) {
        expectSameAsReference([action]);
      }
    });
  }

  test("chains of actions", () => {
    for (const actions of chains) {
      expectSameAsReference(actions);
    }
  });
});
