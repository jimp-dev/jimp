import {
  ZStream,
  Z_BUF_ERROR,
  Z_OK,
  Z_STREAM_END,
  Z_SYNC_FLUSH,
  zlibInflate,
  zlibInflateEnd,
  zlibInflateInit2,
} from "pako";

/**
 * Inflates raw deflate data (no zlib header or checksum) with pako, stopping
 * after `maxLength` bytes. Data that ends early returns what it inflated so
 * far, so callers can decide whether that's enough.
 *
 * @param sizeHint The expected size, to allocate the output once. Defaults to
 * `maxLength`.
 */
export function inflateRawJs(
  data: Uint8Array,
  maxLength: number,
  sizeHint = maxLength,
): Uint8Array {
  const strm = new ZStream();

  zlibInflateInit2(strm, -15);
  strm.input = data;
  strm.next_in = 0;
  strm.avail_in = data.length;

  let output = new Uint8Array(Math.max(Math.min(sizeHint, maxLength), 1));

  strm.output = output;
  strm.next_out = 0;
  strm.avail_out = output.length;

  try {
    for (;;) {
      const status = zlibInflate(strm, Z_SYNC_FLUSH);

      if (
        status !== Z_OK &&
        status !== Z_STREAM_END &&
        status !== Z_BUF_ERROR
      ) {
        throw new Error(strm.msg || `zlib error ${status}`);
      }

      if (
        status === Z_STREAM_END ||
        strm.avail_out > 0 ||
        output.length >= maxLength
      ) {
        break;
      }

      // The output is full but there may be more: grow it
      const grown = new Uint8Array(Math.min(output.length * 2, maxLength));

      grown.set(output);
      output = grown;
      strm.output = output;
      strm.avail_out = output.length - strm.next_out;
    }
  } finally {
    zlibInflateEnd(strm);
  }

  return strm.next_out === output.length
    ? output
    : output.subarray(0, strm.next_out);
}
