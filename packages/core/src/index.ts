import { Buffer } from "buffer";
import {
  Bitmap,
  ColorSpaceName,
  Format,
  JimpClass,
  Edge,
} from "@jimp/types";
import {
  COLOR_SPACES,
  createColorConverter,
  cssColorToHex,
  DISPLAY_P3_PROFILE,
  getColorSpace,
  scan,
  scanIterator,
  SRGB,
} from "@jimp/utils";
import { to } from "await-to-js";
import { hasFileSystem, readFile, writeFile } from "@jimp/file-ops";
import mime from "mime/lite.js";
import type { ExifData } from "exif-parser";

import { composite, CompositeSource } from "./utils/composite.js";
import { BlendMode } from "./index.js";
import {
  attemptExifRotate,
  getExifOrientation,
} from "./utils/image-bitmap.js";
import { copyExif, writeJpegExif } from "./utils/exif.js";
import {
  ICC_MIME_TYPES,
  readIccProfile,
  writeIccProfile,
} from "./utils/icc.js";

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

/** Encoded image data that `Jimp.read` and `Jimp.fromBuffer` accept */
export type ImageInput = Buffer | ArrayBuffer | ArrayBufferView | Blob;

/** Get a Buffer of encoded image data, without copying it where possible */
async function toBuffer(input: ImageInput) {
  if (Buffer.isBuffer(input)) {
    return input;
  }

  if (input instanceof ArrayBuffer) {
    return bufferFromArrayBuffer(input);
  }

  // Uint8Array, DataView, a Node Buffer when a Buffer polyfill is used, ...
  if (ArrayBuffer.isView(input)) {
    return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  }

  if (typeof Blob !== "undefined" && input instanceof Blob) {
    return bufferFromArrayBuffer(await input.arrayBuffer());
  }

  throw new Error(
    "Expected image data as a Buffer, ArrayBuffer, Uint8Array (or other ArrayBuffer view) or Blob"
  );
}

/** Strings that are fetched rather than read from the file system */
const URL_PATTERN = /^(https?|data|blob):/i;

async function detectFileTypeFromBuffer(buffer: Buffer | ArrayBuffer) {
  const { fileTypeFromBuffer } = await import("file-type");
  return fileTypeFromBuffer(
    buffer instanceof ArrayBuffer
      ? buffer
      : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  );
}

export { getExifOrientation } from "./utils/image-bitmap.js";
export { composite } from "./utils/composite.js";
export type { CompositeSource } from "./utils/composite.js";
export type { ColorSpaceName } from "@jimp/types";
export * from "./utils/constants.js";

/**
 * Raw RGBA pixel data, 4 bytes per pixel.
 * `data` can be a Buffer, any Uint8Array (or a view into part of one),
 * a Uint8ClampedArray, or an array of 0xRRGGBBAA numbers.
 * An `ImageData` from a canvas fits this shape, so it can be passed directly.
 */
export interface RawImageData {
  width: number;
  height: number;
  data: Buffer | Uint8Array | Uint8ClampedArray | number[];
  /**
   * The colour space the pixel data is in.
   * @default "srgb"
   */
  colorSpace?: ColorSpaceName;
}

/**
 * Convert raw pixel data to the Buffer that Jimp stores.
 * A Buffer is used as is unless `copy` is set.
 * Any other data is always copied into a new Buffer. Typed arrays usually
 * belong to something the caller keeps using, such as a canvas's ImageData.
 * If Jimp shared that memory, methods that edit pixels in place would change
 * it but methods that replace the bitmap (resize, crop, ...) wouldn't.
 */
function toBitmapData(data: RawImageData["data"], copy: boolean) {
  if (Buffer.isBuffer(data)) {
    return copy ? Buffer.from(data) : data;
  }

  if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
    // Only copy the view's own bytes, not the whole ArrayBuffer it sits in
    return Buffer.from(
      new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
    );
  }

  if (Array.isArray(data)) {
    return Buffer.concat(
      data.map((hex) => Buffer.from(hex.toString(16).padStart(8, "0"), "hex"))
    );
  }

  throw new Error(
    "data must be a Buffer, Uint8Array, Uint8ClampedArray or an array of numbers"
  );
}

/**
 * Check raw image data and convert it to a Bitmap.
 * A bitmap whose data is already a Buffer is returned as is unless `copy` is set.
 */
function toBitmap(bitmap: RawImageData, copy: boolean): Bitmap {
  const { width, height } = bitmap;

  if (typeof height !== "number" || typeof width !== "number") {
    throw new Error("bitmap must have width and height");
  }

  const data = toBitmapData(bitmap.data, copy);
  const expectedLength = width * height * 4;

  // Exactly, not "at least": like ImageData, extra bytes almost always mean
  // the width, height or row stride is wrong. They'd also be read by code
  // that loops over data.length.
  if (data.length !== expectedLength) {
    throw new Error(
      `bitmap data is ${data.length} bytes, but a ${width}x${height} RGBA image needs exactly ${expectedLength} (width * height * 4)`
    );
  }

  return data === bitmap.data ? (bitmap as Bitmap) : { data, width, height };
}

/**
 * Instead of loading an image into an instance you can initialize a new Jimp instance with a empty bitmap.
 */
export interface JimpSimpleConstructorOptions {
  height: number;
  width: number;
  /**
   * Initialize the image with a color for each pixel.
   * A CSS color string is converted to the image's `colorSpace`, a number is
   * used as the pixel value.
   */
  color?: number | string;
  /**
   * The colour space of the image's pixels. Display P3 images can hold more
   * saturated colours than sRGB ones, and are written with a Display P3 ICC
   * profile.
   * @default "srgb"
   */
  colorSpace?: ColorSpaceName;
}

/** The ICC profile jimp writes for a colour space, undefined for sRGB */
function profileForColorSpace(colorSpace: ColorSpaceName = "srgb") {
  if (!(colorSpace in COLOR_SPACES)) {
    throw new Error(
      `Unknown color space "${colorSpace}", expected "srgb" or "display-p3"`
    );
  }

  return colorSpace === "display-p3" ? DISPLAY_P3_PROFILE : undefined;
}

export type JimpConstructorOptions = RawImageData | JimpSimpleConstructorOptions;

/** Converts a jimp plugin function to a Jimp class method */
type JimpInstanceMethod<ClassInstance, MethodMap, Method> =
  Method extends JimpChainableMethod<infer Args>
    ? (
        ...args: Args
      ) => ClassInstance & JimpInstanceMethods<ClassInstance, MethodMap>
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

/** A Jimp instance method that can be chained. */
type JimpChainableMethod<
  Args extends any[] = any[],
  J extends JimpClass = JimpClass,
> = (img: J, ...args: Args) => J;

/** A Jimp instance method that returns anything. */
type JimpMethod<
  Args extends any[] = any[],
  ReturnType = any,
  J extends JimpClass = JimpClass,
> = (img: J, ...args: Args) => ReturnType;

export interface JimpPlugin {
  [key: string]: JimpChainableMethod | JimpMethod;
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type Constructor<T> = new (...args: any[]) => T;

type JimpFormat<
  MimeType extends string = string,
  EncodeOptions extends Record<string, any> | undefined = undefined,
  DecodeOptions extends Record<string, any> | undefined = undefined,
  T extends Format<MimeType, EncodeOptions, DecodeOptions> = Format<
    MimeType,
    EncodeOptions,
    DecodeOptions
  >,
> = () => T;

// The helpers below are exported so that .d.ts files of packages using
// `createJimp` (like `jimp`) can refer to them by name. If tsc can't name them
// it expands them into a separate copy for each place the class type is
// repeated, and TypeScript treats those copies as unrelated types.
export type CreateMimeTypeToExportOptions<T extends Format<string, any>> =
  T extends Format<infer M, infer O> ? Record<M, DeclaredOptions<O>> : never;
/**
 * The encode options of a format. Formats whose encode doesn't take options
 * (GIF, TIFF, BMP) are inferred as `Record<string, any>`, which would accept
 * anything, so they take none.
 */
type DeclaredOptions<O> = string extends keyof NonNullable<O> ? undefined : O;
export type CreateMimeTypeToDecodeOptions<T extends Format<string, any>> =
  T extends Format<infer M, any, infer O> ? Record<M, O> : never;
export type GetOptionsForMimeType<Mime extends string, MimeTypeMap> =
  MimeTypeMap extends Record<Mime, infer O> ? O : never;
type ExportOptions<MimeTypeMap> =
  MimeTypeMap extends Record<string, infer O> ? O : never;

type MimeToExtension<M extends string> = `${string}/${M}`;
export type CreateExtensionToMimeType<M extends string> =
  M extends MimeToExtension<infer E> ? Record<E, M> : never;
export type GetMimeTypeForExtension<Mime extends string, MimeTypeMap> =
  MimeTypeMap extends Record<Mime, infer M> ? M : never;

/** The file extension of a path, e.g. "png" for "./output/image.png" */
export type PathExtension<Path extends string> =
  Path extends `${string}.${infer Rest}`
    ? [PathExtension<Rest>] extends [never]
      ? Rest
      : PathExtension<Rest>
    : never;
/** Extensions `mime` maps to a type with a differently spelled subtype */
type ExtensionAliases =
  | Record<"jpg" | "jpe", "image/jpeg">
  | Record<"tif", "image/tiff">;
type OrIfNever<T, Fallback> = [T] extends [never] ? Fallback : T;
/**
 * The options `write` takes for a path: those of the format its extension
 * maps to, or those of every format when that isn't known, e.g. for a
 * `string` from `path.join` or an extension no format handles.
 */
export type GetOptionsForPath<
  Path extends string,
  ExtensionToMimeType,
  MimeTypeToExportOptions,
> = string extends Path
  ? ExportOptions<MimeTypeToExportOptions>
  : OrIfNever<
      GetOptionsForMimeType<
        GetMimeTypeForExtension<
          Lowercase<PathExtension<Path>>,
          ExtensionToMimeType | ExtensionAliases
        > &
          string,
        MimeTypeToExportOptions
      >,
      ExportOptions<MimeTypeToExportOptions>
    >;

/**
 * Create a Jimp class that support the given image formats and methods
 */
export function createJimp<
  Methods extends JimpPlugin[],
  Formats extends JimpFormat[],
>({
  plugins: pluginsArg,
  formats: formatsArg,
}: {
  /** Plugins that add methods to the created Jimp class */
  plugins?: Methods;
  /** Image formats the Jimp class should support */
  formats?: Formats;
} = {}) {
  type ExtraMethodMap = JimpInstanceMethods<
    InstanceType<typeof CustomJimp>,
    UnionToIntersection<Methods[number]>
  >;
  /** The image type made by the constructor, static readers and chainable methods */
  type Instance = InstanceType<typeof CustomJimp> & ExtraMethodMap;
  type SupportedMimeTypes = ReturnType<Formats[number]>["mime"];
  type MimeTypeToExportOptions = CreateMimeTypeToExportOptions<
    ReturnType<Formats[number]>
  >;
  type MimeTypeToDecodeOptions = CreateMimeTypeToDecodeOptions<
    ReturnType<Formats[number]>
  >;
  type ExtensionToMimeType = CreateExtensionToMimeType<SupportedMimeTypes>;

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

    /** The original MIME type of the image */
    mime?: string;

    /**
     * The ICC colour profile the pixels are in, as read from a JPEG, PNG or
     * WebP, or undefined for sRGB. It's written to JPEG, PNG and WebP output.
     *
     * Setting it changes how the pixels are interpreted, without converting
     * them. Use `toColorSpace` to convert.
     */
    iccProfile?: Buffer;

    /**
     * Create a blank image (`{ width, height, color? }`) or one from raw RGBA
     * pixel data (`{ data, width, height }`, see {@link RawImageData}).
     *
     * A Buffer passed as `data` is used without copying, so the image and the
     * caller share it. Any other `data` is copied.
     * Use `Jimp.fromBitmap` to always copy.
     */
    constructor(options: JimpConstructorOptions = emptyBitmap) {
      // Add the formats
      this.formats = formats;

      this.iccProfile = profileForColorSpace(options.colorSpace);

      if ("data" in options) {
        // Buffers are used without copying. Other data is copied into a Buffer.
        this.bitmap = toBitmap(options, false);
      } else {
        this.bitmap = {
          data: Buffer.alloc(options.width * options.height * 4),
          width: options.width,
          height: options.height,
        };

        if (options.color) {
          this.background =
            typeof options.color === "string"
              ? cssColorToHex(options.color, getColorSpace(this))
              : options.color;

          for (let i = 0; i < this.bitmap.data.length; i += 4) {
            this.bitmap.data.writeUInt32BE(this.background, i);
          }
        }
      }

      // Add the plugins
      for (const methods of plugins) {
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

    /**
     * Create a Jimp instance from a URL, a file path, or encoded image data
     * (a Buffer, ArrayBuffer, Uint8Array or other ArrayBuffer view, or Blob).
     *
     * In Node, strings that aren't `http:`, `https:`, `data:` or `blob:` URLs
     * are read as file paths, so a missing file throws Node's `ENOENT` error.
     * In browsers, strings are always fetched.
     * @example
     * ```ts
     * import { Jimp } from "jimp";
     *
     * // Read from a file path
     * const image = await Jimp.read("test/image.png");
     *
     * // Read from a URL
     * const image = await Jimp.read("https://upload.wikimedia.org/wikipedia/commons/0/01/Bot-Test.jpg");
     *
     * // Read a file picked in the browser
     * const image = await Jimp.read(input.files[0]);
     * ```
     */
    static async read(
      url: string | ImageInput,
      options?: MimeTypeToDecodeOptions
    ): Promise<Instance> {
      if (typeof url !== "string") {
        return this.fromBuffer(url, options);
      }

      if (hasFileSystem && !URL_PATTERN.test(url)) {
        return this.fromBuffer(await readFile(url), options);
      }

      const [fetchErr, response] = await to(fetch(url));

      if (fetchErr) {
        throw new Error(`Could not load Buffer from URL: ${url}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP Status ${response.status} for url ${url}`);
      }

      const [arrayBufferErr, data] = await to(response.arrayBuffer());

      if (arrayBufferErr) {
        throw new Error(`Could not load Buffer from ${url}`);
      }

      const buffer = bufferFromArrayBuffer(data);
      return this.fromBuffer(buffer, options);
    }

    /**
     * Create a Jimp instance from raw RGBA pixel data, such as a canvas's `ImageData`.
     * `data` can be a Buffer, a Uint8Array, a Uint8ClampedArray or an array of
     * 0xRRGGBBAA numbers, and must hold exactly `width * height * 4` bytes.
     *
     * Unlike the constructor, this always copies the data, so changing the
     * image never changes the object you passed in.
     *
     * @example
     * ```ts
     * import { Jimp } from "jimp";
     *
     * const image = Jimp.fromBitmap({
     *   data: [
     *     0xffffffff, 0xffffffff, 0xffffffff,
     *     0xffffffff, 0xffffffff, 0xffffffff,
     *     0xffffffff, 0xffffffff, 0xffffffff,
     *   ],
     *   width: 3,
     *   height: 3,
     * });
     *
     * // In the browser
     * const fromCanvas = Jimp.fromBitmap(
     *   ctx.getImageData(0, 0, canvas.width, canvas.height)
     * );
     * ```
     */
    static fromBitmap(bitmap: RawImageData): Instance {
      return new CustomJimp({
        ...toBitmap(bitmap, true),
        colorSpace: bitmap.colorSpace,
      }) as Instance;
    }

    /**
     * Parse a bitmap with the loaded image types.
     *
     * @param buffer Encoded image data: a Buffer, ArrayBuffer, Uint8Array (or
     * other ArrayBuffer view) or Blob
     * @example
     * ```ts
     * import { Jimp } from "jimp";
     * import { readFile } from "node:fs/promises";
     *
     * const buffer = await readFile("test/image.png");
     * const image = await Jimp.fromBuffer(buffer);
     * ```
     */
    static async fromBuffer(
      buffer: ImageInput,
      options?: MimeTypeToDecodeOptions
    ): Promise<Instance> {
      const actualBuffer = await toBuffer(buffer);

      const mime = await detectFileTypeFromBuffer(actualBuffer);

      if (!mime || !mime.mime) {
        throw new Error("Could not find MIME for Buffer");
      }

      const format = formats.find((format) => format.mime === mime.mime);

      if (!format || !format.decode) {
        throw new Error(`Mime type ${mime.mime} does not support decoding`);
      }

      const image = new CustomJimp(
        await format.decode(actualBuffer, options?.[format.mime])
      ) as Instance;

      image.mime = mime.mime;

      attemptExifRotate(image, actualBuffer);
      image.iccProfile = readIccProfile(actualBuffer);

      return image;
    }

    /**
     * Nicely format Jimp object when sent to the console e.g. console.log(image)
     * @returns Pretty printed jimp object
     * @example
     * ```ts
     * import { Jimp } from "jimp";
     *
     * const image = await Jimp.read("test/image.png");
     *
     * console.log(image);
     * ```
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

    /** Get the width of the image */
    get width() {
      return this.bitmap.width;
    }

    /** Get the height of the image */
    get height() {
      return this.bitmap.height;
    }

    /**
     * The colour space of the image's pixels, from its ICC profile:
     * `"srgb"` (also for images without a profile), `"display-p3"`, or
     * `"custom"` for any other profile.
     * @example
     * ```ts
     * import { Jimp } from "jimp";
     *
     * const image = await Jimp.read("iphone-photo.jpg");
     *
     * image.colorSpace; // "display-p3"
     * ```
     */
    get colorSpace(): ColorSpaceName | "custom" {
      return getColorSpace(this).name;
    }

    /**
     * Converts the pixels to another colour space and sets the ICC profile to
     * match. Colours outside the new space (e.g. Display P3 colours more
     * saturated than sRGB can show) are clipped.
     *
     * Throws for images whose ICC profile jimp can't convert from: only RGB
     * profiles made of primaries and tone curves are supported.
     * @param colorSpace The colour space to convert to
     * @example
     * ```ts
     * import { Jimp } from "jimp";
     *
     * const image = await Jimp.read("iphone-photo.jpg");
     *
     * image.toColorSpace("srgb");
     * ```
     */
    toColorSpace<S extends JimpClass>(this: S, colorSpace: ColorSpaceName): S {
      const profile = profileForColorSpace(colorSpace);
      const from = getColorSpace(this);
      const to = COLOR_SPACES[colorSpace];

      if (from === to) {
        return this;
      }

      if (!from.toXyz) {
        throw new Error(
          "Can't convert from the image's ICC profile: only RGB profiles with primaries and tone curves are supported"
        );
      }

      createColorConverter(from, to)?.(this.bitmap.data);
      this.iccProfile = profile;

      return this;
    }

    /**
     * Converts the Jimp instance to an image buffer
     * @param mime The mime type to export to
     * @param options The options to use when exporting
     * @example
     * ```ts
     * import { Jimp } from "jimp";
     *
     * const image = new Jimp({ width: 3, height: 3, color: 0xffffffff });
     *
     * const buffer = await image.getBuffer("image/jpeg", {
     *   quality: 50,
     * });
     *
     * // Copy the EXIF data of a JPEG that was read, see JPEGOptions.exif
     * const photo = await Jimp.read("photo.jpg");
     * await photo.getBuffer("image/jpeg", { exif: true });
     *
     * // Write sRGB without an ICC profile, converting the colours if the image
     * // is in another colour space, see JPEGOptions.icc
     * await photo.getBuffer("image/jpeg", { icc: false });
     * ```
     */
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

      const { exif, icc } = (options ?? {}) as {
        exif?: boolean;
        icc?: boolean;
      };
      const writeProfile =
        this.iccProfile !== undefined &&
        icc !== false &&
        ICC_MIME_TYPES.has(mime);
      let outputImage: Jimp;

      if (format.hasAlpha) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        outputImage = this;
      } else {
        outputImage = new CustomJimp({
          width: this.bitmap.width,
          height: this.bitmap.height,
          color: this.background,
        });
        // The background is a pixel value in the image's colour space too
        outputImage.iccProfile = this.iccProfile;

        composite(outputImage, this);
      }

      // Output without the profile would be shown as sRGB, so convert it
      const toSrgb = writeProfile
        ? undefined
        : createColorConverter(getColorSpace(this), SRGB);

      if (toSrgb) {
        if (outputImage === this) {
          outputImage = this.clone();
        }

        toSrgb(outputImage.bitmap.data);
      }

      const data: Buffer | Uint8Array = await format.encode(
        outputImage.bitmap,
        options
      );

      // Some encoders (e.g. jpeg-js outside of CommonJS) return a plain Uint8Array
      let buffer = Buffer.isBuffer(data)
        ? data
        : Buffer.from(data.buffer, data.byteOffset, data.byteLength);

      if (mime === "image/jpeg" && exif) {
        buffer = writeJpegExif(this, buffer, {
          width: this.bitmap.width,
          height: this.bitmap.height,
          // 1 once the pixels have been auto-rotated on read
          orientation: getExifOrientation(this),
        });
      }

      if (writeProfile) {
        buffer = writeIccProfile(
          this.iccProfile!,
          mime,
          buffer,
          this.bitmap.width,
          this.bitmap.height
        );
      }

      return buffer;
    }

    /**
     * Converts the image to a base 64 string
     *
     * @param mime The mime type to export to
     * @param options The options to use when exporting
     * @example
     * ```ts
     * import { Jimp } from "jimp";
     *
     * const image = await Jimp.read("test/image.png");
     *
     * const base64 = await image.getBase64("image/jpeg", {
     *   quality: 50,
     * });
     * ```
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

    /**
     * Write the image to a file. The format is picked from the path's extension.
     * @param path the path to write the image to
     * @param options the options to use when writing the image. For a literal
     * path they're checked against its format's options (`.jpg` takes JPEG
     * options, `.gif` none, ...); for a `string` against those of every format.
     * @example
     * ```ts
     * import { Jimp } from "jimp";
     *
     * const image = await Jimp.read("test/image.png");
     *
     * await image.write("test/output.png");
     * await image.write("test/output.jpg", { quality: 80 });
     * ```
     */
    async write<Path extends string>(
      path: Path,
      options?: GetOptionsForPath<
        Path,
        ExtensionToMimeType,
        MimeTypeToExportOptions
      >
    ) {
      const mimeType = mime.getType(path);

      if (!mimeType) {
        throw new Error(
          `Cannot write "${path}": the path has no recognisable file extension to determine the image format`
        );
      }

      await writeFile(
        path,
        await this.getBuffer(
          mimeType as SupportedMimeTypes,
          options as GetOptionsForMimeType<
            SupportedMimeTypes,
            MimeTypeToExportOptions
          >
        )
      );
    }

    /**
     * Clone the image into a new Jimp instance.
     * @param this
     * @returns A new Jimp instance
     * @example
     * ```ts
     * import { Jimp } from "jimp";
     *
     * const image = new Jimp({ width: 3, height: 3, color: 0xffffffff });
     *
     * const clone = image.clone();
     * ```
     */
    clone<S extends JimpClass>(this: S) {
      const clone = new CustomJimp({
        ...this.bitmap,
        data: Buffer.from(this.bitmap.data),
      });
      const { _exif } = this as unknown as { _exif?: ExifData };

      if (_exif) {
        (clone as unknown as { _exif: ExifData })._exif = {
          ..._exif,
          tags: { ..._exif.tags },
        };
      }

      copyExif(this, clone);
      clone.iccProfile = this.iccProfile;
      clone.background = this.background;
      clone.mime = (this as { mime?: string }).mime;

      return clone as unknown as S;
    }

    /**
     * Returns the offset of a pixel in the bitmap buffer
     * @param x the x coordinate
     * @param y the y coordinate
     * @param edgeHandling (optional) define how to sum pixels from outside the border
     * @returns the index of the pixel or -1 if not found
     * @example
     * ```ts
     * import { Jimp } from "jimp";
     *
     * const image = new Jimp({ width: 3, height: 3, color: 0xffffffff });
     *
     * image.getPixelIndex(1, 1); // 2
     * ```
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
     * @example
     * ```ts
     * import { Jimp } from "jimp";
     *
     * const image = new Jimp({ width: 3, height: 3, color: 0xffffffff });
     *
     * image.getPixelColor(1, 1); // 0xffffffff
     * ```
     */
    getPixelColor(x: number, y: number) {
      if (typeof x !== "number" || typeof y !== "number") {
        throw new Error("x and y must be numbers");
      }

      const idx = this.getPixelIndex(x, y);
      return this.bitmap.data.readUInt32BE(idx);
    }

    /**
     * Sets the hex colour value of a pixel
     *
     * @param hex color to set
     * @param x the x coordinate
     * @param y the y coordinate
     *
     * @example
     * ```ts
     * import { Jimp } from "jimp";
     *
     * const image = new Jimp({ width: 3, height: 3, color: 0xffffffff });
     *
     * image.setPixelColor(0xff0000ff, 0, 0);
     * ```
     */
    setPixelColor<S extends JimpClass>(
      this: S,
      hex: number,
      x: number,
      y: number
    ): S {
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
     *
     * @example
     * ```ts
     * import { Jimp } from "jimp";
     *
     * const image = new Jimp({ width: 3, height: 3, color: 0xffffffaa });
     * const image2 = new Jimp({ width: 3, height: 3, color: 0xff0000ff });
     *
     * image.hasAlpha(); // false
     * image2.hasAlpha(); // true
     * ```
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
     * @example
     * ```ts
     * import { Jimp } from "jimp";
     *
     * const image = new Jimp({ width: 10, height: 10, color: 0xffffffff });
     * const image2 = new Jimp({ width: 3, height: 3, color: 0xff0000ff });
     *
     * image.composite(image2, 3, 3);
     * ```
     */
    composite<S extends JimpClass>(
      this: S,
      src: CompositeSource,
      x = 0,
      y = 0,
      options: {
        mode?: BlendMode;
        opacitySource?: number;
        opacityDest?: number;
      } = {}
    ): S {
      composite(this, src, x, y, options);
      return this;
    }

    /**
     * Scan through the image and call the callback for each pixel
     *
     * @example
     * ```ts
     * import { Jimp } from "jimp";
     *
     * const image = new Jimp({ width: 3, height: 3, color: 0xffffffff });
     *
     * image.scan((x, y, idx) => {
     *   // do something with the pixel
     * });
     *
     * // Or scan through just a region
     * image.scan(0, 0, 2, 2, (x, y, idx) => {
     *   // do something with the pixel
     * });
     * ```
     */
    scan<S extends JimpClass>(
      this: S,
      f: (x: number, y: number, idx: number) => any
    ): S;
    scan<S extends JimpClass>(
      this: S,
      x: number,
      y: number,
      w: number,
      h: number,
      cb: (x: number, y: number, idx: number) => any
    ): S;
    scan<S extends JimpClass>(
      this: S,
      x: number | ((x: number, y: number, idx: number) => any),
      y?: number,
      w?: number,
      h?: number,
      f?: (x: number, y: number, idx: number) => any
    ): S {
      return scan(this, x as any, y as any, w as any, h as any, f as any);
    }

    /**
     * Iterate scan through a region of the bitmap
     * @param x the x coordinate to begin the scan at
     * @param y the y coordinate to begin the scan at
     * @param w the width of the scan region
     * @param h the height of the scan region
     * @example
     * ```ts
     * import { Jimp } from "jimp";
     *
     * const image = new Jimp({ width: 3, height: 3, color: 0xffffffff });
     *
     * for (const { x, y, idx, image } of j.scanIterator()) {
     *   // do something with the pixel
     * }
     * ```
     */
    scanIterator<S extends JimpClass>(
      this: S,
      x = 0,
      y = 0,
      w = this.bitmap.width,
      h = this.bitmap.height
    ) {
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
