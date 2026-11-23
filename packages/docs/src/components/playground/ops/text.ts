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
 */
import { diff, HorizontalAlign, loadFont, VerticalAlign } from "jimp";
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

type Font = Awaited<ReturnType<typeof loadFont>>;
const fontCache = new Map<string, Promise<Font>>();

function getFont(name: string) {
  let pending = fontCache.get(name);
  if (!pending) {
    pending = loadFont(assetUrl(fontPath(name)));
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
  "Café crème, 4,50 €",
  "こんにちは",
];

const alignX = ["LEFT", "CENTER", "RIGHT"] as const;
const alignY = ["TOP", "MIDDLE", "BOTTOM"] as const;

/* ---------- diff ---------- */

const edits = [
  { value: "square", label: "draw a square" },
  { value: "brightness", label: "brightness(1.3)" },
  { value: "blur", label: "blur(2)" },
  { value: "flip", label: "flip horizontally" },
];

const SQUARE = 60;

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
      "Draw text with a bitmap font. Turn on the text box to wrap lines and align them.",
    controls: [
      { type: "select", key: "text", options: texts.map((t) => ({ value: t, label: t.replace("\n", " ⏎ ") })) },
      { type: "select", key: "font", options: [...fontNames] },
      { type: "xy", key: "at", label: "x, y" },
      { type: "toggle", key: "box", label: "text box" },
      { type: "slider", key: "maxWidth", min: 20, max: 720, step: 2, unit: "px", when: (o) => o.box },
      { type: "slider", key: "maxHeight", min: 20, max: 720, step: 2, unit: "px", when: (o) => o.box },
      {
        type: "select",
        key: "alignmentX",
        options: alignX.map((a) => ({ value: a, label: `HorizontalAlign.${a}` })),
        when: (o) => o.box,
      },
      {
        type: "select",
        key: "alignmentY",
        options: alignY.map((a) => ({ value: a, label: `VerticalAlign.${a}` })),
        when: (o) => o.box,
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
    }),
    apply: async (image, { text, font: fontName, at, box, maxWidth, maxHeight, alignmentX, alignmentY }) => {
      const font = await getFont(fontName);
      if (!box) {
        image.print({ font, x: at.x, y: at.y, text });
        return;
      }
      image.print({
        font,
        x: at.x,
        y: at.y,
        text: {
          text,
          alignmentX: HorizontalAlign[alignmentX as keyof typeof HorizontalAlign],
          alignmentY: VerticalAlign[alignmentY as keyof typeof VerticalAlign],
        },
        maxWidth,
        maxHeight,
      });
    },
    code: ({ text, font, at, box, maxWidth, maxHeight, alignmentX, alignmentY }) => {
      const load = `const font = await loadFont(${font});`;
      // js() has no shorthand properties, so turn `font: font` into `font`
      const call = (options: string) => `image.print(${options.replace(/^\{ font: font,/, "{ font,")});`;
      if (!box) {
        return `${load}\n${call(js({ font: raw("font"), x: at.x, y: at.y, text }))}`;
      }
      const options = js({
        font: raw("font"),
        x: at.x,
        y: at.y,
        text: {
          text,
          alignmentX: raw(`HorizontalAlign.${alignmentX}`),
          alignmentY: raw(`VerticalAlign.${alignmentY}`),
        },
        maxWidth,
        maxHeight,
      });
      return `${load}\n${call(options)}`;
    },
    imports: ({ font, box }) => ({
      jimp: box ? ["loadFont", "HorizontalAlign", "VerticalAlign"] : ["loadFont"],
      "jimp/fonts": [font],
    }),
    thumbnail: { text: "Jimp", font: "SANS_64_BLACK", alignmentY: "MIDDLE" },
  }),

  defineOp({
    id: "diff",
    label: "diff",
    icon: "compare",
    group: "compare",
    description:
      "Compare the image with an edited copy. Changed pixels are red; the rest is a faded copy.",
    controls: [
      { type: "select", key: "edit", label: "edit the copy", options: edits },
      { type: "xy", key: "at", label: "square at", when: (o) => o.edit === "square" },
      { type: "slider", key: "threshold", min: 0, max: 1, step: 0.05 },
    ],
    defaults: ({ width, height }: ImageSize) => ({
      edit: "square",
      at: {
        x: Math.max(0, Math.round(width / 2 - SQUARE / 2)),
        y: Math.max(0, Math.round(height / 2 - SQUARE / 2)),
      },
      threshold: 0.1,
    }),
    apply: (image, { edit, at, threshold }, { Jimp }) => {
      const edited = image.clone();
      if (edit === "brightness") edited.brightness(1.3);
      else if (edit === "blur") edited.blur(2);
      else if (edit === "flip") edited.flip({ horizontal: true });
      else {
        const square = new Jimp({ width: SQUARE, height: SQUARE, color: 0xff0000ff });
        edited.composite(square, at.x, at.y);
      }
      image.composite(diff(image, edited, threshold).image);
    },
    code: ({ edit, at, threshold }) =>
      [
        editCode(edit, at),
        "// diff returns { percent, image }. Draw the diff image over the original:",
        `image.composite(diff(image, edited, ${js(threshold)}).image);`,
      ].join("\n"),
    imports: () => ({ jimp: ["diff"] }),
  }),
];
