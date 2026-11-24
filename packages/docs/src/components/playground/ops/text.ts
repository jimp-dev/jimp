/**
 * Text and comparison ops: print and diff.
 *
 * Owned by the content author for this area. See ops/shape.ts for how to
 * add an op.
 *
 * `jimp/fonts` can't be imported in the browser (its constants are file
 * paths built with Node's `path` and `url`), so the playground loads copies
 * of the bundled fonts from public/fonts/ by URL. The generated code uses
 * the `jimp/fonts` constants, which is what a Node.js reader would write.
 *
 * The TrueType and WOFF fonts are printable-ASCII subsets of Open Sans and
 * Inter (OFL 1.1) in public/fonts/vector/, loaded with `loadTTF`.
 */
import { diff, HorizontalAlign, loadFont, VerticalAlign } from "jimp";
import { loadTTF } from "jimp/load-ttf";
import { js, raw } from "../code";
import { assetUrl } from "../images";
import { defineOp, type ImageSize } from "../types";

/* ---------- print ---------- */

const fontNames = [
  "SANS_16_BLACK",
  "SANS_32_BLACK",
  "SANS_64_BLACK",
  "SANS_16_WHITE",
  "SANS_32_WHITE",
  "SANS_64_WHITE",
] as const;

/** "SANS_32_BLACK" → "fonts/open-sans/open-sans-32-black/open-sans-32-black.fnt" */
function fontPath(name: string) {
  const [, size, color] = name.split("_");
  const dir = `open-sans-${size}-${color!.toLowerCase()}`;
  return `fonts/open-sans/${dir}/${dir}.fnt`;
}

/** Fonts for `loadTTF`, by file name in public/fonts/vector/ */
const vectorFonts = ["OpenSans-Regular.ttf", "Inter-Regular.woff"];

function isVector(name: string) {
  return vectorFonts.includes(name);
}

type Font = Awaited<ReturnType<typeof loadFont>> | Awaited<ReturnType<typeof loadTTF>>;
const fontCache = new Map<string, Promise<Font>>();

function getFont(name: string) {
  let pending = fontCache.get(name);
  if (!pending) {
    pending = isVector(name) ? loadTTF(assetUrl(`fonts/vector/${name}`)) : loadFont(assetUrl(fontPath(name)));
    pending.catch(() => fontCache.delete(name));
    fontCache.set(name, pending);
  }
  return pending;
}

const texts = [
  "Hello, Jimp",
  "Jimp",
  "The quick brown fox jumps over the lazy dog",
  "First line\nSecond line",
  "Title\n\nA blank line above",
  "Café crème, 4,50 €",
  "こんにちは",
];

const alignX = ["LEFT", "CENTER", "RIGHT"] as const;
const alignY = ["TOP", "MIDDLE", "BOTTOM"] as const;

interface VectorOptions {
  font: string;
  size: number;
  color: string;
  outline: boolean;
  stroke: string;
  strokeWidth: number;
}

/** print's options for loadTTF fonts. Without them the font is a bitmap font. */
function vectorOptions({ font, size, color, outline, stroke, strokeWidth }: VectorOptions) {
  if (!isVector(font)) return {};
  return { size, color, ...(outline && { stroke, strokeWidth }) };
}

/* ---------- diff ---------- */

const edits = [
  { value: "square", label: "draw a square" },
  { value: "brightness", label: "brightness(1.3)" },
  { value: "blur", label: "blur(2)" },
  { value: "flip", label: "flip horizontally" },
];

const SQUARE = 60;
const DEFAULT_DIFF_COLOR = "#ff0000";

/** diff's options, leaving out the ones at their defaults */
function diffOptions(o: { threshold: number; diffMask: boolean; diffColor: string; alpha: number }) {
  return {
    threshold: o.threshold,
    ...(o.diffMask && { diffMask: true }),
    ...(o.diffColor !== DEFAULT_DIFF_COLOR && { diffColor: o.diffColor }),
    ...(!o.diffMask && o.alpha !== 0.1 && { alpha: o.alpha }),
  };
}

function editCode(edit: string, at: { x: number; y: number }) {
  switch (edit) {
    case "brightness":
      return "const edited = image.clone().brightness(1.3);";
    case "blur":
      return "const edited = image.clone().blur(2);";
    case "flip":
      return "const edited = image.clone().flip({ horizontal: true });";
    default:
      return [
        `const square = new Jimp(${js({ width: SQUARE, height: SQUARE, color: raw("0xff0000ff") })});`,
        `const edited = image.clone().composite(square, ${js(at.x)}, ${js(at.y)});`,
      ].join("\n");
  }
}

export default [
  defineOp({
    id: "print",
    label: "print",
    icon: "text",
    group: "text",
    description:
      "Draw text with a bitmap font or a TrueType font, aligned in a box from x, y to the image's edges. Turn on the text box to set its size and wrap lines.",
    controls: [
      { type: "select", key: "text", options: texts.map((t) => ({ value: t, label: t.replace(/\n/g, " ⏎ ") })) },
      {
        type: "select",
        key: "font",
        options: [
          ...fontNames,
          ...vectorFonts.map((name) => ({ value: name, label: `loadTTF("${name}")` })),
        ],
      },
      { type: "slider", key: "size", min: 8, max: 160, step: 1, unit: "px", when: (o) => isVector(o.font) },
      { type: "color", key: "color", when: (o) => isVector(o.font) },
      { type: "toggle", key: "outline", label: "stroke", when: (o) => isVector(o.font) },
      { type: "color", key: "stroke", when: (o) => isVector(o.font) && o.outline },
      {
        type: "slider",
        key: "strokeWidth",
        min: 0.5,
        max: 10,
        step: 0.5,
        unit: "px",
        when: (o) => isVector(o.font) && o.outline,
      },
      { type: "xy", key: "at", label: "x, y" },
      { type: "toggle", key: "box", label: "text box" },
      { type: "slider", key: "maxWidth", min: 20, max: 720, step: 2, unit: "px", when: (o) => o.box },
      { type: "slider", key: "maxHeight", min: 20, max: 720, step: 2, unit: "px", when: (o) => o.box },
      {
        type: "select",
        key: "alignmentX",
        options: alignX.map((a) => ({ value: a, label: `HorizontalAlign.${a}` })),
      },
      {
        type: "select",
        key: "alignmentY",
        options: alignY.map((a) => ({ value: a, label: `VerticalAlign.${a}` })),
      },
    ],
    defaults: ({ width, height }: ImageSize) => ({
      text: texts[0]!,
      font: "SANS_32_BLACK",
      at: { x: 20, y: 20 },
      box: true,
      maxWidth: Math.max(20, width - 40),
      maxHeight: Math.max(20, height - 40),
      alignmentX: "CENTER",
      alignmentY: "BOTTOM",
      size: 48,
      color: "#1d3557",
      outline: false,
      stroke: "#ffd166",
      strokeWidth: 2,
    }),
    apply: async (image, { text, font: fontName, at, box, maxWidth, maxHeight, alignmentX, alignmentY, ...vector }) => {
      const font = await getFont(fontName);
      const aligned = alignmentX !== "LEFT" || alignmentY !== "TOP";
      image.print({
        // The font is either kind, and vectorOptions only adds size and color for a loadTTF font
        ...({ font, ...vectorOptions({ font: fontName, ...vector }) } as { font: Awaited<ReturnType<typeof loadTTF>>; size: number }),
        x: at.x,
        y: at.y,
        text: aligned
          ? {
              text,
              alignmentX: HorizontalAlign[alignmentX as keyof typeof HorizontalAlign],
              alignmentY: VerticalAlign[alignmentY as keyof typeof VerticalAlign],
            }
          : text,
        // Without a box, the text is aligned within the image right of x and below y
        ...(box && { maxWidth, maxHeight }),
      });
    },
    code: ({ text, font, at, box, maxWidth, maxHeight, alignmentX, alignmentY, ...vector }) => {
      const load = isVector(font)
        ? `const font = await loadTTF(${js(`fonts/${font}`)});`
        : `const font = await loadFont(${font});`;
      // js() has no shorthand properties, so turn `font: font` into `font`
      const call = (options: string) => `image.print(${options.replace(/^\{ font: font,/, "{ font,")});`;
      const aligned = alignmentX !== "LEFT" || alignmentY !== "TOP";
      const options = js({
        font: raw("font"),
        x: at.x,
        y: at.y,
        text: aligned
          ? {
              text,
              alignmentX: raw(`HorizontalAlign.${alignmentX}`),
              alignmentY: raw(`VerticalAlign.${alignmentY}`),
            }
          : text,
        ...(box && { maxWidth, maxHeight }),
        ...vectorOptions({ font, ...vector }),
      });
      return `${load}\n${call(options)}`;
    },
    imports: ({ font, alignmentX, alignmentY }) => {
      const align = alignmentX !== "LEFT" || alignmentY !== "TOP" ? ["HorizontalAlign", "VerticalAlign"] : [];
      return isVector(font)
        ? { jimp: align, "jimp/load-ttf": ["loadTTF"] }
        : { jimp: ["loadFont", ...align], "jimp/fonts": [font] };
    },
    thumbnail: { text: "Jimp", font: "SANS_64_BLACK", alignmentY: "MIDDLE" },
  }),

  defineOp({
    id: "diff",
    label: "diff",
    icon: "compare",
    group: "compare",
    description:
      "Compare the image with an edited copy. Changed pixels are drawn in diffColor; the rest is a faded copy, or the original with diffMask.",
    controls: [
      { type: "select", key: "edit", label: "edit the copy", options: edits },
      { type: "xy", key: "at", label: "square at", when: (o) => o.edit === "square" },
      { type: "slider", key: "threshold", min: 0, max: 1, step: 0.05 },
      { type: "toggle", key: "diffMask" },
      { type: "color", key: "diffColor" },
      { type: "slider", key: "alpha", min: 0, max: 1, step: 0.05, when: (o) => !o.diffMask },
    ],
    defaults: ({ width, height }: ImageSize) => ({
      edit: "square",
      at: {
        x: Math.max(0, Math.round(width / 2 - SQUARE / 2)),
        y: Math.max(0, Math.round(height / 2 - SQUARE / 2)),
      },
      threshold: 0.1,
      diffMask: false,
      diffColor: DEFAULT_DIFF_COLOR,
      alpha: 0.1,
    }),
    apply: (image, { edit, at, threshold, diffMask, diffColor, alpha }, { Jimp }) => {
      const edited = image.clone();
      if (edit === "brightness") edited.brightness(1.3);
      else if (edit === "blur") edited.blur(2);
      else if (edit === "flip") edited.flip({ horizontal: true });
      else {
        const square = new Jimp({ width: SQUARE, height: SQUARE, color: 0xff0000ff });
        edited.composite(square, at.x, at.y);
      }
      image.composite(diff(image, edited, diffOptions({ threshold, diffMask, diffColor, alpha })).image);
    },
    code: ({ edit, at, threshold, diffMask, diffColor, alpha }) =>
      [
        editCode(edit, at),
        diffMask
          ? "// diff returns { percent, image }. Draw the changes over the original:"
          : "// diff returns { percent, image }. Draw the diff image over the original:",
        `image.composite(diff(image, edited, ${js(diffOptions({ threshold, diffMask, diffColor, alpha }))}).image);`,
      ].join("\n"),
    imports: () => ({ jimp: ["diff"] }),
  }),
];
