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

export interface Format<T extends string = string> {
  mime: T;
  encode: (image: Bitmap) => Promise<Buffer>;
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
