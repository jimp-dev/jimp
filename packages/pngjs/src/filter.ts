function paeth(left: number, up: number, upLeft: number) {
  const pLeft = Math.abs(up - upLeft);
  const pUp = Math.abs(left - upLeft);
  const pUpLeft = Math.abs(left + up - upLeft - upLeft);

  if (pLeft <= pUp && pLeft <= pUpLeft) {
    return left;
  }

  return pUp <= pUpLeft ? up : upLeft;
}

/**
 * Reverses the filters of `height` lines in place. Each line is a filter type
 * byte followed by `lineBytes` bytes, starting at `offset`.
 *
 * @param stride Bytes per complete pixel, at least 1
 */
export function unfilter(
  data: Uint8Array,
  offset: number,
  lineBytes: number,
  height: number,
  stride: number,
) {
  // Where the previous line's pixels start, -1 for the first line
  let previous = -1;

  for (let y = 0; y < height; y++) {
    const filter = data[offset]!;
    const start = offset + 1;
    const end = start + lineBytes;

    switch (filter) {
      case 0:
        break;
      case 1:
        for (let i = start + stride; i < end; i++) {
          data[i] = data[i]! + data[i - stride]!;
        }

        break;
      case 2:
        if (previous >= 0) {
          for (let i = start, up = previous; i < end; i++, up++) {
            data[i] = data[i]! + data[up]!;
          }
        }

        break;
      case 3:
        if (previous < 0) {
          for (let i = start + stride; i < end; i++) {
            data[i] = data[i]! + (data[i - stride]! >> 1);
          }
        } else {
          const firstEnd = Math.min(start + stride, end);
          let i = start;
          let up = previous;

          for (; i < firstEnd; i++, up++) {
            data[i] = data[i]! + (data[up]! >> 1);
          }

          for (; i < end; i++, up++) {
            data[i] = data[i]! + ((data[i - stride]! + data[up]!) >> 1);
          }
        }

        break;
      case 4:
        if (previous < 0) {
          // With nothing above, Paeth predicts the left byte
          for (let i = start + stride; i < end; i++) {
            data[i] = data[i]! + data[i - stride]!;
          }
        } else {
          const firstEnd = Math.min(start + stride, end);
          let i = start;
          let up = previous;

          for (; i < firstEnd; i++, up++) {
            data[i] = data[i]! + data[up]!;
          }

          for (; i < end; i++, up++) {
            const left = data[i - stride]!;
            const above = data[up]!;
            const upLeft = data[up - stride]!;
            const p = left + above - upLeft;
            const pLeft = p > left ? p - left : left - p;
            const pAbove = p > above ? p - above : above - p;
            const pUpLeft = p > upLeft ? p - upLeft : upLeft - p;

            data[i] =
              data[i]! +
              (pLeft <= pAbove && pLeft <= pUpLeft
                ? left
                : pAbove <= pUpLeft
                  ? above
                  : upLeft);
          }
        }

        break;
      default:
        throw new Error(`Invalid filter type ${filter}`);
    }

    previous = start;
    offset = end;
  }
}

/**
 * Filters `height` lines of `lineBytes` bytes each, from `input` at
 * `inOffset` to `output` at `outOffset`, adding a filter type byte before
 * each line.
 *
 * With more than one filter type, each line uses the one with the smallest
 * sum of absolute differences, the first in `filterTypes` on a tie.
 */
export function filter(
  input: Uint8Array,
  inOffset: number,
  lineBytes: number,
  height: number,
  stride: number,
  filterTypes: readonly number[],
  output: Uint8Array,
  outOffset: number,
) {
  const sums = [0, 0, 0, 0, 0];
  const single = filterTypes.length === 1 ? filterTypes[0]! : -1;

  for (let y = 0; y < height; y++) {
    const start = inOffset + y * lineBytes;
    const end = start + lineBytes;
    // Where the line above starts, -1 for the first line
    const previous = y > 0 ? start - lineBytes : -1;
    let selected = single;

    if (selected < 0) {
      let sumNone = 0;
      let sumSub = 0;
      let sumUp = 0;
      let sumAverage = 0;
      let sumPaeth = 0;

      for (let i = start, x = 0; i < end; i++, x++) {
        const value = input[i]!;
        const left = x >= stride ? input[i - stride]! : 0;
        const up = previous >= 0 ? input[i - lineBytes]! : 0;
        const upLeft =
          previous >= 0 && x >= stride ? input[i - lineBytes - stride]! : 0;

        sumNone += value;
        sumSub += Math.abs(value - left);
        sumUp += Math.abs(value - up);
        sumAverage += Math.abs(value - ((left + up) >> 1));
        sumPaeth += Math.abs(value - paeth(left, up, upLeft));
      }

      sums[0] = sumNone;
      sums[1] = sumSub;
      sums[2] = sumUp;
      sums[3] = sumAverage;
      sums[4] = sumPaeth;

      let min = Infinity;

      for (const type of filterTypes) {
        if (sums[type]! < min) {
          min = sums[type]!;
          selected = type;
        }
      }
    }

    output[outOffset++] = selected;

    switch (selected) {
      case 0:
        output.set(input.subarray(start, end), outOffset);
        break;
      case 1:
        for (let i = start, x = 0; i < end; i++, x++) {
          output[outOffset + x] =
            input[i]! - (x >= stride ? input[i - stride]! : 0);
        }

        break;
      case 2:
        for (let i = start, x = 0; i < end; i++, x++) {
          output[outOffset + x] =
            input[i]! - (previous >= 0 ? input[i - lineBytes]! : 0);
        }

        break;
      case 3:
        for (let i = start, x = 0; i < end; i++, x++) {
          const left = x >= stride ? input[i - stride]! : 0;
          const up = previous >= 0 ? input[i - lineBytes]! : 0;

          output[outOffset + x] = input[i]! - ((left + up) >> 1);
        }

        break;
      case 4:
        for (let i = start, x = 0; i < end; i++, x++) {
          const left = x >= stride ? input[i - stride]! : 0;
          const up = previous >= 0 ? input[i - lineBytes]! : 0;
          const upLeft =
            previous >= 0 && x >= stride ? input[i - lineBytes - stride]! : 0;

          output[outOffset + x] = input[i]! - paeth(left, up, upLeft);
        }

        break;
      default:
        throw new Error(`Invalid filter type ${selected}`);
    }

    outOffset += lineBytes;
  }
}
