/* global console, process */
// File size at equal quality: encodes lossless images with @jimp/jpeg-js and
// jpeg-js, decodes the results with libjpeg-turbo's djpeg (which must be on
// the PATH) and compares SSIM (on luma) and PSNR (on RGB).
//
//   node bench/quality.mjs image.ppm [more.ppm ...]
//
// Convert images to binary PPM first, e.g. `magick photo.png photo.ppm`.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import jpegJs from "jpeg-js";

import { encodeJpeg } from "../dist/esm/index.js";

function readPnm(buffer) {
  const fields = [];
  let pos = 0;

  while (fields.length < 4) {
    while (buffer[pos] <= 32) pos++;
    let field = "";
    while (buffer[pos] > 32) field += String.fromCharCode(buffer[pos++]);
    fields.push(field);
  }

  return {
    width: +fields[1],
    height: +fields[2],
    data: buffer.subarray(pos + 1),
  };
}

function psnr(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return 10 * Math.log10((255 * 255) / (sum / a.length));
}

const kernel = (() => {
  const g = [];
  for (let i = -5; i <= 5; i++) g.push(Math.exp(-(i * i) / 4.5));
  const total = g.reduce((a, b) => a + b);
  return g.map((v) => v / total);
})();

function blur(src, w, h) {
  const tmp = new Float64Array(w * h);
  const out = new Float64Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let k = -5; k <= 5; k++)
        s += kernel[k + 5] * src[y * w + Math.min(w - 1, Math.max(0, x + k))];
      tmp[y * w + x] = s;
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let k = -5; k <= 5; k++)
        s += kernel[k + 5] * tmp[Math.min(h - 1, Math.max(0, y + k)) * w + x];
      out[y * w + x] = s;
    }
  return out;
}

/** SSIM (Wang et al. 2004) on luma, with an 11x11 Gaussian window. */
function ssim(a, b, w, h) {
  const n = w * h;
  const luma = (rgb) =>
    Float64Array.from(
      { length: n },
      (_, i) =>
        0.299 * rgb[i * 3] + 0.587 * rgb[i * 3 + 1] + 0.114 * rgb[i * 3 + 2],
    );
  const x = luma(a);
  const y = luma(b);
  const mx = blur(x, w, h);
  const my = blur(y, w, h);
  const sxx = blur(
    x.map((v) => v * v),
    w,
    h,
  );
  const syy = blur(
    y.map((v) => v * v),
    w,
    h,
  );
  const sxy = blur(
    x.map((v, i) => v * y[i]),
    w,
    h,
  );
  const c1 = (0.01 * 255) ** 2;
  const c2 = (0.03 * 255) ** 2;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const vx = sxx[i] - mx[i] ** 2;
    const vy = syy[i] - my[i] ** 2;
    const cov = sxy[i] - mx[i] * my[i];
    sum +=
      ((2 * mx[i] * my[i] + c1) * (2 * cov + c2)) /
      ((mx[i] ** 2 + my[i] ** 2 + c1) * (vx + vy + c2));
  }
  return sum / n;
}

const djpeg = (jpeg) =>
  readPnm(execFileSync("djpeg", ["-pnm"], { input: jpeg, maxBuffer: 1 << 30 }));
const qualities = [30, 50, 60, 70, 75, 80, 85, 90, 95, 100];
const encoders = {
  "jpeg-js": (image, quality) => jpegJs.encode(image, quality).data,
  "@jimp/jpeg-js": (image, quality) => encodeJpeg(image, { quality }),
  "@jimp/jpeg-js progressive": (image, quality) =>
    encodeJpeg(image, { quality, progressive: true }),
};
const curves = Object.fromEntries(
  Object.keys(encoders).map((name) => [name, []]),
);

for (const file of process.argv.slice(2)) {
  const { width, height, data } = readPnm(readFileSync(file));
  const rgba = new Uint8Array(width * height * 4).fill(255);
  for (let i = 0; i < width * height; i++)
    rgba.set(data.subarray(i * 3, i * 3 + 3), i * 4);
  const image = { width, height, data: rgba };

  for (const [name, encode] of Object.entries(encoders)) {
    const points = qualities.map((quality) => {
      const jpeg = encode(image, quality);
      const decoded = djpeg(jpeg).data;
      return {
        quality,
        size: jpeg.length,
        psnr: psnr(data, decoded),
        ssim: ssim(data, decoded, width, height),
      };
    });
    curves[name].push(points);
  }
}

/** Size of an encoder's file at a metric value, interpolated in log size. */
function sizeAt(points, metric, value) {
  const sorted = [...points].sort((a, b) => a[metric] - b[metric]);
  for (let i = 0; i + 1 < sorted.length; i++) {
    const [p, q] = [sorted[i], sorted[i + 1]];
    if (value >= p[metric] && value <= q[metric]) {
      const t = (value - p[metric]) / (q[metric] - p[metric]);
      return Math.exp(
        Math.log(p.size) + t * (Math.log(q.size) - Math.log(p.size)),
      );
    }
  }
  return null;
}

for (const metric of ["ssim", "psnr"]) {
  console.log(
    `\nSize relative to jpeg-js at the same ${metric.toUpperCase()}:`,
  );
  for (const name of Object.keys(encoders).slice(1)) {
    const row = qualities.map((quality, q) => {
      const ratios = curves["jpeg-js"].flatMap((points, image) => {
        const size = sizeAt(curves[name][image], metric, points[q][metric]);
        return size ? [size / points[q].size] : [];
      });
      if (!ratios.length) return `q${quality}: -`;
      const mean = Math.exp(
        ratios.reduce((a, r) => a + Math.log(r), 0) / ratios.length,
      );
      return `q${quality}: ${((mean - 1) * 100).toFixed(1)}%`;
    });
    console.log(`${name}: ${row.join("  ")}`);
  }
}
