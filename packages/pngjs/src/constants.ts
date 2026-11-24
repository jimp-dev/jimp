export const PNG_SIGNATURE = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

/**
 * How a PNG stores its pixels. The value is a sum of 1 (palette), 2 (colour)
 * and 4 (alpha channel).
 */
export enum ColorType {
  GRAYSCALE = 0,
  COLOR = 2,
  PALETTE = 3,
  GRAYSCALE_ALPHA = 4,
  COLOR_ALPHA = 6,
}

/** Bits per sample, or per palette index for palette images */
export type BitDepth = 1 | 2 | 4 | 8 | 16;

/** How each scanline is transformed before compression */
export enum FilterType {
  /** Try every filter on each line and keep the one that looks smallest */
  AUTO = -1,
  /** The line is stored as is */
  NONE = 0,
  /** Each byte minus the one a pixel to its left */
  SUB = 1,
  /** Each byte minus the one above it */
  UP = 2,
  /** Each byte minus the average of the ones to its left and above */
  AVERAGE = 3,
  /** Each byte minus whichever of left, above or above-left predicts it best */
  PAETH = 4,
}

/** The bit depths each colour type allows */
export const ALLOWED_BIT_DEPTHS: Record<ColorType, readonly BitDepth[]> = {
  [ColorType.GRAYSCALE]: [1, 2, 4, 8, 16],
  [ColorType.COLOR]: [8, 16],
  [ColorType.PALETTE]: [1, 2, 4, 8],
  [ColorType.GRAYSCALE_ALPHA]: [8, 16],
  [ColorType.COLOR_ALPHA]: [8, 16],
};

/** Samples (channels) per pixel of each colour type */
export const CHANNELS: Record<ColorType, number> = {
  [ColorType.GRAYSCALE]: 1,
  [ColorType.COLOR]: 3,
  [ColorType.PALETTE]: 1,
  [ColorType.GRAYSCALE_ALPHA]: 2,
  [ColorType.COLOR_ALPHA]: 4,
};

/** gAMA stores the gamma times 100000 */
export const GAMMA_DIVISION = 100000;

/** The largest length a chunk may have, 2^31 - 1 */
export const MAX_CHUNK_LENGTH = 0x7fffffff;

export function isColorType(value: number): value is ColorType {
  return value in CHANNELS;
}
