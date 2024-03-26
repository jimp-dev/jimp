import { Bitmap, Format, JimpClass, Edge } from "@jimp/types";
import { cssColorToHex, scan, scanIterator } from "@jimp/utils";
import { fromBuffer } from "file-type";
import { to } from "await-to-js";

import { composite } from "./utils/composite.js";
import { BlendMode } from "./index.js";

const emptyBitmap: Bitmap = {
  data: Buffer.alloc(0),
  width: 0,
  height: 0,
};

/**
 * Prepare a Buffer object from the arrayBuffer.
 */
function bufferFromArrayBuffer(arrayBuffer: ArrayBuffer) {
  const buffer = Buffer.alloc(arrayBuffer.byteLength);
  const view = new Uint8Array(arrayBuffer);

  for (let i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i]!;
  }

  return buffer;
}

export { composite } from "./utils/composite.js";
export * from "./utils/constants.js";

export interface RawImageData {
  width: number;
  height: number;
  data: Buffer | Uint8Array | Uint8ClampedArray | number[];
}

export type JimpConstructorInit =
  | Bitmap
  | {
      height: number;
      width: number;
      color?: number | string;
    };

/** Converts a jimp plugin function to a Jimp class method */
type JimpInstanceMethod<ClassInstance, MethodMap, Method> =
  Method extends JimpChainableMethod<infer Args>
    ? (
        ...args: Args
      ) => JimpInstanceMethods<ClassInstance, MethodMap> & ClassInstance
    : Method extends JimpMethod<infer Args, infer Return>
      ? (...args: Args) => Return
      : never;

/** Converts a Record of jimp plugin functions to a Record of Jimp class methods */
export type JimpInstanceMethods<ClassInstance, MethodMap> = {
  [Key in keyof MethodMap]: JimpInstanceMethod<
    ClassInstance,
    MethodMap,
    MethodMap[Key]
  >;
};

/**
 * A Jimp instance method that can be chained.
 */
type JimpChainableMethod<
  Args extends any[] = any[],
  J extends JimpClass = JimpClass,
> = (img: J, ...args: Args) => J;

/**
 * A Jimp instance method that returns anything.
 */
type JimpMethod<
  Args extends any[] = any[],
  ReturnType = any,
  J extends JimpClass = JimpClass,
> = (img: J, ...args: Args) => ReturnType;

type JimpPlugin = () => {
  [key: string]: JimpChainableMethod | JimpMethod;
} | void;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type Constructor<T> = new (...args: any[]) => T;

type JimpFormat<
  M extends string = string,
  O extends Record<string, any> | undefined = undefined,
  T extends Format<M, O> = Format<M, O>,
> = () => T;

type CreateMimeTypeToExportOptions<T extends Format<string, any>> =
  T extends Format<infer M, infer O> ? Record<M, O> : never;

type GetOptionsForMimeType<Mime extends string, MimeTypeMap> =
  MimeTypeMap extends Record<Mime, infer O> ? O : never;

export function createJimp<
  Methods extends JimpPlugin[],
  Formats extends JimpFormat[],
>({
  plugins: pluginsArg,
  formats: formatsArg,
}: {
  plugins?: Methods;
  formats?: Formats;
}) {
  type ExtraMethodMap = JimpInstanceMethods<
    InstanceType<typeof CustomJimp>,
    UnionToIntersection<ReturnType<Methods[number]>>
  >;
  type SupportedMimeTypes = ReturnType<Formats[number]>["mime"];
  type MimeTypeToExportOptions = CreateMimeTypeToExportOptions<
    ReturnType<Formats[number]>
  >;

  const plugins = pluginsArg || [];
  const formats = (formatsArg || []).map((format) => format());

  const CustomJimp = class Jimp implements JimpClass {
    /**
     * The bitmap data of the image
     */
    bitmap: Bitmap = emptyBitmap;

    /**  Default color to use for new pixels */
    background = 0x00000000;

    /** Formats that can be used with Jimp */
    formats: Format<any>[] = [];

    constructor(options: JimpConstructorInit = emptyBitmap) {
      // Add the formats
      this.formats = formats;

      if ("data" in options) {
        this.bitmap = options;
      } else {
        this.bitmap = {
          data: Buffer.alloc(options.width * options.height * 4),
          width: options.width,
          height: options.height,
        };

        if (options.color) {
          this.background =
            typeof options.color === "string"
              ? cssColorToHex(options.color)
              : options.color;

          for (let i = 0; i < this.bitmap.data.length; i += 4) {
            this.bitmap.data.writeUInt32BE(this.background, i);
          }
        }
      }

      // Add the plugins
      for (const plugin of plugins) {
        const methods = plugin();

        if (methods) {
          for (const key in methods) {
            (this as any)[key] = (...args: any[]) => {
              const result = methods[key]?.(this, ...args);

              if (typeof result === "object" && "bitmap" in result) {
                this.bitmap = result.bitmap;
                return this;
              }

              return result;
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
    static async fromBuffer(data: Buffer) {
      const mime = await fromBuffer(data);

      if (!mime || !mime.mime) {
        throw new Error("Could not find MIME for Buffer");
      }

      const format = formats.find((format) => format.mime === mime.mime);

      if (!format || !format.decode) {
        throw new Error(`Mime type ${mime.mime} does not support decoding`);
      }

      return new CustomJimp(await format.decode(data)) as InstanceType<
        typeof CustomJimp
      > &
        ExtraMethodMap;
    }

    /**
     * Create a Jimp instance from a bitmap
     * @param bitmap
     * @returns
     */
    static fromBitmap(bitmap: RawImageData) {
      let data: Buffer | undefined;

      if (bitmap.data instanceof Buffer) {
        data = Buffer.from(bitmap.data);
      }

      if (
        bitmap.data instanceof Uint8Array ||
        bitmap.data instanceof Uint8ClampedArray
      ) {
        data = Buffer.from(bitmap.data.buffer);
      }

      if (Array.isArray(bitmap.data)) {
        data = Buffer.concat(
          bitmap.data.map((hex) =>
            Buffer.from(hex.toString(16).padStart(8, "0"), "hex")
          )
        );
      }

      if (!data) {
        throw new Error("data must be a Buffer");
      }

      return new CustomJimp({ ...bitmap, data }) as InstanceType<
        typeof CustomJimp
      > &
        ExtraMethodMap;
    }

    /**
     * Create a Jimp instance from a URL
     */
    static async fromUrl(url: string) {
      const [fetchErr, response] = await to(fetch(url));

      if (fetchErr) {
        throw new Error(`Could not load Buffer from ${url}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP Status ${response.status} for url ${url}`);
      }

      const [arrayBufferErr, data] = await to(response.arrayBuffer());

      if (arrayBufferErr) {
        throw new Error(`Could not load Buffer from ${url}`);
      }

      const buffer = bufferFromArrayBuffer(data);
      return this.fromBuffer(buffer);
    }

    /**
     * Nicely format Jimp object when sent to the console e.g. console.log(image)
     * @returns pretty printed
     */
    inspect() {
      return (
        "<Jimp " +
        (this.bitmap === emptyBitmap
          ? "pending..."
          : this.bitmap.width + "x" + this.bitmap.height) +
        ">"
      );
    }

    /**
     * Nicely format Jimp object when converted to a string
     * @returns pretty printed
     */
    toString() {
      return "[object Jimp]";
    }

    async getBuffer<
      ProvidedMimeType extends SupportedMimeTypes,
      Options extends GetOptionsForMimeType<
        ProvidedMimeType,
        MimeTypeToExportOptions
      >,
    >(mime: ProvidedMimeType, options?: Options) {
      const format = this.formats.find((format) => format.mime === mime);

      if (!format || !format.encode) {
        throw new Error(`Unsupported MIME type: ${mime}`);
      }

      let outputImage: Jimp;

      if (format.hasAlpha) {
        outputImage = this;
      } else {
        outputImage = new CustomJimp({
          width: this.bitmap.width,
          height: this.bitmap.height,
          color: this.background,
        });

        composite(outputImage, this);
      }

      return format.encode(outputImage.bitmap, options);
    }

    /**
     * Converts the image to a base 64 string
     */
    async getBase64<
      ProvidedMimeType extends SupportedMimeTypes,
      Options extends GetOptionsForMimeType<
        ProvidedMimeType,
        MimeTypeToExportOptions
      >,
    >(mime: ProvidedMimeType, options?: Options) {
      const data = await this.getBuffer(mime, options);
      return "data:" + mime + ";base64," + data.toString("base64");
    }

    clone<S extends typeof CustomJimp>(this: S) {
      return new CustomJimp({
        ...(this as any).bitmap,
        data: Buffer.from((this as any).bitmap.data),
      }) as unknown as S;
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

    /**
     * Determine if the image contains opaque pixels.
     */
    hasAlpha() {
      const { width, height, data } = this.bitmap;
      const byteLen = (width * height) << 2;

      for (let idx = 3; idx < byteLen; idx += 4) {
        if (data[idx] !== 0xff) {
          return true;
        }
      }

      return false;
    }

    /**
     * Composites a source image over to this image respecting alpha channels
     * @param src the source Jimp instance
     * @param x the x position to blit the image
     * @param y the y position to blit the image
     * @param options determine what mode to use
     */
    composite<I extends typeof this>(
      src: I,
      x = 0,
      y = 0,
      options: {
        mode?: BlendMode;
        opacitySource?: number;
        opacityDest?: number;
      } = {}
    ) {
      return composite(this, src, x, y, options);
    }

    scan(f: (x: number, y: number, idx: number) => any): this;
    scan(
      x: number,
      y: number,
      w: number,
      h: number,
      cb: (x: number, y: number, idx: number) => any
    ): this;
    scan(
      x: number | ((x: number, y: number, idx: number) => any),
      y?: number,
      w?: number,
      h?: number,
      f?: (x: number, y: number, idx: number) => any
    ): this {
      return scan(this, x as any, y as any, w as any, h as any, f as any);
    }

    /**
     * Iterate scan through a region of the bitmap
     * @param x the x coordinate to begin the scan at
     * @param y the y coordinate to begin the scan at
     * @param w the width of the scan region
     * @param h the height of the scan region
     */
    scanIterator(x: number, y: number, w: number, h: number) {
      if (typeof x !== "number" || typeof y !== "number") {
        throw new Error("x and y must be numbers");
      }

      if (typeof w !== "number" || typeof h !== "number") {
        throw new Error("w and h must be numbers");
      }

      return scanIterator(this, x, y, w, h);
    }
  };

  return CustomJimp as typeof CustomJimp & Constructor<ExtraMethodMap>;
}
