import type { BmFont, VectorFont } from "@jimp/plugin-print";
import { JimpClassSchema, type JimpClass } from "@jimp/types";
import { GradientStopsSchema as StopsSchema } from "@jimp/utils";
import { z } from "zod";

/** A font from `loadFont` (bitmap) or `loadTTF` (TrueType, OpenType or WOFF) */
export type LayoutFont = BmFont | VectorFont;

/** Whether `font` came from `loadTTF`, rather than being a bitmap font */
export function isVectorFont(font: LayoutFont): font is VectorFont {
  return "opentype" in font;
}

const FontSchema = z.custom<LayoutFont>(
  (font) =>
    typeof font === "object" &&
    font !== null &&
    ("opentype" in font || ("chars" in font && "common" in font)),
  "Expected a font from loadFont or loadTTF",
);

const PercentSchema = z.templateLiteral([z.number(), "%"]);

/** A length in pixels, or a percentage of the parent's content box like `"50%"` */
const LengthSchema = z.union([z.number(), PercentSchema]);

/** A width or height: pixels, a percentage, or `"auto"` to size to the content */
const SizeSchema = z.union([
  z.number().min(0),
  PercentSchema,
  z.literal("auto"),
]);

/**
 * Space around the four sides, like CSS's `padding` and `margin`: one number
 * for every side, `[vertical, horizontal]`, or `[top, right, bottom, left]`.
 */
const SpacingSchema = z.union([
  z.number(),
  z.tuple([z.number(), z.number()]),
  z.tuple([z.number(), z.number(), z.number(), z.number()]),
]);

export type Spacing = z.infer<typeof SpacingSchema>;

/**
 * A color: a hex number (`0xRRGGBBAA`) or a CSS color string, which is
 * converted to the image's colour space.
 */
const ColorSchema = z.union([
  z.number().int().min(0).max(0xffffffff),
  z.string(),
]);

export type Color = z.infer<typeof ColorSchema>;

const LinearGradientSchema = z.strictObject({
  type: z.literal("linear"),
  /**
   * the direction in degrees, like CSS `linear-gradient`: 0 goes up, 90 goes
   * right and 180 (the default) goes down
   */
  angle: z.number().optional(),
  /**
   * the colors along the gradient: colors, spread out evenly, or
   * `{ offset, color }` stops with offsets from 0 to 1
   */
  stops: StopsSchema,
});

const RadialGradientSchema = z.strictObject({
  type: z.literal("radial"),
  /**
   * the colors from the center out to the farthest corner: colors, spread
   * out evenly, or `{ offset, color }` stops with offsets from 0 to 1
   */
  stops: StopsSchema,
});

/**
 * A gradient sized to the box it fills, like CSS's `linear-gradient` and
 * `radial-gradient(circle farthest-corner, ...)`
 */
export type Gradient =
  z.infer<typeof LinearGradientSchema> | z.infer<typeof RadialGradientSchema>;

/** What to fill a box or text with: a color or a gradient */
const FillSchema = z.union([
  ColorSchema,
  LinearGradientSchema,
  RadialGradientSchema,
]);

export type Fill = z.infer<typeof FillSchema>;

const CornerRadiiSchema = z.strictObject({
  topLeft: z.number().min(0).optional(),
  topRight: z.number().min(0).optional(),
  bottomRight: z.number().min(0).optional(),
  bottomLeft: z.number().min(0).optional(),
});

const RadiusSchema = z.union([z.number().min(0), CornerRadiiSchema]);

export type Radius = z.infer<typeof RadiusSchema>;

const ShadowSchema = z.strictObject({
  /** how far right the shadow is, in pixels. Defaults to 0. */
  x: z.number().optional(),
  /** how far down the shadow is, in pixels. Defaults to 4. */
  y: z.number().optional(),
  /** the blur radius in pixels, like CSS. Defaults to 12. */
  blur: z.number().min(0).optional(),
  /** how much to grow the shadow on every side. Defaults to 0. */
  spread: z.number().optional(),
  /** the color of the shadow. Defaults to 50% black. */
  color: ColorSchema.optional(),
});

/** A shadow under a box, like CSS `box-shadow` */
export type Shadow = z.infer<typeof ShadowSchema>;

const AlignSchema = z.enum(["start", "center", "end", "stretch"]);

/** A CSS `mix-blend-mode` */
const BlendModeSchema = z.enum([
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
]);

/** How a node blends with what's behind it, like CSS `mix-blend-mode` */
export type LayoutBlendMode = z.infer<typeof BlendModeSchema>;

/** The props every node has: its size, its spacing and its place in a row or column */
const LayoutPropsSchema = z.strictObject({
  /** the width, border and padding included. Defaults to `"auto"`. */
  width: SizeSchema.optional(),
  /** the height, border and padding included. Defaults to `"auto"`. */
  height: SizeSchema.optional(),
  minWidth: LengthSchema.optional(),
  maxWidth: LengthSchema.optional(),
  minHeight: LengthSchema.optional(),
  maxHeight: LengthSchema.optional(),
  /**
   * the width divided by the height, like CSS `aspect-ratio`. With only one
   * of them known, it gives the other.
   */
  aspectRatio: z.number().positive().optional(),
  /** space inside the border, around the content */
  padding: SpacingSchema.optional(),
  /** space outside the border, around the node */
  margin: SpacingSchema.optional(),
  /** how much of the parent's spare space along its direction the node takes. Defaults to 0. */
  grow: z.number().min(0).optional(),
  /**
   * how much the node shrinks when its parent is too small, relative to its
   * size. Defaults to 1. It doesn't shrink smaller than its content, like
   * the longest word of its text, unless it has a `minWidth` or `minHeight`.
   */
  shrink: z.number().min(0).optional(),
  /** overrides the parent's `align` for this node */
  alignSelf: AlignSchema.optional(),
  /**
   * `"absolute"` takes the node out of the row or column and places it with
   * `top`, `right`, `bottom` and `left` inside the parent's padding box
   */
  position: z.enum(["relative", "absolute"]).optional(),
  top: LengthSchema.optional(),
  right: LengthSchema.optional(),
  bottom: LengthSchema.optional(),
  left: LengthSchema.optional(),
});

/** The props that decorate a node's box */
const BoxStylePropsSchema = z.strictObject({
  /** a color or gradient to fill the box with, under the border */
  background: FillSchema.optional(),
  /** the width of the border, inside the box like CSS. Defaults to 0. */
  borderWidth: z.number().min(0).optional(),
  /** the color of the border. Defaults to black. */
  borderColor: ColorSchema.optional(),
  /** the radius of the corners, for every corner or per corner */
  radius: RadiusSchema.optional(),
  /** one or more shadows under the box. The first is drawn on top. */
  shadow: z.union([ShadowSchema, z.array(ShadowSchema)]).optional(),
  /** the opacity of the node and everything in it, from 0 to 1 */
  opacity: z.number().min(0).max(1).optional(),
  /**
   * how the node and everything in it blends with what's behind it, like
   * CSS `mix-blend-mode`. Defaults to `"normal"`.
   */
  blendMode: BlendModeSchema.optional(),
});

/** Text props. Set them on a box and the text inside it inherits them. */
const TextStylePropsSchema = z.strictObject({
  /** the font: a bitmap font from `loadFont`, or a font from `loadTTF` */
  font: FontSchema.optional(),
  /** for `loadTTF` fonts: the font size in pixels */
  fontSize: z.number().min(0).optional(),
  /** for `loadTTF` fonts: what to fill the text with. Defaults to black. */
  color: FillSchema.optional(),
  /** for `loadTTF` fonts: the height of each line in pixels. Defaults to the font's. */
  lineHeight: z.number().min(0).optional(),
  /** for `loadTTF` fonts: extra space between characters, in pixels */
  letterSpacing: z.number().optional(),
  /** how lines are aligned in the text's box. Defaults to `"left"`. */
  textAlign: z.enum(["left", "center", "right"]).optional(),
});

const BoxPropsSchema = LayoutPropsSchema.extend(BoxStylePropsSchema.shape)
  .extend(TextStylePropsSchema.shape)
  .extend({
    /** whether children are laid out in a `"column"` (default) or a `"row"` */
    direction: z.enum(["row", "column"]).optional(),
    /** space between children, and between lines, in pixels. Defaults to 0. */
    gap: z.number().min(0).optional(),
    /**
     * whether children that don't fit start a new line (a new column in a
     * column), like CSS `flex-wrap: wrap`. Defaults to false.
     */
    wrap: z.boolean().optional(),
    /** where children go along the direction. Defaults to `"start"`. */
    justify: z
      .enum([
        "start",
        "center",
        "end",
        "space-between",
        "space-around",
        "space-evenly",
      ])
      .optional(),
    /** where children go across the direction. Defaults to `"stretch"`. */
    align: AlignSchema.optional(),
    /** `"hidden"` clips the children to the inside of the border */
    overflow: z.enum(["visible", "hidden"]).optional(),
  });

/** The props of a box: a row or column of other nodes */
export type BoxProps = z.infer<typeof BoxPropsSchema>;

const TextPropsSchema = LayoutPropsSchema.extend(BoxStylePropsSchema.shape)
  .extend(TextStylePropsSchema.shape)
  .extend({
    /**
     * the most lines to show. Text that needs more is cut short with an
     * ellipsis.
     */
    maxLines: z.number().int().min(1).optional(),
  });

/** The props of a text node */
export type TextProps = z.infer<typeof TextPropsSchema>;

/** Anything `Jimp.read` reads, or an image */
export type ImageSource = JimpClass | string | ArrayBuffer | Uint8Array;

const ImageSourceSchema = z.union([
  JimpClassSchema,
  z.string(),
  z.instanceof(ArrayBuffer),
  z.instanceof(Uint8Array),
]);

const ImagePropsSchema = LayoutPropsSchema.extend(
  BoxStylePropsSchema.shape,
).extend({
  /**
   * how the image fills its box, like CSS `object-fit`: `"fill"` (default)
   * stretches it, `"cover"` crops it and `"contain"` fits it in
   */
  fit: z.enum(["fill", "cover", "contain"]).optional(),
  /**
   * which part of the image `fit` keeps, or where it places it, like CSS
   * `object-position`: `{ x, y }` fractions from 0 (left/top) to 1
   * (right/bottom). With `fit: "cover"`, `"entropy"` or `"attention"` look at
   * the image to keep its subject, see `cover`. Defaults to the middle.
   */
  objectPosition: z
    .union([
      z.object({ x: z.number().optional(), y: z.number().optional() }),
      z.enum(["entropy", "attention"]),
    ])
    .optional(),
});

/** The props of an image node */
export type ImageProps = z.infer<typeof ImagePropsSchema>;

/** A row or column of other nodes */
export interface BoxNode extends BoxProps {
  type: "box";
  children?: LayoutNode[];
}

/** Text, wrapped to fit its box */
export interface TextNode extends TextProps {
  type: "text";
  text: string;
}

/** An image */
export interface ImageNode extends ImageProps {
  type: "image";
  /**
   * the image: a Jimp image, or a path, URL or buffer, read with the `Jimp`
   * you render with
   */
  src: ImageSource;
}

/** A node of the tree that {@link render} draws */
export type LayoutNode = BoxNode | TextNode | ImageNode;

export const LayoutNodeSchema: z.ZodType<LayoutNode> = z.lazy(() =>
  z.discriminatedUnion("type", [
    BoxPropsSchema.extend({
      type: z.literal("box"),
      children: z.array(LayoutNodeSchema).optional(),
    }),
    TextPropsSchema.extend({ type: z.literal("text"), text: z.string() }),
    ImagePropsSchema.extend({
      type: z.literal("image"),
      src: ImageSourceSchema,
    }),
  ]),
) as z.ZodType<LayoutNode>;

export const RenderOptionsSchema = z.object({
  /** a color or gradient to fill the image with first */
  background: FillSchema.optional(),
});

export const LayoutOptionsSchema = z.strictObject({
  /** the width of the image. Defaults to the width of the tree. */
  width: z.number().int().min(1).optional(),
  /** the height of the image. Defaults to the height of the tree. */
  height: z.number().int().min(1).optional(),
});
