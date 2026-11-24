import type { PathCommand } from "./path.js";

const NUMBER = /[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/y;
const SEPARATOR = /[\s,]*/y;
const COMMAND = /[MmLlHhVvCcSsQqTtAaZz]/y;

class Scanner {
  index = 0;

  constructor(private data: string) {}

  private match(pattern: RegExp) {
    pattern.lastIndex = this.index;

    const match = pattern.exec(this.data);

    if (match) {
      this.index = pattern.lastIndex;
    }

    return match?.[0];
  }

  skipSeparators() {
    this.match(SEPARATOR);
  }

  done() {
    this.skipSeparators();
    return this.index >= this.data.length;
  }

  command() {
    this.skipSeparators();
    return this.match(COMMAND);
  }

  /** Whether a number comes next, so the last command repeats */
  numberNext() {
    this.skipSeparators();
    NUMBER.lastIndex = this.index;
    return NUMBER.test(this.data);
  }

  number() {
    this.skipSeparators();

    const value = this.match(NUMBER);

    if (value === undefined) {
      this.fail("a number");
    }

    return Number(value);
  }

  /** Arc flags are a single 0 or 1, and don't need a separator after them */
  flag() {
    this.skipSeparators();

    const char = this.data[this.index];

    if (char !== "0" && char !== "1") {
      this.fail("a flag (0 or 1)");
    }

    this.index++;
    return char === "1";
  }

  fail(expected: string): never {
    const found =
      this.index < this.data.length
        ? `"${this.data[this.index]}"`
        : "the end of the path";

    throw new Error(
      `Invalid path data: expected ${expected} at position ${this.index} but found ${found}`,
    );
  }
}

/**
 * Convert an SVG elliptical arc to cubic Béziers, following the SVG spec's
 * implementation notes: https://www.w3.org/TR/SVG2/implnote.html#ArcImplementationNotes
 */
function arcToCubics(
  out: PathCommand[],
  x1: number,
  y1: number,
  rx: number,
  ry: number,
  rotation: number,
  largeArc: boolean,
  sweep: boolean,
  x2: number,
  y2: number,
) {
  if (x1 === x2 && y1 === y2) {
    return;
  }

  rx = Math.abs(rx);
  ry = Math.abs(ry);

  if (rx === 0 || ry === 0) {
    out.push({ type: "L", x: x2, y: y2 });
    return;
  }

  const phi = (rotation * Math.PI) / 180;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1p = cos * dx + sin * dy;
  const y1p = -sin * dx + cos * dy;
  // Scale up radii too small to reach the end point
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);

  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }

  const rx2 = rx * rx;
  const ry2 = ry * ry;
  const num = rx2 * ry2 - rx2 * y1p * y1p - ry2 * x1p * x1p;
  const den = rx2 * y1p * y1p + ry2 * x1p * x1p;
  const coef =
    (largeArc === sweep ? -1 : 1) * Math.sqrt(Math.max(0, num / den));
  const cxp = (coef * rx * y1p) / ry;
  const cyp = (-coef * ry * x1p) / rx;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2;
  const cy = sin * cxp + cos * cyp + (y1 + y2) / 2;
  const theta1 = Math.atan2((y1p - cyp) / ry, (x1p - cxp) / rx);
  let delta = Math.atan2((-y1p - cyp) / ry, (-x1p - cxp) / rx) - theta1;

  if (sweep && delta < 0) {
    delta += 2 * Math.PI;
  } else if (!sweep && delta > 0) {
    delta -= 2 * Math.PI;
  }

  // Up to a quarter turn per curve keeps the error tiny (0.03% of the radius)
  const segments = Math.max(
    1,
    Math.ceil(Math.abs(delta) / (Math.PI / 2) - 1e-9),
  );
  const step = delta / segments;
  const k = (4 / 3) * Math.tan(step / 4);
  const map = (ux: number, uy: number) => [
    cx + cos * rx * ux - sin * ry * uy,
    cy + sin * rx * ux + cos * ry * uy,
  ];

  for (let i = 0; i < segments; i++) {
    const a0 = theta1 + i * step;
    const a1 = a0 + step;
    const c0 = Math.cos(a0);
    const s0 = Math.sin(a0);
    const c1 = Math.cos(a1);
    const s1 = Math.sin(a1);
    const [cp1x, cp1y] = map(c0 - k * s0, s0 + k * c0);
    const [cp2x, cp2y] = map(c1 + k * s1, s1 - k * c1);
    // Land exactly on the end point
    const [x, y] = i === segments - 1 ? [x2, y2] : map(c1, s1);

    out.push({
      type: "C",
      x1: cp1x!,
      y1: cp1y!,
      x2: cp2x!,
      y2: cp2y!,
      x: x!,
      y: y!,
    });
  }
}

/**
 * Parses SVG path data (the `d` attribute of a `<path>`) into absolute
 * {@link PathCommand}s. Every SVG command is supported, upper case
 * (absolute) and lower case (relative): `M L H V C S Q T A Z`. `H` and `V`
 * become `L`, `S` and `T` become `C` and `Q`, and arcs become cubic curves.
 *
 * Throws an error naming the position of anything it can't read.
 * @example
 * ```ts
 * import { parseSvgPath } from "@jimp/plugin-draw";
 *
 * parseSvgPath("M10 10 h 80 v 80 Z");
 * // [
 * //   { type: "M", x: 10, y: 10 },
 * //   { type: "L", x: 90, y: 10 },
 * //   { type: "L", x: 90, y: 90 },
 * //   { type: "Z" },
 * // ]
 * ```
 */
export function parseSvgPath(data: string): PathCommand[] {
  const scanner: Scanner = new Scanner(data);
  const out: PathCommand[] = [];
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  // The last control point, for S and T to reflect
  let lastControlX = 0;
  let lastControlY = 0;
  let lastType = "";

  while (!scanner.done()) {
    const command = scanner.command();

    if (!command) {
      scanner.fail("a command");
    }

    if (out.length === 0 && command !== "M" && command !== "m") {
      throw new Error(
        `Invalid path data: it must start with a move command (M or m), not "${command}"`,
      );
    }

    const lower = command.toLowerCase();
    const relative = command === lower;
    let first = true;

    // Commands repeat while more numbers follow them
    do {
      const ox = relative ? x : 0;
      const oy = relative ? y : 0;

      switch (lower) {
        case "m": {
          x = ox + scanner.number();
          y = oy + scanner.number();
          // Pairs after the first are line commands
          out.push({ type: first ? "M" : "L", x, y });

          if (first) {
            startX = x;
            startY = y;
          }

          break;
        }
        case "l":
          x = ox + scanner.number();
          y = oy + scanner.number();
          out.push({ type: "L", x, y });
          break;
        case "h":
          x = ox + scanner.number();
          out.push({ type: "L", x, y });
          break;
        case "v":
          y = oy + scanner.number();
          out.push({ type: "L", x, y });
          break;
        case "c":
        case "s": {
          let x1: number;
          let y1: number;

          if (lower === "c") {
            x1 = ox + scanner.number();
            y1 = oy + scanner.number();
          } else if (lastType === "C") {
            x1 = 2 * x - lastControlX;
            y1 = 2 * y - lastControlY;
          } else {
            x1 = x;
            y1 = y;
          }

          const x2 = ox + scanner.number();
          const y2 = oy + scanner.number();

          x = ox + scanner.number();
          y = oy + scanner.number();
          out.push({ type: "C", x1, y1, x2, y2, x, y });
          lastControlX = x2;
          lastControlY = y2;
          break;
        }
        case "q":
        case "t": {
          let x1: number;
          let y1: number;

          if (lower === "q") {
            x1 = ox + scanner.number();
            y1 = oy + scanner.number();
          } else if (lastType === "Q") {
            x1 = 2 * x - lastControlX;
            y1 = 2 * y - lastControlY;
          } else {
            x1 = x;
            y1 = y;
          }

          x = ox + scanner.number();
          y = oy + scanner.number();
          out.push({ type: "Q", x1, y1, x, y });
          lastControlX = x1;
          lastControlY = y1;
          break;
        }
        case "a": {
          const rx = scanner.number();
          const ry = scanner.number();
          const rotation = scanner.number();
          const largeArc = scanner.flag();
          const sweep = scanner.flag();
          const x2 = ox + scanner.number();
          const y2 = oy + scanner.number();

          arcToCubics(out, x, y, rx, ry, rotation, largeArc, sweep, x2, y2);
          x = x2;
          y = y2;
          break;
        }
        case "z":
          out.push({ type: "Z" });
          x = startX;
          y = startY;
          break;
      }

      lastType =
        lower === "c" || lower === "s"
          ? "C"
          : lower === "q" || lower === "t"
            ? "Q"
            : "";
      first = false;
    } while (lower !== "z" && scanner.numberNext());
  }

  return out;
}
