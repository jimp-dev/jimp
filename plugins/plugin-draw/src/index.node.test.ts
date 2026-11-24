import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import "@jimp/test-utils/image-snapshot";
import png from "@jimp/js-png";

import * as draw from "./index.js";

const Jimp = createJimp({ formats: [png], plugins: [draw.methods] });

describe("Draw", () => {
  test("draws a scene with every kind of shape", async () => {
    const image = new Jimp({ width: 320, height: 240, color: 0xffffffff });

    image
      // Sky and sun
      .drawRect({
        x: 0,
        y: 0,
        w: 320,
        h: 240,
        fill: {
          type: "linear",
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 240,
          stops: [
            { offset: 0, color: "#a8dadc" },
            { offset: 1, color: "#f1faee" },
          ],
        },
      })
      .drawEllipse({
        cx: 260,
        cy: 50,
        rx: 36,
        ry: 36,
        fill: {
          type: "radial",
          cx: 260,
          cy: 50,
          r: 36,
          stops: [
            { offset: 0.5, color: "#ffd166" },
            { offset: 1, color: "rgba(255, 209, 102, 0)" },
          ],
        },
      })
      // A rounded card with an outline
      .drawRect({
        x: 20,
        y: 120,
        w: 120,
        h: 90,
        radius: 16,
        fill: "#e63946",
        stroke: "#1d3557",
        strokeWidth: 5,
      })
      // A star with round joins
      .drawPolygon({
        points: [
          [200, 100],
          [223, 170],
          [163, 127],
          [237, 127],
          [177, 170],
        ],
        fill: "gold",
        stroke: "black",
        strokeWidth: 3,
        join: "round",
      })
      // A zigzag with miter joins and round caps
      .drawPolygon({
        points: [
          [20, 20],
          [50, 90],
          [80, 30],
          [110, 90],
        ],
        closed: false,
        stroke: "#264653",
        strokeWidth: 8,
        cap: "round",
      })
      // A wave and a ring
      .drawPath({
        path: "M 150 220 Q 200 170 250 220 T 310 200",
        stroke: "#2a9d8f",
        strokeWidth: 5,
        cap: "square",
      })
      .drawPath({
        path: "M 240 150 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0 Z m 12 0 a 13 13 0 1 0 26 0 a 13 13 0 1 0 -26 0 Z",
        fill: "#6a4c93",
        fillRule: "evenodd",
      });

    // Rays of different widths
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;

      image.drawLine({
        x1: 160 + Math.cos(angle) * 10,
        y1: 50 + Math.sin(angle) * 10,
        x2: 160 + Math.cos(angle) * 40,
        y2: 50 + Math.sin(angle) * 40,
        color: "rgba(0, 0, 0, 0.6)",
        width: 1 + i / 3,
        cap: "round",
      });
    }

    // Repaint the card's middle
    image.floodFill({ x: 80, y: 160, color: "#f4a261" });

    expect(await image.getBuffer("image/png")).toMatchImageSnapshot();
  });

  test("draws 1000 random lines on a 1080p image quickly", () => {
    let seed = 1;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const image = new Jimp({ width: 1920, height: 1080, color: 0xffffffff });
    const start = performance.now();

    for (let i = 0; i < 1000; i++) {
      image.drawLine({
        x1: random() * 1920,
        y1: random() * 1080,
        x2: random() * 1920,
        y2: random() * 1080,
        color: 0xff000080,
        width: 1 + random() * 4,
      });
    }

    // About 80ms on a laptop. The limit leaves room for slow CI machines.
    expect(performance.now() - start).toBeLessThan(5000);
  });
});
