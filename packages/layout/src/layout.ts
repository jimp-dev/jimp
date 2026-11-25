import { JimpClassSchema, type JimpClass } from "@jimp/types";

import {
  isVectorFont,
  type BoxNode,
  type Fill,
  type ImageSource,
  type LayoutNode,
  type Spacing,
  type TextProps,
} from "./schema.js";
import { clampLines, textHeight, textWidth, type TextStyle } from "./text.js";

/** The four sides of a box */
export interface Edges {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Text props a box passes down to the text inside it */
const INHERITED = [
  "font",
  "fontSize",
  "color",
  "lineHeight",
  "letterSpacing",
  "textAlign",
] as const;

type Inherited = Pick<TextProps, (typeof INHERITED)[number]>;

/** Text props that do nothing with bitmap fonts */
const VECTOR_ONLY = [
  "fontSize",
  "color",
  "lineHeight",
  "letterSpacing",
] as const;

/**
 * A node with its inherited props, spacing and image worked out, ready to lay
 * out. There's one for each place a node appears in the tree.
 */
export interface ResolvedNode {
  node: LayoutNode;
  children: ResolvedNode[];
  padding: Edges;
  margin: Edges;
  border: number;
  text?: {
    style: TextStyle;
    content: string;
    color?: Fill;
    align: "left" | "center" | "right";
    maxLines?: number;
  };
  image?: JimpClass;
  /** Frames already laid out, by their constraints */
  cache: Map<string, Frame>;
}

/** A child placed in its parent, relative to the parent's top left corner */
export interface Placement {
  node: ResolvedNode;
  x: number;
  y: number;
  frame: Frame;
}

/** The size of a node and where its children are */
export interface Frame {
  width: number;
  height: number;
  children: Placement[];
  /** for text: what to draw, after `maxLines`, and the width to wrap it at */
  text?: string;
  wrapWidth?: number;
}

/** Reads an image source that isn't an image yet */
export type ReadImage = (
  src: Exclude<ImageSource, JimpClass>,
) => Promise<JimpClass>;

export function edges(spacing: Spacing = 0): Edges {
  if (typeof spacing === "number") {
    return { top: spacing, right: spacing, bottom: spacing, left: spacing };
  }

  if (spacing.length === 2) {
    const [vertical, horizontal] = spacing;

    return {
      top: vertical,
      right: horizontal,
      bottom: vertical,
      left: horizontal,
    };
  }

  const [top, right, bottom, left] = spacing;

  return { top, right, bottom, left };
}

function inherit(inherited: Inherited, node: Inherited): Inherited {
  const next: Inherited = { ...inherited };

  for (const key of INHERITED) {
    if (node[key] !== undefined) {
      // Each key copies its own type
      (next as Record<string, unknown>)[key] = node[key];
    }
  }

  return next;
}

/**
 * Resolve inherited text props and read images, so the tree can be laid out
 * without waiting for anything
 */
export async function resolveTree(
  node: LayoutNode,
  inherited: Inherited,
  read: ReadImage,
): Promise<ResolvedNode> {
  const resolved: ResolvedNode = {
    node,
    children: [],
    padding: edges(node.padding),
    margin: edges(node.margin),
    border: node.borderWidth ?? 0,
    cache: new Map(),
  };

  if (node.type === "box") {
    const next = inherit(inherited, node);

    resolved.children = await Promise.all(
      (node.children ?? []).map((child) => resolveTree(child, next, read)),
    );
  } else if (node.type === "text") {
    const props = inherit(inherited, node);
    const { font } = props;

    if (!font) {
      throw new Error(
        "layout: text needs a font. Set `font` on the text or on a box around it.",
      );
    }

    if (isVectorFont(font)) {
      if (props.fontSize === undefined) {
        throw new Error(
          "layout: text with a font from loadTTF needs a `fontSize`. Set it on the text or on a box around it.",
        );
      }
    } else {
      // Inherited ones are ignored, so a bitmap font can be used inside a
      // box styled for loadTTF fonts
      const vectorOnly = VECTOR_ONLY.filter((key) => node[key] !== undefined);

      if (vectorOnly.length > 0) {
        throw new Error(
          `layout: ${vectorOnly.join(", ")} can only be used with fonts loaded with loadTTF. Bitmap fonts from loadFont are drawn at the size and in the color they were made with.`,
        );
      }
    }

    const vector = isVectorFont(font);

    resolved.text = {
      style: {
        font,
        size: vector ? props.fontSize : undefined,
        lineHeight: vector ? props.lineHeight : undefined,
        letterSpacing: vector ? props.letterSpacing : undefined,
      },
      content: node.text,
      color: vector ? props.color : undefined,
      align: props.textAlign ?? "left",
      maxLines: node.maxLines,
    };
  } else {
    resolved.image = JimpClassSchema.safeParse(node.src).success
      ? (node.src as JimpClass)
      : await read(node.src as Exclude<ImageSource, JimpClass>);
  }

  return resolved;
}

/** What a node's parent tells it about its size */
interface Constraints {
  /** the width, set by the parent, e.g. by stretching or growing it */
  width?: number;
  height?: number;
  /** the most width there is for the node, when its width is auto */
  availableWidth?: number;
  availableHeight?: number;
  /** what percentages of the node's width and height are of */
  baseWidth?: number;
  baseHeight?: number;
}

type Length = number | `${number}%` | "auto" | undefined;

/** A length in pixels, or undefined for auto */
function resolveLength(length: Length, base: number | undefined) {
  if (length === undefined || length === "auto") {
    return undefined;
  }

  if (typeof length === "number") {
    return length;
  }

  return base === undefined ? undefined : (parseFloat(length) / 100) * base;
}

/** The node's own limits on its width and height */
function limits(r: ResolvedNode, baseWidth?: number, baseHeight?: number) {
  const { node, padding, border } = r;
  const insetX = padding.left + padding.right + border * 2;
  const insetY = padding.top + padding.bottom + border * 2;
  // Like CSS, a min beats a max, and the box is never smaller than its
  // padding and border
  const clamp = (value: number, min: number, max: number, inset: number) =>
    Math.max(inset, min, Math.min(max, value));
  const minWidth = resolveLength(node.minWidth, baseWidth) ?? 0;
  const maxWidth = resolveLength(node.maxWidth, baseWidth) ?? Infinity;
  const minHeight = resolveLength(node.minHeight, baseHeight) ?? 0;
  const maxHeight = resolveLength(node.maxHeight, baseHeight) ?? Infinity;

  return {
    insetX,
    insetY,
    minWidth: Math.max(insetX, minWidth),
    maxWidth,
    minHeight: Math.max(insetY, minHeight),
    maxHeight,
    clampWidth: (width: number) => clamp(width, minWidth, maxWidth, insetX),
    clampHeight: (height: number) =>
      clamp(height, minHeight, maxHeight, insetY),
  };
}

interface FlexItem {
  basis: number;
  grow: number;
  shrink: number;
  min: number;
  max: number;
}

/**
 * Grow or shrink the items to fill `space`, like CSS's flexible lengths: free
 * space is shared by `grow`, missing space is taken by `shrink` times the
 * size, and items that hit their min or max are frozen there.
 */
export function distribute(items: FlexItem[], space: number) {
  const sizes = items.map((item) => item.basis);
  const growing = space > items.reduce((total, item) => total + item.basis, 0);
  const frozen = items.map((item) => (growing ? item.grow : item.shrink) === 0);

  for (let pass = 0; pass <= items.length; pass++) {
    let free = space;
    let weights = 0;

    items.forEach((item, i) => {
      if (frozen[i]) {
        free -= sizes[i]!;
      } else {
        free -= item.basis;
        weights += growing ? item.grow : item.shrink * item.basis;
      }
    });

    if (frozen.every(Boolean)) {
      break;
    }

    const targets: number[] = [];
    let violation = 0;

    items.forEach((item, i) => {
      if (frozen[i]) {
        return;
      }

      const weight = growing ? item.grow : item.shrink * item.basis;
      const target = item.basis + (weights > 0 ? (free * weight) / weights : 0);
      const size = Math.max(item.min, Math.min(item.max, target));

      targets[i] = target;
      sizes[i] = size;
      violation += size - target;
    });

    if (violation === 0) {
      break;
    }

    // Freeze the items that hit a min (if the clamping added space overall)
    // or a max (if it took space away), and share out the rest again
    items.forEach((_, i) => {
      if (
        !frozen[i] &&
        (violation > 0 ? sizes[i]! > targets[i]! : sizes[i]! < targets[i]!)
      ) {
        frozen[i] = true;
      }
    });
  }

  return sizes;
}

/** Lay out a node and its children for the given constraints */
export function layOut(r: ResolvedNode, c: Constraints): Frame {
  const key = [
    c.width,
    c.height,
    c.availableWidth,
    c.availableHeight,
    c.baseWidth,
    c.baseHeight,
  ].join();
  const cached = r.cache.get(key);

  if (cached) {
    return cached;
  }

  const frame = layOutUncached(r, c);

  r.cache.set(key, frame);

  return frame;
}

function layOutUncached(r: ResolvedNode, c: Constraints): Frame {
  const { node } = r;
  const { insetX, insetY, clampWidth, clampHeight } = limits(
    r,
    c.baseWidth,
    c.baseHeight,
  );
  let width = c.width ?? resolveLength(node.width, c.baseWidth);
  let height = c.height ?? resolveLength(node.height, c.baseHeight);

  width = width === undefined ? undefined : clampWidth(width);
  height = height === undefined ? undefined : clampHeight(height);

  // The most the content can take up, when the size is auto
  const availableWidth =
    width ??
    (c.availableWidth === undefined ? undefined : clampWidth(c.availableWidth));
  const availableHeight =
    height ??
    (c.availableHeight === undefined
      ? undefined
      : clampHeight(c.availableHeight));

  if (r.text) {
    const { style, content, maxLines } = r.text;

    if (width === undefined) {
      const maxContent = textWidth(style, content);

      width = clampWidth(
        availableWidth === undefined
          ? maxContent + insetX
          : Math.min(maxContent + insetX, availableWidth),
      );
    }

    const wrapWidth = width - insetX;
    const text = clampLines(style, content, wrapWidth, maxLines);

    height ??= clampHeight(textHeight(style, text, wrapWidth) + insetY);

    return { width, height, children: [], text, wrapWidth };
  }

  if (r.image) {
    const natural = r.image.bitmap;
    const aspect = natural.width / natural.height;

    if (width === undefined && height === undefined) {
      width = clampWidth(natural.width + insetX);
      height = clampHeight(natural.height + insetY);
    } else if (width === undefined) {
      width = clampWidth((height! - insetY) * aspect + insetX);
    } else if (height === undefined) {
      height = clampHeight((width - insetX) / aspect + insetY);
    }

    return { width, height: height!, children: [] };
  }

  return layOutBox(r, node as BoxNode, {
    width,
    height,
    availableWidth,
    availableHeight,
    insetX,
    insetY,
    clampWidth,
    clampHeight,
  });
}

interface BoxSizing {
  width?: number;
  height?: number;
  availableWidth?: number;
  availableHeight?: number;
  insetX: number;
  insetY: number;
  clampWidth: (width: number) => number;
  clampHeight: (height: number) => number;
}

/** Lay out a box's children in a row or column, like a CSS flex container */
function layOutBox(r: ResolvedNode, node: BoxNode, sizing: BoxSizing): Frame {
  const { padding, border } = r;
  const { insetX, insetY } = sizing;
  const isRow = node.direction === "row";
  const gap = node.gap ?? 0;
  const align = node.align ?? "stretch";
  const contentWidth =
    sizing.width === undefined ? undefined : sizing.width - insetX;
  const contentHeight =
    sizing.height === undefined ? undefined : sizing.height - insetY;
  const availableContentWidth =
    sizing.availableWidth === undefined
      ? undefined
      : Math.max(0, sizing.availableWidth - insetX);
  const availableContentHeight =
    sizing.availableHeight === undefined
      ? undefined
      : Math.max(0, sizing.availableHeight - insetY);

  // Everything below is along the main axis (the direction) or the cross axis
  const mainSize = isRow ? contentWidth : contentHeight;
  const crossSize = isRow ? contentHeight : contentWidth;
  const availableMain = isRow ? availableContentWidth : availableContentHeight;
  const availableCross = isRow ? availableContentHeight : availableContentWidth;
  const insetMain = isRow ? insetX : insetY;
  const insetCross = isRow ? insetY : insetX;
  const clampMain = isRow ? sizing.clampWidth : sizing.clampHeight;
  const clampCross = isRow ? sizing.clampHeight : sizing.clampWidth;
  const mainOf = (frame: Frame) => (isRow ? frame.width : frame.height);
  const crossOf = (frame: Frame) => (isRow ? frame.height : frame.width);
  const lay = (
    child: ResolvedNode,
    main: number | undefined,
    cross: number | undefined,
    availableChildMain?: number,
    availableChildCross?: number,
  ) =>
    layOut(
      child,
      isRow
        ? {
            width: main,
            height: cross,
            availableWidth: availableChildMain,
            availableHeight: availableChildCross,
            baseWidth: contentWidth,
            baseHeight: contentHeight,
          }
        : {
            width: cross,
            height: main,
            availableWidth: availableChildCross,
            availableHeight: availableChildMain,
            baseWidth: contentWidth,
            baseHeight: contentHeight,
          },
    );
  const minus = (a: number | undefined, b: number) =>
    a === undefined ? undefined : Math.max(0, a - b);

  const inFlow = r.children.filter(
    (child) => child.node.position !== "absolute",
  );
  const items = inFlow.map((child) => {
    const { margin } = child;
    const marginMainStart = isRow ? margin.left : margin.top;
    const marginMainEnd = isRow ? margin.right : margin.bottom;
    const marginCrossStart = isRow ? margin.top : margin.left;
    const marginCrossEnd = isRow ? margin.bottom : margin.right;
    const marginMain = marginMainStart + marginMainEnd;
    const marginCross = marginCrossStart + marginCrossEnd;
    const selfAlign = child.node.alignSelf ?? align;
    const crossLength = isRow ? child.node.height : child.node.width;
    const stretch =
      selfAlign === "stretch" &&
      (crossLength === undefined || crossLength === "auto");
    const availableChildMain = minus(mainSize ?? availableMain, marginMain);
    const availableChildCross = minus(crossSize ?? availableCross, marginCross);
    // With a known cross size, stretched children are that size from the
    // start, e.g. so text in a column wraps at the column's width
    const stretchedCross = stretch ? minus(crossSize, marginCross) : undefined;
    const childLimits = limits(child, contentWidth, contentHeight);
    const min = isRow ? childLimits.minWidth : childLimits.minHeight;
    const max = isRow ? childLimits.maxWidth : childLimits.maxHeight;
    let basis = resolveLength(
      isRow ? child.node.width : child.node.height,
      mainSize,
    );

    basis =
      basis === undefined
        ? mainOf(
            lay(
              child,
              undefined,
              stretchedCross,
              availableChildMain,
              availableChildCross,
            ),
          )
        : Math.max(min, Math.min(max, basis));

    return {
      child,
      basis,
      grow: child.node.grow ?? 0,
      // Like CSS, images don't shrink below their size, so they don't
      // get squashed
      shrink: child.node.shrink ?? (child.image ? 0 : 1),
      min,
      max,
      marginMainStart,
      marginMainEnd,
      marginCrossStart,
      marginCrossEnd,
      marginMain,
      marginCross,
      selfAlign,
      stretch,
      stretchedCross,
      availableChildCross,
    };
  });

  const margins =
    items.reduce((total, item) => total + item.marginMain, 0) +
    gap * Math.max(0, items.length - 1);
  const lineMain =
    mainSize ??
    clampMain(
      items.reduce((total, item) => total + item.basis, 0) +
        margins +
        insetMain,
    ) - insetMain;
  const sizes = distribute(items, lineMain - margins);
  let frames = items.map((item, i) =>
    lay(
      item.child,
      sizes[i],
      item.stretchedCross,
      undefined,
      item.availableChildCross,
    ),
  );
  const lineCross =
    crossSize ??
    clampCross(
      frames.reduce(
        (most, frame, i) =>
          Math.max(most, crossOf(frame) + items[i]!.marginCross),
        0,
      ) + insetCross,
    ) - insetCross;

  // Now the line's cross size is known, stretch the children that couldn't
  // be stretched before
  frames = frames.map((frame, i) => {
    const item = items[i]!;

    if (!item.stretch || item.stretchedCross !== undefined) {
      return frame;
    }

    item.stretchedCross = Math.max(0, lineCross - item.marginCross);

    return lay(item.child, sizes[i], item.stretchedCross);
  });

  const width = sizing.width ?? (isRow ? lineMain : lineCross) + insetX;
  const height = sizing.height ?? (isRow ? lineCross : lineMain) + insetY;

  // Place the children along the main axis
  const free =
    lineMain - margins - sizes.reduce((total, size) => total + size, 0);
  const count = items.length;
  let start = 0;
  let between = gap;

  switch (node.justify ?? "start") {
    case "end":
      start = free;
      break;
    case "center":
      start = free / 2;
      break;
    case "space-between":
      if (free > 0 && count > 1) {
        between += free / (count - 1);
      }
      break;
    case "space-around":
      if (free > 0) {
        between += free / count;
        start = free / count / 2;
      } else {
        start = free / 2;
      }
      break;
    case "space-evenly":
      if (free > 0) {
        between += free / (count + 1);
        start = free / (count + 1);
      } else {
        start = free / 2;
      }
      break;
    default:
      break;
  }

  const mainStart = border + (isRow ? padding.left : padding.top) + start;
  const crossStart = border + (isRow ? padding.top : padding.left);
  let position = mainStart;
  const placements = new Map<ResolvedNode, Placement>();

  items.forEach((item, i) => {
    const frame = frames[i]!;
    const main = position + item.marginMainStart;
    let cross = crossStart + item.marginCrossStart;

    if (item.selfAlign === "end") {
      cross = crossStart + lineCross - crossOf(frame) - item.marginCrossEnd;
    } else if (item.selfAlign === "center") {
      cross += (lineCross - item.marginCross - crossOf(frame)) / 2;
    }

    position = main + mainOf(frame) + item.marginMainEnd + between;
    placements.set(item.child, {
      node: item.child,
      x: isRow ? main : cross,
      y: isRow ? cross : main,
      frame,
    });
  });

  // Absolutely positioned children are placed in the padding box
  const paddingBoxWidth = width - border * 2;
  const paddingBoxHeight = height - border * 2;

  for (const child of r.children) {
    if (child.node.position !== "absolute") {
      continue;
    }

    const { margin } = child;
    const left = resolveLength(child.node.left, paddingBoxWidth);
    const right = resolveLength(child.node.right, paddingBoxWidth);
    const top = resolveLength(child.node.top, paddingBoxHeight);
    const bottom = resolveLength(child.node.bottom, paddingBoxHeight);
    const marginX = margin.left + margin.right;
    const marginY = margin.top + margin.bottom;
    let childWidth = resolveLength(child.node.width, paddingBoxWidth);
    let childHeight = resolveLength(child.node.height, paddingBoxHeight);

    if (childWidth === undefined && left !== undefined && right !== undefined) {
      childWidth = Math.max(0, paddingBoxWidth - left - right - marginX);
    }

    if (
      childHeight === undefined &&
      top !== undefined &&
      bottom !== undefined
    ) {
      childHeight = Math.max(0, paddingBoxHeight - top - bottom - marginY);
    }

    const frame = layOut(child, {
      width: childWidth,
      height: childHeight,
      availableWidth: Math.max(
        0,
        paddingBoxWidth - (left ?? 0) - (right ?? 0) - marginX,
      ),
      availableHeight: Math.max(
        0,
        paddingBoxHeight - (top ?? 0) - (bottom ?? 0) - marginY,
      ),
      baseWidth: paddingBoxWidth,
      baseHeight: paddingBoxHeight,
    });
    let x = border + padding.left + margin.left;
    let y = border + padding.top + margin.top;

    if (left !== undefined) {
      x = border + left + margin.left;
    } else if (right !== undefined) {
      x = border + paddingBoxWidth - right - margin.right - frame.width;
    }

    if (top !== undefined) {
      y = border + top + margin.top;
    } else if (bottom !== undefined) {
      y = border + paddingBoxHeight - bottom - margin.bottom - frame.height;
    }

    placements.set(child, { node: child, x, y, frame });
  }

  // In tree order, which is the order they're drawn in
  return {
    width,
    height,
    children: r.children.map((child) => placements.get(child)!),
  };
}
