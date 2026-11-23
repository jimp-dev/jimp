import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer, Server } from "node:http";
import { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { createJimp } from "@jimp/core";
import png from "@jimp/js-png";
import { getTestImagePath, makeTestImage } from "@jimp/test-utils";

import svg from "./index.js";

const Jimp = createJimp({ formats: [png, svg] });
const format = svg();

/** A font whose "A" is a square from the baseline up, made by make-font.py */
const font = await readFile(new URL("./fixtures/square.ttf", import.meta.url));

function text(attributes = "") {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="6" height="5"><text x="1" y="4" font-size="3" fill="red" ${attributes}>A</text></svg>`,
  );
}

const square = makeTestImage("      ", " ▴▴▴  ", " ▴▴▴  ", " ▴▴▴  ", "      ");

describe("WASM SVG (Node)", () => {
  test("draws text with the given fonts", async () => {
    expect(await format.decode(text(), { fonts: [font] })).toEqual(square);
    expect(
      await format.decode(text('font-family="Jimp Test Square"'), {
        fonts: [new Uint8Array(font)],
      }),
    ).toEqual(square);
    expect(
      await format.decode(text('font-family="serif"'), {
        fonts: [font],
        defaultFontFamily: "Jimp Test Square",
      }),
    ).toEqual(square);
  });

  test("doesn't draw text without fonts", async () => {
    const image = await format.decode(text());

    expect(image.data.every((value) => value === 0)).toBe(true);
  });

  describe("external resources", () => {
    let server: Server;
    let url: string;
    const requests: string[] = [];

    beforeAll(async () => {
      const red = await new Jimp({
        width: 1,
        height: 1,
        color: 0xff0000ff,
      }).getBuffer("image/png");

      server = createServer((request, response) => {
        requests.push(request.url!);
        response.setHeader("Content-Type", "image/png");
        response.end(red);
      });
      await new Promise<void>((resolve) =>
        server.listen(0, "127.0.0.1", resolve),
      );
      url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(() => {
      server.close();
    });

    test("aren't requested or read from disk", async () => {
      const dice = getTestImagePath("dice.png");
      const image = await format.decode(
        Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="2" height="2">
            <style>@import url("${url}/style.css"); rect { fill: url("${url}/paint.svg#red"); }</style>
            <image width="2" height="2" href="${url}/image.png"/>
            <image width="2" height="2" xlink:href="${url}/xlink.png"/>
            <image width="2" height="2" href="${dice}"/>
            <image width="2" height="2" href="file://${dice}"/>
            <use href="${url}/sprite.svg#icon"/>
            <filter id="f"><feImage href="${url}/filter.png"/></filter>
            <rect width="2" height="2" filter="url(#f)"/>
          </svg>`,
        ),
      );

      // Give a request time to arrive
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(requests).toEqual([]);
      expect(image.data.every((value) => value === 0)).toBe(true);
    });

    test("are only loaded by resolveImage", async () => {
      const image = await format.decode(
        Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><image width="1" height="1" href="${url}/red.png"/></svg>`,
        ),
        {
          resolveImage: async (href) =>
            new Uint8Array(await (await fetch(href)).arrayBuffer()),
        },
      );

      expect(requests).toEqual(["/red.png"]);
      expect([...image.data]).toEqual([255, 0, 0, 255]);
    });
  });

  test("reads .svg files", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "jimp-svg-"));
    const file = path.join(dir, "squares.svg");

    try {
      await writeFile(
        file,
        '<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="3" height="2"><rect width="1" height="2" fill="red"/></svg>',
      );

      const image = await Jimp.read(file, { "image/svg+xml": { width: 6 } });

      expect(image.mime).toBe("image/svg+xml");
      expect([image.width, image.height]).toEqual([6, 4]);
      await expect(image.write(path.join(dir, "out.svg"))).rejects.toThrow(
        "Jimp can read SVG but can't write it",
      );

      await image.write(path.join(dir, "out.png"));
      const written = await Jimp.read(path.join(dir, "out.png"));
      expect(written.bitmap.data).toEqual(image.bitmap.data);
    } finally {
      await rm(dir, { recursive: true });
    }
  });
});
