/**
 * More effects ops: convolute, convolution, boxShadow. See ops/shape.ts for
 * how to add an op.
 */
import type { Edge } from "jimp";
import { centeredRect, hexToInt, intToHexLiteral, js, raw } from "../code";
import { defineOp, type ImageSize } from "../types";

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
function kernelCode(rows: string[][]) {
  return `[\n${rows.map((row) => `  [${row.join(", ")}],`).join("\n")}\n]`;
}

interface Kernel {
  label: string;
  kernel: number[][];
  /** The kernel as source code, so fractions print as `1 / 9` rather than 0.11. */
  code: string[][];
}

/** "1 / 9" → 0.111…, "-2" → -2 */
const cellValue = (cell: string) => {
  const [a, b] = cell.split("/").map(Number);
  return b === undefined ? a! : a! / b;
};

const k = (label: string, code: string[][]): Kernel => ({
  label,
  code,
  kernel: code.map((row) => row.map(cellValue)),
});

/**
 * Kernels that look the same whether they're read row by row (`convolution`)
 * or column by column (`convolute`), so each one does what its name says in
 * both ops.
 */
const kernels = {
  sharpen: k("sharpen", [
    ["0", "-1", "0"],
    ["-1", "5", "-1"],
    ["0", "-1", "0"],
  ]),
  emboss: k("emboss", [
    ["-2", "-1", "0"],
    ["-1", "1", "1"],
    ["0", "1", "2"],
  ]),
  boxBlur: k("box blur", [
    ["1 / 9", "1 / 9", "1 / 9"],
    ["1 / 9", "1 / 9", "1 / 9"],
    ["1 / 9", "1 / 9", "1 / 9"],
  ]),
  edges: k("edge detect", [
    ["-1", "-1", "-1"],
    ["-1", "8", "-1"],
    ["-1", "-1", "-1"],
  ]),
  sobelY: k("horizontal edges (Sobel)", [
    ["-1", "-2", "-1"],
    ["0", "0", "0"],
    ["1", "2", "1"],
  ]),
} satisfies Record<string, Kernel>;

type KernelId = keyof typeof kernels;

/** convolute() also runs the kernel over alpha, so kernels that sum to 0 erase the image. */
const convoluteKernels: KernelId[] = ["sharpen", "emboss", "boxBlur"];
const convolutionKernels: KernelId[] = ["sharpen", "emboss", "boxBlur", "edges", "sobelY"];

/** `Edge` is only exported as a type from "jimp", so the code uses its numeric values. */
const edgeModes = [
  { value: "1", label: "1 (Edge.EXTEND, default)" },
  { value: "2", label: "2 (Edge.WRAP)" },
  { value: "3", label: "3 (Edge.CROP)" },
];
const edgeNames: Record<string, string> = { "1": "EXTEND", "2": "WRAP", "3": "CROP" };

const BOX_SHADOW_DEFAULTS = { x: 0, y: 4, blur: 12, spread: 0 };

export default [
  defineOp({
    id: "convolute",
    label: "convolute",
    icon: convoluteIcon,
    group: "effects",
    description:
      "Run a 3×3 kernel over every channel, alpha included, of the image or a region of it.",
    controls: [
      {
        type: "select",
        key: "kernel",
        options: convoluteKernels.map((id) => ({ value: id, label: kernels[id].label })),
      },
      { type: "toggle", key: "useRegion", label: "region only" },
      { type: "rect", key: "region", when: (o) => o.useRegion },
    ],
    defaults: ({ width, height }: ImageSize) => ({
      kernel: "emboss",
      useRegion: false,
      region: centeredRect(width, height, 0.5),
    }),
    apply: (image, { kernel, useRegion, region }) => {
      const { kernel: matrix } = kernels[kernel as KernelId];
      image.convolute(useRegion ? { kernel: matrix, ...region } : matrix);
    },
    code: ({ kernel, useRegion, region }) => {
      const matrix = kernelCode(kernels[kernel as KernelId].code);
      if (!useRegion) return `image.convolute(${matrix});`;
      const rows = matrix.split("\n").map((line, i) => (i === 0 ? line : `  ${line}`));
      return `image.convolute({\n  kernel: ${rows.join("\n")},\n  ${js(region).slice(2, -2)},\n});`;
    },
  }),

  defineOp({
    id: "convolution",
    label: "convolution",
    icon: convolutionIcon,
    group: "effects",
    description:
      "Run a kernel over the red, green and blue channels. Alpha is left alone, and edgeHandling picks what lies past the border.",
    controls: [
      {
        type: "select",
        key: "kernel",
        options: convolutionKernels.map((id) => ({ value: id, label: kernels[id].label })),
      },
      { type: "select", key: "edgeHandling", label: "edgeHandling", options: edgeModes },
    ],
    defaults: { kernel: "edges", edgeHandling: "1" },
    apply: (image, { kernel, edgeHandling }) => {
      const { kernel: matrix } = kernels[kernel as KernelId];
      if (edgeHandling === "1") image.convolution(matrix);
      else image.convolution({ kernel: matrix, edgeHandling: Number(edgeHandling) as Edge });
    },
    code: ({ kernel, edgeHandling }) => {
      const matrix = kernelCode(kernels[kernel as KernelId].code);
      if (edgeHandling === "1") return `image.convolution(${matrix});`;
      const rows = matrix.split("\n").map((line, i) => (i === 0 ? line : `  ${line}`));
      return `image.convolution({\n  kernel: ${rows.join("\n")},\n  edgeHandling: ${edgeHandling}, // Edge.${edgeNames[edgeHandling]}\n});`;
    },
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
