import { Bitmap, Format } from "@jimp/types";
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

type JimpInstanceMethods<T> = {
  [K in keyof T]: JimpInstanceMethod<T, T[K]>;
};

type JimpOutputMethod<Instance, Output> = (mime: Instance) => Promise<Output>;

type JimpSupportedFormats<U> = U extends Format<infer M>[] ? M : never;

export class Jimp<
  SupportedMimeTypes extends string = string,
  Formats extends Format<SupportedMimeTypes>[] = Format<SupportedMimeTypes>[],
  MethodMap extends Record<string, JimpMethod> = Record<string, JimpMethod>,
> {
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
   * Returns the original MIME of the image (default: "image/png")
   * @returns {string} the MIME
   */
  // getMIME() {
  //   const mime = this._originalMime || Jimp.MIME_PNG;

  //   return mime;
  // }
}
