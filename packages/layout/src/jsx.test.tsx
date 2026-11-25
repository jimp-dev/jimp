import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import type { VectorFont } from "@jimp/plugin-print";

import { Box, Image, Text } from "./index.js";

const Jimp = createJimp();

// Components don't check fonts, so any object will do
const regular = {} as VectorFont;

describe("JSX", () => {
  test("builds the same tree as objects", () => {
    const picture = new Jimp({ width: 1, height: 1 });
    const name = "Jimp";

    expect(
      <Box direction="row" gap={8}>
        <Text font={regular} fontSize={12}>
          Hello {name}
        </Text>
        <>
          <Image src={picture} width={10} />
          {false}
          {null}
        </>
        {[1, 2].map((n) => (
          <Box width={n} />
        ))}
      </Box>,
    ).toStrictEqual({
      type: "box",
      direction: "row",
      gap: 8,
      children: [
        { type: "text", font: regular, fontSize: 12, text: "Hello Jimp" },
        { type: "image", src: picture, width: 10 },
        { type: "box", width: 1, children: [] },
        { type: "box", width: 2, children: [] },
      ],
    });
  });
});
