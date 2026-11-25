import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";

import { render, type LayoutNode } from "./index.js";

const Jimp = createJimp();

type Image = InstanceType<typeof Jimp>;

/** The [r, g, b, a] of a pixel */
function pixel(image: Image, x: number, y: number) {
  const idx = image.getPixelIndex(x, y);
  return [...image.bitmap.data.subarray(idx, idx + 4)];
}

describe("render", () => {
  test("makes an image of the Jimp class", async () => {
    const image = await render(
      { type: "box" },
      { Jimp, width: 30, height: 20 },
    );

    expect(image).toBeInstanceOf(Jimp);
    expect(image.width).toBe(30);
    expect(image.height).toBe(20);
    expect(pixel(image, 0, 0)).toStrictEqual([0, 0, 0, 0]);
  });

  test("fills the image with the background", async () => {
    const image = await render(
      { type: "box" },
      { Jimp, width: 4, height: 4, background: "#ff0000" },
    );

    expect(pixel(image, 3, 3)).toStrictEqual([255, 0, 0, 255]);
  });

  test("throws for an invalid background", async () => {
    await expect(
      render(
        { type: "box" },
        // @ts-expect-error testing an invalid gradient
        { Jimp, width: 4, height: 4, background: { type: "conic" } },
      ),
    ).rejects.toThrow();
    await expect(
      render(
        { type: "box" },
        { Jimp, width: 4, height: 4, background: "nope" },
      ),
    ).rejects.toThrow('Invalid color "nope"');
  });

  test("draws backgrounds at the laid out positions", async () => {
    const image = await render(
      {
        type: "box",
        direction: "row",
        padding: 2,
        gap: 2,
        background: "#ffffff",
        children: [
          { type: "box", width: 3, background: "#ff0000" },
          { type: "box", grow: 1, background: "#0000ff" },
        ],
      },
      { Jimp, width: 12, height: 6 },
    );

    expect(pixel(image, 1, 3)).toStrictEqual([255, 255, 255, 255]);
    expect(pixel(image, 2, 2)).toStrictEqual([255, 0, 0, 255]);
    expect(pixel(image, 4, 3)).toStrictEqual([255, 0, 0, 255]);
    expect(pixel(image, 5, 3)).toStrictEqual([255, 255, 255, 255]);
    expect(pixel(image, 7, 3)).toStrictEqual([0, 0, 255, 255]);
    expect(pixel(image, 9, 3)).toStrictEqual([0, 0, 255, 255]);
    expect(pixel(image, 10, 3)).toStrictEqual([255, 255, 255, 255]);
  });

  test("draws the border inside the box, like CSS", async () => {
    const image = await render(
      {
        type: "box",
        background: "#ffffff",
        borderWidth: 2,
        borderColor: "#000000",
      },
      { Jimp, width: 8, height: 8 },
    );

    expect(pixel(image, 0, 4)).toStrictEqual([0, 0, 0, 255]);
    expect(pixel(image, 1, 4)).toStrictEqual([0, 0, 0, 255]);
    expect(pixel(image, 2, 4)).toStrictEqual([255, 255, 255, 255]);
    expect(pixel(image, 7, 7)).toStrictEqual([0, 0, 0, 255]);
  });

  test("gradients fit the box they fill", async () => {
    const image = await render(
      {
        type: "box",
        direction: "row",
        children: [
          { type: "box", width: 10 },
          {
            type: "box",
            width: 10,
            background: {
              type: "linear",
              angle: 90,
              stops: ["#000000", "#ffffff"],
            },
          },
        ],
      },
      { Jimp, width: 20, height: 1 },
    );

    // Dark on the box's left edge, light on its right
    expect(pixel(image, 10, 0)[0]).toBeLessThan(20);
    expect(pixel(image, 19, 0)[0]).toBeGreaterThan(235);
  });

  test("an angle of 180 goes down", async () => {
    const image = await render(
      {
        type: "box",
        background: { type: "linear", stops: ["#000000", "#ffffff"] },
      },
      { Jimp, width: 1, height: 10 },
    );

    expect(pixel(image, 0, 0)[0]).toBeLessThan(20);
    expect(pixel(image, 0, 9)[0]).toBeGreaterThan(235);
  });

  test("opacity fades the box and everything in it", async () => {
    const image = await render(
      {
        type: "box",
        padding: 2,
        opacity: 0.5,
        background: "#ffffff",
        children: [{ type: "box", grow: 1, background: "#ff0000" }],
      },
      { Jimp, width: 6, height: 6, background: "#000000" },
    );

    expect(pixel(image, 0, 0)).toStrictEqual([128, 128, 128, 255]);
    expect(pixel(image, 3, 3)).toStrictEqual([128, 0, 0, 255]);
  });

  test("opacity 0 draws nothing", async () => {
    const image = await render(
      { type: "box", opacity: 0, background: "#ffffff" },
      { Jimp, width: 2, height: 2 },
    );

    expect(pixel(image, 0, 0)).toStrictEqual([0, 0, 0, 0]);
  });

  const overflowing = (overflow: "visible" | "hidden"): LayoutNode => ({
    type: "box",
    padding: 2,
    children: [
      {
        type: "box",
        height: 6,
        overflow,
        children: [
          { type: "box", height: 20, shrink: 0, background: "#ff0000" },
        ],
      },
    ],
  });

  test("overflow: hidden clips the children to the box", async () => {
    const visible = await render(overflowing("visible"), {
      Jimp,
      width: 10,
      height: 20,
    });
    const hidden = await render(overflowing("hidden"), {
      Jimp,
      width: 10,
      height: 20,
    });

    expect(pixel(visible, 5, 12)).toStrictEqual([255, 0, 0, 255]);
    expect(pixel(hidden, 5, 7)).toStrictEqual([255, 0, 0, 255]);
    expect(pixel(hidden, 5, 8)).toStrictEqual([0, 0, 0, 0]);
  });

  test("overflow: hidden clips to the rounded corners", async () => {
    const image = await render(
      {
        type: "box",
        radius: 10,
        overflow: "hidden",
        children: [{ type: "box", grow: 1, background: "#ff0000" }],
      },
      { Jimp, width: 20, height: 20 },
    );

    expect(pixel(image, 0, 0)[3]).toBe(0);
    expect(pixel(image, 10, 10)).toStrictEqual([255, 0, 0, 255]);
  });

  test("shadows are centered under the box without an offset", async () => {
    const image = await render(
      {
        type: "box",
        padding: 20,
        children: [
          {
            type: "box",
            grow: 1,
            shadow: { x: 0, y: 0, blur: 8, color: "#000000" },
          },
        ],
      },
      { Jimp, width: 60, height: 60 },
    );

    // The shadow shows around the (transparent) box, the same on every side
    const left = pixel(image, 15, 30);

    expect(left[3]).toBeGreaterThan(0);
    expect(pixel(image, 44, 30)).toStrictEqual(left);
    expect(pixel(image, 30, 15)).toStrictEqual(left);
    expect(pixel(image, 30, 44)).toStrictEqual(left);
  });

  test("shadows move with x and y", async () => {
    const image = await render(
      {
        type: "box",
        padding: 20,
        children: [
          {
            type: "box",
            grow: 1,
            background: "#ffffff",
            shadow: { x: 5, y: 5, blur: 0, color: "#000000" },
          },
        ],
      },
      { Jimp, width: 60, height: 60 },
    );

    expect(pixel(image, 42, 42)).toStrictEqual([0, 0, 0, 255]);
    expect(pixel(image, 18, 18)).toStrictEqual([0, 0, 0, 0]);
    expect(pixel(image, 22, 22)).toStrictEqual([255, 255, 255, 255]);
  });

  test("nodes are drawn in tree order, absolutely positioned or not", async () => {
    const image = await render(
      {
        type: "box",
        children: [
          {
            type: "box",
            position: "absolute",
            top: 0,
            left: 0,
            width: 4,
            height: 4,
            background: "#ff0000",
          },
          { type: "box", height: 2, background: "#0000ff" },
        ],
      },
      { Jimp, width: 4, height: 4 },
    );

    expect(pixel(image, 1, 1)).toStrictEqual([0, 0, 255, 255]);
    expect(pixel(image, 1, 3)).toStrictEqual([255, 0, 0, 255]);
  });

  test("images are drawn into their box", async () => {
    const picture = new Jimp({ width: 2, height: 1, color: 0x00ff00ff });
    const image = await render(
      { type: "box", padding: 1, children: [{ type: "image", src: picture }] },
      { Jimp, width: 6, height: 6 },
    );

    // Stretched to the column's width, keeping its aspect ratio
    expect(pixel(image, 1, 1)).toStrictEqual([0, 255, 0, 255]);
    expect(pixel(image, 4, 2)).toStrictEqual([0, 255, 0, 255]);
    expect(pixel(image, 4, 3)).toStrictEqual([0, 0, 0, 0]);
    // The image itself isn't changed
    expect(picture.width).toBe(2);
  });
});
