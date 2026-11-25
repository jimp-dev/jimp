/**
 * Draws the site's sticker icons (src/components/icons.ts) with
 * @jimp/plugin-draw, for the Open Graph images of pages without a picture.
 *
 * The icons are the inner markup of a 32 x 32 SVG, using only `path`,
 * `rect`, `circle` and `g`, with fill, stroke, stroke-width, line caps and
 * joins, opacity and stroke-dasharray. That's all this reads; it isn't an
 * SVG renderer.
 */
import { cssColorToHex, intToRGBA, Jimp, type JimpInstance } from "jimp";
import {
  drawShape,
  flattenPath,
  type Matrix,
  type Paint,
  type Polyline,
} from "@jimp/plugin-draw";

type Attributes = Record<string, string>;

const ellipse = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0z`;

function rect(a: Attributes) {
  const [x, y, w, h] = ["x", "y", "width", "height"].map((k) =>
    Number(a[k] ?? 0),
  ) as [number, number, number, number];
  const r = Math.min(Number(a.rx ?? 0), w / 2, h / 2);

  return r === 0
    ? `M${x} ${y}h${w}v${h}h${-w}z`
    : `M${x + r} ${y}h${w - r * 2}a${r} ${r} 0 0 1 ${r} ${r}v${h - r * 2}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - r * 2)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - r * 2)}a${r} ${r} 0 0 1 ${r} ${-r}z`;
}

/** The path data of an element, or undefined for ones that aren't shapes */
function pathData(tag: string, a: Attributes) {
  if (tag === "path") return a.d;
  if (tag === "rect") return rect(a);
  if (tag === "circle") return ellipse(Number(a.cx), Number(a.cy), Number(a.r));

  return undefined;
}

/** A color with the element's opacity applied */
function paint(color: string | undefined, opacity: number): Paint | undefined {
  if (color === undefined || color === "none") {
    return undefined;
  }

  const { r, g, b, a } = intToRGBA(cssColorToHex(color));

  return { r, g, b, a: a * opacity };
}

/** Split polylines into the dashes of an SVG `stroke-dasharray` */
function dash(polylines: Polyline[], pattern: number[]): Polyline[] {
  const dashes: Polyline[] = [];

  for (const { points, closed } of polylines) {
    const xs: number[] = [];

    for (let i = 0; i < points.length; i++) xs.push(points[i]!);

    if (closed) xs.push(xs[0]!, xs[1]!);

    let index = 0;
    let left = pattern[0]!;
    let current: number[] = [xs[0]!, xs[1]!];

    for (let i = 2; i < xs.length; i += 2) {
      let [x0, y0] = [xs[i - 2]!, xs[i - 1]!];
      const [x1, y1] = [xs[i]!, xs[i + 1]!];
      let length = Math.hypot(x1 - x0, y1 - y0);

      while (length >= left) {
        const t = left / length;
        const x = x0 + (x1 - x0) * t;
        const y = y0 + (y1 - y0) * t;

        if (index % 2 === 0) {
          current.push(x, y);
          dashes.push({ points: current, closed: false });
        }

        current = [x, y];
        length -= left;
        [x0, y0] = [x, y];
        index++;
        left = pattern[index % pattern.length]!;
      }

      left -= length;

      if (index % 2 === 0) current.push(x1, y1);
    }

    if (index % 2 === 0 && current.length > 2) {
      dashes.push({ points: current, closed: false });
    }
  }

  return dashes;
}

/** Draw icon markup from icons.ts on a transparent `size` x `size` image */
export function drawIcon(markup: string, size: number): JimpInstance {
  const image = new Jimp({ width: size, height: size, color: 0x00000000 });
  const scale = size / 32;
  const transform: Matrix = [scale, 0, 0, scale, 0, 0];
  // Attributes set on the <g>s around an element
  const groups: Attributes[] = [{}];

  for (const [, closing, tag, rawAttributes] of markup.matchAll(
    /<(\/?)(\w+)([^>]*?)\/?>/g,
  )) {
    if (closing) {
      if (tag === "g") groups.pop();
      continue;
    }

    const own = Object.fromEntries(
      [...rawAttributes!.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, k, v]) => [
        k,
        v,
      ]),
    );
    const a: Attributes = { ...groups.at(-1), ...own };

    if (tag === "g") {
      // A <g> written as <g .../> isn't one this markup uses
      groups.push(a);
      continue;
    }

    const d = pathData(tag!, a);

    if (!d) continue;

    const opacity = Number(a.opacity ?? 1);
    const polylines = flattenPath(d, { transform });
    // Like SVG, shapes are filled black unless they say otherwise
    const fill = paint(a.fill ?? "#000", opacity);
    const stroke = paint(a.stroke, opacity);
    const style = {
      strokeWidth: Number(a["stroke-width"] ?? 1) * scale,
      cap: a["stroke-linecap"] as "round" | undefined,
      join: a["stroke-linejoin"] as "round" | undefined,
    };

    if (fill) {
      drawShape(image, polylines, { fill });
    }

    if (stroke) {
      const pattern = a["stroke-dasharray"]
        ?.split(/[\s,]+/)
        .map((n) => Number(n) * scale);

      drawShape(image, pattern ? dash(polylines, pattern) : polylines, {
        ...style,
        stroke,
      });
    }
  }

  return image;
}
