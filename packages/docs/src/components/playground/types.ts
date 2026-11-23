import type { Jimp, JimpInstance } from "jimp";
import type { CategoryId } from "../../data/categories";

export type { JimpInstance };

/** A point on the image, in pixels of the image the op is applied to. */
export interface Point {
  x: number;
  y: number;
}

/** A region of the image, in pixels of the image the op is applied to. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Size of the image an op is applied to. Annotate `defaults` functions with it. */
export interface ImageSize {
  width: number;
  height: number;
}

export type OptionValue = number | string | boolean | Point | Rect;
export type Options = Record<string, OptionValue>;

interface BaseControl<O extends Options> {
  /** The key in the op's options this control edits. */
  key: keyof O & string;
  /** Label shown next to the control. Defaults to `key`. */
  label?: string;
  /** Only show the control when this returns true. */
  when?: (opts: O) => boolean;
}

/** A range slider. Value: number. */
export interface SliderControl<O extends Options> extends BaseControl<O> {
  type: "slider";
  min: number;
  max: number;
  step?: number;
  /** Shown after the value, e.g. "px" or "°". */
  unit?: string;
}

/** A free number input. Value: number. Use it where invalid values are instructive. */
export interface NumberControl<O extends Options> extends BaseControl<O> {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
}

/** An on/off switch. Value: boolean. */
export interface ToggleControl<O extends Options> extends BaseControl<O> {
  type: "toggle";
}

/** A dropdown. Value: string. */
export interface SelectControl<O extends Options> extends BaseControl<O> {
  type: "select";
  options: readonly (string | { value: string; label: string })[];
}

/** A color picker. Value: a "#rrggbb" string. */
export interface ColorControl<O extends Options> extends BaseControl<O> {
  type: "color";
}

/** Click on the image to pick a point. Value: Point. */
export interface PointControl<O extends Options> extends BaseControl<O> {
  type: "xy";
}

/** Drag on the image to pick a region. Value: Rect. */
export interface RectControl<O extends Options> extends BaseControl<O> {
  type: "rect";
}

export type Control<O extends Options = Options> =
  | SliderControl<O>
  | NumberControl<O>
  | ToggleControl<O>
  | SelectControl<O>
  | ColorControl<O>
  | PointControl<O>
  | RectControl<O>;

/** Named imports a code sample needs, keyed by module: `{ jimp: ["ResizeStrategy"] }`. */
export type Imports = Partial<Record<string, string[]>>;

/** Helpers passed to `apply`. */
export interface OpContext {
  /** The `Jimp` class from the `jimp` package. */
  Jimp: typeof Jimp;
  /** Load an image from `public/`, e.g. `loadImage("dice.png")`. Cached. */
  loadImage(path: string): Promise<JimpInstance>;
}

export interface Op<O extends Options = Options> {
  /** Unique id. Use the method name ("blur") for an op that demos one method. */
  id: string;
  /** The method this op demonstrates, if it differs from `id`. Links stickers and docs. */
  method?: string;
  /** Text on the tool button, usually the method name. */
  label: string;
  /** A key from `toolIcons` in src/components/icons.ts, or raw SVG markup for a 32x32 viewBox. */
  icon: string;
  /** Category, used to filter ops and stickers. */
  group: CategoryId;
  /** One sentence describing what the op does. Plain text. */
  description: string;
  controls: Control<NoInfer<O>>[];
  /**
   * Starting options. A function receives the size of the image the op is
   * applied to. The option types of the whole op are inferred from this.
   */
  defaults: O | ((size: ImageSize) => O);
  /** Apply the op to `image` in place. Throwing shows the error in the playground. */
  apply(image: JimpInstance, opts: NoInfer<O>, ctx: OpContext): void | Promise<void>;
  /** The statements a user would write for this step. They operate on a variable named `image`. */
  code(opts: NoInfer<O>): string;
  /** Named imports the code needs besides `Jimp`. */
  imports?: (opts: NoInfer<O>) => Imports;
  /** Sticker thumbnail: `false` to show an icon instead, or options to use instead of `defaults`. */
  thumbnail?: false | Partial<NoInfer<O>>;
}

/** Any op, with its option types erased. */
export type AnyOp = Op<Options>;

/**
 * Define an op with typed options. Each file in `ops/` default-exports an
 * array of these: `export default [defineOp({ ... }), defineOp({ ... })];`
 */
export function defineOp<O extends Options>(op: Op<O>): AnyOp {
  return op as unknown as AnyOp;
}

/** A step for the `steps` prop of `<Playground>`. */
export interface Step {
  /** Op id */
  op: string;
  /** Overrides for the op's defaults */
  options?: Options;
}
