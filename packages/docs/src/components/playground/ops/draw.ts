/**
 * Playground ops: drawing with @jimp/plugin-draw. drawLine, drawRect,
 * drawEllipse, drawPolygon, drawPath and floodFill. See ops/shape.ts for how
 * to add an op.
 *
 * Each op builds the options object once, passes it to the method and prints
 * it with `call()`, so the code panel always matches what was drawn.
 */
import type { Paint } from "jimp";
import { centeredRect, js } from "../code";
import { defineOp, type ImageSize, type Point } from "../types";

/* ---------- Helpers ---------- */

/** Whole pixels, so the printed code stays short. */
const r = (n: number) => Math.round(n);

/** `image.<method>(options);`, broken over lines when it's long. */
function call(method: string, options: Record<string, unknown>) {
  const oneLine = `image.${method}(${js(options)});`;
  if (oneLine.length <= 72) return oneLine;

  const entries = Object.entries(options).filter(([, v]) => v !== undefined);
  return `image.${method}({\n${entries.map(([k, v]) => `  ${k}: ${js(v)},`).join("\n")}\n});`;
}

const linear = (x1: number, y1: number, x2: number, y2: number, from: string, to: string): Paint => ({
  type: "linear",
  x1: r(x1),
  y1: r(y1),
  x2: r(x2),
  y2: r(y2),
  stops: [
    { offset: 0, color: from },
    { offset: 1, color: to },
  ],
});

const radial = (cx: number, cy: number, radius: number, from: string, to: string): Paint => ({
  type: "radial",
  cx: r(cx),
  cy: r(cy),
  r: r(radius),
  stops: [
    { offset: 0, color: from },
    { offset: 1, color: to },
  ],
});

/* ---------- Shared shape controls ---------- */

type Style = "fill" | "stroke" | "both";

interface ShapeOpts {
  [key: string]: string | number | boolean | Point;
  style: Style;
  fill: string;
  stroke: string;
  strokeWidth: number;
  gradient: boolean;
  fill2: string;
}

const shapeDefaults = {
  style: "both" as Style,
  fill: "#ffd83a",
  stroke: "#1b1840",
  strokeWidth: 6,
  gradient: false as boolean,
  fill2: "#ff5fb0",
};

const styleControls = [
  {
    type: "select" as const,
    key: "style" as const,
    options: [
      { value: "fill", label: "fill" },
      { value: "stroke", label: "stroke" },
      { value: "both", label: "fill and stroke" },
    ],
  },
  { type: "color" as const, key: "fill" as const, when: (o: ShapeOpts) => o.style !== "stroke" },
  {
    type: "toggle" as const,
    key: "gradient" as const,
    label: "gradient fill",
    when: (o: ShapeOpts) => o.style !== "stroke",
  },
  {
    type: "color" as const,
    key: "fill2" as const,
    label: "gradient to",
    when: (o: ShapeOpts) => o.style !== "stroke" && o.gradient,
  },
  { type: "color" as const, key: "stroke" as const, when: (o: ShapeOpts) => o.style !== "fill" },
  {
    type: "slider" as const,
    key: "strokeWidth" as const,
    min: 1,
    max: 30,
    step: 1,
    unit: "px",
    when: (o: ShapeOpts) => o.style !== "fill",
  },
];

/** `fill`, `stroke` and `strokeWidth` for the chosen style. */
function shapeStyle(o: ShapeOpts, gradient: () => Paint) {
  return {
    fill: o.style === "stroke" ? undefined : o.gradient ? gradient() : o.fill,
    stroke: o.style === "fill" ? undefined : o.stroke,
    strokeWidth: o.style === "fill" ? undefined : o.strokeWidth,
  };
}

const joinControl = {
  type: "select" as const,
  key: "join" as const,
  options: ["miter", "round", "bevel"],
  when: (o: ShapeOpts) => o.style !== "fill",
};

const fillRuleControl = {
  type: "select" as const,
  key: "fillRule" as const,
  options: ["nonzero", "evenodd"],
  when: (o: ShapeOpts) => o.style !== "stroke",
};

/** Leave options at their defaults out of the code. */
const unlessDefault = <T>(value: T, fallback: T) => (value === fallback ? undefined : value);

/* ---------- Polygon and path presets ---------- */

/** Corners of a regular shape around (cx, cy), starting at the top. */
function ring(cx: number, cy: number, radius: number, count: number, step = 1) {
  return Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + (i * step * 2 * Math.PI) / count;
    return [r(cx + radius * Math.cos(angle)), r(cy + radius * Math.sin(angle))] as [number, number];
  });
}

const polygons: Record<string, { label: string; points: (c: Point, s: number) => [number, number][] }> = {
  star: { label: "star (crossing)", points: (c, s) => ring(c.x, c.y, s, 5, 2) },
  triangle: { label: "triangle", points: (c, s) => ring(c.x, c.y, s, 3) },
  hexagon: { label: "hexagon", points: (c, s) => ring(c.x, c.y, s, 6) },
  zigzag: {
    label: "zigzag",
    points: (c, s) =>
      [-1, -0.5, 0, 0.5, 1].map((t, i) => [r(c.x + t * s), r(c.y + (i % 2 ? -0.5 : 0.5) * s)]),
  },
};

/**
 * Path presets drawn in a 100 × 100 box, made only of absolute M, L, Q, C, S,
 * A and Z commands so `place` can scale them.
 */
const paths: Record<string, { label: string; d: string }> = {
  heart: {
    label: "heart (arcs and curves)",
    d: "M 10 30 A 20 20 0 0 1 50 30 A 20 20 0 0 1 90 30 Q 90 60 50 90 Q 10 60 10 30 Z",
  },
  ring: {
    label: "ring (two circles)",
    d: "M 10 50 A 40 40 0 1 0 90 50 A 40 40 0 1 0 10 50 Z M 30 50 A 20 20 0 1 0 70 50 A 20 20 0 1 0 30 50 Z",
  },
  bubble: {
    label: "speech bubble",
    d: "M 10 20 Q 10 10 20 10 L 80 10 Q 90 10 90 20 L 90 60 Q 90 70 80 70 L 45 70 L 25 90 L 30 70 L 20 70 Q 10 70 10 60 Z",
  },
  wave: { label: "wave (open)", d: "M 0 50 C 15 10 35 10 50 50 S 85 90 100 50" },
};

/** Scale a preset path to `size` pixels and center it on `center`. */
function place(d: string, center: Point, size: number) {
  const u = size / 100;
  const ox = center.x - size / 2;
  const oy = center.y - size / 2;
  const tokens = d.split(" ");
  const out: string[] = [];
  let command = "";
  let arg = 0;

  for (const token of tokens) {
    if (/^[A-Z]$/.test(token)) {
      command = token;
      arg = 0;
      out.push(token);
      continue;
    }
    const n = Number(token);
    if (command === "A") {
      // rx ry rotation large-arc sweep x y: only the radii and end point scale
      const i = arg % 7;
      out.push(String(i < 2 ? r(n * u) : i === 5 ? r(ox + n * u) : i === 6 ? r(oy + n * u) : n));
    } else {
      out.push(String(r(arg % 2 === 0 ? ox + n * u : oy + n * u)));
    }
    arg++;
  }

  return out.join(" ");
}

/* ---------- Icons (32x32 inner SVG markup) ---------- */

const S = `stroke="#1b1840" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;
const icons = {
  drawLine: `<path d="M5 26 27 6" ${S} stroke-width="6"/><path d="M5 26 27 6" stroke="#ff4b4b" stroke-width="2.4" stroke-linecap="round"/>`,
  drawRect: `<rect x="4" y="7" width="24" height="18" rx="4" fill="#ffd83a" ${S}/>`,
  drawEllipse: `<ellipse cx="16" cy="16" rx="13" ry="9" fill="#5cc8ff" ${S}/>`,
  drawPolygon: `<path d="M16 3l3.6 8 8.4.8-6.4 5.6 2 8.6L16 21.6 8.4 26l2-8.6L4 11.8l8.4-.8z" fill="#b5e86b" ${S}/>`,
  drawPath: `<path d="M4 22C8 6 14 6 16 16s8 10 12-6" fill="none" ${S}/><circle cx="4" cy="22" r="2.4" fill="#ff5fb0" ${S} stroke-width="1.8"/><circle cx="28" cy="10" r="2.4" fill="#ff5fb0" ${S} stroke-width="1.8"/>`,
  floodFill: `<path d="M6 14 15 5l10 10-9 9z" fill="#fff" ${S}/><path d="M8 16h16l-8 8z" fill="#3a7bff"/><path d="M6 14 15 5l10 10-9 9z" fill="none" ${S}/><path d="M27 19c1.5 2.5 2 3.6 2 4.6a2 2 0 01-4 0c0-1 .5-2.1 2-4.6z" fill="#3a7bff" ${S} stroke-width="1.8"/>`,
};

/* ---------- Ops ---------- */

export default [
  defineOp({
    id: "drawLine",
    label: "drawLine",
    icon: icons.drawLine,
    group: "draw",
    description: "Draw an antialiased line between two points. Pick each end on the image.",
    controls: [
      { type: "xy", key: "start" },
      { type: "xy", key: "end" },
      { type: "slider", key: "width", min: 1, max: 40, step: 1, unit: "px" },
      { type: "select", key: "cap", options: ["butt", "round", "square"] },
      { type: "color", key: "color" },
      { type: "toggle", key: "gradient", label: "gradient" },
      { type: "color", key: "color2", label: "gradient to", when: (o) => o.gradient },
    ],
    defaults: ({ width, height }: ImageSize) => ({
      start: { x: r(width * 0.12), y: r(height * 0.8) },
      end: { x: r(width * 0.88), y: r(height * 0.2) },
      width: Math.max(4, r(width / 30)),
      cap: "round",
      color: "#ff4b4b",
      gradient: false as boolean,
      color2: "#3a7bff",
    }),
    apply: (image, o) => {
      image.drawLine(lineOptions(o));
    },
    code: (o) => call("drawLine", lineOptions(o)),
    thumbnail: { gradient: true },
  }),

  defineOp({
    id: "drawRect",
    label: "drawRect",
    icon: icons.drawRect,
    group: "draw",
    description: "Draw a rectangle, with rounded corners if you like. Drag on the image to place it.",
    controls: [
      { type: "rect", key: "rect", label: "rectangle" },
      { type: "slider", key: "radius", min: 0, max: 100, step: 1, unit: "px" },
      ...styleControls,
      {
        type: "select",
        key: "strokeAlign",
        label: "stroke align",
        options: ["center", "inside", "outside"],
        when: (o) => o.style !== "fill",
      },
      joinControl,
    ],
    defaults: ({ width, height }: ImageSize) => ({
      ...shapeDefaults,
      rect: centeredRect(width, height, 0.6),
      radius: r(Math.min(width, height) / 10),
      strokeAlign: "center",
      join: "miter",
      strokeWidth: Math.max(2, r(width / 60)),
    }),
    apply: (image, o) => {
      image.drawRect(rectOptions(o));
    },
    code: (o) => call("drawRect", rectOptions(o)),
    thumbnail: { gradient: true },
  }),

  defineOp({
    id: "drawEllipse",
    label: "drawEllipse",
    icon: icons.drawEllipse,
    group: "draw",
    description: "Draw an ellipse, or a circle when both radii match. Pick the center on the image.",
    controls: [
      { type: "xy", key: "center" },
      { type: "slider", key: "rx", min: 0, max: 200, step: 1, unit: "px" },
      { type: "slider", key: "ry", min: 0, max: 200, step: 1, unit: "px" },
      ...styleControls,
    ],
    defaults: ({ width, height }: ImageSize) => ({
      ...shapeDefaults,
      center: { x: r(width / 2), y: r(height / 2) },
      rx: r(width * 0.3),
      ry: r(height * 0.3),
      fill: "#5cc8ff",
      fill2: "#ffffff",
      strokeWidth: Math.max(2, r(width / 60)),
    }),
    apply: (image, o) => {
      image.drawEllipse(ellipseOptions(o));
    },
    code: (o) => call("drawEllipse", ellipseOptions(o)),
    thumbnail: { gradient: true },
  }),

  defineOp({
    id: "drawPolygon",
    label: "drawPolygon",
    icon: icons.drawPolygon,
    group: "draw",
    description: "Draw a polygon or, with closed off, a polyline through a list of points.",
    controls: [
      {
        type: "select",
        key: "shape",
        options: Object.entries(polygons).map(([value, p]) => ({ value, label: p.label })),
      },
      { type: "xy", key: "center" },
      { type: "slider", key: "size", min: 10, max: 200, step: 1, unit: "px" },
      { type: "toggle", key: "closed" },
      fillRuleControl,
      ...styleControls,
      joinControl,
    ],
    defaults: ({ width, height }: ImageSize) => ({
      ...shapeDefaults,
      shape: "star",
      center: { x: r(width / 2), y: r(height / 2) },
      size: r(Math.min(width, height) * 0.42),
      closed: true,
      fillRule: "nonzero",
      join: "round",
      strokeWidth: Math.max(2, r(width / 90)),
    }),
    apply: (image, o) => {
      image.drawPolygon(polygonOptions(o));
    },
    code: (o) => call("drawPolygon", polygonOptions(o)),
    thumbnail: { fillRule: "evenodd" },
  }),

  defineOp({
    id: "drawPath",
    label: "drawPath",
    icon: icons.drawPath,
    group: "draw",
    description: "Draw an SVG path: lines, curves and arcs, filled, stroked or both.",
    controls: [
      {
        type: "select",
        key: "preset",
        label: "path",
        options: Object.entries(paths).map(([value, p]) => ({ value, label: p.label })),
      },
      { type: "xy", key: "center" },
      { type: "slider", key: "size", min: 20, max: 300, step: 1, unit: "px" },
      fillRuleControl,
      ...styleControls,
      { type: "select", key: "cap", options: ["butt", "round", "square"], when: (o) => o.style !== "fill" },
      joinControl,
    ],
    defaults: ({ width, height }: ImageSize) => ({
      ...shapeDefaults,
      preset: "heart",
      center: { x: r(width / 2), y: r(height / 2) },
      size: r(Math.min(width, height) * 0.8),
      fillRule: "nonzero",
      fill: "#ff4b4b",
      fill2: "#ffd83a",
      cap: "round",
      join: "round",
      strokeWidth: Math.max(2, r(width / 90)),
    }),
    apply: (image, o) => {
      image.drawPath(pathOptions(o));
    },
    code: (o) => call("drawPath", pathOptions(o)),
    thumbnail: { preset: "ring", fillRule: "evenodd", gradient: true },
  }),

  defineOp({
    id: "floodFill",
    label: "floodFill",
    icon: icons.floodFill,
    group: "draw",
    description:
      "Fill the area connected to a point, like a paint bucket. Raise tolerance to take in similar colors.",
    controls: [
      { type: "xy", key: "point" },
      { type: "slider", key: "tolerance", min: 0, max: 1, step: 0.01 },
      { type: "color", key: "color" },
      { type: "toggle", key: "gradient", label: "gradient" },
      { type: "color", key: "color2", label: "gradient to", when: (o) => o.gradient },
    ],
    defaults: ({ width, height }: ImageSize) => ({
      point: { x: r(width * 0.03), y: r(height * 0.03) },
      tolerance: 0.2,
      color: "#ffd83a",
      gradient: false as boolean,
      color2: "#ff5fb0",
      w: width,
      h: height,
    }),
    apply: (image, o) => {
      image.floodFill(floodOptions(o));
    },
    code: (o) => call("floodFill", floodOptions(o)),
    thumbnail: { gradient: true },
  }),
];

/* ---------- Options for each op, shared by apply and code ---------- */

function lineOptions(o: {
  start: Point;
  end: Point;
  width: number;
  cap: string;
  color: string;
  gradient: boolean;
  color2: string;
}) {
  return {
    x1: o.start.x,
    y1: o.start.y,
    x2: o.end.x,
    y2: o.end.y,
    color: o.gradient ? linear(o.start.x, o.start.y, o.end.x, o.end.y, o.color, o.color2) : o.color,
    width: o.width,
    cap: unlessDefault(o.cap, "butt") as "round" | "square" | undefined,
  };
}

function rectOptions(
  o: ShapeOpts & { rect: { x: number; y: number; w: number; h: number }; radius: number; strokeAlign: string; join: string },
) {
  const { x, y, w, h } = o.rect;
  return {
    x,
    y,
    w,
    h,
    radius: o.radius || undefined,
    ...shapeStyle(o, () => linear(x, y, x + w, y + h, o.fill, o.fill2)),
    strokeAlign:
      o.style === "fill" ? undefined : (unlessDefault(o.strokeAlign, "center") as "inside" | "outside" | undefined),
    join: o.style === "fill" ? undefined : (unlessDefault(o.join, "miter") as "round" | "bevel" | undefined),
  };
}

function ellipseOptions(o: ShapeOpts & { center: Point; rx: number; ry: number }) {
  const { x, y } = o.center;
  return {
    cx: x,
    cy: y,
    rx: o.rx,
    ry: o.ry,
    ...shapeStyle(o, () => radial(x - o.rx / 3, y - o.ry / 3, Math.max(o.rx, o.ry) * 1.2, o.fill2, o.fill)),
  };
}

function polygonOptions(
  o: ShapeOpts & { shape: string; center: Point; size: number; closed: boolean; fillRule: string; join: string },
) {
  const points = (polygons[o.shape] ?? polygons.star!).points(o.center, o.size);
  const xs = points.map(([x]) => x);
  return {
    points,
    closed: o.closed ? undefined : false,
    ...shapeStyle(o, () => linear(Math.min(...xs), 0, Math.max(...xs), 0, o.fill, o.fill2)),
    fillRule: o.style === "stroke" ? undefined : (unlessDefault(o.fillRule, "nonzero") as "evenodd" | undefined),
    join: o.style === "fill" ? undefined : (unlessDefault(o.join, "miter") as "round" | "bevel" | undefined),
  };
}

function pathOptions(
  o: ShapeOpts & { preset: string; center: Point; size: number; fillRule: string; cap: string; join: string },
) {
  const { x, y } = o.center;
  const half = o.size / 2;
  return {
    path: place((paths[o.preset] ?? paths.heart!).d, o.center, o.size),
    ...shapeStyle(o, () => linear(x, y - half, x, y + half, o.fill, o.fill2)),
    fillRule: o.style === "stroke" ? undefined : (unlessDefault(o.fillRule, "nonzero") as "evenodd" | undefined),
    cap: o.style === "fill" ? undefined : (unlessDefault(o.cap, "butt") as "round" | "square" | undefined),
    join: o.style === "fill" ? undefined : (unlessDefault(o.join, "miter") as "round" | "bevel" | undefined),
  };
}

function floodOptions(o: {
  point: Point;
  tolerance: number;
  color: string;
  gradient: boolean;
  color2: string;
  w: number;
  h: number;
}) {
  const { x, y } = o.point;
  return {
    x,
    y,
    color: o.gradient ? radial(x, y, Math.max(o.w, o.h), o.color, o.color2) : o.color,
    tolerance: o.tolerance || undefined,
  };
}
