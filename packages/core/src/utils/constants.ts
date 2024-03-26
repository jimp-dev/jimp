// used to auto resizing etc.
export const AUTO = -1;

// Align modes for cover, contain, bit masks

export enum HorizontalAlign {
  LEFT = 1,
  CENTER = 2,
  RIGHT = 4,
}

export enum VerticalAlign {
  TOP = 8,
  MIDDLE = 16,
  BOTTOM = 32,
}

export enum BlendMode {
  SRC_OVER = "srcOver",
  DST_OVER = "dstOver",
  MULTIPLY = "multiply",
  ADD = "add",
  SCREEN = "screen",
  OVERLAY = "overlay",
  DARKEN = "darken",
  LIGHTEN = "lighten",
  HARD_LIGHT = "hardLight",
  DIFFERENCE = "difference",
  EXCLUSION = "exclusion",
}
