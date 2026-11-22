import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { Jimp } from "./index.js";

let dir: string;

beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "jimp-write-"));
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("write", () => {
  test("writes to a path built at runtime", async () => {
    const image = new Jimp({ width: 2, height: 3, color: 0xff0000ff });
    const output: string = path.join(dir, "image.png");

    await image.write(output);

    const written = await Jimp.read(output);
    expect(written.mime).toBe("image/png");
    expect(written.width).toBe(2);
    expect(written.height).toBe(3);
  });

  test("explains when the path has no extension", async () => {
    const image = new Jimp({ width: 1, height: 1 });
    const output: string = path.join(dir, "67f63be03de2e62bccbab3400");

    await expect(image.write(output)).rejects.toThrow(
      /no recognisable file extension/,
    );
  });
});
