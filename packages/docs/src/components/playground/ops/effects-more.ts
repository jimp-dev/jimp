/**
 * More effects ops: convolute, convolution, boxShadow. See ops/shape.ts for
 * how to add an op.
 */
import { Edge } from "jimp";
import { centeredRect, hexToInt, intToHexLiteral, js, raw } from "../code";
import { defineOp, type ImageSize, type Rect } from "../types";

const INK = "#1b1840";
const S = `stroke="${INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"`;

/** A 3×3 kernel grid with the center cell highlighted. */
const kernelIcon = (extra = "") =>
  `${extra}<g ${S}><rect x="5" y="5" width="22" height="22" rx="2" fill="#fff"/><path d="M12.3 5v22M19.7 5v22M5 12.3h22M5 19.7h22" fill="none"/></g><rect x="13.4" y="13.4" width="5.2" height="5.2" fill="#ffd83a"/>`;

const convoluteIcon = kernelIcon();
const convolutionIcon = kernelIcon(
  `<rect x="1.5" y="1.5" width="29" height="29" rx="3" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="2 2.4"/>`,
);
const boxShadowIcon = `<rect x="9" y="10" width="19" height="17" rx="3" fill="${INK}" opacity=".35"/><rect x="4" y="5" width="19" height="17" rx="3" fill="#ffd83a" ${S}/>`;

/** A kernel as it would be written in code, one row per line. */
function kernelCode(kernel: number[][]) {
  return `[\n${kernel.map((row) => `  [${row.join(", ")}],`).join("\n")}\n]`;
}

interface Kernel {
  label: string;
  kernel: number[][];
  /** Passed as `divisor` so the kernel can be written with whole numbers. */
  divisor?: number;
}

const kernels = {
  sharpen: {
    label: "sharpen",
    kernel: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
  },
  emboss: {
    label: "emboss",
    kernel: [
      [-2, -1, 0],
      [-1, 1, 1],
      [0, 1, 2],
    ],
  },
  boxBlur: {
    label: "box blur (divisor 9)",
    kernel: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    divisor: 9,
  },
  gaussian: {
    label: "Gaussian blur (divisor 16)",
    kernel: [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1],
    ],
    divisor: 16,
  },
  box4: {
    label: "4×4 box blur (even size)",
    kernel: [
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
    ],
    divisor: 16,
  },
  edges: {
    label: "edge detect",
    kernel: [
      [-1, -1, -1],
      [-1, 8, -1],
      [-1, -1, -1],
    ],
  },
  sobelX: {
    label: "vertical edges (Sobel x)",
    kernel: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ],
  },
  sobelY: {
    label: "horizontal edges (Sobel y)",
    kernel: [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ],
  },
  roberts: {
    label: "2×2 Roberts cross (even size)",
    kernel: [
      [1, 0],
      [0, -1],
    ],
  },
} satisfies Record<string, Kernel>;

type KernelId = keyof typeof kernels;

const kernelOptions = (Object.keys(kernels) as KernelId[]).map((id) => ({
  value: id,
  label: kernels[id].label,
}));

/**
 * The call for `method` with `kernel` and `extra` options: the kernel on its
 * own when there are no options, otherwise an options object.
 */
function kernelCall(method: string, kernel: number[][], extra: Record<string, unknown>) {
  const entries = Object.entries(extra).filter(([, v]) => v !== undefined);
  const matrix = kernelCode(kernel);
  if (!entries.length) return `image.${method}(${matrix});`;
  const rows = matrix.split("\n").map((line, i) => (i === 0 ? line : `  ${line}`));
  const lines = entries.map(([key, value]) => `  ${key}: ${js(value)},`);
  return `image.${method}({\n  kernel: ${rows.join("\n")},\n${lines.join("\n")}\n});`;
}

const edgeModes = [
  { value: "EXTEND", label: "Edge.EXTEND (default)" },
  { value: "WRAP", label: "Edge.WRAP" },
  { value: "CROP", label: "Edge.CROP" },
];
type EdgeName = keyof typeof Edge;

/** convolute's options besides the kernel, leaving out defaults. */
function convoluteExtra(o: {
  kernel: string;
  bias: number;
  preserveAlpha: boolean;
  useRegion: boolean;
  region: Rect;
}) {
  const extra: { divisor?: number; bias?: number; preserveAlpha?: boolean } & Partial<Rect> = {};
  const { divisor } = kernels[o.kernel as KernelId] as Kernel;
  if (divisor) extra.divisor = divisor;
  if (o.bias) extra.bias = o.bias;
  if (o.preserveAlpha) extra.preserveAlpha = true;
  if (o.useRegion) Object.assign(extra, o.region);
  return extra;
}

/** convolution's options besides the kernel, leaving out defaults. */
function convolutionExtra(o: { kernel: string; bias: number; edgeHandling: string }) {
  const extra: { divisor?: number; bias?: number; edgeHandling?: EdgeName } = {};
  const { divisor } = kernels[o.kernel as KernelId] as Kernel;
  if (divisor) extra.divisor = divisor;
  if (o.bias) extra.bias = o.bias;
  if (o.edgeHandling !== "EXTEND") extra.edgeHandling = o.edgeHandling as EdgeName;
  return extra;
}

const BOX_SHADOW_DEFAULTS = { x: 0, y: 4, blur: 12, spread: 0 };

export default [
  defineOp({
    id: "convolute",
    label: "convolute",
    icon: convoluteIcon,
    group: "effects",
    description:
      "Run a kernel over every channel, alpha included unless preserveAlpha is on, of the image or a region of it. Kernels that sum to 0 erase alpha.",
    controls: [
      { type: "select", key: "kernel", options: kernelOptions },
      { type: "slider", key: "bias", min: 0, max: 255, step: 1 },
      { type: "toggle", key: "preserveAlpha", label: "preserveAlpha" },
      { type: "toggle", key: "useRegion", label: "region only" },
      { type: "rect", key: "region", when: (o) => o.useRegion },
    ],
    defaults: ({ width, height }: ImageSize) => ({
      kernel: "emboss",
      bias: 0,
      preserveAlpha: false,
      useRegion: false,
      region: centeredRect(width, height, 0.5),
    }),
    apply: (image, opts) => {
      const { kernel } = kernels[opts.kernel as KernelId];
      const extra = convoluteExtra(opts);
      image.convolute(Object.keys(extra).length ? { kernel, ...extra } : kernel);
    },
    code: (opts) => kernelCall("convolute", kernels[opts.kernel as KernelId].kernel, convoluteExtra(opts)),
  }),

  defineOp({
    id: "convolution",
    label: "convolution",
    icon: convolutionIcon,
    group: "effects",
    description:
      "Run a kernel over the red, green and blue channels. Alpha is left alone, and edgeHandling picks what lies past the border.",
    controls: [
      { type: "select", key: "kernel", options: kernelOptions },
      { type: "slider", key: "bias", min: 0, max: 255, step: 1 },
      { type: "select", key: "edgeHandling", label: "edgeHandling", options: edgeModes },
    ],
    defaults: { kernel: "edges", bias: 0, edgeHandling: "EXTEND" },
    apply: (image, opts) => {
      const { kernel } = kernels[opts.kernel as KernelId];
      const { edgeHandling, ...extra } = convolutionExtra(opts);
      if (!edgeHandling && !Object.keys(extra).length) {
        image.convolution(kernel);
      } else {
        image.convolution({
          kernel,
          ...extra,
          edgeHandling: edgeHandling ? Edge[edgeHandling] : undefined,
        });
      }
    },
    code: (opts) => {
      const { edgeHandling, ...extra } = convolutionExtra(opts);
      return kernelCall("convolution", kernels[opts.kernel as KernelId].kernel, {
        ...extra,
        edgeHandling: edgeHandling ? raw(`Edge.${edgeHandling}`) : undefined,
      });
    },
    imports: ({ edgeHandling }) => (edgeHandling === "EXTEND" ? {} : { jimp: ["Edge"] }),
    thumbnail: { kernel: "emboss" },
  }),

  defineOp({
    id: "boxShadow",
    label: "boxShadow",
    icon: boxShadowIcon,
    group: "effects",
    description:
      "Draw a CSS-style shadow under the image's box. The image grows to fit the shadow.",
    controls: [
      { type: "slider", key: "x", min: -40, max: 40, step: 1, unit: "px" },
      { type: "slider", key: "y", min: -40, max: 40, step: 1, unit: "px" },
      { type: "slider", key: "blur", min: 0, max: 40, step: 1, unit: "px" },
      { type: "slider", key: "spread", min: -20, max: 20, step: 1, unit: "px" },
      { type: "color", key: "color" },
      { type: "slider", key: "alpha", label: "color alpha", min: 0, max: 255, step: 1 },
      {
        type: "slider",
        key: "radius",
        label: "radius (rounds corners first)",
        min: 0,
        max: 60,
        step: 1,
        unit: "px",
      },
    ],
    defaults: { x: 0, y: 8, blur: 16, spread: 0, color: "#000000", alpha: 128, radius: 0 },
    apply: (image, { x, y, blur, spread, color, alpha, radius }) => {
      if (radius > 0) image.roundCorners({ radius });
      image.boxShadow({
        x,
        y,
        blur,
        spread,
        color: hexToInt(color, alpha),
        radius: radius > 0 ? radius : undefined,
      });
    },
    code: ({ x, y, blur, spread, color, alpha, radius }) => {
      const colorInt = hexToInt(color, alpha);
      const options = js({
        x: x === BOX_SHADOW_DEFAULTS.x ? undefined : x,
        y: y === BOX_SHADOW_DEFAULTS.y ? undefined : y,
        blur: blur === BOX_SHADOW_DEFAULTS.blur ? undefined : blur,
        spread: spread === BOX_SHADOW_DEFAULTS.spread ? undefined : spread,
        color: colorInt === 0x00000080 ? undefined : raw(intToHexLiteral(colorInt)),
        radius: radius > 0 ? radius : undefined,
      });
      const shadow = `image.boxShadow(${options === "{}" ? "" : options});`;
      return radius > 0 ? `image.roundCorners(${js({ radius })});\n${shadow}` : shadow;
    },
    thumbnail: { y: 6, blur: 10, radius: 20 },
  }),
];
