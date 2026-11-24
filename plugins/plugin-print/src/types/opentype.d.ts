// opentype.js ships without types. The font it returns is typed in
// ../opentype.ts, which only describes the parts this plugin uses.
declare module "opentype.js" {
  export function parse(buffer: ArrayBuffer): unknown;
}
