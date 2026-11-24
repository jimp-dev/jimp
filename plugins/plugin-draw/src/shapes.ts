import { arcTo, ellipseTo, PolylineBuilder } from "./path.js";
import type { Polyline } from "./rasterize.js";

/** Corner radii in the order top left, top right, bottom right, bottom left */
export type Radii = [number, number, number, number];

/**
 * Scale the radii down so that adjacent corners don't overlap, the way CSS
 * does it: https://www.w3.org/TR/css-backgrounds-3/#corner-overlap
 */
export function fitRadii(radii: Radii, w: number, h: number): Radii {
  const [tl, tr, br, bl] = radii;
  const f = Math.min(
    1,
    w / (tl + tr),
    w / (bl + br),
    h / (tl + bl),
    h / (tr + br),
  );

  return f < 1 ? [tl * f, tr * f, br * f, bl * f] : radii;
}

/** The outline of a rectangle, clockwise from the top left, with rounded corners */
export function rectPolyline(
  x: number,
  y: number,
  w: number,
  h: number,
  radii: Radii,
  tolerance: number,
): Polyline {
  const [tl, tr, br, bl] = fitRadii(radii, w, h);
  const out = new PolylineBuilder();
  const lineTo = (px: number, py: number) => out.lineTo(px, py);
  const right = x + w;
  const bottom = y + h;
  const corner = (
    r: number,
    cx: number,
    cy: number,
    start: number,
    px: number,
    py: number,
  ) => {
    if (r > 0) {
      out.lineTo(cx + r * Math.cos(start), cy + r * Math.sin(start));
      arcTo(lineTo, cx, cy, r, r, start, Math.PI / 2, tolerance);
    } else {
      out.lineTo(px, py);
    }
  };

  out.moveTo(x + tl, y);
  corner(tr, right - tr, y + tr, -Math.PI / 2, right, y);
  corner(br, right - br, bottom - br, 0, right, bottom);
  corner(bl, x + bl, bottom - bl, Math.PI / 2, x, bottom);
  corner(tl, x + tl, y + tl, Math.PI, x, y);
  out.end(true);

  return out.polylines[0]!;
}

/** The outline of an ellipse, clockwise from its rightmost point */
export function ellipsePolyline(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  tolerance: number,
): Polyline {
  const points: number[] = [];

  ellipseTo((x, y) => points.push(x, y), cx, cy, rx, ry, tolerance);

  return { points, closed: true };
}
