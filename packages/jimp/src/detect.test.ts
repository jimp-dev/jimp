import { describe, expect, test, vi } from "vitest";
import { createJimp } from "@jimp/core";
import png from "@jimp/js-png";
import { Format } from "@jimp/types";

/** A text format file-type can't identify: "TXT" then a width and height */
function text(detect?: Format["detect"]) {
  return () =>
    ({
      mime: "text/x-test",
      detect,
      encode: () => {
        throw new Error("Can't write text images");
      },
      decode: (data) => {
        const [width, height] = data
          .toString()
          .split("TXT ")[1]!
          .split(" ")
          .map(Number);
        return {
          width: width!,
          height: height!,
          data: Buffer.alloc(width! * height! * 4, 0xff),
        };
      },
    }) satisfies Format<"text/x-test">;
}

const isText = (data: Buffer) => data.toString("latin1", 0, 3) === "TXT";

describe("detecting formats file-type can't identify", () => {
  test("reads data a format's detect recognises", async () => {
    const Jimp = createJimp({ formats: [png, text(isText)] });
    const image = await Jimp.read(Buffer.from("TXT 3 2"));

    expect(image.mime).toBe("text/x-test");
    expect([image.width, image.height]).toEqual([3, 2]);
  });

  test("still fails for data no format recognises", async () => {
    const Jimp = createJimp({ formats: [png, text(isText)] });

    await expect(Jimp.read(Buffer.from("hello"))).rejects.toThrow(
      "Could not find MIME for Buffer",
    );
  });

  test("is used when file-type finds a type no format decodes", async () => {
    // file-type identifies the XML prolog as application/xml
    const xml = Buffer.from('<?xml version="1.0"?>TXT 1 1');
    const Jimp = createJimp({
      formats: [png, text((data) => data.includes("TXT"))],
    });
    const WithoutText = createJimp({ formats: [png] });

    expect((await Jimp.read(xml)).mime).toBe("text/x-test");
    await expect(WithoutText.read(xml)).rejects.toThrow(
      "Mime type application/xml does not support decoding",
    );
  });

  test("isn't called for data file-type identifies", async () => {
    const detect = vi.fn(() => true);
    const Jimp = createJimp({ formats: [text(detect), png] });
    const buffer = await new Jimp({ width: 1, height: 1 }).getBuffer(
      "image/png",
    );

    expect((await Jimp.read(buffer)).mime).toBe("image/png");
    expect(detect).not.toHaveBeenCalled();
  });

  test("asks formats in the order they were given", async () => {
    const first = vi.fn(() => false);
    const second = vi.fn(() => true);
    const Jimp = createJimp({
      formats: [
        text(first),
        () => ({ ...text(second)(), mime: "text/x-second" }),
        () => ({ ...text(second)(), mime: "text/x-third" }),
      ],
    });
    const image = await Jimp.read(Buffer.from("TXT 1 1"));

    expect(image.mime).toBe("text/x-second");
    expect(first.mock.invocationCallOrder[0]).toBeLessThan(
      second.mock.invocationCallOrder[0]!,
    );
    expect(second).toHaveBeenCalledTimes(1);
  });
});
