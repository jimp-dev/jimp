import { Buffer } from "buffer";
import { initWasm, Resvg, ResvgRenderOptions } from "@resvg/resvg-wasm";
import { Bitmap, Format } from "@jimp/types";
import { cssColorToHex } from "@jimp/utils";
import z from "zod";

import { isSvg } from "./detect.js";
import { loadWasm } from "./load-wasm.js";

/** Returns the bytes of an image an SVG links to, or nothing to skip it */
export type ResolveImage = (
  href: string,
) => Uint8Array | undefined | Promise<Uint8Array | undefined>;

const DecodeSvgOptionsSchema = z
  .object({
    /**
     * Width to render at, in pixels. The height keeps the SVG's aspect ratio.
     * With `height` too, the image fits inside both.
     * Defaults to the SVG's own size.
     */
    width: z.number().positive().optional(),
    /**
     * Height to render at, in pixels. The width keeps the SVG's aspect ratio.
     * With `width` too, the image fits inside both.
     * Defaults to the SVG's own size.
     */
    height: z.number().positive().optional(),
    /**
     * Render at a multiple of the SVG's own size, e.g. 2 for twice the
     * width and height. Can't be combined with `width` or `height`.
     * @default 1
     */
    scale: z.number().positive().optional(),
    /**
     * Fill the image with this colour behind the SVG: a CSS colour or a
     * 0xRRGGBBAA number.
     * @default transparent
     */
    background: z.union([z.string(), z.number()]).optional(),
    /**
     * Fonts (TTF, OTF, TTC or WOFF2) to draw `<text>` with. Without any, text isn't
     * drawn: the plugin has no access to system fonts.
     */
    fonts: z.array(z.instanceof(Uint8Array)).optional(),
    /**
     * The family to use for text that doesn't set `font-family`, and for the
     * generic `serif`, `sans-serif` and `monospace` families. Text in a family
     * none of the `fonts` have falls back to a font that has its characters.
     */
    defaultFontFamily: z.string().optional(),
    /**
     * Largest image, in megapixels, that will be rendered. Larger sizes are
     * rejected before any pixel memory is allocated.
     * @default 100
     */
    maxResolutionInMP: z.number().positive().optional(),
    /**
     * Loads the http(s) URLs of `<image>` elements, which are otherwise
     * skipped, by returning the PNG, JPEG or GIF's bytes. Images in `data:`
     * URLs are always drawn.
     *
     * Only use this for SVGs you trust, or check the URL first: an untrusted
     * SVG can make your server request any URL, including internal ones.
     */
    resolveImage: z
      .custom<ResolveImage>((value) => typeof value === "function")
      .optional(),
  })
  .strict()
  .refine(
    ({ scale, width, height }) =>
      scale === undefined || (width === undefined && height === undefined),
    "Pass either scale or width and height, not both",
  );

export type DecodeSvgOptions = z.input<typeof DecodeSvgOptionsSchema>;

export interface SvgWasm {
  /** The compiled `@resvg/resvg-wasm/index_bg.wasm` */
  resvg?: WebAssembly.Module;
}

export interface SvgFormatOptions {
  /**
   * A precompiled wasm module for runtimes or bundlers where the plugin
   * can't load resvg's wasm itself.
   * resvg is initialized once, by the first instance that decodes, so pass
   * the same module to every instance.
   */
  wasm?: SvgWasm;
}

let resvgReady: Promise<void> | undefined;

function initResvgOnce(module?: WebAssembly.Module) {
  resvgReady ??= Promise.resolve(module ?? loadWasm())
    .then((wasm) => initWasm(wasm))
    .catch((error: unknown) => {
      // Another copy of the plugin, or the app, has initialized it already
      if (!(error instanceof Error && error.message.startsWith("Already"))) {
        throw error;
      }
    });
  return resvgReady;
}

/** resvg renders premultiplied RGBA, which Jimp doesn't use */
function unpremultiply(pixels: Uint8Array) {
  // Already copied out of wasm memory, so it's converted in place
  const data = Buffer.from(pixels.buffer, pixels.byteOffset, pixels.byteLength);

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]!;

    if (alpha !== 0 && alpha !== 255) {
      for (let c = i; c < i + 3; c++) {
        data[c] = Math.min(255, Math.round((data[c]! * 255) / alpha));
      }
    }
  }

  return data;
}

function toHexColor(color: string | number) {
  return `#${(cssColorToHex(color) >>> 0).toString(16).padStart(8, "0")}`;
}

/** How resvg should scale the SVG, when that doesn't depend on its size */
function getFit({
  width,
  height,
  scale,
}: DecodeSvgOptions): ResvgRenderOptions["fitTo"] {
  if (width !== undefined && height !== undefined) {
    return undefined;
  }

  if (width !== undefined) {
    return { mode: "width", value: Math.max(1, Math.round(width)) };
  }

  if (height !== undefined) {
    return { mode: "height", value: Math.max(1, Math.round(height)) };
  }

  return scale === undefined
    ? { mode: "original" }
    : { mode: "zoom", value: scale };
}

/**
 * The size to render the SVG at, rounded like resvg does, and how resvg
 * should scale the SVG's own size to it
 */
function getRenderSize(
  intrinsicWidth: number,
  intrinsicHeight: number,
  options: DecodeSvgOptions,
) {
  let { width, height } = options;

  // Fit inside both, so whichever is smaller relative to the SVG wins
  if (width !== undefined && height !== undefined) {
    if (width / intrinsicWidth <= height / intrinsicHeight) {
      height = undefined;
    } else {
      width = undefined;
    }
  }

  const fitTo = getFit({ ...options, width, height })!;

  switch (fitTo.mode) {
    case "width":
      return {
        fitTo,
        width: fitTo.value,
        height: Math.round((fitTo.value * intrinsicHeight) / intrinsicWidth),
      };
    case "height":
      return {
        fitTo,
        width: Math.round((fitTo.value * intrinsicWidth) / intrinsicHeight),
        height: fitTo.value,
      };
    case "original":
      return { fitTo, width: intrinsicWidth, height: intrinsicHeight };
    case "zoom": {
      // At least a pixel across the smaller side
      const value = Math.max(
        fitTo.value,
        1 / Math.min(intrinsicWidth, intrinsicHeight),
      );

      return {
        fitTo: { mode: "zoom", value } as const,
        width: Math.round(intrinsicWidth * value),
        height: Math.round(intrinsicHeight * value),
      };
    }
  }
}

async function decode(
  data: Buffer,
  options: DecodeSvgOptions,
  wasm?: WebAssembly.Module,
): Promise<Bitmap> {
  const {
    background,
    fonts = [],
    defaultFontFamily,
    maxResolutionInMP = 100,
    resolveImage,
    ...size
  } = DecodeSvgOptionsSchema.parse(options);
  const renderOptions: ResvgRenderOptions = {
    background: background === undefined ? undefined : toHexColor(background),
    // Only the given fonts: the wasm has no access to the system's
    font: { fontBuffers: fonts, defaultFontFamily },
  };
  const fitTo = getFit(size);

  await initResvgOnce(wasm);

  // Parses the SVG. The pixels are only allocated by render()
  let svg = new Resvg(data, { ...renderOptions, fitTo });

  try {
    const target = getRenderSize(svg.width, svg.height, size);

    if (target.width * target.height > maxResolutionInMP * 1_000_000) {
      throw new Error(
        `SVG dimensions ${target.width}x${target.height} exceed the maximum resolution of ${maxResolutionInMP} megapixels. Use the width, height or scale option to render it smaller.`,
      );
    }

    // The scale depends on the SVG's size, and is a parsing option
    if (JSON.stringify(target.fitTo) !== JSON.stringify(fitTo)) {
      const scaled = new Resvg(data, { ...renderOptions, fitTo: target.fitTo });
      svg.free();
      svg = scaled;
    }

    if (resolveImage) {
      for (const href of svg.imagesToResolve() as string[]) {
        const image = await resolveImage(href);

        if (image) {
          svg.resolveImage(href, image);
        }
      }
    }

    const image = svg.render();

    try {
      return {
        data: unpremultiply(image.pixels),
        width: image.width,
        height: image.height,
      };
    } finally {
      image.free();
    }
  } finally {
    svg.free();
  }
}

/**
 * SVG images (.svg), rendered with resvg. Only reading is supported: writing
 * would need a raster to vector conversion.
 */
export default function svg({ wasm }: SvgFormatOptions = {}) {
  return {
    mime: "image/svg+xml",
    hasAlpha: true,
    detect: isSvg,
    encode: async () => {
      throw new Error(
        "Jimp can read SVG but can't write it. Write a raster format like PNG (image/png) instead.",
      );
    },
    decode: (data, options: DecodeSvgOptions = {}) =>
      decode(data, options, wasm?.resvg),
  } satisfies Format<"image/svg+xml">;
}
