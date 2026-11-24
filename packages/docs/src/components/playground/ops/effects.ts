/** Playground ops: blur and effects. See ops/shape.ts for how to add an op. */
import { centeredRect, js, num } from "../code";
import { defineOp, type ImageSize } from "../types";

type DitherType = "floyd-steinberg" | "atkinson" | "bayer4" | "bayer8";

const INK = "#1b1840";
/** A soft blob with a crisp, outlined copy on top. */
const sharpenIcon = `<circle cx="16" cy="16" r="12" fill="#c9a8ff" opacity=".45"/><path d="M16 4 27 26H5z" fill="#fff" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M16 11l6 12H10z" fill="#ff5fb0" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;

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
      "A true Gaussian blur. r is the standard deviation in pixels: any value above 0, including fractions. Slower as r grows.",
    controls: [{ type: "slider", key: "r", min: 0.5, max: 10, step: 0.5, unit: "px" }],
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
    id: "sharpen",
    label: "sharpen",
    icon: sharpenIcon,
    group: "effects",
    description:
      "Sharpen edges with an unsharp mask. amount sets the strength, radius the width of the blur it compares with, and threshold skips small differences.",
    controls: [
      { type: "slider", key: "amount", min: 0, max: 3, step: 0.1 },
      { type: "slider", key: "radius", min: 0.5, max: 6, step: 0.5, unit: "px" },
      { type: "slider", key: "threshold", min: 0, max: 40, step: 1 },
    ],
    defaults: { amount: 1.5, radius: 1, threshold: 0 },
    apply: (image, { amount, radius, threshold }) => {
      // Rounded like the code panel, so slider steps such as 0.30000000000000004 match it
      image.sharpen({ amount: num(amount), radius: num(radius), threshold });
    },
    code: ({ amount, radius, threshold }) =>
      `image.sharpen(${js({
        amount,
        radius: radius === 1 ? undefined : radius,
        threshold: threshold === 0 ? undefined : threshold,
      })});`,
    thumbnail: { amount: 3, radius: 2 },
  }),

  defineOp({
    id: "dither",
    label: "dither",
    icon: "dither",
    group: "effects",
    description:
      "Reduce the image to a palette with error-diffusion or ordered (Bayer) dithering. rgb565 is the original subtle pattern, which doesn't reduce colors.",
    controls: [
      {
        type: "select",
        key: "type",
        options: [
          { value: "floyd-steinberg", label: "floyd-steinberg" },
          { value: "atkinson", label: "atkinson" },
          { value: "bayer4", label: "bayer4" },
          { value: "bayer8", label: "bayer8" },
          { value: "rgb565", label: "rgb565 (default, subtle)" },
        ],
      },
      {
        type: "select",
        key: "palette",
        options: [
          { value: "bw", label: "bw (default)" },
          { value: "rgb565", label: "rgb565" },
          { value: "levels", label: "levels per channel" },
        ],
        when: (o) => o.type !== "rgb565",
      },
      {
        type: "slider",
        key: "levels",
        min: 2,
        max: 16,
        step: 1,
        when: (o) => o.type !== "rgb565" && o.palette === "levels",
      },
    ],
    defaults: { type: "floyd-steinberg", palette: "bw", levels: 2 },
    apply: (image, { type, palette, levels }) => {
      if (type === "rgb565") {
        image.dither();
        return;
      }
      image.dither({
        type: type as DitherType,
        palette: palette === "levels" ? levels : (palette as "bw" | "rgb565"),
      });
    },
    code: ({ type, palette, levels }) => {
      if (type === "rgb565") return `image.dither();`;
      return `image.dither(${js({
        type,
        palette: palette === "bw" ? undefined : palette === "levels" ? levels : palette,
      })});`;
    },
    thumbnail: { type: "bayer4" },
  }),
];
