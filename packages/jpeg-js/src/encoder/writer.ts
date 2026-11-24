/** Writes bytes, and entropy-coded bits with 0xFF byte stuffing. */
export class ByteWriter {
  private buffer: Uint8Array;
  private length = 0;
  private bitBuffer = 0;
  private bitCount = 0;

  constructor(initialSize = 1024) {
    this.buffer = new Uint8Array(initialSize);
  }

  private reserve(bytes: number) {
    if (this.length + bytes <= this.buffer.length) {
      return;
    }

    const grown = new Uint8Array(
      Math.max(this.buffer.length * 2, this.length + bytes),
    );

    grown.set(this.buffer.subarray(0, this.length));
    this.buffer = grown;
  }

  writeByte(value: number) {
    this.reserve(1);
    this.buffer[this.length++] = value;
  }

  writeUint16(value: number) {
    this.reserve(2);
    this.buffer[this.length++] = value >> 8;
    this.buffer[this.length++] = value;
  }

  writeBytes(bytes: ArrayLike<number>) {
    this.reserve(bytes.length);

    if (bytes instanceof Uint8Array) {
      this.buffer.set(bytes, this.length);
      this.length += bytes.length;
    } else {
      for (let i = 0; i < bytes.length; i++) {
        this.buffer[this.length++] = bytes[i]!;
      }
    }
  }

  /** Writes the low `count` (at most 16) bits of `value`. */
  writeBits(value: number, count: number) {
    this.bitBuffer = (this.bitBuffer << count) | (value & ((1 << count) - 1));
    this.bitCount += count;

    if (this.bitCount < 8) {
      return;
    }

    // At most 3 bytes, doubled by stuffing
    this.reserve(6);

    const buffer = this.buffer;

    while (this.bitCount >= 8) {
      this.bitCount -= 8;

      const byte = (this.bitBuffer >> this.bitCount) & 0xff;

      buffer[this.length++] = byte;

      if (byte === 0xff) {
        buffer[this.length++] = 0;
      }
    }

    this.bitBuffer &= (1 << this.bitCount) - 1;
  }

  /** Pads the last partial byte with 1 bits. */
  flushBits() {
    if (this.bitCount > 0) {
      this.writeBits(0x7f, 8 - this.bitCount);
    }

    this.bitBuffer = 0;
    this.bitCount = 0;
  }

  result() {
    return this.buffer.slice(0, this.length);
  }
}
