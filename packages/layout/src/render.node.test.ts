import { beforeAll, describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import "@jimp/test-utils/image-snapshot";
import { getTestImagePath } from "@jimp/test-utils";
import png from "@jimp/js-png";
import { SANS_16_BLACK } from "@jimp/plugin-print/fonts";
import { loadFont } from "@jimp/plugin-print/load-font";
import { loadTTF } from "@jimp/plugin-print/load-ttf";
import type { VectorFont } from "@jimp/plugin-print";
import path from "path";
import { fileURLToPath } from "url";

import { layout, render, type LayoutNode } from "./index.js";
import { card, cardJsx } from "../test/card.js";

const Jimp = createJimp({ formats: [png] });

const fixtures = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures",
);

let regular: VectorFont;
let bold: VectorFont;

beforeAll(async () => {
  regular = await loadTTF(path.join(fixtures, "Inter-Regular.otf"));
  bold = await loadTTF(path.join(fixtures, "Inter-Bold.otf"));
});

async function snapshot(image: InstanceType<typeof Jimp>) {
  expect(await image.getBuffer("image/png")).toMatchImageSnapshot();
}

describe("render", () => {
  test("an Open Graph card", async () => {
    const tree = card({ regular, bold });
    const image = await render(tree, { Jimp, width: 600, height: 315 });
    const result = await layout(tree, { width: 600, height: 315 });

    // The title is cut short at two lines
    expect(result.children[1]!.children[0]!.text).toMatch(/…$/);
    await snapshot(image);
  });

  test("a card written with JSX is the same", async () => {
    const options = { Jimp, width: 600, height: 315 };
    const fromJsx = await render(cardJsx({ regular, bold }), options);
    const fromObjects = await render(card({ regular, bold }), options);

    expect(fromJsx.bitmap.data).toStrictEqual(fromObjects.bitmap.data);
  });

  test("box styles", async () => {
    const dice = await Jimp.read(getTestImagePath("dice.png"));
    const cell = (props: Partial<LayoutNode>): LayoutNode =>
      ({ type: "box", width: 100, height: 80, ...props }) as LayoutNode;
    const image = await render(
      {
        type: "box",
        direction: "row",
        padding: 30,
        gap: 30,
        align: "start",
        background: "#f4f1ea",
        children: [
          // A card with a CSS border and a soft shadow
          cell({
            radius: 16,
            background: "white",
            borderWidth: 3,
            borderColor: "#1b1840",
            shadow: { y: 6, blur: 12, color: "rgba(27, 24, 64, 0.4)" },
          }),
          // Different corners and two shadows, the first on top
          cell({
            radius: { topLeft: 30, bottomRight: 30 },
            background: { type: "radial", stops: ["#ffd83a", "#ff5fb0"] },
            shadow: [
              { x: -6, y: -6, blur: 0, color: "#3fe0b5" },
              { x: 8, y: 8, blur: 0, spread: 2, color: "#5cc8ff" },
            ],
          }),
          // Half transparent, with a child
          cell({
            opacity: 0.5,
            padding: 10,
            radius: 8,
            background: "#1b1840",
            children: [{ type: "box", grow: 1, background: "#ff5fb0" }],
          }),
          // A rounded clip around an image bigger than the box
          cell({
            radius: 40,
            overflow: "hidden",
            borderWidth: 4,
            borderColor: "#ff5fb0",
            children: [{ type: "image", src: dice, width: 160, shrink: 0 }],
          }),
        ],
      },
      { Jimp },
    );

    await snapshot(image);
  });

  test("image fit", async () => {
    const dice = await Jimp.read(getTestImagePath("dice.png"));
    const image = await render(
      {
        type: "box",
        direction: "row",
        padding: 10,
        gap: 10,
        background: "#d9d6ea",
        children: (["fill", "cover", "contain"] as const).map((fit) => ({
          type: "image",
          src: dice,
          fit,
          width: 60,
          height: 90,
          background: "#1b1840",
        })),
      },
      { Jimp },
    );

    await snapshot(image);
  });

  test("image objectPosition", async () => {
    const dice = await Jimp.read(getTestImagePath("dice.png"));
    const positions = [undefined, { x: 0 }, "entropy", "attention"] as const;
    const image = await render(
      {
        type: "box",
        direction: "row",
        padding: 10,
        gap: 10,
        background: "#d9d6ea",
        children: [
          ...positions.map((objectPosition) => ({
            type: "image" as const,
            src: dice,
            fit: "cover" as const,
            objectPosition,
            width: 40,
            height: 90,
          })),
          {
            type: "image",
            src: dice,
            fit: "contain",
            objectPosition: { y: 0 },
            width: 60,
            height: 90,
            background: "#1b1840",
          },
        ],
      },
      { Jimp },
    );

    await snapshot(image);
  });

  test("an avatar: a rounded image with a border", async () => {
    const dice = await Jimp.read(getTestImagePath("dice.png"));
    const image = await render(
      {
        type: "image",
        src: dice,
        fit: "cover",
        width: 80,
        height: 80,
        radius: 40,
        borderWidth: 4,
        borderColor: "#ffd83a",
        background: "#ffd83a",
      },
      { Jimp },
    );

    await snapshot(image);
  });

  test("text alignment, wrapping and inherited styles", async () => {
    const paragraph =
      "Text wraps to fit its box and inherits its font and color.";
    const image = await render(
      {
        type: "box",
        direction: "row",
        padding: 16,
        gap: 16,
        background: "white",
        font: regular,
        fontSize: 14,
        color: "#1b1840",
        children: (["left", "center", "right"] as const).map((textAlign) => ({
          type: "box",
          grow: 1,
          padding: 8,
          gap: 4,
          textAlign,
          background: "#f4f1ea",
          children: [
            { type: "text", text: textAlign, font: bold, color: "#ff5fb0" },
            { type: "text", text: paragraph },
            {
              type: "text",
              text: paragraph,
              maxLines: 2,
              letterSpacing: 1,
              color: {
                type: "linear",
                angle: 90,
                stops: ["#3a2d7a", "#22c76b"],
              },
            },
          ],
        })),
      },
      { Jimp, width: 480 },
    );

    await snapshot(image);
  });

  test("wrapped tags and an aspect ratio", async () => {
    const dice = await Jimp.read(getTestImagePath("dice.png"));
    const tags = [
      "layout",
      "flexbox",
      "open graph",
      "typescript",
      "no wasm",
      "jimp",
      "cards",
    ];
    const image = await render(
      {
        type: "box",
        direction: "row",
        padding: 16,
        gap: 16,
        align: "start",
        background: "#f4f1ea",
        font: bold,
        fontSize: 14,
        children: [
          {
            type: "image",
            src: dice,
            fit: "cover",
            width: 96,
            aspectRatio: 1,
            radius: 12,
          },
          {
            type: "box",
            grow: 1,
            direction: "row",
            wrap: true,
            gap: 8,
            children: tags.map((tag) => ({
              type: "text",
              text: tag,
              padding: [4, 10],
              radius: 999,
              background: "#3a2d7a",
              color: "white",
            })),
          },
        ],
      },
      { Jimp, width: 360 },
    );

    await snapshot(image);
  });

  test("bitmap fonts", async () => {
    const font = await loadFont(SANS_16_BLACK);
    const image = await render(
      {
        type: "box",
        padding: 10,
        gap: 6,
        font,
        background: "white",
        children: [
          { type: "text", text: "Bitmap fonts work too" },
          {
            type: "text",
            text: "They wrap and align like any other font, and cut long text short.",
            textAlign: "center",
            maxLines: 2,
            padding: 6,
            background: "#ffd83a",
            radius: 6,
          },
        ],
      },
      { Jimp, width: 220 },
    );

    await snapshot(image);
  });
});
