import expect from "@storybook/expect";
import { getType, getExtension, addType } from "../../src/utils/mime";

describe("Mime", () => {
  before(() => {
    addType("image/png", ["png"]);
    addType("image/gif", ["gif"]);
    addType("image/jpeg", ["jpeg", "jpg"]);
    addType("image/bmp", ["bmp"]);
    addType("image/tiff", ["tiff"]);
  });

  describe("getType", () => {
    it("should return undefined if not found", () => {
      expect(getType("/path/to.the/file.boop")).toBe(undefined);
    });

    it("should return the correct mime", () => {
      expect(getType("/path/to.the/file.png")).toBe("image/png");
      expect(getType("/path/to.the/file.gif")).toBe("image/gif");
      expect(getType("/path/to.the/file.jpg")).toBe("image/jpeg");
      expect(getType("/path/to.the/file.jpeg")).toBe("image/jpeg");
      expect(getType("/path/to.the/file.bmp")).toBe("image/bmp");
      expect(getType("/path/to.the/file.tiff")).toBe("image/tiff");
    });
  });

  describe("getExtension", () => {
    it("should return undefined if not found", () => {
      expect(getExtension("unknown/mime")).toBe(undefined);
    });

    it("should return the correct extension", () => {
      expect(getExtension("image/png")).toBe("png");
      expect(getExtension("image/gif")).toBe("gif");
      expect(getExtension("image/jpeg")).toBe("jpeg");
      expect(getExtension("image/bmp")).toBe("bmp");
      expect(getExtension("image/tiff")).toBe("tiff");
    });
  });
});
