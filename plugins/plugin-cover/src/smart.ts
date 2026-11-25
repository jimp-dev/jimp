import { Bitmap } from "@jimp/types";

/**
 * How `cover` picks the part of the image to keep by looking at it:
 *
 * - `"entropy"` keeps the window whose luminance histogram has the most
 *   information (Shannon entropy), so busy, detailed areas win over flat ones
 * - `"attention"` keeps the window with the most edges, saturated colour and
 *   skin tones, which is where people tend to look
 */
export type CoverStrategy = "entropy" | "attention";

export const COVER_STRATEGIES = ["entropy", "attention"] as const;

/** The longest side of the copy that is analysed */
const ANALYSIS_SIZE = 256;
/** At most this many source pixels are averaged per analysed pixel, per axis */
const MAX_SAMPLES = 4;
/** Luminance histogram bins for `"entropy"` */
const BINS = 64;
/**
 * Windows that score within this fraction of the best one are treated as
 * equally good, and the most balanced of them is kept. Without it, noise
 * decides between nearly identical windows and pushes the subject to an edge.
 */
const TOLERANCE = 0.01;

/**
 * For `"attention"`, how much less the edges of the window count than its
 * middle: at 0.75 a salient pixel at the edge counts a quarter as much
 */
const EDGE_FALLOFF = 0.75;

/**
 * For `"attention"`, how much more skin tones count than edges or saturated
 * colour, since the subject of a photo is usually a person
 */
const SKIN_WEIGHT = 3;

/** Pick `n` evenly spaced indexes in `[start, end)` */
function samples(start: number, end: number) {
  const n = Math.min(MAX_SAMPLES, end - start);
  const result: number[] = [];

  for (let i = 0; i < n; i++) {
    result.push(start + Math.floor(((i + 0.5) * (end - start)) / n));
  }

  return result;
}

/**
 * Shrink the bitmap so its longest side is at most `ANALYSIS_SIZE`, averaging
 * a few source pixels per output pixel. Colours are weighted by alpha, so
 * transparent pixels don't darken their neighbours. Returns RGBA from 0 to 1.
 */
function downscale(bitmap: Bitmap) {
  const { width, height, data } = bitmap;
  const s = Math.min(1, ANALYSIS_SIZE / Math.max(width, height));
  const aw = Math.max(1, Math.round(width * s));
  const ah = Math.max(1, Math.round(height * s));
  const cols: number[][] = [];
  const rows: number[][] = [];

  for (let x = 0; x < aw; x++) {
    const start = Math.floor((x * width) / aw);
    cols.push(
      samples(start, Math.max(start + 1, Math.floor(((x + 1) * width) / aw))),
    );
  }

  for (let y = 0; y < ah; y++) {
    const start = Math.floor((y * height) / ah);
    rows.push(
      samples(start, Math.max(start + 1, Math.floor(((y + 1) * height) / ah))),
    );
  }

  const out = new Float64Array(aw * ah * 4);

  for (let y = 0; y < ah; y++) {
    for (let x = 0; x < aw; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;

      for (const sy of rows[y]!) {
        for (const sx of cols[x]!) {
          const i = (sy * width + sx) << 2;
          const alpha = data[i + 3]!;

          r += data[i]! * alpha;
          g += data[i + 1]! * alpha;
          b += data[i + 2]! * alpha;
          a += alpha;
          n++;
        }
      }

      const o = (y * aw + x) << 2;

      if (a > 0) {
        out[o] = r / a / 255;
        out[o + 1] = g / a / 255;
        out[o + 2] = b / a / 255;
      }

      out[o + 3] = a / n / 255;
    }
  }

  return { width: aw, height: ah, data: out };
}

type Analysed = ReturnType<typeof downscale>;

function luminance(data: Float64Array, i: number) {
  return 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
}

/**
 * How likely each pixel is to catch the eye, from 0 up: edge strength (Sobel
 * on luminance), saturation, and how close the colour is to a skin tone.
 * Transparent pixels count for nothing.
 */
function saliency({ width, height, data }: Analysed) {
  const lum = new Float64Array(width * height);

  for (let i = 0; i < lum.length; i++) {
    lum[i] = luminance(data, i << 2);
  }

  const at = (x: number, y: number) =>
    lum[
      Math.min(height - 1, Math.max(0, y)) * width +
        Math.min(width - 1, Math.max(0, x))
    ]!;
  const map = new Float64Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const o = i << 2;
      const alpha = data[o + 3]!;

      if (alpha === 0) {
        continue;
      }

      const gx =
        at(x + 1, y - 1) +
        2 * at(x + 1, y) +
        at(x + 1, y + 1) -
        at(x - 1, y - 1) -
        2 * at(x - 1, y) -
        at(x - 1, y + 1);
      const gy =
        at(x - 1, y + 1) +
        2 * at(x, y + 1) +
        at(x + 1, y + 1) -
        at(x - 1, y - 1) -
        2 * at(x, y - 1) -
        at(x + 1, y - 1);
      // a step from black to white is 4
      const edge = Math.min(1, Math.sqrt(gx * gx + gy * gy) / 2);

      const r = data[o]!;
      const g = data[o + 1]!;
      const b = data[o + 2]!;
      const chroma = Math.max(r, g, b) - Math.min(r, g, b);
      const saturation = Math.max(0, chroma - 0.25) / 0.75;

      // Skin tones sit in a small box of the YCbCr plane, whatever their
      // brightness: Cb 77-127 and Cr 133-173 out of 255 (Chai & Ngan)
      const cb = 128 + 255 * (-0.168736 * r - 0.331264 * g + 0.5 * b);
      const cr = 128 + 255 * (0.5 * r - 0.418688 * g - 0.081312 * b);
      const d = Math.hypot((cb - 102) / 25, (cr - 153) / 20);
      const y8 = lum[i]!;
      const skin =
        y8 > 0.2 && y8 < 0.95 ? Math.min(1, Math.max(0, (0.9 - d) / 0.4)) : 0;

      map[i] = alpha * (edge + saturation + SKIN_WEIGHT * skin);
    }
  }

  return map;
}

/** The index of the best score, preferring the one `prefer` ranks lowest */
function pick(scores: number[], prefer: (offset: number) => number) {
  const best = Math.max(...scores);
  let chosen = 0;
  let chosenRank = Infinity;

  scores.forEach((score, offset) => {
    if (score >= best - Math.abs(best) * TOLERANCE) {
      const rank = prefer(offset);

      if (rank < chosenRank) {
        chosen = offset;
        chosenRank = rank;
      }
    }
  });

  return chosen;
}

/** The entropy of each window of `windowLength` lines, in bits */
function entropyScores(
  analysed: Analysed,
  horizontal: boolean,
  windowLength: number,
) {
  const { width, height, data } = analysed;
  const lines = horizontal ? width : height;
  const across = horizontal ? height : width;
  // the histogram of each column (or row), weighted by alpha
  const histograms = new Float64Array(lines * BINS);

  for (let line = 0; line < lines; line++) {
    for (let j = 0; j < across; j++) {
      const o = (horizontal ? j * width + line : line * width + j) << 2;
      const bin = Math.min(BINS - 1, Math.floor(luminance(data, o) * BINS));

      const k = line * BINS + bin;

      histograms[k] = histograms[k]! + data[o + 3]!;
    }
  }

  const window = new Float64Array(BINS);
  const scores: number[] = [];

  for (let line = 0; line < lines; line++) {
    for (let bin = 0; bin < BINS; bin++) {
      let count = window[bin]! + histograms[line * BINS + bin]!;

      if (line >= windowLength) {
        count -= histograms[(line - windowLength) * BINS + bin]!;
      }

      window[bin] = count;
    }

    if (line >= windowLength - 1) {
      let total = 0;
      let entropy = 0;

      for (const count of window) {
        total += count;
      }

      for (const count of window) {
        // the running sums can drift a little below 0
        if (count > 1e-9) {
          const p = count / total;
          entropy -= p * Math.log2(p);
        }
      }

      scores.push(entropy);
    }
  }

  return scores;
}

/**
 * Find where along the cropped axis to keep a window of the image, as a
 * fraction from 0 (left/top) to 1 (right/bottom).
 *
 * `cover` only ever crops one axis, so this slides a window the size of the
 * kept part along that axis over a downscaled copy and scores each position.
 * @param bitmap the image
 * @param keep the size of the part to keep, in the image's pixels
 * @param strategy how to score each position
 */
export function findSmartAlign(
  bitmap: Bitmap,
  keep: { w: number; h: number },
  strategy: CoverStrategy,
) {
  const horizontal = keep.w / bitmap.width < keep.h / bitmap.height;
  const analysed = downscale(bitmap);
  const lines = horizontal ? analysed.width : analysed.height;
  const windowLength = Math.max(
    1,
    Math.round(
      horizontal
        ? (keep.w * analysed.width) / bitmap.width
        : (keep.h * analysed.height) / bitmap.height,
    ),
  );
  const travel = lines - windowLength;

  if (travel <= 0) {
    return { alignX: 0.5, alignY: 0.5 };
  }

  let offset: number;

  if (strategy === "entropy") {
    // among near ties, keep the window closest to the middle
    offset = pick(entropyScores(analysed, horizontal, windowLength), (o) =>
      Math.abs(o - travel / 2),
    );
  } else {
    const map = saliency(analysed);
    const across = horizontal ? analysed.height : analysed.width;
    // the saliency of each column (or row)
    const profile = new Float64Array(lines);

    for (let line = 0; line < lines; line++) {
      for (let j = 0; j < across; j++) {
        profile[line] =
          profile[line]! +
          map[
            horizontal ? j * analysed.width + line : line * analysed.width + j
          ]!;
      }
    }

    // Weigh the middle of the window more than its edges, so the window
    // centres on one subject rather than cutting two in half to fit both
    const weights = new Float64Array(windowLength);

    for (let i = 0; i < windowLength; i++) {
      weights[i] = 1 - EDGE_FALLOFF * Math.abs((2 * i + 1) / windowLength - 1);
    }

    const scores: number[] = [];

    for (let o = 0; o <= travel; o++) {
      let score = 0;

      for (let i = 0; i < windowLength; i++) {
        score += profile[o + i]! * weights[i]!;
      }

      scores.push(score);
    }

    // among near ties, keep the window closest to the middle
    offset = pick(scores, (o) => Math.abs(o - travel / 2));
  }

  const fraction = offset / travel;

  return horizontal
    ? { alignX: fraction, alignY: 0.5 }
    : { alignX: 0.5, alignY: fraction };
}
