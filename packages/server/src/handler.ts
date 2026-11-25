import { z } from "zod";

import { sha256, toBase64Url } from "./encoding.js";
import { ImageHandlerError } from "./errors.js";
import { parseParams, type ImageEdit } from "./params.js";
import { canonicalQuery, SIGNATURE_PARAM, verifyUrl } from "./sign.js";

/** Encoded image data a source can return */
export type SourceData = ArrayBuffer | ArrayBufferView | Blob;

/**
 * Loads the image for a path. Return `null` (or `undefined`) if there's no
 * image there, and the handler responds with 404.
 * Throw an `ImageHandlerError` to respond with another status.
 * @param path The decoded path after `basePath`, without a leading slash,
 * e.g. `photos/cat.jpg`. It never contains `.` or `..` segments, empty
 * segments, backslashes or null characters.
 * @param request The request, e.g. to read headers from
 */
export type ImageSource = (
  path: string,
  request: Request,
) => SourceData | null | undefined | Promise<SourceData | null | undefined>;

/** The parts of a Jimp image the handler uses */
export interface JimpImage {
  bitmap: { width: number; height: number };
  background: number;
  mime?: string;
  formats: { mime: string; hasAlpha?: boolean; encode?: unknown }[];
  apply(edits: ImageEdit[]): unknown;
  getBuffer(
    mime: string,
    options?: Record<string, unknown>,
  ): Promise<Uint8Array>;
  hasAlpha(): boolean;
}

/** A Jimp class, from `jimp` or `createJimp` */
export interface JimpClassLike {
  new (): JimpImage;
  fromBuffer(
    data: Uint8Array,
    options?: Record<string, unknown>,
  ): Promise<JimpImage>;
}

/**
 * The methods edits can use by default: resizing and cropping, rotating and
 * flipping, and color and blur effects. Methods that draw text, take other
 * images or run arbitrary kernels aren't included.
 */
export const defaultAllowedEdits = [
  "autocrop",
  "blur",
  "border",
  "brightness",
  "circle",
  "contain",
  "contrast",
  "cover",
  "crop",
  "dither",
  "exposure",
  "fade",
  "flip",
  "gaussian",
  "greyscale",
  "invert",
  "normalize",
  "opacity",
  "opaque",
  "pixelate",
  "posterize",
  "resize",
  "rotate",
  "roundCorners",
  "scale",
  "scaleToFit",
  "sepia",
  "sharpen",
  "threshold",
  "vibrance",
];

/**
 * Formats whose decoders take `maxResolutionInMP`. `@jimp/wasm-jpeg` uses
 * the `image/jpeg` MIME type too, and ignores it.
 */
const LIMITED_FORMATS = [
  "image/avif",
  "image/bmp",
  "image/gif",
  "image/j2c",
  "image/jp2",
  "image/jpeg",
  "image/jpx",
  "image/jxl",
  "image/png",
  "image/svg+xml",
  "image/tiff",
  "image/vnd.microsoft.icon",
  "image/webp",
  "image/x-icon",
  "image/x-ms-bmp",
];

/** Formats the `q` param applies to */
const QUALITY_FORMATS = new Set([
  "image/avif",
  "image/jpeg",
  "image/jxl",
  "image/webp",
]);

/** Formats every browser shows, which `fm=auto` keeps */
const WEB_FORMATS = new Set(["image/gif", "image/jpeg", "image/png"]);

const ImageHandlerOptionsSchema = z.object({
  Jimp: z.custom<JimpClassLike>(
    (value) =>
      typeof value === "function" &&
      typeof (value as JimpClassLike).fromBuffer === "function",
    "Jimp must be a Jimp class, from jimp or createJimp",
  ),
  source: z.custom<ImageSource>(
    (value) => typeof value === "function",
    "source must be a function that loads an image for a path",
  ),
  basePath: z.string().regex(/^\//, "basePath must start with /").optional(),
  secret: z
    .union([z.string().min(1), z.array(z.string().min(1)).min(1)])
    .optional(),
  requireSignature: z.boolean().optional(),
  allowedEdits: z.array(z.string()).optional(),
  maxEdits: z.number().int().positive().optional(),
  maxSize: z.number().int().positive().optional(),
  maxSourceBytes: z.number().positive().optional(),
  maxSourceResolutionInMP: z.number().positive().optional(),
  quality: z.number().int().min(1).max(100).optional(),
  defaultFormat: z.enum(["original", "auto"]).optional(),
  cacheControl: z.string().optional(),
  readOptions: z.record(z.string(), z.unknown()).optional(),
  encodeOptions: z
    .record(z.string(), z.record(z.string(), z.unknown()))
    .optional(),
  onError: z
    .custom<(error: ImageHandlerError, request: Request) => void>(
      (value) => typeof value === "function",
      "onError must be a function",
    )
    .optional(),
});

export interface ImageHandlerOptions {
  /**
   * The Jimp class to read, edit and write images with: `Jimp` from `jimp`,
   * or a class from `createJimp` with the formats and plugins you need, such
   * as `@jimp/wasm-webp` and `@jimp/wasm-avif` for `fm=auto`
   */
  Jimp: JimpClassLike;
  /**
   * Loads the image for a path, e.g. `fetchSource({ baseUrl })`, or
   * `directorySource(root)` from `@jimp/server/node`
   */
  source: ImageSource;
  /**
   * The path the handler serves. Requests for other paths get a 404, and the
   * rest of the path is passed to `source`.
   * @default "/"
   */
  basePath?: string;
  /**
   * Secret for checking URL signatures (see `signUrl`). With a secret, every
   * request needs a valid `s` param unless `requireSignature` is false.
   * Pass several to rotate secrets: a signature from any of them is valid.
   */
  secret?: string | string[];
  /**
   * With `false`, unsigned requests are accepted too, but the `edits` param
   * still needs a signature.
   * @default true when there's a secret
   */
  requireSignature?: boolean;
  /**
   * The methods edits can use, from the params and the `edits` param.
   * @default defaultAllowedEdits
   */
  allowedEdits?: string[];
  /**
   * The most edits a request can make, including those from params
   * @default 10
   */
  maxEdits?: number;
  /**
   * The largest `w` and `h`, after `dpr`, in pixels. Edits can't make the
   * longest side of the image larger than this, or than the source's if it's
   * larger.
   * @default 4096
   */
  maxSize?: number;
  /**
   * The largest source file, in bytes
   * @default 20 MB
   */
  maxSourceBytes?: number;
  /**
   * The largest source image, in megapixels, as the `maxResolutionInMP`
   * decode option of each format that has one. A decoded image takes 4 bytes
   * per pixel, so 25 MP takes 100 MB.
   * @default 25
   */
  maxSourceResolutionInMP?: number;
  /**
   * The quality for AVIF, JPEG, JPEG XL and WebP when there's no `q` param
   * and `encodeOptions` doesn't set one
   * @default 75
   */
  quality?: number;
  /**
   * The output format when there's no `fm` param: the source's format, or
   * negotiated from the `Accept` header like `fm=auto`
   * @default "original"
   */
  defaultFormat?: "original" | "auto";
  /**
   * The Cache-Control header for images and 304 responses. Error responses
   * have `no-store`.
   * @default "public, max-age=86400, stale-while-revalidate=604800"
   */
  cacheControl?: string;
  /**
   * Options for `Jimp.fromBuffer`, keyed by MIME type like `Jimp.read`'s.
   * They're merged over the `maxSourceResolutionInMP` limits.
   */
  readOptions?: Record<string, unknown>;
  /**
   * Options for `getBuffer`, keyed by MIME type, e.g.
   * `{ "image/png": { deflateLevel: 6 } }`. A `q` param overrides their
   * `quality`.
   */
  encodeOptions?: Record<string, Record<string, unknown>>;
  /**
   * Called with every error before the handler responds, e.g. to log 5xx
   * errors. The error's `cause` is the original error.
   */
  onError?: (error: ImageHandlerError, request: Request) => void;
}

/**
 * Turn any error into an `ImageHandlerError`, choosing the status from what
 * went wrong
 */
function toHandlerError(error: unknown, fallbackStatus: number) {
  if (error instanceof ImageHandlerError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);

  return new ImageHandlerError(fallbackStatus, message, { cause: error });
}

/** Errors Jimp's decoders throw when an image is over a size limit */
const DECODE_LIMIT_ERROR =
  /maxResolutionInMP|maxMemoryUsageInMB|exceed the maximum resolution|exceeds? the maximum/;

/** Errors Jimp throws when no format can decode the data */
const UNSUPPORTED_ERROR =
  /Could not find MIME for Buffer|does not support decoding/;

function decodeError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  // "Couldn't read the WebP's dimensions to check maxResolutionInMP" isn't
  // about the size, so it falls through to a decode error
  if (DECODE_LIMIT_ERROR.test(message) && !/^Couldn't read/.test(message)) {
    return new ImageHandlerError(
      413,
      `The source image is too large: ${message}`,
      {
        cause: error,
      },
    );
  }

  if (UNSUPPORTED_ERROR.test(message)) {
    return new ImageHandlerError(
      415,
      "The source image's format isn't supported",
      { cause: error },
    );
  }

  return new ImageHandlerError(
    422,
    `The source image couldn't be decoded: ${message}`,
    { cause: error },
  );
}

function applyEdits(image: JimpImage, edits: ImageEdit[]) {
  try {
    image.apply(edits);
  } catch (error) {
    // Running out of memory isn't the request's fault
    if ((error as Error).cause instanceof RangeError) {
      throw toHandlerError(error, 500);
    }

    throw toHandlerError(error, 400);
  }
}

/** Whether the Accept header lists a MIME type, with a quality above 0 */
function accepts(accept: string, mime: string) {
  return accept.split(",").some((part) => {
    const [type, ...params] = part.split(";").map((value) => value.trim());

    if (type?.toLowerCase() !== mime) {
      return false;
    }

    const q = params.find((param) => /^q=/i.test(param));

    return q === undefined || Number(q.slice(2)) > 0;
  });
}

/**
 * Whether an If-None-Match header matches an ETag. `*` isn't matched: the
 * ETag is worked out before the edits run, and they can still fail.
 */
function matchesEtag(ifNoneMatch: string, etag: string) {
  return ifNoneMatch
    .split(",")
    .map((value) => value.trim().replace(/^W\//, ""))
    .some((value) => value === etag);
}

/** Split the path after `basePath` into checked, decoded segments */
function parsePath(pathname: string, basePath: string) {
  if (pathname !== basePath && !pathname.startsWith(`${basePath}/`)) {
    return undefined;
  }

  const rest = pathname.slice(basePath.length + 1);

  if (!rest) {
    throw new ImageHandlerError(400, "The URL needs an image path");
  }

  const segments = rest.split("/").map((segment) => {
    let decoded: string;

    try {
      decoded = decodeURIComponent(segment);
    } catch {
      throw new ImageHandlerError(400, "The image path isn't valid");
    }

    if (
      decoded === "" ||
      decoded === "." ||
      decoded === ".." ||
      /[/\\\0]/.test(decoded)
    ) {
      throw new ImageHandlerError(400, "The image path isn't valid");
    }

    return decoded;
  });

  return segments.join("/");
}

async function toBytes(data: SourceData) {
  if (data instanceof Uint8Array) {
    return data;
  }

  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }

  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }

  if (typeof Blob !== "undefined" && data instanceof Blob) {
    return new Uint8Array(await data.arrayBuffer());
  }

  throw new Error(
    "source must return an ArrayBuffer, a Uint8Array (or other ArrayBuffer view) or a Blob",
  );
}

function errorResponse(error: ImageHandlerError, method: string) {
  // Don't show internal details, like file paths, to clients
  const body =
    error.status >= 500
      ? error.status === 502
        ? "Bad Gateway"
        : error.status === 504
          ? "Gateway Timeout"
          : "Internal Server Error"
      : error.message;
  const headers = new Headers({
    "Cache-Control": "no-store",
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });

  if (error.status === 405) {
    headers.set("Allow", "GET, HEAD");
  }

  return new Response(method === "HEAD" ? null : body, {
    status: error.status,
    headers,
  });
}

/**
 * Create a handler that resizes, crops and converts images from URL params,
 * like `/images/cat.jpg?w=400&h=300&fm=auto`. It takes a web standard
 * `Request` and returns a `Response`, so it runs on Cloudflare Workers,
 * Vercel Edge Functions, Deno, Bun and Node.js (see `toNodeHandler` in
 * `@jimp/server/node`).
 * @example
 * ```ts
 * import { Jimp } from "jimp";
 * import { createImageHandler, fetchSource } from "@jimp/server";
 *
 * const handler = createImageHandler({
 *   Jimp,
 *   source: fetchSource({ baseUrl: "https://assets.example.com/" }),
 *   basePath: "/images",
 * });
 *
 * export default { fetch: handler };
 * ```
 */
export function createImageHandler(options: ImageHandlerOptions) {
  const parsed = ImageHandlerOptionsSchema.safeParse(options);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((issue) => issue.message).join("; "),
    );
  }

  const {
    Jimp,
    source,
    basePath: basePathOption = "/",
    secret,
    allowedEdits = defaultAllowedEdits,
    maxEdits = 10,
    maxSize = 4096,
    maxSourceBytes = 20 * 1024 * 1024,
    maxSourceResolutionInMP = 25,
    quality: defaultQuality = 75,
    defaultFormat = "original",
    cacheControl = "public, max-age=86400, stale-while-revalidate=604800",
    readOptions = {},
    encodeOptions = {},
    onError,
  } = parsed.data;
  const secrets = secret === undefined ? [] : [secret].flat();
  const requireSignature = parsed.data.requireSignature ?? secrets.length > 0;
  const basePath = basePathOption.replace(/\/+$/, "");
  const allowed = new Set(allowedEdits);

  // Plugin methods are added to each instance, so look at one
  const probe = new Jimp();
  const encodable = new Map(
    probe.formats
      .filter((format) => typeof format.encode === "function")
      .map((format) => [format.mime, format]),
  );

  const decodeOptions: Record<string, unknown> = {};

  for (const mime of LIMITED_FORMATS) {
    decodeOptions[mime] = { maxResolutionInMP: maxSourceResolutionInMP };
  }

  for (const [key, value] of Object.entries(readOptions)) {
    decodeOptions[key] =
      typeof value === "object" && value !== null && key in decodeOptions
        ? { ...(decodeOptions[key] as object), ...value }
        : value;
  }

  // Options that change the output, so a new config gets new ETags
  const configKey = JSON.stringify([
    probe.formats.map((format) => format.mime),
    defaultQuality,
    defaultFormat,
    maxSourceResolutionInMP,
    readOptions,
    encodeOptions,
  ]);

  function checkEdits(edits: ImageEdit[]) {
    if (edits.length > maxEdits) {
      throw new ImageHandlerError(
        422,
        `Too many edits: ${edits.length}, the most is ${maxEdits}`,
      );
    }

    for (const [name] of edits) {
      if (!allowed.has(name)) {
        throw new ImageHandlerError(400, `The ${name} edit isn't allowed`);
      }

      if (
        typeof (probe as unknown as Record<string, unknown>)[name] !==
        "function"
      ) {
        throw new ImageHandlerError(
          400,
          `The ${name} edit isn't available: the Jimp class has no ${name} method`,
        );
      }
    }
  }

  /** Pick the output format from the Accept header, for `fm=auto` */
  function negotiate(accept: string, image: JimpImage) {
    for (const mime of ["image/avif", "image/webp"]) {
      if (encodable.has(mime) && accepts(accept, mime)) {
        return mime;
      }
    }

    return fallbackFormat(image);
  }

  /** The source's format if browsers show it, otherwise PNG or JPEG */
  function fallbackFormat(image: JimpImage) {
    if (
      image.mime &&
      WEB_FORMATS.has(image.mime) &&
      encodable.has(image.mime)
    ) {
      return image.mime;
    }

    const mime = image.hasAlpha() ? "image/png" : "image/jpeg";

    if (encodable.has(mime)) {
      return mime;
    }

    throw new ImageHandlerError(
      415,
      "The Jimp class can't encode PNG or JPEG for this image",
    );
  }

  async function handle(request: Request): Promise<Response> {
    if (request.method !== "GET" && request.method !== "HEAD") {
      throw new ImageHandlerError(405, "Only GET and HEAD are supported");
    }

    const url = new URL(request.url);
    const path = parsePath(url.pathname, basePath);

    if (path === undefined) {
      throw new ImageHandlerError(404, "Not found");
    }

    const isSigned = secrets.length > 0 && (await verifyUrl(url, secrets));

    if (!isSigned && url.searchParams.has(SIGNATURE_PARAM)) {
      throw new ImageHandlerError(403, "The signature isn't valid");
    }

    if (!isSigned && requireSignature) {
      throw new ImageHandlerError(403, "The URL needs a signature");
    }

    if (!isSigned && url.searchParams.has("edits")) {
      throw secrets.length > 0
        ? new ImageHandlerError(403, "The edits param needs a signature")
        : new ImageHandlerError(
            400,
            "The edits param is only accepted on signed URLs",
          );
    }

    const params = parseParams(url.searchParams);

    for (const [name, value] of [
      ["w", params.width],
      ["h", params.height],
    ] as const) {
      if (value !== undefined && value > maxSize) {
        throw new ImageHandlerError(
          422,
          `${name} is ${value}, the most is ${maxSize}`,
        );
      }
    }

    checkEdits([...params.rawEdits, ...params.edits]);

    const format =
      params.format ?? (defaultFormat === "auto" ? "auto" : undefined);

    if (format && format !== "auto" && !encodable.has(format)) {
      throw new ImageHandlerError(415, `The Jimp class can't encode ${format}`);
    }

    let data: SourceData | null | undefined;

    try {
      data = await source(path, request);
    } catch (error) {
      throw toHandlerError(error, 500);
    }

    if (data === null || data === undefined) {
      throw new ImageHandlerError(404, "Not found");
    }

    const bytes = await toBytes(data);

    if (bytes.byteLength > maxSourceBytes) {
      throw new ImageHandlerError(
        413,
        `The source image is ${bytes.byteLength} bytes, the most is ${maxSourceBytes}`,
      );
    }

    const accept = request.headers.get("Accept") ?? "";
    // fm=auto picks a format from these, so they're part of the ETag
    const acceptKey =
      format === "auto"
        ? ["image/avif", "image/webp"]
            .filter((mime) => encodable.has(mime) && accepts(accept, mime))
            .join(",")
        : "";
    const etag = `"${toBase64Url(
      await sha256(
        [
          toBase64Url(await sha256(bytes)),
          canonicalQuery(url.searchParams),
          acceptKey,
          configKey,
        ].join("\n"),
      ),
    )}"`;
    const headers = new Headers({
      "Cache-Control": cacheControl,
      ETag: etag,
      "X-Content-Type-Options": "nosniff",
    });

    if (format === "auto") {
      headers.set("Vary", "Accept");
    }

    const ifNoneMatch = request.headers.get("If-None-Match");

    if (ifNoneMatch && matchesEtag(ifNoneMatch, etag)) {
      return new Response(null, { status: 304, headers });
    }

    let image: JimpImage;

    try {
      image = await Jimp.fromBuffer(bytes, decodeOptions);
    } catch (error) {
      throw decodeError(error);
    }

    const sourceSize = Math.max(image.bitmap.width, image.bitmap.height);

    if (params.background !== undefined) {
      image.background = params.background;
    }

    const largest = Math.max(maxSize, sourceSize);
    const tooLarge = (width: number, height: number) =>
      new ImageHandlerError(
        422,
        `The edits make the image ${width}x${height}, larger than the most of ${maxSize}`,
      );

    applyEdits(image, params.rawEdits);

    // With only w or h, the other side follows the aspect ratio, so a tall
    // image with a large w could take far more memory than maxSize allows.
    // Check it before resizing.
    if (params.resizesOneSide) {
      const turned = params.edits.some(
        ([name, deg]) => name === "rotate" && Math.abs(deg as number) % 180,
      );
      const [w, h] = turned
        ? [image.bitmap.height, image.bitmap.width]
        : [image.bitmap.width, image.bitmap.height];
      const width = params.width ?? Math.round((w * params.height!) / h);
      const height = params.height ?? Math.round((h * params.width!) / w);

      if (Math.max(width, height) > largest) {
        throw tooLarge(width, height);
      }
    }

    applyEdits(image, params.edits);

    if (Math.max(image.bitmap.width, image.bitmap.height) > largest) {
      throw tooLarge(image.bitmap.width, image.bitmap.height);
    }

    const mime =
      format === "auto"
        ? negotiate(accept, image)
        : (format ??
          (image.mime && encodable.has(image.mime)
            ? image.mime
            : fallbackFormat(image)));

    // Formats without alpha are drawn over the background: white, unless
    // the request sets bg
    if (!encodable.get(mime)?.hasAlpha && params.background === undefined) {
      image.background = 0xffffffff;
    }

    const quality =
      params.quality ?? encodeOptions[mime]?.quality ?? defaultQuality;
    let body: Uint8Array;

    try {
      body = await image.getBuffer(mime, {
        ...encodeOptions[mime],
        ...(QUALITY_FORMATS.has(mime) && { quality }),
      });
    } catch (error) {
      throw toHandlerError(error, 500);
    }

    headers.set("Content-Type", mime);
    headers.set("Content-Length", String(body.byteLength));

    return new Response(request.method === "HEAD" ? null : (body as BodyInit), {
      status: 200,
      headers,
    });
  }

  return async function imageHandler(request: Request): Promise<Response> {
    try {
      return await handle(request);
    } catch (error) {
      const handlerError = toHandlerError(error, 500);

      onError?.(handlerError, request);

      return errorResponse(handlerError, request.method);
    }
  };
}
