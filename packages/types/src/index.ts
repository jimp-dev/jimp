import { z } from "zod";

/**
 * How `getPixelIndex` (and plugins like `convolution`) handle coordinates
 * outside the image.
 */
export enum Edge {
  /** Use the nearest edge pixel */
  EXTEND = 1,
  /** Wrap around to the other side of the image */
  WRAP = 2,
  /** There is no pixel: `getPixelIndex` returns -1 */
  CROP = 3,
}

export interface Bitmap {
  data: Buffer;
  width: number;
  height: number;
}

export interface Format<
  Mime extends string = string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ExportOptions extends Record<string, any> | undefined = undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DecodeOptions extends Record<string, any> | undefined = undefined,
> {
  mime: Mime;
  hasAlpha?: boolean;
  encode: (image: Bitmap, options?: ExportOptions) => Promise<Buffer> | Buffer;
  decode: (data: Buffer, options?: DecodeOptions) => Promise<Bitmap> | Bitmap;
}

/** The colour spaces jimp can create images in and convert to */
export type ColorSpaceName = "srgb" | "display-p3";

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export const JimpClassSchema = z.object({
  bitmap: z.object({
    // Buffer is a Uint8Array subclass, and the Buffer global isn't available everywhere
    data: z.instanceof(Uint8Array),
    width: z.number(),
    height: z.number(),
  }),
  iccProfile: z.instanceof(Uint8Array).optional(),
});

export interface JimpClass {
  background: number;
  bitmap: Bitmap;
  /**
   * The ICC colour profile of the image's pixels, or undefined for sRGB.
   * See `getColorSpace` in `@jimp/utils`.
   */
  iccProfile?: Buffer;

  getPixelIndex: (x: number, y: number, edgeHandling?: Edge) => number;
  getPixelColor: (x: number, y: number) => number;
  setPixelColor: (hex: number, x: number, y: number) => JimpClass;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scan(f: (x: number, y: number, idx: number) => any): JimpClass;
  scan(
    x: number,
    y: number,
    w: number,
    h: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cb: (x: number, y: number, idx: number) => any
  ): JimpClass;
  scan(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    x: number | ((x: number, y: number, idx: number) => any),
    y?: number,
    w?: number,
    h?: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    f?: (x: number, y: number, idx: number) => any
  ): JimpClass;
}
