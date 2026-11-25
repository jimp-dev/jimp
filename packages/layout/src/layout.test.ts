import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import type { BmFont } from "@jimp/plugin-print";

import { distribute } from "./layout.js";
import {
  Box,
  Image,
  layout,
  render,
  Text,
  type ComputedLayout,
  type LayoutNode,
} from "./index.js";

const Jimp = createJimp();

/**
 * A monospace bitmap font with no glyph images: every printable ASCII
 * character is 10px wide and lines are 20px high, so text is easy to measure
 */
const mono: BmFont = {
  chars: Object.fromEntries(
    Array.from({ length: 95 }, (_, i) => [
      String.fromCharCode(32 + i),
      {
        id: 32 + i,
        xadvance: 10,
        width: 0,
        height: 0,
        xoffset: 0,
        yoffset: 0,
        page: 0,
        x: 0,
        y: 0,
      },
    ]),
  ),
  kernings: {},
  common: { lineHeight: 20 },
  info: {},
  pages: [],
};

/** The x, y, width and height of each node, and the same for its children */
function boxes(result: ComputedLayout): unknown {
  const { x, y, width, height, children } = result;

  return children.length > 0
    ? { x, y, width, height, children: children.map(boxes) }
    : { x, y, width, height };
}

/** The boxes of the root's children */
async function childBoxes(tree: LayoutNode, width = 200, height = 100) {
  const result = await layout(tree, { width, height });

  return result.children.map(boxes);
}

const block = (props: Partial<LayoutNode> = {}): LayoutNode =>
  ({ type: "box", ...props }) as LayoutNode;

describe("sizing", () => {
  test("the root fills the image", async () => {
    const result = await layout(block(), { width: 300, height: 200 });

    expect(boxes(result)).toStrictEqual({
      x: 0,
      y: 0,
      width: 300,
      height: 200,
    });
  });

  test("the root's margin is kept inside the image", async () => {
    const result = await layout(block({ margin: [10, 20] }), {
      width: 300,
      height: 200,
    });

    expect(boxes(result)).toStrictEqual({
      x: 20,
      y: 10,
      width: 260,
      height: 180,
    });
  });

  test("without a size the image is the size of the tree", async () => {
    const tree = block({
      padding: 5,
      children: [block({ width: 40, height: 30 })],
    });
    const result = await layout(tree);
    const image = await render(tree, { Jimp });

    expect(boxes(result)).toStrictEqual({
      x: 0,
      y: 0,
      width: 50,
      height: 40,
      children: [{ x: 5, y: 5, width: 40, height: 30 }],
    });
    expect(image.width).toBe(50);
    expect(image.height).toBe(40);
  });

  test("an auto root hugs its content in a fixed size image", async () => {
    const result = await layout(
      block({ width: "auto", height: "auto", padding: 10 }),
      { width: 300, height: 200 },
    );

    expect(boxes(result)).toStrictEqual({
      x: 0,
      y: 0,
      width: 20,
      height: 20,
    });
  });

  test("percentages are of the parent's content box", async () => {
    expect(
      await childBoxes(
        block({
          padding: 10,
          direction: "row",
          children: [block({ width: "25%", height: "50%" })],
        }),
      ),
    ).toStrictEqual([{ x: 10, y: 10, width: 45, height: 40 }]);
  });

  test("min and max sizes win over the size", async () => {
    expect(
      await childBoxes(
        block({
          direction: "row",
          align: "start",
          children: [
            block({ width: 10, minWidth: 30, height: 10 }),
            block({ width: 100, maxWidth: 50, height: 300, maxHeight: "50%" }),
          ],
        }),
      ),
    ).toStrictEqual([
      { x: 0, y: 0, width: 30, height: 10 },
      { x: 30, y: 0, width: 50, height: 50 },
    ]);
  });

  test("a box is never smaller than its padding and border", async () => {
    expect(
      await childBoxes(
        block({
          direction: "row",
          align: "start",
          children: [
            block({ width: 4, height: 4, padding: 5, borderWidth: 2 }),
          ],
        }),
      ),
    ).toStrictEqual([{ x: 0, y: 0, width: 14, height: 14 }]);
  });
});

describe("columns and rows", () => {
  test("a column stacks its children and stretches them across", async () => {
    expect(
      await childBoxes(
        block({
          padding: 10,
          gap: 5,
          children: [block({ height: 20 }), block({ height: 30 })],
        }),
      ),
    ).toStrictEqual([
      { x: 10, y: 10, width: 180, height: 20 },
      { x: 10, y: 35, width: 180, height: 30 },
    ]);
  });

  test("a row puts its children side by side and stretches them down", async () => {
    expect(
      await childBoxes(
        block({
          direction: "row",
          padding: [10, 20],
          gap: 5,
          children: [block({ width: 20 }), block({ width: 30 })],
        }),
      ),
    ).toStrictEqual([
      { x: 20, y: 10, width: 20, height: 80 },
      { x: 45, y: 10, width: 30, height: 80 },
    ]);
  });

  test("margins push children apart and in from the edges", async () => {
    expect(
      await childBoxes(
        block({
          direction: "row",
          children: [
            block({ width: 20, margin: [5, 10] }),
            block({ width: 20, margin: [0, 0, 10, 5] }),
          ],
        }),
      ),
    ).toStrictEqual([
      { x: 10, y: 5, width: 20, height: 90 },
      { x: 45, y: 0, width: 20, height: 90 },
    ]);
  });

  test("an auto-sized box hugs its children", async () => {
    const result = await layout(
      block({
        direction: "row",
        align: "start",
        children: [
          block({
            direction: "row",
            padding: 4,
            gap: 2,
            children: [
              block({ width: 10, height: 10 }),
              block({ width: 20, height: 16 }),
            ],
          }),
        ],
      }),
      { width: 200, height: 100 },
    );

    expect(boxes(result.children[0]!)).toStrictEqual({
      x: 0,
      y: 0,
      width: 40,
      height: 24,
      children: [
        { x: 4, y: 4, width: 10, height: 10 },
        { x: 16, y: 4, width: 20, height: 16 },
      ],
    });
  });

  test("nested boxes are positioned on the image, not their parent", async () => {
    const result = await layout(
      block({
        padding: 10,
        children: [block({ padding: 7, children: [block({ height: 5 })] })],
      }),
      { width: 100, height: 100 },
    );

    expect(boxes(result.children[0]!.children[0]!)).toStrictEqual({
      x: 17,
      y: 17,
      width: 66,
      height: 5,
    });
  });
});

describe("justify", () => {
  const row = (justify: string, count = 3) =>
    childBoxes(
      block({
        direction: "row",
        justify,
        children: Array.from({ length: count }, () =>
          block({ width: 20, height: 10 }),
        ),
      } as Partial<LayoutNode>),
      200,
      10,
    ).then((result) => result.map((box) => (box as { x: number }).x));

  test.each([
    ["start", [0, 20, 40]],
    ["center", [70, 90, 110]],
    ["end", [140, 160, 180]],
    ["space-between", [0, 90, 180]],
    ["space-around", [23, 90, 157]],
    ["space-evenly", [35, 90, 145]],
  ])("%s", async (justify, xs) => {
    expect(await row(justify)).toStrictEqual(xs);
  });

  test("space-between with one child puts it at the start", async () => {
    expect(await row("space-between", 1)).toStrictEqual([0]);
  });

  test("children that don't fit overflow on both sides when centered", async () => {
    expect(
      await childBoxes(
        block({
          direction: "row",
          justify: "center",
          children: [block({ width: 300, height: 10, shrink: 0 })],
        }),
      ),
    ).toStrictEqual([{ x: -50, y: 0, width: 300, height: 10 }]);
  });
});

describe("align", () => {
  const column = (align: string, alignSelf?: "start" | "center" | "end") =>
    childBoxes(
      block({
        align,
        children: [block({ width: 50, height: 10, alignSelf })],
      } as Partial<LayoutNode>),
    );

  test.each([
    ["start", 0],
    ["center", 75],
    ["end", 150],
  ])("%s", async (align, x) => {
    expect(await column(align)).toStrictEqual([
      { x, y: 0, width: 50, height: 10 },
    ]);
  });

  test("stretch doesn't change a set size", async () => {
    expect(await column("stretch")).toStrictEqual([
      { x: 0, y: 0, width: 50, height: 10 },
    ]);
  });

  test("alignSelf overrides the parent's align", async () => {
    expect(await column("start", "end")).toStrictEqual([
      { x: 150, y: 0, width: 50, height: 10 },
    ]);
  });

  test("end and center leave room for the margins", async () => {
    expect(
      await childBoxes(
        block({
          align: "end",
          children: [block({ width: 50, height: 10, margin: [0, 10] })],
        }),
      ),
    ).toStrictEqual([{ x: 140, y: 0, width: 50, height: 10 }]);
  });
});

describe("grow and shrink", () => {
  test("grow shares out the spare space", async () => {
    expect(
      await childBoxes(
        block({
          direction: "row",
          gap: 10,
          children: [
            block({ width: 20 }),
            block({ grow: 1 }),
            block({ width: 30, grow: 2 }),
          ],
        }),
      ),
    ).toStrictEqual([
      { x: 0, y: 0, width: 20, height: 100 },
      { x: 30, y: 0, width: 43, height: 100 },
      { x: 83, y: 0, width: 117, height: 100 },
    ]);
  });

  test("a child that hits its max gives the rest to the others", async () => {
    expect(
      await childBoxes(
        block({
          direction: "row",
          children: [block({ grow: 1, maxWidth: 50 }), block({ grow: 1 })],
        }),
      ),
    ).toStrictEqual([
      { x: 0, y: 0, width: 50, height: 100 },
      { x: 50, y: 0, width: 150, height: 100 },
    ]);
  });

  test("shrink takes space from bigger children first", async () => {
    expect(
      await childBoxes(
        block({
          direction: "row",
          children: [block({ width: 100 }), block({ width: 200 })],
        }),
      ),
    ).toStrictEqual([
      { x: 0, y: 0, width: 67, height: 100 },
      { x: 67, y: 0, width: 133, height: 100 },
    ]);
  });

  test("shrink: 0 keeps a child's size", async () => {
    expect(
      await childBoxes(
        block({
          direction: "row",
          children: [block({ width: 150, shrink: 0 }), block({ width: 150 })],
        }),
      ),
    ).toStrictEqual([
      { x: 0, y: 0, width: 150, height: 100 },
      { x: 150, y: 0, width: 50, height: 100 },
    ]);
  });

  test("distribute freezes items at their limits", () => {
    const item = { basis: 0, grow: 1, shrink: 1, min: 0, max: Infinity };

    expect(
      distribute([{ ...item, max: 10 }, { ...item, min: 80 }, item], 120),
    ).toStrictEqual([10, 80, 30]);
  });
});

describe("minimum sizes", () => {
  const text = (content: string, props: object = {}): LayoutNode => ({
    type: "text",
    text: content,
    font: mono,
    ...props,
  });

  test("text doesn't shrink narrower than its longest word", async () => {
    expect(
      await childBoxes(
        block({
          direction: "row",
          align: "start",
          children: [block({ width: 150 }), text("one three")],
        }),
      ),
    ).toStrictEqual([
      // Both shrink, by their size
      { x: 0, y: 0, width: 125, height: 0 },
      { x: 125, y: 0, width: 75, height: 40 },
    ]);
    expect(
      await childBoxes(
        block({
          direction: "row",
          align: "start",
          children: [block({ width: 160, shrink: 0 }), text("one three")],
        }),
      ),
    ).toStrictEqual([
      { x: 0, y: 0, width: 160, height: 0 },
      // "three" is 50 wide
      { x: 160, y: 0, width: 50, height: 40 },
    ]);
  });

  test("text that can't fit overflows rather than breaking words", async () => {
    expect(
      await childBoxes(
        block({
          direction: "row",
          align: "start",
          children: [block({ width: 190, shrink: 0 }), text("one three")],
        }),
      ),
    ).toStrictEqual([
      { x: 0, y: 0, width: 190, height: 0 },
      { x: 190, y: 0, width: 50, height: 40 },
    ]);
  });

  test("minWidth: 0 lets text shrink and break words", async () => {
    expect(
      (
        await childBoxes(
          block({
            direction: "row",
            align: "start",
            children: [
              block({ width: 180, shrink: 0 }),
              text("one three", { minWidth: 0 }),
            ],
          }),
        )
      )[1],
    ).toStrictEqual({ x: 180, y: 0, width: 20, height: 100 });
  });

  test("a box doesn't shrink narrower than what's in it", async () => {
    const chip = block({ padding: 5, children: [text("tag")] });

    expect(
      await childBoxes(
        block({
          direction: "row",
          align: "start",
          children: [block({ width: 300 }), chip, chip],
        }),
      ),
    ).toStrictEqual([
      { x: 0, y: 0, width: 120, height: 0 },
      {
        x: 120,
        y: 0,
        width: 40,
        height: 30,
        children: [{ x: 125, y: 5, width: 30, height: 20 }],
      },
      {
        x: 160,
        y: 0,
        width: 40,
        height: 30,
        children: [{ x: 165, y: 5, width: 30, height: 20 }],
      },
    ]);
  });

  test("a box with overflow: hidden can shrink, clipping its content", async () => {
    expect(
      (
        await childBoxes(
          block({
            direction: "row",
            align: "start",
            children: [
              block({ width: 180, shrink: 0 }),
              block({ overflow: "hidden", children: [text("three")] }),
            ],
          }),
        )
      )[1],
    ).toMatchObject({ x: 180, y: 0, width: 20 });
  });

  test("children of a column don't shrink shorter than their content", async () => {
    expect(
      await childBoxes(
        block({
          children: [block({ height: 80 }), text("one two three four")],
        }),
        100,
        100,
      ),
    ).toStrictEqual([
      { x: 0, y: 0, width: 100, height: 60 },
      { x: 0, y: 60, width: 100, height: 40 },
    ]);
  });
});

describe("aspectRatio", () => {
  test("gives the height from the width", async () => {
    expect(
      await childBoxes(block({ children: [block({ aspectRatio: 4 })] })),
    ).toStrictEqual([{ x: 0, y: 0, width: 200, height: 50 }]);
  });

  test("gives the width from the height, e.g. when a row stretches it", async () => {
    expect(
      await childBoxes(
        block({ direction: "row", children: [block({ aspectRatio: 0.5 })] }),
      ),
    ).toStrictEqual([{ x: 0, y: 0, width: 50, height: 100 }]);
  });

  test("sizes a box from its content's width", async () => {
    expect(
      await childBoxes(
        block({
          align: "start",
          children: [
            block({ aspectRatio: 2, children: [block({ width: 60 })] }),
          ],
        }),
      ),
    ).toStrictEqual([
      {
        x: 0,
        y: 0,
        width: 60,
        height: 30,
        children: [{ x: 0, y: 0, width: 60, height: 0 }],
      },
    ]);
  });

  test("throws for a ratio that isn't positive", async () => {
    await expect(
      layout(block({ aspectRatio: 0 }), { width: 10, height: 10 }),
    ).rejects.toThrow();
  });
});

describe("wrap", () => {
  const tile = (props: Partial<LayoutNode> = {}) =>
    block({ width: 50, height: 20, ...props });

  test("starts a new line when a child doesn't fit", async () => {
    const result = await layout(
      block({
        direction: "row",
        wrap: true,
        gap: 10,
        children: Array.from({ length: 5 }, () => tile()),
      }),
      { width: 200, height: 100 },
    );

    expect(result.children.map((child) => [child.x, child.y])).toStrictEqual([
      [0, 0],
      [60, 0],
      [120, 0],
      [0, 30],
      [60, 30],
    ]);
  });

  test("an auto-sized box is as tall as its lines", async () => {
    expect(
      (
        await childBoxes(
          block({
            children: [
              block({
                direction: "row",
                wrap: true,
                gap: 10,
                children: [tile(), tile({ height: 30 }), tile(), tile()],
              }),
            ],
          }),
          180,
          200,
        )
      )[0],
    ).toMatchObject({ y: 0, width: 180, height: 60 });
  });

  test("lines are justified and stretched on their own", async () => {
    const result = await layout(
      block({
        direction: "row",
        wrap: true,
        justify: "center",
        align: "stretch",
        children: [
          tile({ width: 80 }),
          tile({ width: 80, height: 40 }),
          tile({ width: 80, height: "auto" }),
        ],
      }),
      { width: 200, height: 200 },
    );

    expect(result.children.map(boxes)).toStrictEqual([
      { x: 20, y: 0, width: 80, height: 20 },
      { x: 100, y: 0, width: 80, height: 40 },
      // Alone on its line, centered, and as tall as the line
      { x: 60, y: 40, width: 80, height: 0 },
    ]);
  });

  test("children grow to fill their own line", async () => {
    const result = await layout(
      block({
        direction: "row",
        wrap: true,
        children: [
          tile({ width: 120, grow: 1 }),
          tile({ width: 120, grow: 1 }),
        ],
      }),
      { width: 200, height: 100 },
    );

    expect(result.children.map(boxes)).toStrictEqual([
      { x: 0, y: 0, width: 200, height: 20 },
      { x: 0, y: 20, width: 200, height: 20 },
    ]);
  });

  test("wraps a column into more columns", async () => {
    const result = await layout(
      block({
        wrap: true,
        align: "start",
        children: [tile(), tile(), tile()],
      }),
      { width: 200, height: 50 },
    );

    expect(result.children.map((child) => [child.x, child.y])).toStrictEqual([
      [0, 0],
      [0, 20],
      [50, 0],
    ]);
  });

  test("text wraps inside a wrapped line", async () => {
    const result = await layout(
      block({
        direction: "row",
        wrap: true,
        gap: 10,
        children: [
          { type: "text", text: "alpha", font: mono },
          { type: "text", text: "beta", font: mono },
          { type: "text", text: "gamma", font: mono },
        ],
      }),
      { width: 120, height: 100 },
    );

    expect(result.children.map(boxes)).toStrictEqual([
      { x: 0, y: 0, width: 50, height: 20 },
      { x: 60, y: 0, width: 40, height: 20 },
      { x: 0, y: 30, width: 50, height: 20 },
    ]);
  });
});

describe("absolute positioning", () => {
  test("places children in the padding box", async () => {
    const result = await layout(
      block({
        padding: 20,
        borderWidth: 5,
        children: [
          block({ height: 10 }),
          block({
            position: "absolute",
            top: 0,
            right: 10,
            width: 30,
            height: 30,
          }),
          block({ position: "absolute", left: "50%", bottom: 0, width: 10 }),
          block({ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }),
        ],
      }),
      { width: 200, height: 100 },
    );

    expect(result.children.map(boxes)).toStrictEqual([
      { x: 25, y: 25, width: 150, height: 10 },
      { x: 155, y: 5, width: 30, height: 30 },
      { x: 100, y: 95, width: 10, height: 0 },
      { x: 5, y: 5, width: 190, height: 90 },
    ]);
  });

  test("without insets, a child stays where it would have started", async () => {
    expect(
      await childBoxes(
        block({
          padding: 15,
          children: [block({ position: "absolute", width: 10, height: 10 })],
        }),
      ),
    ).toStrictEqual([{ x: 15, y: 15, width: 10, height: 10 }]);
  });
});

describe("text", () => {
  const text = (content: string, props: object = {}): LayoutNode => ({
    type: "text",
    text: content,
    font: mono,
    ...props,
  });

  test("is as wide as its text, and as high as its lines", async () => {
    expect(
      await childBoxes(
        block({
          direction: "row",
          align: "start",
          children: [text("hello"), text("a\nbc")],
        }),
      ),
    ).toStrictEqual([
      { x: 0, y: 0, width: 50, height: 20 },
      { x: 50, y: 0, width: 20, height: 40 },
    ]);
  });

  test("wraps at the width of a column", async () => {
    const result = await layout(
      block({ padding: 10, children: [text("one two three four five")] }),
      { width: 120, height: 200 },
    );

    expect(boxes(result.children[0]!)).toStrictEqual({
      x: 10,
      y: 10,
      width: 100,
      height: 60,
    });
  });

  test("wraps when a row shrinks it", async () => {
    expect(
      await childBoxes(
        block({
          direction: "row",
          align: "start",
          children: [block({ width: 100, shrink: 0 }), text("one two three")],
        }),
        180,
      ),
    ).toStrictEqual([
      { x: 0, y: 0, width: 100, height: 0 },
      { x: 100, y: 0, width: 80, height: 40 },
    ]);
  });

  test("maxLines cuts the text short with an ellipsis", async () => {
    const result = await layout(
      block({ children: [text("one two three four five", { maxLines: 2 })] }),
      { width: 100, height: 200 },
    );

    expect(result.children[0]!.height).toBe(40);
    expect(result.children[0]!.text).toBe("one two three f...");
  });

  test("maxLines leaves text that fits alone", async () => {
    const result = await layout(
      block({ children: [text("one two", { maxLines: 1 })] }),
      { width: 100, height: 200 },
    );

    expect(result.children[0]!.text).toBe("one two");
  });

  test("inherits its font from the boxes around it", async () => {
    const result = await layout(
      block({
        font: mono,
        children: [block({ children: [{ type: "text", text: "hi" }] })],
      }),
      { width: 100, height: 100 },
    );

    expect(result.children[0]!.children[0]!.height).toBe(20);
  });

  test("throws without a font", async () => {
    await expect(
      layout({ type: "text", text: "hi" }, { width: 10, height: 10 }),
    ).rejects.toThrow("layout: text needs a font");
  });

  test("throws for props bitmap fonts can't use", async () => {
    await expect(
      layout(text("hi", { color: "red", fontSize: 12 }), {
        width: 10,
        height: 10,
      }),
    ).rejects.toThrow(
      "layout: fontSize, color can only be used with fonts loaded with loadTTF",
    );
  });

  test("ignores inherited props bitmap fonts can't use", async () => {
    await expect(
      layout(block({ color: "red", children: [text("hi")] }), {
        width: 10,
        height: 10,
      }),
    ).resolves.toBeDefined();
  });
});

describe("images", () => {
  const picture = new Jimp({ width: 40, height: 20, color: 0xff0000ff });

  test("are their natural size, or keep their aspect ratio", async () => {
    expect(
      await childBoxes(
        block({
          direction: "row",
          align: "start",
          children: [
            { type: "image", src: picture },
            { type: "image", src: picture, width: 20 },
            { type: "image", src: picture, height: 30 },
          ],
        }),
      ),
    ).toStrictEqual([
      { x: 0, y: 0, width: 40, height: 20 },
      { x: 40, y: 0, width: 20, height: 10 },
      { x: 60, y: 0, width: 60, height: 30 },
    ]);
  });

  test("don't shrink smaller than their size unless you let them", async () => {
    const row = (minWidth?: number) =>
      childBoxes(
        block({
          direction: "row",
          align: "start",
          children: [
            { type: "image", src: picture, width: 40, height: 20, minWidth },
            block({ width: 200, height: 10 }),
          ],
        }),
      );

    expect(await row()).toStrictEqual([
      { x: 0, y: 0, width: 40, height: 20 },
      { x: 40, y: 0, width: 160, height: 10 },
    ]);
    expect((await row(0))[0]).toStrictEqual({
      x: 0,
      y: 0,
      width: 33,
      height: 20,
    });
  });

  test("aspectRatio overrides the image's own", async () => {
    expect(
      await childBoxes(
        block({
          align: "start",
          children: [
            { type: "image", src: picture, width: 30, aspectRatio: 1 },
          ],
        }),
      ),
    ).toStrictEqual([{ x: 0, y: 0, width: 30, height: 30 }]);
  });

  test("stretch across a column, keeping their aspect ratio", async () => {
    expect(
      await childBoxes(block({ children: [{ type: "image", src: picture }] })),
    ).toStrictEqual([{ x: 0, y: 0, width: 200, height: 100 }]);
  });

  test("are read with the Jimp class", async () => {
    const reads: unknown[] = [];
    const result = await layout(
      { type: "image", src: "picture.png", width: "auto", height: "auto" },
      {
        width: 100,
        height: 100,
        Jimp: {
          read: async (src) => {
            reads.push(src);
            return picture;
          },
        },
      },
    );

    expect(reads).toStrictEqual(["picture.png"]);
    expect(result.width).toBe(40);
  });

  test("throw for a path without a Jimp class to read it", async () => {
    await expect(
      layout({ type: "image", src: "picture.png" }, { width: 10, height: 10 }),
    ).rejects.toThrow("pass a Jimp class with a `read` method");
  });
});

describe("validation", () => {
  test("throws for unknown props", async () => {
    await expect(
      layout(
        // @ts-expect-error testing an invalid prop
        { type: "box", justifyContent: "center" },
        { width: 10, height: 10 },
      ),
    ).rejects.toThrow("justifyContent");
  });

  test("throws for invalid values deep in the tree", async () => {
    await expect(
      layout(
        block({
          children: [block({ children: [block({ width: "wide" as "auto" })] })],
        }),
        { width: 10, height: 10 },
      ),
    ).rejects.toThrow(/children[\s\S]*width/);
  });

  test("throws for something that isn't a font", async () => {
    await expect(
      layout(
        // @ts-expect-error testing an invalid font
        { type: "text", text: "hi", font: "Inter" },
        { width: 10, height: 10 },
      ),
    ).rejects.toThrow("Expected a font from loadFont or loadTTF");
  });
});

describe("components", () => {
  test("build the same tree as objects", () => {
    const picture = new Jimp({ width: 1, height: 1 });

    expect(
      Box({
        direction: "row",
        children: [
          Text({ font: mono, children: ["Hello ", 42, null, false] }),
          [Image({ src: picture, width: 10 })],
          "plain",
          undefined,
        ],
      }),
    ).toStrictEqual({
      type: "box",
      direction: "row",
      children: [
        { type: "text", font: mono, text: "Hello 42" },
        { type: "image", src: picture, width: 10 },
        { type: "text", text: "plain" },
      ],
    });
  });

  test("Text can't contain other nodes", () => {
    expect(() => Text({ children: [Box()] })).toThrow(
      "Text can only contain strings and numbers",
    );
  });
});
