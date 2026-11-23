// These import the published `.d.ts` of each format, so they catch options
// that only lose their types once declarations are emitted.
import { describe, expectTypeOf, test } from "vitest";
import { createJimp } from "@jimp/core";
import avif from "@jimp/wasm-avif";
import jpeg from "@jimp/wasm-jpeg";
import jpeg2000, { j2c, jpx } from "@jimp/wasm-jpeg2000";
import jxl from "@jimp/wasm-jxl";
import png from "@jimp/wasm-png";
import svg from "@jimp/wasm-svg";
import webp from "@jimp/wasm-webp";
import type { QuantizeOptions } from "@jimp/plugin-quantize";

import { defaultPlugins } from "./index.js";

const Jimp = createJimp({
  plugins: defaultPlugins,
  formats: [avif, jpeg, jpeg2000, j2c, jpx, jxl, png, svg, webp],
});
const image = new Jimp({ width: 1, height: 1 });

describe("wasm format encode options", () => {
  test("webp", () => {
    image.write("output.webp", { quality: 75, lossless: 1 });
    image.getBuffer("image/webp", { quality: 75 });
    // @ts-expect-error not a WebP option
    image.write("output.webp", { notAnOption: true });
    // @ts-expect-error not a WebP option
    image.getBuffer("image/webp", { notAnOption: true });
    // @ts-expect-error quality is a number
    image.getBuffer("image/webp", { quality: "75" });
  });

  test("avif", () => {
    image.write("output.avif", { cqLevel: 30, tune: "ssim" });
    image.getBuffer("image/avif", { speed: 8 });
    // @ts-expect-error not an AVIF option
    image.write("output.avif", { notAnOption: true });
    // @ts-expect-error not an AVIF option
    image.getBuffer("image/avif", { notAnOption: true });
    // @ts-expect-error not a tune
    image.getBuffer("image/avif", { tune: "fast" });
  });

  test("jpeg", () => {
    image.write("output.jpg", { quality: 75, progressive: false });
    image.getBuffer("image/jpeg", { quality: 75, exif: true, icc: false });
    // @ts-expect-error not a JPEG option
    image.write("output.jpg", { notAnOption: true });
    // @ts-expect-error not a JPEG option
    image.getBuffer("image/jpeg", { notAnOption: true });
  });

  test("png", () => {
    image.write("output.png", { optimize: { level: 3 }, icc: false });
    image.getBuffer("image/png", { optimize: { interlace: true } });
    // @ts-expect-error not a PNG option
    image.write("output.png", { notAnOption: true });
    // @ts-expect-error not a PNG option
    image.getBuffer("image/png", { notAnOption: true });
  });

  test("jpeg 2000", () => {
    image.write("output.jp2", { compressionRatio: 20, decompositions: 3 });
    image.getBuffer("image/jp2", { compressionRatio: 20 });
    image.getBuffer("image/j2c", { decompositions: 3 });
    // @ts-expect-error not a JPEG 2000 option
    image.write("output.jp2", { notAnOption: true });
    // @ts-expect-error not a JPEG 2000 option
    image.getBuffer("image/j2c", { notAnOption: true });
  });

  test("jpeg xl", () => {
    image.write("output.jxl", { quality: 75, effort: 3 });
    image.getBuffer("image/jxl", { lossless: true });
    // @ts-expect-error not a JPEG XL option
    image.write("output.jxl", { notAnOption: true });
    // @ts-expect-error not a JPEG XL option
    image.getBuffer("image/jxl", { notAnOption: true });
  });
});

describe("wasm format decode options", () => {
  test("svg", () => {
    Jimp.read("image.svg", {
      "image/svg+xml": { width: 100, background: "white", scale: 2 },
    });
    Jimp.read("image.svg", {
      // @ts-expect-error not an SVG option
      "image/svg+xml": { notAnOption: true },
    });
    Jimp.read("image.svg", {
      // @ts-expect-error width is a number
      "image/svg+xml": { width: "100" },
    });
  });

  test("jpeg 2000", () => {
    Jimp.read("image.jp2", { "image/jp2": { reduce: 1, layers: 2 } });
    Jimp.read("image.jpx", { "image/jpx": { maxResolutionInMP: 10 } });
    Jimp.read("image.jp2", {
      // @ts-expect-error not a JPEG 2000 option
      "image/jp2": { notAnOption: true },
    });
  });

  test("jpeg xl", () => {
    Jimp.read("image.jxl", { "image/jxl": { maxResolutionInMP: 10 } });
    Jimp.read("image.jxl", {
      // @ts-expect-error not a JPEG XL option
      "image/jxl": { notAnOption: true },
    });
  });
});

describe("plugin options", () => {
  test("quantize", () => {
    expectTypeOf<QuantizeOptions>().not.toBeAny();
    image.quantize({ colors: 16, imageQuantization: "floyd-steinberg" });
    // @ts-expect-error not a quantize option
    image.quantize({ notAnOption: true });
    // @ts-expect-error not an image quantization
    image.quantize({ imageQuantization: "random" });
  });
});
