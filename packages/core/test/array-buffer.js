import expect from "@storybook/expect";
import { isArrayBuffer } from "..";

describe("isArrayBuffer", () => {
  it("true", () => {
    expect(isArrayBuffer(new ArrayBuffer(2))).toEqual(true);
    expect(isArrayBuffer(new Uint8Array(2))).toEqual(true);
  });

  it("false", () => {
    expect(isArrayBuffer(new Buffer(2))).toEqual(true);
  });
});
