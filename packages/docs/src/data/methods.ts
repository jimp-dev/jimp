import type { CategoryId } from "./categories";

/**
 * Every hand-written method page, in sidebar order.
 *
 * This list drives the sidebar's "Methods" section and the sticker sheets on
 * /methods/. Each entry has a page at `src/content/docs/methods/<slug>.mdx`
 * whose frontmatter `category`, `method` and `plugin` match the entry.
 *
 * The sticker text comes from each page's frontmatter `description`, so
 * content authors only need to touch their own page.
 */
export interface MethodEntry {
  /** URL slug: /methods/<slug>/ */
  slug: string;
  /** The API name, e.g. "blur", "Jimp.read", "intToRGBA" */
  method: string;
  /** Sidebar and sticker label, e.g. "blur()" */
  label: string;
  category: CategoryId;
  /** npm package the API comes from */
  plugin: string;
}

const m = (
  slug: string,
  method: string,
  category: CategoryId,
  plugin: string,
  label = `${method}()`,
): MethodEntry => ({ slug, method, label, category, plugin });

export const methods: MethodEntry[] = [
  // Loading & saving
  m("read", "Jimp.read", "io", "@jimp/core"),
  m("from-buffer", "Jimp.fromBuffer", "io", "@jimp/core"),
  m("from-bitmap", "Jimp.fromBitmap", "io", "@jimp/core"),
  m("new-jimp", "new Jimp", "io", "@jimp/core", "new Jimp()"),
  m("get-buffer", "getBuffer", "io", "@jimp/core"),
  m("get-base64", "getBase64", "io", "@jimp/core"),
  m("write", "write", "io", "@jimp/core"),
  m("clone", "clone", "io", "@jimp/core"),

  // Size & shape
  m("resize", "resize", "shape", "@jimp/plugin-resize"),
  m("scale", "scale", "shape", "@jimp/plugin-resize"),
  m("scale-to-fit", "scaleToFit", "shape", "@jimp/plugin-resize"),
  m("cover", "cover", "shape", "@jimp/plugin-cover"),
  m("contain", "contain", "shape", "@jimp/plugin-contain"),
  m("crop", "crop", "shape", "@jimp/plugin-crop"),
  m("autocrop", "autocrop", "shape", "@jimp/plugin-crop"),
  m("autocrop-rect", "autocropRect", "shape", "@jimp/plugin-crop"),
  m("rotate", "rotate", "shape", "@jimp/plugin-rotate"),
  m("flip", "flip", "shape", "@jimp/plugin-flip"),
  m("circle", "circle", "shape", "@jimp/plugin-circle"),
  m("round-corners", "roundCorners", "shape", "@jimp/plugin-border"),
  m("border", "border", "shape", "@jimp/plugin-border"),
  m("fisheye", "fisheye", "shape", "@jimp/plugin-fisheye"),
  m("displace", "displace", "shape", "@jimp/plugin-displace"),

  // Blur & effects
  m("blur", "blur", "effects", "@jimp/plugin-blur"),
  m("gaussian", "gaussian", "effects", "@jimp/plugin-blur"),
  m("pixelate", "pixelate", "effects", "@jimp/plugin-color"),
  m("dither", "dither", "effects", "@jimp/plugin-dither"),
  m("convolute", "convolute", "effects", "@jimp/plugin-color"),
  m("convolution", "convolution", "effects", "@jimp/plugin-color"),
  m("box-shadow", "boxShadow", "effects", "@jimp/plugin-border"),
  m("shadow", "shadow", "effects", "@jimp/plugin-shadow"),

  // Color
  m("color", "color", "color", "@jimp/plugin-color"),
  m("brightness", "brightness", "color", "@jimp/plugin-color"),
  m("contrast", "contrast", "color", "@jimp/plugin-color"),
  m("greyscale", "greyscale", "color", "@jimp/plugin-color"),
  m("invert", "invert", "color", "@jimp/plugin-color"),
  m("sepia", "sepia", "color", "@jimp/plugin-color"),
  m("posterize", "posterize", "color", "@jimp/plugin-color"),
  m("normalize", "normalize", "color", "@jimp/plugin-color"),
  m("threshold", "threshold", "color", "@jimp/plugin-threshold"),
  m("quantize", "quantize", "color", "@jimp/plugin-quantize"),
  m("opacity", "opacity", "color", "@jimp/plugin-color"),
  m("fade", "fade", "color", "@jimp/plugin-color"),
  m("opaque", "opaque", "color", "@jimp/plugin-color"),

  // Compositing
  m("composite", "composite", "compose", "@jimp/core"),
  m("blit", "blit", "compose", "@jimp/plugin-blit"),
  m("mask", "mask", "compose", "@jimp/plugin-mask"),

  // Text
  m("print", "print", "text", "@jimp/plugin-print"),
  m("load-font", "loadFont", "text", "@jimp/plugin-print"),
  m("measure-text", "measureText", "text", "@jimp/plugin-print"),
  m("measure-text-height", "measureTextHeight", "text", "@jimp/plugin-print"),

  // Pixels
  m("get-pixel-color", "getPixelColor", "pixels", "@jimp/core"),
  m("set-pixel-color", "setPixelColor", "pixels", "@jimp/core"),
  m("get-pixel-index", "getPixelIndex", "pixels", "@jimp/core"),
  m("has-alpha", "hasAlpha", "pixels", "@jimp/core"),
  m("scan", "scan", "pixels", "@jimp/core"),
  m("scan-iterator", "scanIterator", "pixels", "@jimp/core"),

  // Comparing
  m("hash", "hash", "compare", "@jimp/plugin-hash"),
  m("phash", "pHash", "compare", "@jimp/plugin-hash"),
  m("distance-from-hash", "distanceFromHash", "compare", "@jimp/plugin-hash"),
  m("distance", "distance", "compare", "@jimp/plugin-hash"),
  m("compare-hashes", "compareHashes", "compare", "@jimp/plugin-hash"),
  m("diff", "diff", "compare", "@jimp/diff"),

  // Utilities
  m("int-to-rgba", "intToRGBA", "utils", "@jimp/utils"),
  m("rgba-to-int", "rgbaToInt", "utils", "@jimp/utils"),
  m("css-color-to-hex", "cssColorToHex", "utils", "@jimp/utils"),
  m("color-diff", "colorDiff", "utils", "@jimp/utils"),
  m("limit255", "limit255", "utils", "@jimp/utils"),
];

export const methodsBySlug = new Map(methods.map((entry) => [entry.slug, entry]));
export const methodsByName = new Map(
  methods.map((entry) => [entry.method, entry]),
);
