import { describe, expect, test } from "vitest";

import avif from "./index.js";
import { readAvifSize } from "./header.js";

const format = avif();

describe("readAvifSize", () => {
  test("reads the size from the ispe property", async () => {
    const width = 37;
    const height = 21;
    const data = await format.encode({
      width,
      height,
      data: Buffer.alloc(width * height * 4, 0x80),
    });

    expect(readAvifSize(data)).toEqual({ width, height });
  });

  test("returns undefined for other data", () => {
    expect(readAvifSize(new Uint8Array(40))).toBeUndefined();
  });

  test("decode refuses files without an ispe when there's a limit", async () => {
    await expect(
      format.decode(Buffer.alloc(40), { maxResolutionInMP: 100 }),
    ).rejects.toThrow(
      "Couldn't read the AVIF's dimensions to check maxResolutionInMP",
    );
  });
});
