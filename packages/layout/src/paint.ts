import { composite, HorizontalAlign } from "@jimp/core";
import { methods as borderMethods } from "@jimp/plugin-border";
import { methods as containMethods } from "@jimp/plugin-contain";
import { methods as coverMethods } from "@jimp/plugin-cover";
import { methods as drawMethods, type Paint } from "@jimp/plugin-draw";
import { methods as printMethods } from "@jimp/plugin-print";
import { methods as resizeMethods } from "@jimp/plugin-resize";
import type { JimpClass } from "@jimp/types";
import { clone } from "@jimp/utils";

import type { Frame, ResolvedNode } from "./layout.js";
import {
  isVectorFont,
  type BoxNode,
  type Fill,
  type ImageNode,
  type Radius,
  type Shadow,
} from "./schema.js";

/** A rectangle on the image being drawn, in whole pixels */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A laid out node, at its place on the image in whole pixels */
export interface PlacedNode extends Rect {
  resolved: ResolvedNode;
  frame: Frame;
  children: PlacedNode[];
}

/**
 * Round a node's edges to whole pixels, rather than its position and size,
 * so neighbours still touch and sizes don't drift
 */
export function place(
  resolved: ResolvedNode,
  frame: Frame,
  x: number,
  y: number,
): PlacedNode {
  const left = Math.round(x);
  const top = Math.round(y);

  return {
    resolved,
    frame,
    x: left,
    y: top,
    width: Math.round(x + frame.width) - left,
    height: Math.round(y + frame.height) - top,
    children: frame.children.map((child) =>
      place(child.node, child.frame, x + child.x, y + child.y),
    ),
  };
}

/** Make a transparent image to draw part of the tree on */
export type CreateImage = (width: number, height: number) => JimpClass;

/** Where an image being drawn on is, so nodes are drawn in the right place */
interface Target {
  image: JimpClass;
  /** where the image's top left corner is on the final image */
  x: number;
  y: number;
}

function cornerRadii(radius: Radius) {
  return typeof radius === "number"
    ? {
        topLeft: radius,
        topRight: radius,
        bottomRight: radius,
        bottomLeft: radius,
      }
    : radius;
}

/** The radii of a box `inset` pixels inside one with `radius`, like CSS */
function insetRadius(radius: Radius | undefined, inset: number) {
  if (radius === undefined) {
    return undefined;
  }

  const shrink = (r = 0) => Math.max(0, r - inset);
  const corners = cornerRadii(radius);
  const inner = {
    topLeft: shrink(corners.topLeft),
    topRight: shrink(corners.topRight),
    bottomRight: shrink(corners.bottomRight),
    bottomLeft: shrink(corners.bottomLeft),
  };

  return Object.values(inner).some((r) => r > 0) ? inner : undefined;
}

/** A layout fill as a `@jimp/plugin-draw` paint, for the rectangle it fills */
export function toPaint(fill: Fill, rect: Rect): Paint {
  if (typeof fill !== "object") {
    return fill;
  }

  const last = fill.stops.length - 1;
  const stops = fill.stops.map((stop, i) =>
    typeof stop === "object"
      ? stop
      : { offset: last === 0 ? 0 : i / last, color: stop },
  );
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;

  if (fill.type === "radial") {
    return {
      type: "radial",
      cx,
      cy,
      r: Math.hypot(rect.width / 2, rect.height / 2),
      stops,
    };
  }

  // Like CSS, the gradient line goes through the center at `angle` and is
  // long enough for the corners to get the first and last colors
  const angle = ((fill.angle ?? 180) * Math.PI) / 180;
  const dx = Math.sin(angle);
  const dy = -Math.cos(angle);
  const half = (Math.abs(rect.width * dx) + Math.abs(rect.height * dy)) / 2;

  return {
    type: "linear",
    x1: cx - dx * half,
    y1: cy - dy * half,
    x2: cx + dx * half,
    y2: cy + dy * half,
    stops,
  };
}

/** A rectangle on the final image, on the image being drawn on */
function local(rect: Rect, target: Target): Rect {
  return { ...rect, x: rect.x - target.x, y: rect.y - target.y };
}

function drawShadows(
  shadows: Shadow[],
  rect: Rect,
  radius: Radius | undefined,
  target: Target,
  create: CreateImage,
) {
  // The first shadow is on top, like CSS
  for (const shadow of [...shadows].reverse()) {
    const { x = 0, y = 4, blur = 12, spread = 0 } = shadow;
    const image = borderMethods.boxShadow(create(rect.width, rect.height), {
      ...shadow,
      radius,
    });
    // boxShadow grows the image by this much on the left and top
    const extent = blur + spread;
    const left = Math.max(0, Math.ceil(extent - x));
    const top = Math.max(0, Math.ceil(extent - y));

    composite(
      target.image,
      image,
      rect.x - target.x - left,
      rect.y - target.y - top,
    );
  }
}

function drawImage(
  node: ImageNode,
  source: JimpClass,
  content: Rect,
  inset: number,
  target: Target,
) {
  const { width: w, height: h } = content;

  if (w <= 0 || h <= 0) {
    return;
  }

  let image = clone(source);

  if (image.bitmap.width !== w || image.bitmap.height !== h) {
    const align = node.objectPosition;

    if (node.fit === "cover") {
      image = coverMethods.cover(image, { w, h, align });
    } else if (node.fit === "contain") {
      // contain shows the whole image, so a strategy has nothing to choose
      image = containMethods.contain(image, {
        w,
        h,
        align: typeof align === "object" ? align : undefined,
      });
    } else {
      image = resizeMethods.resize(image, { w, h });
    }
  }

  const radius = insetRadius(node.radius, inset);

  if (radius) {
    image = borderMethods.roundCorners(image, { radius });
  }

  composite(target.image, image, content.x - target.x, content.y - target.y);
}

function drawText(placed: PlacedNode, content: Rect, target: Target) {
  const { text } = placed.resolved;
  const { frame } = placed;

  if (!text || frame.text === undefined) {
    return;
  }

  const { style, color, align } = text;
  const position = local(content, target);
  const box = {
    x: position.x,
    y: position.y,
    text: {
      text: frame.text,
      alignmentX:
        align === "center"
          ? HorizontalAlign.CENTER
          : align === "right"
            ? HorizontalAlign.RIGHT
            : HorizontalAlign.LEFT,
    },
    // Not the rounded width, which could be narrower than the text
    maxWidth: frame.wrapWidth,
  };

  if (isVectorFont(style.font)) {
    printMethods.print(target.image, {
      ...box,
      font: style.font,
      size: style.size!,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      color: color === undefined ? undefined : toPaint(color, position),
    });
  } else {
    printMethods.print(target.image, { ...box, font: style.font });
  }
}

/** Draw a node and everything in it */
export function paint(placed: PlacedNode, target: Target, create: CreateImage) {
  const { opacity = 1 } = placed.resolved.node;

  if (opacity <= 0) {
    return;
  }

  if (opacity < 1) {
    // Draw it on its own, then fade the whole thing in one go
    const layer = create(target.image.bitmap.width, target.image.bitmap.height);

    paintNode(placed, { ...target, image: layer }, create);
    composite(target.image, layer, 0, 0, { opacitySource: opacity });

    return;
  }

  paintNode(placed, target, create);
}

function paintNode(placed: PlacedNode, target: Target, create: CreateImage) {
  const { resolved } = placed;
  const { node, border, padding } = resolved;
  const rect = local(placed, target);

  if (placed.width <= 0 || placed.height <= 0) {
    return;
  }

  if (node.shadow) {
    drawShadows(
      Array.isArray(node.shadow) ? node.shadow : [node.shadow],
      placed,
      node.radius,
      target,
      create,
    );
  }

  if (node.background !== undefined || border > 0) {
    drawMethods.drawRect(target.image, {
      x: rect.x,
      y: rect.y,
      w: rect.width,
      h: rect.height,
      radius: node.radius,
      fill:
        node.background === undefined
          ? undefined
          : toPaint(node.background, rect),
      ...(border > 0 && {
        stroke: node.borderColor ?? 0x000000ff,
        strokeWidth: border,
        strokeAlign: "inside" as const,
      }),
    });
  }

  const content: Rect = {
    x: placed.x + border + padding.left,
    y: placed.y + border + padding.top,
    width: placed.width - border * 2 - padding.left - padding.right,
    height: placed.height - border * 2 - padding.top - padding.bottom,
  };

  if (resolved.image) {
    drawImage(
      node as ImageNode,
      resolved.image,
      content,
      border + Math.max(...Object.values(padding)),
      target,
    );
  } else if (resolved.text) {
    drawText(placed, content, target);
  } else if ((node as BoxNode).overflow === "hidden") {
    // Draw the children on their own, clip them to inside the border, then
    // draw them on the image
    const inside: Rect = {
      x: placed.x + border,
      y: placed.y + border,
      width: placed.width - border * 2,
      height: placed.height - border * 2,
    };

    if (inside.width <= 0 || inside.height <= 0) {
      return;
    }

    let layer = create(inside.width, inside.height);
    const clipped = { image: layer, x: inside.x, y: inside.y };

    for (const child of placed.children) {
      paint(child, clipped, create);
    }

    const radius = insetRadius(node.radius, border);

    if (radius) {
      layer = borderMethods.roundCorners(layer, { radius });
    }

    composite(target.image, layer, inside.x - target.x, inside.y - target.y);
  } else {
    for (const child of placed.children) {
      paint(child, target, create);
    }
  }
}
