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
