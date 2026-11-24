import { Jimp } from "jimp";
import type { JimpInstance, OpContext } from "./types";

/** Width the playground works at. Larger sources are scaled down first. */
export const PREVIEW_WIDTH = 360;

/** URL of a file in `public/`, respecting the site's base path. */
export function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

const cache = new Map<string, Promise<JimpInstance>>();

/** Decode an image from `public/` once and hand out copies. */
export async function loadImage(path: string): Promise<JimpInstance> {
  let pending = cache.get(path);
  if (!pending) {
    pending = Jimp.read(assetUrl(path)) as Promise<JimpInstance>;
    pending.catch(() => cache.delete(path));
    cache.set(path, pending);
  }
  return (await pending).clone();
}

/** Decode a user's file. */
export async function loadFile(file: File): Promise<JimpInstance> {
  return (await Jimp.fromBuffer(await file.arrayBuffer())) as JimpInstance;
}

/** Scale an image down to at most `width` pixels wide. Returns true if it was resized. */
export function fitWidth(image: JimpInstance, width: number) {
  if (image.bitmap.width <= width) return false;
  image.resize({ w: width });
  return true;
}

export function toDataUrl(image: JimpInstance) {
  return image.getBase64("image/png");
}

export const opContext: OpContext = { Jimp, loadImage };

interface ValidationIssue {
  path?: PropertyKey[];
  message: string;
}

/**
 * Jimp validates options with zod, whose error message is a JSON dump of the
 * issues. Turn that into one readable line, e.g. "w: Too small: expected
 * number to be >=0". Other errors keep their message.
 */
export function errorMessage(error: unknown): string {
  if (error && typeof error === "object" && "issues" in error) {
    const issues = (error as { issues: ValidationIssue[] }).issues;
    if (Array.isArray(issues) && issues.length) {
      return issues
        .map(({ path, message }) =>
          path?.length ? `${path.map(String).join(".")}: ${message}` : message,
        )
        .join("; ");
    }
  }
  return error instanceof Error ? error.message : String(error);
}
