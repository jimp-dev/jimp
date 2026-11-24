import { toBuffer, toUint8Array } from "./buffer.js";
import type { PngInput } from "./decode.js";
import { decodePixels } from "./pixels.js";
import { readPng } from "./read.js";
import type { FrameControl } from "./read.js";
import type { DecodeOptions, PngHeader } from "./types.js";

export interface DecodeFramesOptions extends DecodeOptions {
  /** Only decode this many frames, from the start @default Infinity */
  maxFrames?: number;
}

export interface PngFrame<Data extends Uint8Array | Uint16Array = Uint8Array> {
  /**
   * The whole image as it looks during this frame, as RGBA samples: the
   * frame has been drawn over the ones before it
   */
  data: Data;
  /** How long the frame is shown, in milliseconds */
  delay: number;
}

export interface DecodedFrames<
  Data extends Uint8Array | Uint16Array = Uint8Array,
> extends PngHeader {
  frames: PngFrame<Data>[];
  /**
   * How many times the animation plays, 0 for forever. Undefined for PNGs
   * that aren't animated.
   */
  plays?: number;
}

const DISPOSE_BACKGROUND = 1;
const DISPOSE_PREVIOUS = 2;
const BLEND_OVER = 1;

/** Copies a rectangle of RGBA pixels between images of different widths */
function copyRect(
  from: Uint8Array | Uint16Array,
  fromWidth: number,
  to: Uint8Array | Uint16Array,
  toWidth: number,
  x: number,
  y: number,
  width: number,
  height: number,
  toCanvas: boolean,
) {
  for (let row = 0; row < height; row++) {
    const canvasStart = ((y + row) * (toCanvas ? toWidth : fromWidth) + x) * 4;
    const rectStart = row * width * 4;

    if (toCanvas) {
      to.set(from.subarray(rectStart, rectStart + width * 4), canvasStart);
    } else {
      to.set(from.subarray(canvasStart, canvasStart + width * 4), rectStart);
    }
  }
}

/** Draws a frame over the canvas with "over" alpha compositing */
function blendOver(
  frame: Uint8Array | Uint16Array,
  canvas: Uint8Array | Uint16Array,
  canvasWidth: number,
  control: FrameControl,
  max: number,
) {
  for (let row = 0; row < control.height; row++) {
    let i = row * control.width * 4;
    let o = ((control.y + row) * canvasWidth + control.x) * 4;

    for (let x = 0; x < control.width; x++, i += 4, o += 4) {
      const sa = frame[i + 3]!;

      if (sa === max) {
        canvas[o] = frame[i]!;
        canvas[o + 1] = frame[i + 1]!;
        canvas[o + 2] = frame[i + 2]!;
        canvas[o + 3] = max;
      } else if (sa > 0) {
        const da = (canvas[o + 3]! * (max - sa)) / max;
        const a = sa + da;

        canvas[o] = Math.round((frame[i]! * sa + canvas[o]! * da) / a);
        canvas[o + 1] = Math.round(
          (frame[i + 1]! * sa + canvas[o + 1]! * da) / a,
        );
        canvas[o + 2] = Math.round(
          (frame[i + 2]! * sa + canvas[o + 2]! * da) / a,
        );
        canvas[o + 3] = Math.round(a);
      }
    }
  }
}

/**
 * Decodes every frame of an animated PNG (APNG). Each frame is the whole
 * image, with the frames before it drawn underneath as the animation says.
 * A PNG that isn't animated has one frame, the image.
 *
 * Frames after a broken one are dropped, so the animation plays as far as it
 * can, like in browsers.
 */
export function decodeFrames(
  data: PngInput,
  options: DecodeFramesOptions & { outputDepth: 16 },
): DecodedFrames<Uint16Array>;
export function decodeFrames(
  data: PngInput,
  options?: DecodeFramesOptions & { outputDepth?: 8 },
): DecodedFrames<Uint8Array>;
export function decodeFrames(
  data: PngInput,
  {
    checkCRC = true,
    outputDepth = 8,
    maxFrames = Infinity,
  }: DecodeFramesOptions = {},
): DecodedFrames<Uint8Array> | DecodedFrames<Uint16Array> {
  const file = readPng(toUint8Array(data), { checkCRC, frames: true });
  const mode = outputDepth === 16 ? 16 : 8;
  const info = {
    ...file.header,
    palette: file.palette,
    transparentColor: file.transparentColor,
  };
  const wrap = (pixels: Uint8Array | Uint16Array) =>
    pixels instanceof Uint8Array ? toBuffer(pixels) : pixels;

  if (!file.animation || file.frames.length === 0) {
    return {
      ...file.header,
      frames: [{ data: wrap(decodePixels(info, file.idat, mode)), delay: 0 }],
    } as DecodedFrames<Uint8Array>;
  }

  const { width, height } = file.header;
  const max = mode === 16 ? 65535 : 255;
  const canvas =
    mode === 16
      ? new Uint16Array(width * height * 4)
      : new Uint8Array(width * height * 4);
  const frames: PngFrame<Uint8Array | Uint16Array>[] = [];

  for (const [index, frame] of file.frames.entries()) {
    if (frames.length >= maxFrames) {
      break;
    }

    const { control } = frame;
    let pixels: Uint8Array | Uint16Array;

    try {
      pixels = decodePixels(
        { ...info, width: control.width, height: control.height },
        frame.data,
        mode,
      );
    } catch (error) {
      if (index === 0) {
        throw error;
      }

      break;
    }

    // The first frame can't restore the canvas from before it
    const dispose =
      index === 0 && control.dispose === DISPOSE_PREVIOUS
        ? DISPOSE_BACKGROUND
        : control.dispose;
    let saved: Uint8Array | Uint16Array | undefined;

    if (dispose === DISPOSE_PREVIOUS) {
      saved = canvas.slice(0, control.width * control.height * 4);
      copyRect(
        canvas,
        width,
        saved,
        control.width,
        control.x,
        control.y,
        control.width,
        control.height,
        false,
      );
    }

    if (control.blend === BLEND_OVER) {
      blendOver(pixels, canvas, width, control, max);
    } else {
      copyRect(
        pixels,
        control.width,
        canvas,
        width,
        control.x,
        control.y,
        control.width,
        control.height,
        true,
      );
    }

    frames.push({ data: wrap(canvas.slice()), delay: control.delay });

    if (dispose === DISPOSE_BACKGROUND) {
      copyRect(
        new Uint8Array(control.width * control.height * 4),
        control.width,
        canvas,
        width,
        control.x,
        control.y,
        control.width,
        control.height,
        true,
      );
    } else if (saved) {
      copyRect(
        saved,
        control.width,
        canvas,
        width,
        control.x,
        control.y,
        control.width,
        control.height,
        true,
      );
    }
  }

  return {
    ...file.header,
    frames,
    plays: file.animation.loops,
  } as DecodedFrames<Uint8Array>;
}
