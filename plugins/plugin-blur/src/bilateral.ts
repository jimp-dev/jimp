import { JimpClass } from "@jimp/types";

/** The largest squared distance between two RGB colors */
const MAX_DISTANCE = 3 * 255 * 255;

/**
 * Smooth the image with a bilateral filter: each pixel becomes an average of
 * its neighbors weighted both by distance (a Gaussian with standard
 * deviation `radius`) and by how close their color is to its own (a Gaussian
 * of the RGB distance with standard deviation `tolerance`). Neighbors across
 * an edge have a very different color, so they barely count, and the edge
 * stays sharp.
 *
 * Neighbors up to `2 * radius` pixels away are read, and pixels past the
 * edges are copies of the nearest edge pixel. Colors are weighted by alpha
 * as well, so transparent pixels don't pull colors toward black. Alpha isn't
 * changed, and fully transparent pixels are left alone.
 */
export function bilateralFilter(
  image: JimpClass,
  radius: number,
  tolerance: number,
) {
  const { width, height, data } = image.bitmap;
  const reach = Math.max(1, Math.ceil(radius * 2));

  // Copy the image into planes with a border of `reach` clamped pixels, so
  // the inner loop doesn't have to clamp coordinates or skip neighbors
  const paddedWidth = width + reach * 2;
  const paddedHeight = height + reach * 2;
  const planeSize = paddedWidth * paddedHeight;
  const red = new Float32Array(planeSize);
  const green = new Float32Array(planeSize);
  const blue = new Float32Array(planeSize);
  const alpha = new Float32Array(planeSize);

  for (let py = 0; py < paddedHeight; py++) {
    const y = Math.min(height - 1, Math.max(0, py - reach));

    for (let px = 0; px < paddedWidth; px++) {
      const x = Math.min(width - 1, Math.max(0, px - reach));
      const idx = (y * width + x) << 2;
      const p = py * paddedWidth + px;

      red[p] = data[idx]!;
      green[p] = data[idx + 1]!;
      blue[p] = data[idx + 2]!;
      alpha[p] = data[idx + 3]!;
    }
  }

  // The neighbors in a circle of radius `reach`, as offsets into the planes,
  // with their distance weights
  const offsets: number[] = [];
  const distanceWeights: number[] = [];

  for (let dy = -reach; dy <= reach; dy++) {
    for (let dx = -reach; dx <= reach; dx++) {
      const d2 = dx * dx + dy * dy;

      if (d2 <= reach * reach) {
        offsets.push(dy * paddedWidth + dx);
        distanceWeights.push(Math.exp(-d2 / (2 * radius * radius)));
      }
    }
  }

  const count = offsets.length;
  const offset = Int32Array.from(offsets);
  const distanceWeight = Float32Array.from(distanceWeights);

  // The color weight for each squared RGB distance. The colors are whole
  // numbers, so the distances are too.
  const colorWeight = new Float32Array(MAX_DISTANCE + 1);
  const scale = 1 / (2 * tolerance * tolerance);

  for (let d2 = 0; d2 <= MAX_DISTANCE; d2++) {
    const weight = Math.exp(-d2 * scale);

    // Past this, the weights are too small to change a color
    if (weight < 1e-7) {
      break;
    }

    colorWeight[d2] = weight;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) << 2;

      if (data[idx + 3] === 0) {
        continue;
      }

      const center = (y + reach) * paddedWidth + x + reach;
      const r0 = red[center]!;
      const g0 = green[center]!;
      const b0 = blue[center]!;
      let r = 0;
      let g = 0;
      let b = 0;
      let total = 0;

      for (let i = 0; i < count; i++) {
        const p = center + offset[i]!;
        const rp = red[p]!;
        const gp = green[p]!;
        const bp = blue[p]!;
        const dr = rp - r0;
        const dg = gp - g0;
        const db = bp - b0;
        const weight =
          distanceWeight[i]! *
          colorWeight[dr * dr + dg * dg + db * db]! *
          alpha[p]!;

        r += rp * weight;
        g += gp * weight;
        b += bp * weight;
        total += weight;
      }

      // The pixel itself always counts, so `total` is greater than 0
      data[idx] = Math.round(r / total);
      data[idx + 1] = Math.round(g / total);
      data[idx + 2] = Math.round(b / total);
    }
  }
}
