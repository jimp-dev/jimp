import { methods as drawMethods } from "@jimp/plugin-draw";
import type { JimpClass } from "@jimp/types";
import { z } from "zod";

import { layOut, resolveTree, type ReadImage } from "./layout.js";
import { paint, place, toPaint, type PlacedNode } from "./paint.js";
import {
  LayoutNodeSchema,
  LayoutOptionsSchema,
  RenderOptionsSchema,
  type BoxNode,
  type BoxProps,
  type Fill,
  type ImageNode,
  type ImageProps,
  type ImageSource,
  type LayoutNode,
  type TextNode,
  type TextProps,
} from "./schema.js";

export type {
  BoxNode,
  BoxProps,
  Color,
  Fill,
  Gradient,
  ImageNode,
  ImageProps,
  ImageSource,
  LayoutBlendMode,
  LayoutFont,
  LayoutNode,
  Radius,
  Shadow,
  Spacing,
  TextNode,
  TextProps,
} from "./schema.js";

/**
 * The Jimp class to draw with, such as `Jimp` from `jimp` or one made with
 * `createJimp`. `read` is only needed for image nodes whose `src` isn't
 * already an image.
 */
export interface JimpConstructor<I extends JimpClass = JimpClass> {
  new (options: { width: number; height: number; color?: number }): I;
  read?: (src: string | ArrayBuffer | Uint8Array) => Promise<I>;
}

export type LayoutOptions = z.infer<typeof LayoutOptionsSchema> & {
  /** reads image nodes whose `src` is a path, URL or buffer */
  Jimp?: Pick<JimpConstructor, "read">;
};

export interface RenderOptions<I extends JimpClass> {
  /** the Jimp class to make the image with */
  Jimp: JimpConstructor<I>;
  /** the width of the image. Defaults to the width of the tree. */
  width?: number;
  /** the height of the image. Defaults to the height of the tree. */
  height?: number;
  /** a color or gradient to fill the image with first. Defaults to transparent. */
  background?: Fill;
}

/** Where a node ended up: its border box on the image, in whole pixels */
export interface ComputedLayout {
  /** the node, as it is in the tree */
  node: LayoutNode;
  x: number;
  y: number;
  width: number;
  height: number;
  /** for text nodes: the text drawn, cut short if it has more than `maxLines` */
  text?: string;
  children: ComputedLayout[];
}

function reader(Jimp?: Pick<JimpConstructor, "read">): ReadImage {
  return (src) => {
    if (!Jimp?.read) {
      throw new Error(
        "layout: to use an image node with a path, URL or buffer, pass a Jimp class with a `read` method in the options. Or read the image first and pass it as `src`.",
      );
    }

    return Jimp.read(src);
  };
}

/** Lay out the tree on an image of the given size, or of the tree's size */
async function layOutTree(
  tree: LayoutNode,
  options: { width?: number; height?: number },
  read: ReadImage,
) {
  LayoutNodeSchema.parse(tree);
  LayoutOptionsSchema.parse({ width: options.width, height: options.height });

  const root = await resolveTree(tree, {}, read);
  const { margin } = root;
  const marginX = margin.left + margin.right;
  const marginY = margin.top + margin.bottom;
  const { width, height } = options;
  const percent = (length: unknown, base: number | undefined) =>
    typeof length === "string" && length.endsWith("%") && base !== undefined
      ? (parseFloat(length) / 100) * base
      : typeof length === "number"
        ? length
        : undefined;
  const available = (size: number | undefined, margins: number) =>
    size === undefined ? undefined : Math.max(0, size - margins);
  // The root fills the image, unless it has its own size. "auto" sizes it
  // to its content.
  const frame = layOut(root, {
    width:
      tree.width === "auto"
        ? undefined
        : (percent(tree.width, width) ?? available(width, marginX)),
    height:
      tree.height === "auto"
        ? undefined
        : (percent(tree.height, height) ?? available(height, marginY)),
    availableWidth: available(width, marginX),
    availableHeight: available(height, marginY),
    baseWidth: width,
    baseHeight: height,
  });
  const placed = place(root, frame, margin.left, margin.top);

  return {
    placed,
    width: width ?? Math.max(1, Math.ceil(frame.width + marginX)),
    height: height ?? Math.max(1, Math.ceil(frame.height + marginY)),
  };
}

function computed(placed: PlacedNode): ComputedLayout {
  const { resolved, frame, x, y, width, height } = placed;

  return {
    node: resolved.node,
    x,
    y,
    width,
    height,
    ...(frame.text !== undefined && { text: frame.text }),
    children: placed.children.map(computed),
  };
}

/**
 * Works out where every node in the tree goes, without drawing anything.
 * The positions are the same ones {@link render} draws at.
 * @example
 * ```ts
 * import { layout } from "@jimp/layout";
 *
 * const result = await layout(
 *   {
 *     type: "box",
 *     direction: "row",
 *     gap: 10,
 *     children: [
 *       { type: "box", width: 100 },
 *       { type: "box", grow: 1 },
 *     ],
 *   },
 *   { width: 400, height: 100 },
 * );
 *
 * result.children[1]; // { x: 110, y: 0, width: 290, height: 100, ... }
 * ```
 */
export async function layout(
  tree: LayoutNode,
  options: LayoutOptions = {},
): Promise<ComputedLayout> {
  const { placed } = await layOutTree(tree, options, reader(options.Jimp));

  return computed(placed);
}

/**
 * Lays out a tree of boxes, text and images, like CSS flexbox, and draws it
 * on a new image: Open Graph cards, social banners, badges.
 *
 * Boxes lay out their children in a column (or a row with
 * `direction: "row"`) with `gap`, `padding`, `margin`, `justify`, `align`,
 * `grow` and `shrink`, and are drawn with a `background` color or gradient,
 * a `borderWidth` and `borderColor`, a `radius`, `shadow`s and `opacity`.
 * Text wraps to fit its box and inherits `font`, `fontSize`, `color` and the
 * other text props from the boxes around it.
 *
 * The root node fills the image unless it has its own size. Without a
 * `width` or `height` the image is the size of the tree.
 * @example
 * ```ts
 * import { Jimp } from "jimp";
 * import { loadTTF } from "jimp/load-ttf";
 * import { render } from "@jimp/layout";
 *
 * const font = await loadTTF("fonts/Inter-Bold.otf");
 *
 * const card = await render(
 *   {
 *     type: "box",
 *     padding: 64,
 *     justify: "center",
 *     background: { type: "linear", angle: 135, stops: ["#1b1840", "#3a2d7a"] },
 *     font,
 *     color: "white",
 *     children: [
 *       { type: "text", text: "Hello from Jimp", fontSize: 72 },
 *     ],
 *   },
 *   { width: 1200, height: 630, Jimp },
 * );
 *
 * await card.write("card.png");
 * ```
 */
export async function render<I extends JimpClass>(
  tree: LayoutNode,
  options: RenderOptions<I>,
): Promise<I> {
  const { Jimp, background } = options;

  RenderOptionsSchema.parse({ background });
  const { placed, width, height } = await layOutTree(
    tree,
    options,
    reader(Jimp),
  );
  const image = new Jimp({ width, height, color: 0x00000000 });
  const create = (w: number, h: number) => {
    const layer = new Jimp({ width: w, height: h, color: 0x00000000 });

    // So layers are drawn on the image without converting their colours
    layer.iccProfile = image.iccProfile;

    return layer;
  };

  if (background !== undefined) {
    drawMethods.drawRect(image, {
      x: 0,
      y: 0,
      w: width,
      h: height,
      fill: toPaint(background, { x: 0, y: 0, width, height }),
    });
  }

  paint(placed, { image, x: 0, y: 0 }, create);

  return image;
}

type Child = LayoutNode | string | number | boolean | null | undefined;

/** The children of a component: nodes, strings, or (nested) arrays of them */
export type LayoutChildren = Child | LayoutChildren[];

function flatten(children: LayoutChildren): Child[] {
  return Array.isArray(children)
    ? children.flatMap((child) => flatten(child))
    : [children];
}

/**
 * A row or column of other nodes. For JSX, or to build a tree with function
 * calls.
 * @example
 * ```tsx
 * <Box direction="row" gap={16} padding={32} background="#1b1840">
 *   <Text>Hello</Text>
 * </Box>
 * ```
 */
export function Box(
  props: BoxProps & { children?: LayoutChildren } = {},
): BoxNode {
  const { children, ...rest } = props;
  const nodes = flatten(children).flatMap((child): LayoutNode[] => {
    // Skipped like React skips them, and so are empty strings, so
    // `{subtitle && <Text>...</Text>}` adds no empty line
    if (
      child === null ||
      child === undefined ||
      typeof child === "boolean" ||
      child === ""
    ) {
      return [];
    }

    return typeof child === "object"
      ? [child]
      : [{ type: "text", text: String(child) }];
  });

  return { type: "box", ...rest, children: nodes };
}

/**
 * Text. Its children are joined into one string. For JSX, or to build a tree
 * with function calls.
 * @example
 * ```tsx
 * <Text font={font} fontSize={48} maxLines={2}>
 *   {title}
 * </Text>
 * ```
 */
export function Text(
  props: TextProps & { children?: LayoutChildren },
): TextNode {
  const { children, ...rest } = props;
  const text = flatten(children)
    .map((child) => {
      if (child === null || child === undefined || typeof child === "boolean") {
        return "";
      }

      if (typeof child === "object") {
        throw new Error(
          "layout: Text can only contain strings and numbers, not other nodes",
        );
      }

      return String(child);
    })
    .join("");

  return { type: "text", ...rest, text };
}

/**
 * An image. For JSX, or to build a tree with function calls.
 * @example
 * ```tsx
 * <Image src={avatar} width={96} height={96} radius={48} fit="cover" />
 * ```
 */
export function Image(props: ImageProps & { src: ImageSource }): ImageNode {
  return { type: "image", ...props };
}
