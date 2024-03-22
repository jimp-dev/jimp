import { Bitmap, Format, JimpClass, Edge } from "@jimp/types";
import { fromBuffer } from "file-type";

const emptyBitmap: Bitmap = {
  data: Buffer.alloc(0),
  width: 0,
  height: 0,
};

export * from "./utils/constants.js";

export interface JimpOptions {}

/** Converts a jimp plugin function to a Jimp class method */
type JimpInstanceMethod<M, T> =
  T extends JimpMethod<infer Args>
    ? (...args: Args) => JimpInstanceMethods<M>
    : T;

/** Converts a Record of jimp plugin functions to a Record of Jimp class methods */
export type JimpInstanceMethods<T> = {
  [K in keyof T]: JimpInstanceMethod<T, T[K]>;
};

type JimpMethod<Args extends any[] = any[], J extends JimpClass = JimpClass> = (
  img: J,
  ...args: Args
) => J;

type JimpPlugin = () => { [key: string]: JimpMethod } | void;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

type Constructor<T> = new (...args: any[]) => T;

type JimpFormat<M extends string = string, T extends Format<M> = Format<M>> = (
  octokit: any,
  options: JimpOptions,
) => T;

export function createJimp<
  Methods extends JimpPlugin[],
  Formats extends JimpFormat[],
>({ plugins, formats }: { plugins: Methods; formats: Formats }) {
  type ExtraMethodMap = JimpInstanceMethods<
    UnionToIntersection<ReturnType<Methods[number]>>
  >;
  type SupportedMimeTypes = ReturnType<Formats[number]>["mime"];

  const customJimp = class Jimp implements JimpClass {
    /**
     * The bitmap data of the image
     */
    bitmap: Bitmap = emptyBitmap;

    /** Formats that can be used with Jimp */
    formats: Format<any>[] = [];

    constructor(options: JimpOptions = {}) {
      // Add the formats
      for (const format of formats) {
        this.formats.push(format(this, options));
      }

      // Add the plugins
      for (const plugin of plugins) {
        const methods = plugin();

        if (methods) {
          for (const key in methods) {
            (this as any)[key] = (...args: any[]) => {
              const result = methods[key]?.(this, ...args);
              if (result) {
                this.bitmap = result.bitmap;
              }
              return this;
            };
          }
        }
      }
    }

    /**
     * Parse a bitmap with the loaded image types.
     *
     * @param {Buffer} data raw image data
     * @param {string} path optional path to file
     * @param {function(Error, Jimp)} finish (optional) a callback for when complete
     * @memberof Jimp
     */
    async fromBuffer(data: Buffer) {
      const mime = await fromBuffer(data);

      if (!mime || !mime.mime) {
        throw new Error("Could not find MIME for Buffer");
      }

      const format = this.formats.find((format) => format.mime === mime.mime);

      if (!format || !format.decode) {
        throw new Error(`Mime type ${mime.mime} does not support decoding`);
      }

      this.bitmap = await format.decode(data);
    }

    async toBuffer(mime: SupportedMimeTypes) {
      const format = this.formats.find((format) => format.mime === mime);

      if (!format || !format.encode) {
        throw new Error(`Unsupported MIME type: ${mime}`);
      }

      return format.encode(this.bitmap);
    }

    /**
     * Returns the offset of a pixel in the bitmap buffer
     * @param x the x coordinate
     * @param y the y coordinate
     * @param edgeHandling (optional) define how to sum pixels from outside the border
     * @returns the index of the pixel or -1 if not found
     */
    getPixelIndex(x: number, y: number, edgeHandling?: Edge) {
      let xi;
      let yi;

      if (!edgeHandling) {
        edgeHandling = Edge.EXTEND;
      }

      if (typeof x !== "number" || typeof y !== "number") {
        throw new Error("x and y must be numbers");
      }

      // round input
      x = Math.round(x);
      y = Math.round(y);
      xi = x;
      yi = y;

      if (edgeHandling === Edge.EXTEND) {
        if (x < 0) xi = 0;
        if (x >= this.bitmap.width) xi = this.bitmap.width - 1;
        if (y < 0) yi = 0;
        if (y >= this.bitmap.height) yi = this.bitmap.height - 1;
      }

      if (edgeHandling === Edge.WRAP) {
        if (x < 0) {
          xi = this.bitmap.width + x;
        }

        if (x >= this.bitmap.width) {
          xi = x % this.bitmap.width;
        }

        if (y < 0) {
          yi = this.bitmap.height + y;
        }

        if (y >= this.bitmap.height) {
          yi = y % this.bitmap.height;
        }
      }

      let i = (this.bitmap.width * yi + xi) << 2;

      // if out of bounds index is -1
      if (xi < 0 || xi >= this.bitmap.width) {
        i = -1;
      }

      if (yi < 0 || yi >= this.bitmap.height) {
        i = -1;
      }

      return i;
    }

    /**
     * Returns the hex color value of a pixel
     * @param x the x coordinate
     * @param y the y coordinate
     * @returns the color of the pixel
     */
    getPixelColor(x: number, y: number) {
      if (typeof x !== "number" || typeof y !== "number") {
        throw new Error("x and y must be numbers");
      }

      const idx = this.getPixelIndex(x, y);
      return this.bitmap.data.readUInt32BE(idx);
    }

    /**
     * Returns the hex colour value of a pixel
     * @param hex color to set
     * @param x the x coordinate
     * @param y the y coordinate
     * @returns the index of the pixel or -1 if not found
     */
    setPixelColor(hex: number, x: number, y: number) {
      if (
        typeof hex !== "number" ||
        typeof x !== "number" ||
        typeof y !== "number"
      ) {
        throw new Error("hex, x and y must be numbers");
      }

      const idx = this.getPixelIndex(x, y);
      this.bitmap.data.writeUInt32BE(hex, idx);

      return this;
    }
  };

  return customJimp as typeof customJimp & Constructor<ExtraMethodMap>;
}
