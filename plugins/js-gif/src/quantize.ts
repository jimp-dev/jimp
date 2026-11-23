/**
 * Palette selection for the GIF encoder.
 *
 * A GIF frame has at most 256 palette entries. Images that fit get an exact
 * palette. Other images are quantized with Xiaolin Wu's algorithm on a
 * 64x64x64 color histogram, so memory for palette selection doesn't depend
 * on the image size. Pixels are then mapped to their nearest palette color.
 *
 * Pixels with an alpha of 0 are transparent and use their own palette index.
 * All other pixels are treated as opaque.
 */

export interface IndexedImage {
  /** 0xRRGGBB colors, padded to a power of two between 2 and 256 */
  palette: number[];
  /** One palette index per pixel */
  indexes: Uint8Array;
  /** Index used for pixels with an alpha of 0, if there are any */
  transparentIndex: number | null;
}

const MAX_COLORS = 256;

// The histogram has 64 levels per channel, plus a zero border at index 0
// so the cumulative moments can be read without bounds checks.
const HIST_SHIFT = 2;
const SIDE = (256 >> HIST_SHIFT) + 1;
const SIDE2 = SIDE * SIDE;
const HIST_SIZE = SIDE * SIDE2;

// Nearest color candidates are kept per cell of 4x4x4 colors.
const CELL_SHIFT = 2;
const CELL_BITS = 8 - CELL_SHIFT;

// Exact colors are counted in a small open-addressing hash set.
const COLOR_SET_BITS = 10;
const COLOR_SET_SIZE = 1 << COLOR_SET_BITS;
const EMPTY = -1;

function colorSlot(keys: Int32Array, rgb: number) {
  let slot = Math.imul(rgb, 0x9e3779b1) >>> (32 - COLOR_SET_BITS);

  while (keys[slot] !== EMPTY && keys[slot] !== rgb) {
    slot = (slot + 1) & (COLOR_SET_SIZE - 1);
  }

  return slot;
}

/** Map an RGBA bitmap to palette indexes */
export function indexImage(
  data: Uint8Array,
  width: number,
  height: number
): IndexedImage {
  const length = width * height * 4;
  const keys = new Int32Array(COLOR_SET_SIZE).fill(EMPTY);
  let colorCount = 0;
  let usesTransparency = false;
  let lastRgb = -1;

  for (let i = 0; i < length; i += 4) {
    if (data[i + 3] === 0) {
      usesTransparency = true;
      continue;
    }

    const rgb = (data[i]! << 16) | (data[i + 1]! << 8) | data[i + 2]!;

    if (rgb === lastRgb || colorCount > MAX_COLORS) {
      continue;
    }

    lastRgb = rgb;

    const slot = colorSlot(keys, rgb);

    if (keys[slot] === EMPTY) {
      keys[slot] = rgb;
      colorCount++;
    }
  }

  const maxColors = usesTransparency ? MAX_COLORS - 1 : MAX_COLORS;
  const indexes = new Uint8Array(width * height);
  let colors: number[];

  if (colorCount <= maxColors) {
    colors = mapExact(data, length, keys, indexes);
  } else {
    colors = buildPalette(data, length, maxColors);
    mapNearest(data, length, colors, indexes);
    // One k-means step: the histogram only has 64 levels per channel,
    // so move each color to the exact mean of the pixels mapped to it
    colors = refinePalette(data, length, colors.length, indexes);
    mapNearest(data, length, colors, indexes);
  }

  let transparentIndex: number | null = null;

  if (usesTransparency) {
    transparentIndex = colors.length;

    for (let i = 3, j = 0; i < length; i += 4, j++) {
      if (data[i] === 0) {
        indexes[j] = transparentIndex;
      }
    }
  }

  return {
    palette: padPalette(colors, usesTransparency),
    indexes,
    transparentIndex,
  };
}

/** GIF palettes must have a power of two entries, at least 2 */
function padPalette(colors: number[], usesTransparency: boolean) {
  const count = colors.length + (usesTransparency ? 1 : 0);
  let size = 2;

  while (size < count) {
    size <<= 1;
  }

  const palette = colors.slice();

  while (palette.length < size) {
    palette.push(0);
  }

  return palette;
}

/** Use every color in the image as the palette, sorted ascending */
function mapExact(
  data: Uint8Array,
  length: number,
  keys: Int32Array,
  indexes: Uint8Array
) {
  const colors = Array.from(keys.filter((key) => key !== EMPTY)).sort(
    (a, b) => a - b
  );
  const values = new Uint8Array(COLOR_SET_SIZE);

  for (let i = 0; i < colors.length; i++) {
    values[colorSlot(keys, colors[i]!)] = i;
  }

  for (let i = 0, j = 0; i < length; i += 4, j++) {
    if (data[i + 3] !== 0) {
      const rgb = (data[i]! << 16) | (data[i + 1]! << 8) | data[i + 2]!;
      indexes[j] = values[colorSlot(keys, rgb)]!;
    }
  }

  return colors;
}

interface Box {
  r0: number;
  r1: number;
  g0: number;
  g1: number;
  b0: number;
  b1: number;
  vol: number;
}

const RED = 0;
const GREEN = 1;
const BLUE = 2;

/**
 * Xiaolin Wu's color quantizer
 * (Graphics Gems II, "Efficient Statistical Computations for Optimal Color
 * Quantization"). Boxes of the histogram are split until there are
 * `maxColors` of them, always splitting the box with the largest variance
 * where the split minimizes the summed variance of the two halves.
 */
function buildPalette(data: Uint8Array, length: number, maxColors: number) {
  // Cumulative moments: pixel count, channel sums and sum of squares
  const wt = new Float64Array(HIST_SIZE);
  const mr = new Float64Array(HIST_SIZE);
  const mg = new Float64Array(HIST_SIZE);
  const mb = new Float64Array(HIST_SIZE);
  const m2 = new Float64Array(HIST_SIZE);

  for (let i = 0; i < length; i += 4) {
    if (data[i + 3] === 0) {
      continue;
    }

    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const index =
      ((r >> HIST_SHIFT) + 1) * SIDE2 +
      ((g >> HIST_SHIFT) + 1) * SIDE +
      (b >> HIST_SHIFT) +
      1;

    wt[index] = wt[index]! + 1;
    mr[index] = mr[index]! + r;
    mg[index] = mg[index]! + g;
    mb[index] = mb[index]! + b;
    m2[index] = m2[index]! + r * r + g * g + b * b;
  }

  computeMoments(wt, mr, mg, mb, m2);

  const top = SIDE - 1;
  const boxes: Box[] = [
    { r0: 0, r1: top, g0: 0, g1: top, b0: 0, b1: top, vol: top ** 3 },
  ];
  const variances = new Float64Array(maxColors);
  const variance = (box: Box) => {
    if (box.vol <= 1) {
      return 0;
    }

    const r = volume(box, mr);
    const g = volume(box, mg);
    const b = volume(box, mb);

    return volume(box, m2) - (r * r + g * g + b * b) / volume(box, wt);
  };

  let next = 0;

  for (let i = 1; i < maxColors; i++) {
    const box: Box = { r0: 0, r1: 0, g0: 0, g1: 0, b0: 0, b1: 0, vol: 0 };

    if (cut(boxes[next]!, box, wt, mr, mg, mb)) {
      boxes[i] = box;
      variances[next] = variance(boxes[next]!);
      variances[i] = variance(box);
    } else {
      variances[next] = 0;
      i--;
    }

    next = 0;

    for (let k = 1; k <= i; k++) {
      if (variances[k]! > variances[next]!) {
        next = k;
      }
    }

    if (variances[next]! <= 0) {
      break;
    }
  }

  const colors = new Set<number>();

  for (const box of boxes) {
    const weight = volume(box, wt);

    if (weight > 0) {
      const r = Math.round(volume(box, mr) / weight);
      const g = Math.round(volume(box, mg) / weight);
      const b = Math.round(volume(box, mb) / weight);
      colors.add((r << 16) | (g << 8) | b);
    }
  }

  return Array.from(colors).sort((a, b) => a - b);
}

/** Replace each palette color with the mean of the pixels mapped to it */
function refinePalette(
  data: Uint8Array,
  length: number,
  count: number,
  indexes: Uint8Array
) {
  const sums = new Float64Array(count * 4);

  for (let i = 0, j = 0; i < length; i += 4, j++) {
    if (data[i + 3] === 0) {
      continue;
    }

    const sum = indexes[j]! * 4;

    sums[sum] = sums[sum]! + 1;
    sums[sum + 1] = sums[sum + 1]! + data[i]!;
    sums[sum + 2] = sums[sum + 2]! + data[i + 1]!;
    sums[sum + 3] = sums[sum + 3]! + data[i + 2]!;
  }

  const colors = new Set<number>();

  for (let sum = 0; sum < sums.length; sum += 4) {
    const weight = sums[sum]!;

    if (weight > 0) {
      const r = Math.round(sums[sum + 1]! / weight);
      const g = Math.round(sums[sum + 2]! / weight);
      const b = Math.round(sums[sum + 3]! / weight);
      colors.add((r << 16) | (g << 8) | b);
    }
  }

  return Array.from(colors).sort((a, b) => a - b);
}

/** Turn the histogram into cumulative moments, in place */
function computeMoments(
  wt: Float64Array,
  mr: Float64Array,
  mg: Float64Array,
  mb: Float64Array,
  m2: Float64Array
) {
  const areaW = new Float64Array(SIDE);
  const areaR = new Float64Array(SIDE);
  const areaG = new Float64Array(SIDE);
  const areaB = new Float64Array(SIDE);
  const area2 = new Float64Array(SIDE);

  for (let r = 1; r < SIDE; r++) {
    areaW.fill(0);
    areaR.fill(0);
    areaG.fill(0);
    areaB.fill(0);
    area2.fill(0);

    for (let g = 1; g < SIDE; g++) {
      let lineW = 0;
      let lineR = 0;
      let lineG = 0;
      let lineB = 0;
      let line2 = 0;

      for (let b = 1; b < SIDE; b++) {
        const index = r * SIDE2 + g * SIDE + b;
        const prev = index - SIDE2;

        lineW += wt[index]!;
        lineR += mr[index]!;
        lineG += mg[index]!;
        lineB += mb[index]!;
        line2 += m2[index]!;

        areaW[b] = areaW[b]! + lineW;
        areaR[b] = areaR[b]! + lineR;
        areaG[b] = areaG[b]! + lineG;
        areaB[b] = areaB[b]! + lineB;
        area2[b] = area2[b]! + line2;

        wt[index] = wt[prev]! + areaW[b]!;
        mr[index] = mr[prev]! + areaR[b]!;
        mg[index] = mg[prev]! + areaG[b]!;
        mb[index] = mb[prev]! + areaB[b]!;
        m2[index] = m2[prev]! + area2[b]!;
      }
    }
  }
}

function at(r: number, g: number, b: number) {
  return r * SIDE2 + g * SIDE + b;
}

/** Sum of a moment over a box */
function volume({ r0, r1, g0, g1, b0, b1 }: Box, m: Float64Array) {
  return (
    m[at(r1, g1, b1)]! -
    m[at(r1, g1, b0)]! -
    m[at(r1, g0, b1)]! +
    m[at(r1, g0, b0)]! -
    m[at(r0, g1, b1)]! +
    m[at(r0, g1, b0)]! +
    m[at(r0, g0, b1)]! -
    m[at(r0, g0, b0)]!
  );
}

/** Part of a box's volume that doesn't depend on the split position */
function bottom(
  { r0, r1, g0, g1, b0, b1 }: Box,
  direction: number,
  m: Float64Array
) {
  switch (direction) {
    case RED:
      return (
        -m[at(r0, g1, b1)]! +
        m[at(r0, g1, b0)]! +
        m[at(r0, g0, b1)]! -
        m[at(r0, g0, b0)]!
      );
    case GREEN:
      return (
        -m[at(r1, g0, b1)]! +
        m[at(r1, g0, b0)]! +
        m[at(r0, g0, b1)]! -
        m[at(r0, g0, b0)]!
      );
    default:
      return (
        -m[at(r1, g1, b0)]! +
        m[at(r1, g0, b0)]! +
        m[at(r0, g1, b0)]! -
        m[at(r0, g0, b0)]!
      );
  }
}

/** Part of a box's volume below a split at `position` */
function top(
  { r0, r1, g0, g1, b0, b1 }: Box,
  direction: number,
  position: number,
  m: Float64Array
) {
  switch (direction) {
    case RED:
      return (
        m[at(position, g1, b1)]! -
        m[at(position, g1, b0)]! -
        m[at(position, g0, b1)]! +
        m[at(position, g0, b0)]!
      );
    case GREEN:
      return (
        m[at(r1, position, b1)]! -
        m[at(r1, position, b0)]! -
        m[at(r0, position, b1)]! +
        m[at(r0, position, b0)]!
      );
    default:
      return (
        m[at(r1, g1, position)]! -
        m[at(r1, g0, position)]! -
        m[at(r0, g1, position)]! +
        m[at(r0, g0, position)]!
      );
  }
}

/** Find the split along one axis that best separates the box */
function maximize(
  box: Box,
  direction: number,
  first: number,
  last: number,
  whole: [number, number, number, number],
  wt: Float64Array,
  mr: Float64Array,
  mg: Float64Array,
  mb: Float64Array
) {
  const [wholeW, wholeR, wholeG, wholeB] = whole;
  const baseW = bottom(box, direction, wt);
  const baseR = bottom(box, direction, mr);
  const baseG = bottom(box, direction, mg);
  const baseB = bottom(box, direction, mb);
  let max = 0;
  let position = -1;

  for (let i = first; i < last; i++) {
    let halfW = baseW + top(box, direction, i, wt);

    if (halfW === 0) {
      continue;
    }

    let halfR = baseR + top(box, direction, i, mr);
    let halfG = baseG + top(box, direction, i, mg);
    let halfB = baseB + top(box, direction, i, mb);
    let score = (halfR * halfR + halfG * halfG + halfB * halfB) / halfW;

    halfW = wholeW - halfW;

    if (halfW === 0) {
      continue;
    }

    halfR = wholeR - halfR;
    halfG = wholeG - halfG;
    halfB = wholeB - halfB;
    score += (halfR * halfR + halfG * halfG + halfB * halfB) / halfW;

    if (score > max) {
      max = score;
      position = i;
    }
  }

  return { max, position };
}

/** Split `box` in two, storing the upper half in `other` */
function cut(
  box: Box,
  other: Box,
  wt: Float64Array,
  mr: Float64Array,
  mg: Float64Array,
  mb: Float64Array
) {
  const whole: [number, number, number, number] = [
    volume(box, wt),
    volume(box, mr),
    volume(box, mg),
    volume(box, mb),
  ];
  const red = maximize(box, RED, box.r0 + 1, box.r1, whole, wt, mr, mg, mb);
  const green = maximize(box, GREEN, box.g0 + 1, box.g1, whole, wt, mr, mg, mb);
  const blue = maximize(box, BLUE, box.b0 + 1, box.b1, whole, wt, mr, mg, mb);

  other.r1 = box.r1;
  other.g1 = box.g1;
  other.b1 = box.b1;

  if (red.max >= green.max && red.max >= blue.max) {
    if (red.position < 0) {
      return false;
    }

    other.r0 = box.r1 = red.position;
    other.g0 = box.g0;
    other.b0 = box.b0;
  } else if (green.max >= red.max && green.max >= blue.max) {
    other.g0 = box.g1 = green.position;
    other.r0 = box.r0;
    other.b0 = box.b0;
  } else {
    other.b0 = box.b1 = blue.position;
    other.r0 = box.r0;
    other.g0 = box.g0;
  }

  box.vol = (box.r1 - box.r0) * (box.g1 - box.g0) * (box.b1 - box.b0);
  other.vol =
    (other.r1 - other.r0) * (other.g1 - other.g0) * (other.b1 - other.b0);

  return true;
}

/**
 * Map each opaque pixel to its nearest palette color.
 *
 * For each cell of 8x8x8 colors, only the palette colors that can be
 * nearest to some color in the cell are compared. A color can only be
 * nearest if its distance to the cell is no more than the smallest
 * distance within which some palette color covers the whole cell.
 * These candidate lists are built the first time a cell is used.
 */
function mapNearest(
  data: Uint8Array,
  length: number,
  colors: number[],
  indexes: Uint8Array
) {
  const count = colors.length;
  const pr = new Int32Array(count);
  const pg = new Int32Array(count);
  const pb = new Int32Array(count);

  for (let i = 0; i < count; i++) {
    pr[i] = (colors[i]! >> 16) & 0xff;
    pg[i] = (colors[i]! >> 8) & 0xff;
    pb[i] = colors[i]! & 0xff;
  }

  const cellSize = 1 << CELL_SHIFT;
  const cellStart = new Int32Array(1 << (CELL_BITS * 3)).fill(-1);
  const cellLength = new Uint16Array(1 << (CELL_BITS * 3));
  const minDistances = new Float64Array(count);
  let candidates = new Uint8Array(4096);
  let candidateCount = 0;

  const addCandidates = (cell: number, r: number, g: number, b: number) => {
    const r0 = r & ~(cellSize - 1);
    const g0 = g & ~(cellSize - 1);
    const b0 = b & ~(cellSize - 1);
    const r1 = r0 + cellSize - 1;
    const g1 = g0 + cellSize - 1;
    const b1 = b0 + cellSize - 1;
    let bound = Infinity;

    for (let i = 0; i < count; i++) {
      const dr = pr[i]! < r0 ? r0 - pr[i]! : pr[i]! > r1 ? pr[i]! - r1 : 0;
      const dg = pg[i]! < g0 ? g0 - pg[i]! : pg[i]! > g1 ? pg[i]! - g1 : 0;
      const db = pb[i]! < b0 ? b0 - pb[i]! : pb[i]! > b1 ? pb[i]! - b1 : 0;
      const fr = Math.max(pr[i]! - r0, r1 - pr[i]!);
      const fg = Math.max(pg[i]! - g0, g1 - pg[i]!);
      const fb = Math.max(pb[i]! - b0, b1 - pb[i]!);

      minDistances[i] = dr * dr + dg * dg + db * db;
      bound = Math.min(bound, fr * fr + fg * fg + fb * fb);
    }

    if (candidateCount + count > candidates.length) {
      const grown = new Uint8Array(candidates.length * 2);
      grown.set(candidates);
      candidates = grown;
    }

    cellStart[cell] = candidateCount;

    for (let i = 0; i < count; i++) {
      if (minDistances[i]! <= bound) {
        candidates[candidateCount++] = i;
      }
    }

    cellLength[cell] = candidateCount - cellStart[cell]!;
  };

  let lastRgb = -1;
  let lastIndex = 0;

  for (let i = 0, j = 0; i < length; i += 4, j++) {
    if (data[i + 3] === 0) {
      continue;
    }

    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const rgb = (r << 16) | (g << 8) | b;

    if (rgb !== lastRgb) {
      const cell =
        ((r >> CELL_SHIFT) << (CELL_BITS * 2)) |
        ((g >> CELL_SHIFT) << CELL_BITS) |
        (b >> CELL_SHIFT);

      if (cellStart[cell] === -1) {
        addCandidates(cell, r, g, b);
      }

      const start = cellStart[cell]!;
      const end = start + cellLength[cell]!;
      let best = Infinity;

      for (let k = start; k < end; k++) {
        const candidate = candidates[k]!;
        const dr = r - pr[candidate]!;
        const dg = g - pg[candidate]!;
        const db = b - pb[candidate]!;
        const distance = dr * dr + dg * dg + db * db;

        if (distance < best) {
          best = distance;
          lastIndex = candidate;
        }
      }

      lastRgb = rgb;
    }

    indexes[j] = lastIndex;
  }
}
