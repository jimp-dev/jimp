/**
 * Jimpy on a paint splash, drawn with @jimp/plugin-draw for the Open Graph
 * images. Jimpy's shapes are the daytime ones from src/components/Jimpy.astro
 * (keep them in sync), in its 250 x 270 coordinates. The splash is centered
 * on Jimpy, rather than off to one side like the share banner's.
 */
import { Jimp, type JimpInstance } from "jimp";
import {
  drawShape,
  flattenPath,
  type Matrix,
  type Paint,
} from "@jimp/plugin-draw";

const INK = "#1b1840";

interface Shape {
  d: string;
  fill?: Paint;
  stroke?: Paint;
  width?: number;
  cap?: "round";
  /** an SVG rotate(angle cx cy) */
  rotate?: [number, number, number];
  /** whether it gets the white sticker outline */
  outline?: boolean;
}

const ellipse = (cx: number, cy: number, rx: number, ry = rx) =>
  `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0z`;

const rect = (x: number, y: number, w: number, h: number, r = 0) =>
  r === 0
    ? `M${x} ${y}h${w}v${h}h${-w}z`
    : `M${x + r} ${y}h${w - r * 2}a${r} ${r} 0 0 1 ${r} ${r}v${h - r * 2}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - r * 2)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - r * 2)}a${r} ${r} 0 0 1 ${r} ${-r}z`;

const BRUSH: Shape["rotate"] = [35, 238, 92];

const JIMPY: Shape[] = [
  { d: ellipse(125, 252, 78, 12), fill: "rgba(27, 24, 64, 0.22)" },
  {
    d: ellipse(92, 240, 22, 12),
    fill: "#ff8f1f",
    stroke: INK,
    width: 5,
    outline: true,
  },
  {
    d: ellipse(158, 240, 22, 12),
    fill: "#ff8f1f",
    stroke: INK,
    width: 5,
    outline: true,
  },
  {
    d: "M38 150C38 80 78 48 125 48s87 32 87 102c0 62-32 88-87 88S38 212 38 150z",
    fill: "#3a7bff",
    stroke: INK,
    width: 6,
    outline: true,
  },
  {
    d: "M52 108C60 70 92 50 125 50s65 20 73 58c-8 6-14-4-20 4-4 22-16 22-17 2-4-10-14 4-20 2-8-4-10 24-21 20-8-4-3-22-12-24-8-2-10 14-18 12-8-2-6-18-18-16-8 2-10 16-20-2z",
    fill: "#ffd83a",
    stroke: INK,
    width: 5,
  },
  { d: ellipse(96, 142, 23, 26), fill: "#fff", stroke: INK, width: 5 },
  { d: ellipse(96, 146, 9), fill: INK },
  { d: ellipse(154, 142, 23, 26), fill: "#fff", stroke: INK, width: 5 },
  { d: ellipse(154, 146, 9), fill: INK },
  { d: ellipse(70, 180, 10), fill: "rgba(255, 95, 176, 0.8)" },
  { d: ellipse(180, 180, 10), fill: "rgba(255, 95, 176, 0.8)" },
  { d: "M96 182q29 34 58 0z", fill: "#7a1430", stroke: INK, width: 5 },
  { d: "M112 196q13-10 26 0", fill: "#ff7b8e" },
  { d: "M208 160l26-40", stroke: INK, width: 13, cap: "round", outline: true },
  { d: "M208 160l26-40", stroke: "#3a7bff", width: 6, cap: "round" },
  {
    d: rect(232, 40, 12, 62, 5),
    fill: "#c47a2c",
    stroke: INK,
    width: 4,
    rotate: BRUSH,
    outline: true,
  },
  {
    d: rect(230, 30, 16, 14),
    fill: "#cfd3e6",
    stroke: INK,
    width: 4,
    rotate: BRUSH,
    outline: true,
  },
  {
    d: "M230 30c0-14 4-22 8-28 4 6 8 14 8 28z",
    fill: "#ff4b4b",
    stroke: INK,
    width: 4,
    rotate: BRUSH,
    outline: true,
  },
];

/** The middle of Jimpy, hair to feet and side to side */
const MIDDLE = { x: 125, y: 150 };
/** How far from the middle the drawing reaches, the brush included */
const REACH = 175;
/** The width of the white sticker outline around Jimpy */
const OUTLINE = 7;

/**
 * A paint splash around (0, 0): a ring of rounded lobes of different sizes,
 * each a quadratic curve from one valley to the next through its tip
 */
function splash(radius: number) {
  const lobes = [1, 0.9, 1.04, 0.88, 0.97, 1.05, 0.86, 1, 0.92, 1.03, 0.89];
  const valley = 0.8;
  const at = (i: number, r: number) => {
    const angle = (i / lobes.length) * Math.PI * 2 - Math.PI / 2;

    return [Math.cos(angle) * r * radius, Math.sin(angle) * r * radius];
  };
  const point = ([x, y]: number[]) => `${x!.toFixed(1)} ${y!.toFixed(1)}`;
  let d = `M${point(at(-0.5, valley))}`;

  lobes.forEach((r, i) => {
    const from = at(i - 0.5, valley);
    const to = at(i + 0.5, valley);
    const tip = at(i, r);
    // The control point that puts the middle of the curve on the tip
    const control = [
      tip[0]! * 2 - (from[0]! + to[0]!) / 2,
      tip[1]! * 2 - (from[1]! + to[1]!) / 2,
    ];

    d += `Q${point(control)} ${point(to)}`;
  });

  return `${d}z`;
}

/** SVG's rotate(angle cx cy) then the matrix `m` */
function rotated(
  m: Matrix,
  [degrees, cx, cy]: [number, number, number],
): Matrix {
  const a = (degrees * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const r = [
    cos,
    sin,
    -sin,
    cos,
    cx - cos * cx + sin * cy,
    cy - sin * cx - cos * cy,
  ];

  return [
    m[0] * r[0]! + m[2] * r[1]!,
    m[1] * r[0]! + m[3] * r[1]!,
    m[0] * r[2]! + m[2] * r[3]!,
    m[1] * r[2]! + m[3] * r[3]!,
    m[0] * r[4]! + m[2] * r[5]! + m[4],
    m[1] * r[4]! + m[3] * r[5]! + m[5],
  ];
}

/** Jimpy in the middle of a `size` x `size` image, on a splash */
export function drawJimpy(size: number): JimpInstance {
  const image = new Jimp({ width: size, height: size, color: 0x00000000 });
  const scale = size / (REACH * 2);
  const center = size / 2;
  const toImage: Matrix = [
    scale,
    0,
    0,
    scale,
    center - MIDDLE.x * scale,
    center - MIDDLE.y * scale,
  ];
  const draw = (
    d: string,
    transform: Matrix,
    style: Parameters<typeof drawShape>[2],
  ) =>
    drawShape(image, flattenPath(d, { transform }), {
      ...style,
      join: "round",
    });

  // The splash, and two drops of paint
  draw(splash(150), [scale, 0, 0, scale, center, center], {
    fill: "#ff5fb0",
    stroke: INK,
    strokeWidth: 5 * scale,
  });
  draw(ellipse(-148, 132, 9), [scale, 0, 0, scale, center, center], {
    fill: "#ffd83a",
    stroke: INK,
    strokeWidth: 4 * scale,
  });
  draw(ellipse(160, 70, 7), [scale, 0, 0, scale, center, center], {
    fill: "#3a7bff",
    stroke: INK,
    strokeWidth: 4 * scale,
  });

  // A white outline around Jimpy, like a sticker, then Jimpy
  for (const pass of ["outline", "jimpy"] as const) {
    for (const shape of JIMPY) {
      if (pass === "outline" && !shape.outline) {
        continue;
      }

      const transform = shape.rotate ? rotated(toImage, shape.rotate) : toImage;
      const width = (shape.width ?? 0) * scale;

      draw(
        shape.d,
        transform,
        pass === "outline"
          ? {
              fill: shape.fill ? "white" : undefined,
              stroke: "white",
              strokeWidth: width + OUTLINE * 2 * scale,
              cap: "round",
            }
          : {
              fill: shape.fill,
              stroke: shape.stroke,
              strokeWidth: width,
              cap: shape.cap,
            },
      );
    }
  }

  return image;
}
