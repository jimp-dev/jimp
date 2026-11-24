import { decode, encode } from "./compat.js";

export {
  JpegError,
  JpegFormatError,
  JpegLimitError,
  JpegUnsupportedError,
} from "./errors.js";
export {
  decodeJpeg,
  type DecodeJpegOptions,
  type JpegData,
  type JpegImage,
} from "./decode.js";
export {
  encodeJpeg,
  type EncodeJpegOptions,
  type RawImageData,
} from "./encode.js";
export {
  decode,
  encode,
  type DecodedImage,
  type DecodeOptions,
  type EncodedImage,
  type EncodeInput,
} from "./compat.js";

/** Like jpeg-js's `module.exports`, for `import jpeg from "@jimp/jpeg-js"`. */
export default { decode, encode };
