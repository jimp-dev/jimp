/**
 * Playground ops: reading and writing pixels (scan, scanIterator,
 * getPixelColor, setPixelColor, getPixelIndex) and the color helpers that
 * work on single pixels (colorDiff, limit255).
 *
 * See ops/shape.ts for how to add an op. Every op here writes a small,
 * self-contained loop, so `code()` spells out the exact statements `apply()`
 * runs.
 */
import { colorDiff, intToRGBA, limit255 } from "jimp";
import { centeredRect, hexToInt, intToHexLiteral, js } from "../code";
import { defineOp, type ImageSize, type JimpInstance, type Rect } from "../types";

const INK = "#1b1840";
const S = `stroke="${INK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;

const icons = {
  scan: `<rect x="4" y="4" width="24" height="24" rx="3" fill="#fff" ${S}/><path d="M8 10h16M8 16h16M8 22h9" ${S} stroke="#8ff0c8" stroke-width="3.4"/><path d="M8 10h16M8 16h16M8 22h9" fill="none" ${S} stroke-width="1.6"/><path d="M24 10l-16 6M24 16l-16 6" fill="none" ${S} stroke-width="1.2" stroke-dasharray="1.5 2.5"/><circle cx="18" cy="22" r="2.6" fill="#ff5fb0" ${S} stroke-width="2"/>`,
  scanIterator: `<rect x="4" y="4" width="24" height="24" rx="3" fill="#fff" ${S}/><g ${S} stroke-width="2"><rect x="8" y="8" width="5" height="5" fill="#8ff0c8"/><rect x="13.5" y="8" width="5" height="5" fill="#8ff0c8"/><rect x="19" y="8" width="5" height="5" fill="#8ff0c8"/><rect x="8" y="13.5" width="5" height="5" fill="#ff5fb0"/></g><path d="M23 18a5 5 0 11-5 5" fill="none" ${S}/><path d="M23 14v4h-4" fill="none" ${S}/>`,
  setPixelColor: `<g ${S} stroke-width="1.6"><rect x="4" y="4" width="8" height="8" fill="#fff"/><rect x="12" y="4" width="8" height="8" fill="#fff"/><rect x="4" y="12" width="8" height="8" fill="#fff"/><rect x="12" y="12" width="8" height="8" fill="#ff5fb0"/></g><path d="M29 9 17 21l-4 1 1-4L26 6z" fill="#ffd83a" ${S}/><path d="M23 9l3 3" ${S}/>`,
  getPixelColor: `<g ${S} stroke-width="1.6"><rect x="4" y="16" width="8" height="8" fill="#fff"/><rect x="12" y="16" width="8" height="8" fill="#3a7bff"/><rect x="4" y="24" width="8" height="5" fill="#fff"/><rect x="12" y="24" width="8" height="5" fill="#fff"/></g><path d="M27 5a3 3 0 00-4 0l-3 3-1-1-2 2 1 1-7 7v3h3l7-7 1 1 2-2-1-1 3-3a3 3 0 001-3z" fill="#a9e4ff" ${S} stroke-width="2.2"/>`,
  getPixelIndex: `<rect x="4" y="6" width="24" height="20" rx="3" fill="#fff" ${S}/><path d="M4 16h24M16 6v20" ${S} stroke-width="1.6"/><rect x="16" y="16" width="12" height="10" fill="#8ff0c8" ${S} stroke-width="1.6"/><path d="M10 11h2M21 21h2" ${S}/><path d="M2 29h10l-3-3M30 3H20l3 3" fill="none" ${S} stroke-width="2"/>`,
  colorDiff: `<rect x="3" y="6" width="14" height="14" rx="3" fill="#ff4b4b" ${S}/><rect x="15" y="12" width="14" height="14" rx="3" fill="#ff8f8f" ${S}/><path d="M19 17h6M19 21h6M23 15l-2 8" ${S} stroke-width="2"/>`,
  limit255: `<path d="M4 6h24M4 26h24" ${S}/><g ${S} stroke-width="2"><rect x="7" y="14" width="5" height="12" fill="#d9d6ea"/><rect x="14" y="6" width="5" height="20" fill="#ff8f1f"/><rect x="21" y="6" width="5" height="20" fill="#ff8f1f"/></g><path d="M16.5 2v2M23.5 2v2" ${S} stroke-width="2"/>`,
};

/* ---------- Per-pixel effects shared by the scan and scanIterator ops ---------- */

type Data = JimpInstance["bitmap"]["data"];

interface Effect {
  label: string;
  /** The loop body, one statement per line. Uses `x`, `y`, `idx` and `image`. */
  body: string[];
  /** What `body` does. Keep the two in sync. */
  run(data: Data, x: number, y: number, idx: number, image: JimpInstance): void;
}

const effects: Record<string, Effect> = {
  swap: {
    label: "swap red and blue",
    body: [
      "const { data } = image.bitmap;",
      "const red = data[idx];",
      "data[idx] = data[idx + 2];",
      "data[idx + 2] = red;",
    ],
    run(data, _x, _y, idx) {
      const red = data[idx]!;
      data[idx] = data[idx + 2]!;
      data[idx + 2] = red;
    },
  },
  red: {
    label: "keep only red",
    body: ["const { data } = image.bitmap;", "data[idx + 1] = 0; // green", "data[idx + 2] = 0; // blue"],
    run(data, _x, _y, idx) {
      data[idx + 1] = 0;
      data[idx + 2] = 0;
    },
  },
  invert: {
    label: "invert",
    body: [
      "const { data } = image.bitmap;",
      "data[idx] = 255 - data[idx];",
      "data[idx + 1] = 255 - data[idx + 1];",
      "data[idx + 2] = 255 - data[idx + 2];",
    ],
    run(data, _x, _y, idx) {
      data[idx] = 255 - data[idx]!;
      data[idx + 1] = 255 - data[idx + 1]!;
      data[idx + 2] = 255 - data[idx + 2]!;
    },
  },
  grey: {
    label: "average to grey",
    body: [
      "const { data } = image.bitmap;",
      "const grey = Math.round((data[idx] + data[idx + 1] + data[idx + 2]) / 3);",
      "data[idx] = grey;",
      "data[idx + 1] = grey;",
      "data[idx + 2] = grey;",
    ],
    run(data, _x, _y, idx) {
      const grey = Math.round((data[idx]! + data[idx + 1]! + data[idx + 2]!) / 3);
      data[idx] = grey;
      data[idx + 1] = grey;
      data[idx + 2] = grey;
    },
  },
  checker: {
    label: "checkerboard alpha",
    body: [
      "if ((Math.floor(x / 20) + Math.floor(y / 20)) % 2 === 1) {",
      "  image.bitmap.data[idx + 3] = 0; // alpha",
      "}",
    ],
    run(data, x, y, idx) {
      if ((Math.floor(x / 20) + Math.floor(y / 20)) % 2 === 1) {
        data[idx + 3] = 0;
      }
    },
  },
  fade: {
    label: "fade out to the left",
    body: [
      "const { data } = image.bitmap;",
      "data[idx + 3] = Math.round(data[idx + 3] * (x / image.width));",
    ],
    run(data, x, _y, idx, image) {
      data[idx + 3] = Math.round(data[idx + 3]! * (x / image.width));
    },
  },
  position: {
    label: "color by x and y",
    body: [
      "const { data } = image.bitmap;",
      "data[idx] = Math.round((x / image.width) * 255); // red grows to the right",
      "data[idx + 1] = Math.round((y / image.height) * 255); // green grows downward",
      "data[idx + 2] = 128;",
      "data[idx + 3] = 255;",
    ],
    run(data, x, y, idx, image) {
      data[idx] = Math.round((x / image.width) * 255);
      data[idx + 1] = Math.round((y / image.height) * 255);
      data[idx + 2] = 128;
      data[idx + 3] = 255;
    },
  },
};

const effectOptions = Object.entries(effects).map(([value, { label }]) => ({ value, label }));
const effectFor = (key: string) => effects[key] ?? effects.swap!;
const indent = (lines: string[]) => lines.map((line) => `  ${line}`).join("\n");
const regionArgs = ({ x, y, w, h }: Rect) => `${js(x)}, ${js(y)}, ${js(w)}, ${js(h)}`;

const loopControls = [
  { type: "select", key: "effect", label: "for each pixel", options: effectOptions },
  { type: "toggle", key: "useRegion", label: "region only" },
  { type: "rect", key: "region", when: (o: { useRegion: boolean }) => o.useRegion },
] as const;

const loopDefaults = ({ width, height }: ImageSize) => ({
  effect: "swap",
  useRegion: false,
  region: centeredRect(width, height, 0.6),
});

/* ---------- Helpers ---------- */

/** A point at a fraction of the image size. */
const at = (width: number, height: number, fx: number, fy: number) => ({
  x: Math.round(width * fx),
  y: Math.round(height * fy),
});

const edgeNames: Record<string, string> = { "1": "EXTEND", "2": "WRAP", "3": "CROP" };

export default [
  defineOp({
    id: "scan",
    label: "scan",
    icon: icons.scan,
    group: "pixels",
    description:
      "Run a function for every pixel, or every pixel in a region. Pick what the function does.",
    controls: [...loopControls],
    defaults: loopDefaults,
    apply: (image, { effect, useRegion, region }) => {
      const { run } = effectFor(effect);
      const cb = (x: number, y: number, idx: number) => run(image.bitmap.data, x, y, idx, image);
      if (useRegion) image.scan(region.x, region.y, region.w, region.h, cb);
      else image.scan(cb);
    },
    code: ({ effect, useRegion, region }) => {
      const args = useRegion ? `${regionArgs(region)}, ` : "";
      return `image.scan(${args}(x, y, idx) => {\n${indent(effectFor(effect).body)}\n});`;
    },
    thumbnail: { effect: "swap" },
  }),

  defineOp({
    id: "scanIterator",
    label: "scanIterator",
    icon: icons.scanIterator,
    group: "pixels",
    description: "Loop over every pixel, or every pixel in a region, with for...of.",
    controls: [...loopControls],
    defaults: (size: ImageSize) => ({ ...loopDefaults(size), effect: "position", useRegion: true }),
    apply: (image, { effect, useRegion, region }) => {
      const { run } = effectFor(effect);
      const pixels = useRegion
        ? image.scanIterator(region.x, region.y, region.w, region.h)
        : image.scanIterator();
      for (const { x, y, idx } of pixels) {
        run(image.bitmap.data, x, y, idx, image);
      }
    },
    code: ({ effect, useRegion, region }) => {
      const args = useRegion ? regionArgs(region) : "";
      return `for (const { x, y, idx } of image.scanIterator(${args})) {\n${indent(effectFor(effect).body)}\n}`;
    },
  }),

  defineOp({
    id: "setPixelColor",
    label: "setPixelColor",
    icon: icons.setPixelColor,
    group: "pixels",
    description:
      "Paint a dot by setting pixels one at a time. Click the image to move it. The color replaces the pixel; it isn't blended.",
    controls: [
      { type: "xy", key: "point", label: "x, y" },
      { type: "slider", key: "radius", min: 0, max: 40, step: 1, unit: "px" },
      { type: "color", key: "color" },
      { type: "slider", key: "alpha", min: 0, max: 255, step: 1 },
    ],
    defaults: ({ width, height }: ImageSize) => ({
      point: at(width, height, 0.5, 0.5),
      radius: Math.max(4, Math.round(width / 30)),
      color: "#ff5fb0",
      alpha: 255,
    }),
    apply: (image, { point, radius, color, alpha }) => {
      const hex = hexToInt(color, alpha);
      if (radius === 0) {
        image.setPixelColor(hex, point.x, point.y);
        return;
      }
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy <= radius * radius) {
            image.setPixelColor(hex, point.x + dx, point.y + dy);
          }
        }
      }
    },
    code: ({ point, radius, color, alpha }) => {
      const hex = intToHexLiteral(hexToInt(color, alpha));
      if (radius === 0) return `image.setPixelColor(${hex}, ${js(point.x)}, ${js(point.y)});`;
      return [
        `for (let dy = -${radius}; dy <= ${radius}; dy++) {`,
        `  for (let dx = -${radius}; dx <= ${radius}; dx++) {`,
        `    if (dx * dx + dy * dy <= ${radius} * ${radius}) {`,
        `      image.setPixelColor(${hex}, ${js(point.x)} + dx, ${js(point.y)} + dy);`,
        `    }`,
        `  }`,
        `}`,
      ].join("\n");
    },
    thumbnail: { radius: 18 },
  }),

  defineOp({
    id: "getPixelColor",
    label: "getPixelColor",
    icon: icons.getPixelColor,
    group: "pixels",
    description:
      "Read the color of one pixel and paint a swatch with it in the top-left corner. Click the image to pick the pixel.",
    controls: [
      { type: "xy", key: "point", label: "x, y" },
      { type: "slider", key: "size", min: 10, max: 120, step: 2, unit: "px" },
    ],
    defaults: ({ width, height }: ImageSize) => ({
      point: at(width, height, 0.5, 0.56),
      size: Math.max(10, Math.round(width / 6)),
    }),
    apply: (image, { point, size }) => {
      const color = image.getPixelColor(point.x, point.y);
      image.scan(0, 0, size, size, (x, y) => {
        image.setPixelColor(color, x, y);
      });
    },
    code: ({ point, size }) =>
      [
        `const color = image.getPixelColor(${js(point.x)}, ${js(point.y)});`,
        `image.scan(0, 0, ${js(size)}, ${js(size)}, (x, y) => {`,
        `  image.setPixelColor(color, x, y);`,
        `});`,
      ].join("\n"),
    thumbnail: { size: 50 },
  }),

  defineOp({
    id: "getPixelIndex",
    label: "getPixelIndex",
    icon: icons.getPixelIndex,
    group: "pixels",
    description:
      "Shift the image by reading each pixel from somewhere else. The edge mode decides what fills the gap.",
    controls: [
      { type: "slider", key: "dx", label: "shift x", min: -180, max: 180, step: 5, unit: "px" },
      { type: "slider", key: "dy", label: "shift y", min: -135, max: 135, step: 5, unit: "px" },
      {
        type: "select",
        key: "edge",
        label: "edgeHandling",
        options: [
          { value: "1", label: "1 (Edge.EXTEND)" },
          { value: "2", label: "2 (Edge.WRAP)" },
          { value: "3", label: "3 (Edge.CROP)" },
        ],
      },
    ],
    defaults: { dx: 90, dy: 45, edge: "2" },
    apply: (image, { dx, dy, edge }) => {
      const source = image.clone();
      const mode = Number(edge);
      image.scan((x, y, idx) => {
        const from = source.getPixelIndex(x - dx, y - dy, mode);
        const color = from === -1 ? 0 : source.bitmap.data.readUInt32BE(from);
        image.bitmap.data.writeUInt32BE(color, idx);
      });
    },
    code: ({ dx, dy, edge }) => {
      const sx = dx < 0 ? `x + ${-dx}` : `x - ${dx}`;
      const sy = dy < 0 ? `y + ${-dy}` : `y - ${dy}`;
      return [
        `const source = image.clone();`,
        `image.scan((x, y, idx) => {`,
        `  // ${edge} is Edge.${edgeNames[edge]}`,
        `  const from = source.getPixelIndex(${sx}, ${sy}, ${edge});`,
        `  const color = from === -1 ? 0 : source.bitmap.data.readUInt32BE(from);`,
        `  image.bitmap.data.writeUInt32BE(color, idx);`,
        `});`,
      ].join("\n");
    },
  }),

  defineOp({
    id: "colorDiff",
    label: "colorDiff",
    icon: icons.colorDiff,
    group: "utils",
    description:
      "Hide every pixel whose color differs from a picked pixel by more than the tolerance. Click the image to pick.",
    controls: [
      { type: "xy", key: "point", label: "x, y" },
      { type: "slider", key: "tolerance", min: 0, max: 1, step: 0.01 },
    ],
    defaults: ({ width, height }: ImageSize) => ({
      point: at(width, height, 0.5, 0.56),
      tolerance: 0.15,
    }),
    apply: (image, { point, tolerance }) => {
      const target = intToRGBA(image.getPixelColor(point.x, point.y));
      const max = Number(tolerance.toFixed(2));
      image.scan((x, y, idx) => {
        const pixel = intToRGBA(image.getPixelColor(x, y));
        if (colorDiff(pixel, target) > max) {
          image.bitmap.data[idx + 3] = 0;
        }
      });
    },
    code: ({ point, tolerance }) =>
      [
        `const target = intToRGBA(image.getPixelColor(${js(point.x)}, ${js(point.y)}));`,
        `image.scan((x, y, idx) => {`,
        `  const pixel = intToRGBA(image.getPixelColor(x, y));`,
        `  if (colorDiff(pixel, target) > ${js(tolerance)}) {`,
        `    image.bitmap.data[idx + 3] = 0; // hide it`,
        `  }`,
        `});`,
      ].join("\n"),
    imports: () => ({ jimp: ["intToRGBA", "colorDiff"] }),
  }),

  defineOp({
    id: "limit255",
    label: "limit255",
    icon: icons.limit255,
    group: "utils",
    description:
      "Add a value to every color channel. Turn limit255 off to see values above 255 wrap around to 0.",
    controls: [
      { type: "slider", key: "amount", min: -255, max: 255, step: 5 },
      { type: "toggle", key: "clamp", label: "use limit255" },
    ],
    defaults: { amount: 120, clamp: true },
    apply: (image, { amount, clamp }) => {
      const fix = clamp ? limit255 : (n: number) => n;
      image.scan((_x, _y, idx) => {
        const { data } = image.bitmap;
        data[idx] = fix(data[idx]! + amount);
        data[idx + 1] = fix(data[idx + 1]! + amount);
        data[idx + 2] = fix(data[idx + 2]! + amount);
      });
    },
    code: ({ amount, clamp }) => {
      const sum = (i: string) => {
        const expr = `data[idx${i}] ${amount < 0 ? "-" : "+"} ${Math.abs(amount)}`;
        return clamp ? `limit255(${expr})` : expr;
      };
      return [
        `image.scan((x, y, idx) => {`,
        `  const { data } = image.bitmap;`,
        `  data[idx] = ${sum("")};`,
        `  data[idx + 1] = ${sum(" + 1")};`,
        `  data[idx + 2] = ${sum(" + 2")};`,
        `});`,
      ].join("\n");
    },
    imports: ({ clamp }) => (clamp ? { jimp: ["limit255"] } : {}),
  }),
];
