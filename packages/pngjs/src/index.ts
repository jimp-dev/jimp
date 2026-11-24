export { decode, readHeader } from "./decode.js";
export type { PngInput } from "./decode.js";
export { encode } from "./encode.js";
export { adjustGamma } from "./gamma.js";
export type { GammaImage } from "./gamma.js";
export { ColorType, FilterType } from "./constants.js";
export type { BitDepth } from "./constants.js";
export type {
  DecodeOptions,
  DecodedPng,
  EncodeOptions,
  IccProfile,
  ImageData,
  PaletteColor,
  PhysicalDimensions,
  PngHeader,
  PngMetadata,
  PngText,
  RenderingIntent,
} from "./types.js";

// The pngjs API
export { PNG } from "./png.js";
export type { BaseOptions, PNGOptions } from "./png.js";
export type {
  DeflateFactory,
  DeflateStream,
  LegacyColorType,
  Metadata,
  PNGWithMetadata,
  PackerOptions,
  ParserOptions,
} from "./legacy.js";
