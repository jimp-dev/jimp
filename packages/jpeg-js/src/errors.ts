/**
 * Base class of every error @jimp/jpeg-js throws on purpose. Decoding never
 * throws anything else (no `TypeError` or `RangeError` from bad input), so
 * `error instanceof JpegError` tells a broken or unsupported JPEG apart from a
 * bug.
 */
export class JpegError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

/** The data is not a JPEG, or is corrupt or truncated. */
export class JpegFormatError extends JpegError {}

/**
 * The data is a JPEG, but uses a feature this decoder doesn't support, like
 * lossless or hierarchical coding.
 */
export class JpegUnsupportedError extends JpegError {}

/**
 * Decoding would go over `maxResolutionInMP`, `maxMemoryUsageInMB` or another
 * limit that protects against untrusted input.
 */
export class JpegLimitError extends JpegError {}
