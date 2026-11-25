/** Boxes that only hold other boxes, on the way to the image sizes */
const CONTAINERS = new Set(["meta", "iprp", "ipco"]);

/**
 * Read the width and height of an AVIF from the image spatial extents
 * (`ispe`) properties in its `meta` box, without decoding it. A file can
 * describe several images (a grid and its tiles, a thumbnail, an alpha plane),
 * so this returns the largest. Returns undefined if there's no `ispe`, and
 * leaves the codec to report the error.
 */
export function readAvifSize(
  data: Uint8Array,
): { width: number; height: number } | undefined {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let largest: { width: number; height: number } | undefined;

  function walk(start: number, end: number) {
    let offset = start;

    while (offset + 8 <= end) {
      let size = view.getUint32(offset);
      const type = String.fromCharCode(
        ...data.subarray(offset + 4, offset + 8),
      );
      let header = 8;

      if (size === 1) {
        if (offset + 16 > end) return;
        size = Number(view.getBigUint64(offset + 8));
        header = 16;
      } else if (size === 0) {
        size = end - offset;
      }

      if (size < header || offset + size > end) return;

      const boxEnd = offset + size;

      if (type === "ispe" && size >= header + 12) {
        // A full box: version and flags, then the width and height
        const width = view.getUint32(offset + header + 4);
        const height = view.getUint32(offset + header + 8);

        if (!largest || width * height > largest.width * largest.height) {
          largest = { width, height };
        }
      } else if (CONTAINERS.has(type)) {
        // meta is a full box, so its children start after version and flags
        walk(offset + header + (type === "meta" ? 4 : 0), boxEnd);
      }

      offset = boxEnd;
    }
  }

  walk(0, data.length);

  return largest;
}
