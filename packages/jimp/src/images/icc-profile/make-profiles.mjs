// Writes the Display P3 ICC profiles used by the ICC tests, see README.md.
// Run with: node make-profiles.mjs
import { Buffer } from "node:buffer";
import { writeFileSync } from "node:fs";

const D50 = [0.9642, 1, 0.8249];
const D65 = [0.95047, 1, 1.08883];
// Display P3: the DCI-P3 primaries with a D65 white point
const primaries = [
  [0.68, 0.32],
  [0.265, 0.69],
  [0.15, 0.06],
];

const multiply = (a, b) =>
  a.map((row) =>
    b[0].map((_, j) => row.reduce((s, v, k) => s + v * b[k][j], 0)),
  );

function invert(m) {
  const [[a, b, c], [d, e, f], [g, h, i]] = m;
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);

  return [
    [e * i - f * h, c * h - b * i, b * f - c * e],
    [f * g - d * i, a * i - c * g, c * d - a * f],
    [d * h - e * g, b * g - a * h, a * e - b * d],
  ].map((row) => row.map((v) => v / det));
}

/** The RGB to XYZ matrix for the primaries and white point */
function rgbToXyz(white) {
  const columns = primaries.map(([x, y]) => [x / y, 1, (1 - x - y) / y]);
  const m = [0, 1, 2].map((r) => columns.map((c) => c[r]));
  const scale = multiply(
    invert(m),
    white.map((v) => [v]),
  );

  return m.map((row) => row.map((v, j) => v * scale[j][0]));
}

/** Bradford chromatic adaptation from D65 to D50 */
const bradford = [
  [0.8951, 0.2664, -0.1614],
  [-0.7502, 1.7135, 0.0367],
  [0.0389, -0.0685, 1.0296],
];
const cone = (w) =>
  multiply(
    bradford,
    w.map((v) => [v]),
  ).map(([v]) => v);
const [src, dst] = [cone(D65), cone(D50)];
const chad = multiply(
  invert(bradford),
  multiply(
    [0, 1, 2].map((i) => [0, 1, 2].map((j) => (i === j ? dst[i] / src[i] : 0))),
    bradford,
  ),
);
const adapted = multiply(chad, rgbToXyz(D65));

const s15 = (v) => {
  const b = Buffer.alloc(4);
  b.writeInt32BE(Math.round(v * 65536));
  return b;
};

const tag = (type, ...parts) =>
  Buffer.concat([Buffer.from(type, "latin1"), Buffer.alloc(4), ...parts]);

function mluc(text) {
  const utf16 = Buffer.from(text, "utf16le").swap16();
  const head = Buffer.alloc(20);
  head.writeUInt32BE(1, 0); // records
  head.writeUInt32BE(12, 4); // record size
  head.write("enUS", 8, "latin1");
  head.writeUInt32BE(utf16.length, 12);
  head.writeUInt32BE(28, 16); // offset from the start of the tag
  return tag("mluc", head, utf16);
}

const xyz = (values) => tag("XYZ ", ...values.map(s15));

/** The sRGB transfer curve, which Display P3 shares */
const srgbCurve = (v) =>
  v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);

function para() {
  const head = Buffer.alloc(4);
  head.writeUInt16BE(3, 0); // Y = (aX + b)^g for X >= d, else cX
  return tag(
    "para",
    head,
    ...[2.4, 1 / 1.055, 0.055 / 1.055, 1 / 12.92, 0.04045].map(s15),
  );
}

function curv(points) {
  const data = Buffer.alloc(4 + points * 2);
  data.writeUInt32BE(points, 0);

  for (let i = 0; i < points; i++) {
    data.writeUInt16BE(
      Math.round(srgbCurve(i / (points - 1)) * 65535),
      4 + i * 2,
    );
  }

  return tag("curv", data);
}

function profile(description, trc) {
  const column = (i) => adapted.map((row) => row[i]);
  const tags = [
    ["desc", mluc(description)],
    ["cprt", mluc("No copyright, use freely")],
    ["wtpt", xyz(D50)],
    ["rXYZ", xyz(column(0))],
    ["gXYZ", xyz(column(1))],
    ["bXYZ", xyz(column(2))],
    ["rTRC", trc()],
    ["gTRC", trc()],
    ["bTRC", trc()],
    ["chad", tag("sf32", ...chad.flat().map(s15))],
  ];

  const table = Buffer.alloc(4 + tags.length * 12);
  table.writeUInt32BE(tags.length, 0);

  const data = [];
  let offset = 128 + table.length;

  tags.forEach(([signature, body], i) => {
    const padded = Buffer.concat([
      body,
      Buffer.alloc((4 - (body.length % 4)) % 4),
    ]);
    table.write(signature, 4 + i * 12, "latin1");
    table.writeUInt32BE(offset, 8 + i * 12);
    table.writeUInt32BE(body.length, 12 + i * 12);
    data.push(padded);
    offset += padded.length;
  });

  const header = Buffer.alloc(128);
  header.writeUInt32BE(offset, 0);
  header.writeUInt32BE(0x04300000, 8); // version 4.3
  header.write("mntrRGB XYZ ", 12, "latin1");
  [2026, 1, 1, 0, 0, 0].forEach((v, i) => header.writeUInt16BE(v, 24 + i * 2));
  header.write("acsp", 36, "latin1");
  D50.map(s15).forEach((v, i) => v.copy(header, 68 + i * 4));

  return Buffer.concat([header, table, ...data]);
}

writeFileSync("display-p3.icc", profile("Display P3", para));
// Over 64 KB, so it takes two APP2 segments in a JPEG
writeFileSync(
  "display-p3-sampled.icc",
  profile("Display P3 (sampled curves)", () => curv(12000)),
);
