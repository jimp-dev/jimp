/**
 * Read the width and height of a WebP from its first chunk, without decoding
 * it. Returns undefined if the header isn't one we recognise.
 */
export function readWebpSize(
  data: Uint8Array,
): { width: number; height: number } | undefined {
  if (
    data.length < 16 ||
    ascii(data, 0) !== "RIFF" ||
    ascii(data, 8) !== "WEBP"
  ) {
    return undefined;
  }

  const chunk = ascii(data, 12);

  // The size fields end at byte 25 for VP8L and 30 for the others
  if (data.length < (chunk === "VP8L" ? 25 : 30)) {
    return undefined;
  }

  switch (chunk) {
    // Lossy: 14-bit sizes after the frame tag and start code
    case "VP8 ":
      return {
        width: (data[26]! | (data[27]! << 8)) & 0x3fff,
        height: (data[28]! | (data[29]! << 8)) & 0x3fff,
      };
    // Lossless: 14-bit sizes minus one, after the signature byte
    case "VP8L": {
      const bits =
        data[21]! | (data[22]! << 8) | (data[23]! << 16) | (data[24]! << 24);

      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >>> 14) & 0x3fff) + 1,
      };
    }
    // Extended (alpha, animation, metadata): 24-bit canvas sizes minus one
    case "VP8X":
      return {
        width: (data[24]! | (data[25]! << 8) | (data[26]! << 16)) + 1,
        height: (data[27]! | (data[28]! << 8) | (data[29]! << 16)) + 1,
      };
    default:
      return undefined;
  }
}

function ascii(data: Uint8Array, offset: number) {
  return String.fromCharCode(...data.subarray(offset, offset + 4));
}
