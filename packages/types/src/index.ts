export enum Edge {
  EXTEND = 1,
  WRAP = 2,
  CROP = 3,
}

export interface Bitmap {
  data: Buffer;
  width: number;
  height: number;
}

export interface Format<
  Mime extends string = string,
  ExportOptions extends Record<string, any> | undefined = undefined,
> {
  mime: Mime;
  encode: (image: Bitmap, options?: ExportOptions) => Promise<Buffer>;
  decode: (data: Buffer) => Promise<Bitmap>;
}

export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface JimpClass {
  bitmap: Bitmap;

  getPixelIndex: (x: number, y: number, edgeHandling?: Edge) => number;
  getPixelColor: (x: number, y: number) => number;
  setPixelColor: (hex: number, x: number, y: number) => JimpClass;
}
