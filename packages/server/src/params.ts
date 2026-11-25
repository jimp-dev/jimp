import { cssColorToHex } from "@jimp/utils";
import { z } from "zod";

import { fromBase64Url, toBase64Url, utf8 } from "./encoding.js";
import { ImageHandlerError } from "./errors.js";
import { SIGNATURE_PARAM } from "./sign.js";

/** One edit for `image.apply`: a method name followed by its arguments */
export type ImageEdit = [string, ...unknown[]];

/** The `fm` values, and the MIME types they encode to */
export const FORMATS: Record<string, string> = {
  avif: "image/avif",
  bmp: "image/bmp",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  jxl: "image/jxl",
  png: "image/png",
  tiff: "image/tiff",
  webp: "image/webp",
};

/** `pos` keywords, as `{ x, y }` fractions for cover and contain */
const POSITIONS: Record<string, { x: number; y: number }> = {
  center: { x: 0.5, y: 0.5 },
  top: { x: 0.5, y: 0 },
  bottom: { x: 0.5, y: 1 },
  left: { x: 0, y: 0.5 },
  right: { x: 1, y: 0.5 },
  "top-left": { x: 0, y: 0 },
  "top-right": { x: 1, y: 0 },
  "bottom-left": { x: 0, y: 1 },
  "bottom-right": { x: 1, y: 1 },
};

const TRUE = new Set(["", "1", "true"]);
const FALSE = new Set(["0", "false"]);

function wholeNumber(name: string, min: number, max: number) {
  return z
    .string()
    .regex(/^\d+$/, `${name} must be a whole number`)
    .transform(Number)
    .pipe(
      z
        .number()
        .min(min, `${name} must be at least ${min}`)
        .max(max, `${name} must be at most ${max}`),
    );
}

function decimal(name: string, min: number, max: number) {
  return z
    .string()
    .regex(/^\d+(\.\d+)?$/, `${name} must be a number`)
    .transform(Number)
    .pipe(
      z
        .number()
        .min(min, `${name} must be at least ${min}`)
        .max(max, `${name} must be at most ${max}`),
    );
}

function oneOf<T extends string>(name: string, values: readonly T[]) {
  return z
    .string()
    .refine((value): value is T => values.includes(value as T), {
      message: `${name} must be one of ${values.join(", ")}`,
    })
    .transform((value) => value as T);
}

const fraction = /^(0(\.\d+)?|1(\.0+)?)$/;

const ParamsSchema = z
  .object({
    w: wholeNumber("w", 1, Infinity).optional(),
    h: wholeNumber("h", 1, Infinity).optional(),
    dpr: decimal("dpr", 1, 4).optional(),
    fit: oneOf("fit", [
      "cover",
      "contain",
      "scale-to-fit",
      "fill",
    ] as const).optional(),
    pos: z
      .string()
      .transform((value, ctx) => {
        const keyword = POSITIONS[value];

        if (keyword) {
          return keyword;
        }

        const [x, y, ...rest] = value.split(",");

        if (
          x === undefined ||
          y === undefined ||
          rest.length > 0 ||
          !fraction.test(x) ||
          !fraction.test(y)
        ) {
          ctx.addIssue({
            code: "custom",
            message: `pos must be one of ${Object.keys(POSITIONS).join(", ")}, or x,y fractions from 0 to 1 like 0.5,0.2`,
          });
          return z.NEVER;
        }

        return { x: Number(x), y: Number(y) };
      })
      .optional(),
    q: wholeNumber("q", 1, 100).optional(),
    fm: oneOf("fm", ["auto", ...Object.keys(FORMATS)]).optional(),
    bg: z
      .string()
      .transform((value, ctx) => {
        try {
          // Hex without the #, which would need escaping in a URL
          return cssColorToHex(
            /^([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(value)
              ? `#${value}`
              : value,
          );
        } catch {
          ctx.addIssue({
            code: "custom",
            message: `bg must be a hex color like ff0000 or a CSS color, not "${value}"`,
          });
          return z.NEVER;
        }
      })
      .optional(),
    blur: wholeNumber("blur", 1, 100).optional(),
    sharpen: decimal("sharpen", 0, 10).optional(),
    greyscale: z
      .string()
      .refine((value) => TRUE.has(value) || FALSE.has(value), {
        message: "greyscale must be 1, true, 0 or false",
      })
      .transform((value) => TRUE.has(value))
      .optional(),
    rot: oneOf("rot", ["0", "90", "180", "270"] as const)
      .transform(Number)
      .optional(),
    flip: oneOf("flip", ["h", "v", "hv"] as const).optional(),
    edits: z.string().optional(),
  })
  .strict();

/** An image request, parsed from its URL params */
export interface ImageParams {
  /** The edits from the `edits` param, which run first */
  rawEdits: ImageEdit[];
  /** The edits from the other params, in order */
  edits: ImageEdit[];
  /** Whether the resize only sets one side, so the other follows the image */
  resizesOneSide: boolean;
  /** The width and height the request asks for, after `dpr` */
  width?: number;
  height?: number;
  /** `auto`, a MIME type, or undefined for the default */
  format?: string;
  quality?: number;
  background?: number;
}

function formatIssues(error: z.ZodError) {
  return error.issues
    .map((issue) => {
      if (issue.code === "unrecognized_keys") {
        return `Unknown param${issue.keys.length > 1 ? "s" : ""}: ${issue.keys.join(", ")}`;
      }

      return issue.message;
    })
    .join("; ");
}

/**
 * Encode edits for the `edits` param, as base64url JSON. URLs with `edits`
 * must be signed, see `signUrl`.
 * @example
 * ```ts
 * import { encodeEdits, signUrl } from "@jimp/server";
 *
 * const edits = encodeEdits([["crop", { x: 0, y: 0, w: 400, h: 400 }], ["circle"]]);
 * const src = await signUrl(`/images/team/ada.jpg?edits=${edits}&w=128`, secret);
 * ```
 */
export function encodeEdits(edits: ImageEdit[]) {
  return toBase64Url(utf8(JSON.stringify(edits)));
}

/** Decode the `edits` param: base64url JSON of an array of edits */
function parseRawEdits(value: string): ImageEdit[] {
  let edits: unknown;

  try {
    edits = JSON.parse(new TextDecoder().decode(fromBase64Url(value)));
  } catch {
    throw new ImageHandlerError(400, "edits must be base64url-encoded JSON");
  }

  if (
    !Array.isArray(edits) ||
    !edits.every((edit) => Array.isArray(edit) && typeof edit[0] === "string")
  ) {
    throw new ImageHandlerError(
      400,
      'edits must be an array of edits, like [["resize", { "w": 100 }]]',
    );
  }

  return edits as ImageEdit[];
}

/**
 * Turn the URL params into the edits to apply and the output to encode.
 * Throws an `ImageHandlerError` with status 400 for invalid params.
 */
export function parseParams(searchParams: URLSearchParams): ImageParams {
  const input: Record<string, string> = Object.create(null);

  for (const [key, value] of searchParams) {
    if (key === SIGNATURE_PARAM) {
      continue;
    }

    if (key in input) {
      throw new ImageHandlerError(400, `${key} is given more than once`);
    }

    input[key] = value;
  }

  const result = ParamsSchema.safeParse(input);

  if (!result.success) {
    throw new ImageHandlerError(400, formatIssues(result.error));
  }

  const params = result.data;
  const rawEdits = params.edits ? parseRawEdits(params.edits) : [];
  const edits: ImageEdit[] = [];
  const dpr = params.dpr ?? 1;
  const width = params.w === undefined ? undefined : Math.round(params.w * dpr);
  const height =
    params.h === undefined ? undefined : Math.round(params.h * dpr);

  // Jimp rotates counter-clockwise; rot turns the image clockwise, like
  // other image services
  if (params.rot) {
    edits.push(["rotate", -params.rot]);
  }

  if (params.flip) {
    edits.push([
      "flip",
      {
        horizontal: params.flip.includes("h"),
        vertical: params.flip.includes("v"),
      },
    ]);
  }

  if (width !== undefined && height !== undefined) {
    const fit = params.fit ?? "cover";
    const align = params.pos;

    if (fit === "cover" || fit === "contain") {
      edits.push([fit, { w: width, h: height, ...(align && { align }) }]);
    } else if (fit === "scale-to-fit") {
      edits.push(["scaleToFit", { w: width, h: height }]);
    } else {
      edits.push(["resize", { w: width, h: height }]);
    }
  } else if (width !== undefined) {
    edits.push(["resize", { w: width }]);
  } else if (height !== undefined) {
    edits.push(["resize", { h: height }]);
  }

  if (params.blur) {
    edits.push(["blur", params.blur]);
  }

  if (params.sharpen) {
    edits.push(["sharpen", { amount: params.sharpen }]);
  }

  if (params.greyscale) {
    edits.push(["greyscale"]);
  }

  return {
    rawEdits,
    edits,
    resizesOneSide: (width === undefined) !== (height === undefined),
    width,
    height,
    format:
      params.fm === undefined || params.fm === "auto"
        ? params.fm
        : FORMATS[params.fm],
    quality: params.q,
    background: params.bg,
  };
}
