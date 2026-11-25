import type { LayoutChildren, LayoutNode } from "./index.js";

// The automatic JSX runtime, so components like `Box` can be written as JSX.
// Set `"jsx": "react-jsx"` and `"jsxImportSource": "@jimp/layout"` in your
// tsconfig, or start the file with a `@jsxImportSource @jimp/layout` comment.

type Component<P> = (props: P) => LayoutNode;

/** Groups children without a box around them: `<>...</>` */
export function Fragment(props: { children?: LayoutChildren }) {
  return props.children;
}

export function jsx<P extends object>(
  type: Component<P> | typeof Fragment,
  props: P,
): LayoutNode {
  return (type as Component<P>)(props);
}

export const jsxs = jsx;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JSX {
  export type Element = LayoutNode;
  // Only components, no elements like <div>
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface IntrinsicElements {}
  /**
   * Props every element takes. `key` is allowed, so code written for React
   * type checks, but there's nothing to reconcile so it's ignored.
   */
  export interface IntrinsicAttributes {
    key?: string | number | bigint | null;
  }
  export interface ElementChildrenAttribute {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    children: {};
  }
}
