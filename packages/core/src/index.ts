import { Bitmap, Format, JimpClass, Edge } from "@jimp/types";
import { fromBuffer } from "file-type";

const emptyBitmap: Bitmap = {
  data: Buffer.alloc(0),
  width: 0,
  height: 0,
};

export type Constructor<T> = new (...args: any[]) => T;
type AnyFunction = (...args: any) => any;

/**
 * @author https://stackoverflow.com/users/2887218/jcalz
 * @see https://stackoverflow.com/a/50375286/10325032
 */
export type UnionToIntersection<Union> = (
  Union extends any ? (argument: Union) => void : never
) extends (argument: infer Intersection) => void // tslint:disable-line: no-unused
  ? Intersection
  : never;

export type ReturnTypeOf<T extends AnyFunction | AnyFunction[]> =
  T extends AnyFunction
    ? ReturnType<T>
    : T extends AnyFunction[]
      ? // exclude `void` from intersection, see octokit/octokit.js#2115
        UnionToIntersection<Exclude<ReturnType<T[number]>, void>>
      : never;

export interface JimpOptions {}

export type JimpPlugin = (
  octokit: Jimp,
  options: JimpOptions,
) => { [key: string]: any } | void;

export type JimpFormat<
  M extends string = string,
  T extends Format<M> = Format<M>,
> = (octokit: Jimp, options: JimpOptions) => T;

export type JimpFormatArray<T> =
  T extends Array<infer U>
    ? U extends JimpFormat<infer M, infer U>
      ? U
      : never
    : never;

export type JimpFormatMime<T> = T extends Format<infer M> ? M : never;

export type JimpMethod<Args extends any[] = any[]> = (
  img: Jimp,
  ...args: Args
) => Jimp;

type JimpInstanceMethod<M, T> =
  T extends JimpMethod<infer Args>
    ? (...args: Args) => JimpInstanceMethods<M>
    : never;

export type JimpInstanceMethods<T> = {
  [K in keyof T]: JimpInstanceMethod<T, T[K]>;
};

type JimpSupportedFormats<U> = U extends Format<infer M>[] ? M : never;

export * from "./utils/constants.js";

export class Jimp<
  SupportedMimeTypes extends string = string,
  Formats extends Format<SupportedMimeTypes>[] = Format<SupportedMimeTypes>[],
  MethodMap extends Record<string, JimpMethod> = Record<string, JimpMethod>,
> implements JimpClass
{
  static plugins: JimpPlugin[] = [];
  static formatPlugins: JimpFormat[] = [];
  static formats: Format[] = [];

  bitmap: Bitmap = emptyBitmap;
  methods: MethodMap = {} as MethodMap;
  formats: Format<SupportedMimeTypes>[] = [];

  /**
   * Attach a plugin (or many) to your jimp instance.
   *
   * @example
   * const API = Jimp.plugin(plugin1, plugin2, plugin3, ...)
   */
  static plugin<
    S extends Constructor<any> & { plugins: any[] },
    T extends JimpPlugin[],
  >(this: S, ...newPlugins: T) {
    const currentPlugins = this.plugins;
    const NewJimp = class extends this {
      static plugins = currentPlugins.concat(
        newPlugins.filter((plugin) => !currentPlugins.includes(plugin)),
      );
    };
    type Methods = JimpInstanceMethods<ReturnTypeOf<T>>;

    return NewJimp as typeof this & Constructor<Methods>;
  }

  /**
   * Attach a plugin (or many) to your jimp instance.
   *
   * @example
   * const API = Jimp.plugin(plugin1, plugin2, plugin3, ...)
   */
  static addFormat<
    S extends Constructor<any> & { formatPlugins: any[] },
    T extends JimpFormat[],
  >(this: S, ...newFormats: T) {
    const currentFormats = this.formatPlugins;
    const NewJimp = class extends this {
      static formatPlugins = currentFormats.concat(
        newFormats.filter((format) => !currentFormats.includes(format)),
      );
    };

    type NewFormats = JimpFormatArray<T>;
    type SupportedFormats = JimpFormatMime<NewFormats>;

    // return {} as SupportedFormats;
    return NewJimp as typeof this &
      Constructor<Jimp<SupportedFormats, NewFormats>>;
  }

  constructor(options: JimpOptions = {}) {
    const classConstructor = this.constructor as typeof Jimp;

    for (let i = 0; i < classConstructor.formatPlugins.length; ++i) {
      const formatPlugin = classConstructor.formatPlugins[i];

      if (formatPlugin) {
        const format = formatPlugin(this, options);
        this.formats.push(format as any);
      }
    }

    for (let i = 0; i < classConstructor.plugins.length; ++i) {
      const plugin = classConstructor.plugins[i];

      if (plugin) {
        const methods = plugin(this, options);

        if (methods) {
          for (const key in methods) {
            (this as any)[key] = (...args: any[]) => {
              const result = methods[key](this, ...args);

              if (result) {
                this.bitmap = result.bitmap;
              }
            };
          }
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

  async toBuffer(mime: JimpSupportedFormats<this["formats"]>) {
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
}
