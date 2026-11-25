/** @jsxImportSource @jimp/layout */
import type { VectorFont } from "@jimp/plugin-print";

import { Box, Text, type LayoutNode } from "../src/index.js";

interface Fonts {
  regular: VectorFont;
  bold: VectorFont;
}

/** An Open Graph card, at half of the usual 1200 x 630 */
export function card(fonts: Fonts) {
  const chip = (label: string): LayoutNode => ({
    type: "box",
    padding: [5, 10],
    radius: 999,
    background: "#ffd83a",
    shadow: { y: 3, blur: 6, color: "rgba(0, 0, 0, 0.35)" },
    children: [
      {
        type: "text",
        text: label,
        font: fonts.bold,
        fontSize: 12,
        color: "#1b1840",
      },
    ],
  });

  return {
    type: "box",
    padding: 36,
    justify: "space-between",
    background: { type: "linear", angle: 135, stops: ["#1b1840", "#3a2d7a"] },
    font: fonts.regular,
    color: "white",
    children: [
      {
        type: "box",
        direction: "row",
        align: "center",
        gap: 8,
        children: [
          {
            type: "box",
            width: 28,
            height: 28,
            radius: 14,
            borderWidth: 2,
            borderColor: "white",
            background: {
              type: "radial",
              stops: ["#ffd83a", "#ff5fb0"],
            },
          },
          {
            type: "text",
            text: "jimp-dev.github.io",
            fontSize: 14,
            color: "#c9c4f0",
          },
        ],
      },
      {
        type: "box",
        gap: 12,
        children: [
          {
            type: "text",
            text: "Lay out Open Graph cards with plain JavaScript and Jimp",
            font: fonts.bold,
            fontSize: 36,
            lineHeight: 42,
            maxLines: 2,
          },
          {
            type: "text",
            text: "Rows, columns, wrapping text, gradients, borders, rounded corners and shadows, without a browser.",
            fontSize: 15,
            color: "#c9c4f0",
            maxLines: 2,
          },
        ],
      },
      {
        type: "box",
        direction: "row",
        gap: 6,
        children: ["Node", "Browsers", "Workers", "Deno", "Bun"].map(chip),
      },
    ],
  } satisfies LayoutNode;
}

function Chip({ label, fonts }: { label: string; fonts: Fonts }) {
  return (
    <Box
      padding={[5, 10]}
      radius={999}
      background="#ffd83a"
      shadow={{ y: 3, blur: 6, color: "rgba(0, 0, 0, 0.35)" }}
    >
      <Text font={fonts.bold} fontSize={12} color="#1b1840">
        {label}
      </Text>
    </Box>
  );
}

/** The same card as {@link card}, written with JSX */
export function cardJsx(fonts: Fonts) {
  return (
    <Box
      padding={36}
      justify="space-between"
      background={{
        type: "linear",
        angle: 135,
        stops: ["#1b1840", "#3a2d7a"],
      }}
      font={fonts.regular}
      color="white"
    >
      <Box direction="row" align="center" gap={8}>
        <Box
          width={28}
          height={28}
          radius={14}
          borderWidth={2}
          borderColor="white"
          background={{ type: "radial", stops: ["#ffd83a", "#ff5fb0"] }}
        />
        <Text fontSize={14} color="#c9c4f0">
          jimp-dev.github.io
        </Text>
      </Box>
      <Box gap={12}>
        <Text font={fonts.bold} fontSize={36} lineHeight={42} maxLines={2}>
          Lay out Open Graph cards with plain JavaScript and Jimp
        </Text>
        <Text fontSize={15} color="#c9c4f0" maxLines={2}>
          Rows, columns, wrapping text, gradients, borders, rounded corners and
          shadows, without a browser.
        </Text>
      </Box>
      <Box direction="row" gap={6}>
        {["Node", "Browsers", "Workers", "Deno", "Bun"].map((label) => (
          <Chip label={label} fonts={fonts} />
        ))}
      </Box>
    </Box>
  );
}
