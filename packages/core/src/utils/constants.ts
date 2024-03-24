// used to auto resizing etc.
export const AUTO = -1;

// Align modes for cover, contain, bit masks
export const HORIZONTAL_ALIGN_LEFT = 1;
export const HORIZONTAL_ALIGN_CENTER = 2;
export const HORIZONTAL_ALIGN_RIGHT = 4;

export const VERTICAL_ALIGN_TOP = 8;
export const VERTICAL_ALIGN_MIDDLE = 16;
export const VERTICAL_ALIGN_BOTTOM = 32;

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
