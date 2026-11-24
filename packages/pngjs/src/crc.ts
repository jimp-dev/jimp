let table: Uint32Array | undefined;

function getTable() {
  if (!table) {
    table = new Uint32Array(256);

    for (let i = 0; i < 256; i++) {
      let crc = i;

      for (let j = 0; j < 8; j++) {
        crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
      }

      table[i] = crc;
    }
  }

  return table;
}

/** CRC-32 as PNG uses it, continuing from `crc` if given */
export function crc32Js(data: Uint8Array, crc = 0) {
  const t = getTable();
  let c = ~crc;

  for (let i = 0; i < data.length; i++) {
    c = t[(c ^ data[i]!) & 0xff]! ^ (c >>> 8);
  }

  return ~c >>> 0;
}
