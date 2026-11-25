/**
 * The picture on a method's Open Graph image: the method applied to the
 * playground's dice photo, with the options its sticker on /methods/ uses.
 */
import { Jimp, type JimpInstance } from "jimp";
import path from "node:path";

import { resolveIcon, toolIcons } from "../components/icons";
import { PREVIEW_WIDTH } from "../components/playground/images";
import { defaultOptions, opForMethod } from "../components/playground/registry";
import type { Options, OpContext } from "../components/playground/types";

const file = (...parts: string[]) => path.join(process.cwd(), ...parts);

const images = new Map<string, Promise<JimpInstance>>();

/** An image from `public/`, read once and copied for each use */
async function publicImage(name: string) {
  let image = images.get(name);

  if (!image) {
    image = Jimp.read(file("public", name)) as Promise<JimpInstance>;
    images.set(name, image);
  }

  return (await image).clone();
}

// The playground's context, reading from public/ on disk instead of the site
const context: OpContext = { Jimp, loadImage: publicImage };

/**
 * The method applied to the dice photo, at the playground's size, or
 * undefined when it has no picture to show (no op, an op whose sticker is
 * an icon, or an op that can't run at build time).
 */
export async function preview(method: string) {
  const op = opForMethod(method);

  if (!op || op.thumbnail === false) {
    return undefined;
  }

  const image = await publicImage("dice.png");

  if (image.bitmap.width > PREVIEW_WIDTH) {
    image.resize({ w: PREVIEW_WIDTH });
  }

  try {
    const options = {
      ...defaultOptions(op, image.bitmap),
      ...op.thumbnail,
    } as Options;

    await op.apply(image, options, context);
  } catch {
    return undefined;
  }

  return image;
}

/**
 * The icon a method's sticker on /methods/ shows: its own, its op's, or
 * `fallback`, its category's
 */
export function methodIcon(method: string, fallback?: string) {
  const op = opForMethod(method);

  return toolIcons[method] ?? (op ? resolveIcon(op.icon) : fallback);
}
