export function addConstants(constants: [string, string | number], jimpInstance?: Jimp): void;
export function addJimpMethods(methods: [string, Function], jimpInstance?: Jimp): void;
export function jimpEvMethod(methodName: string, evName: string, method: Function): void;
export function jimpEvChange(methodName: string, method: Function): void;
export function addType(mime: string, extensions: string[]): void;

export interface Jimp {
  prototype: this;
  // Constants
  AUTO: -1;
  // blend modes
  BLEND_SOURCE_OVER: string;
  BLEND_DESTINATION_OVER: string;
  BLEND_MULTIPLY: string;
  BLEND_SCREEN: string;
  BLEND_OVERLAY: string;
  BLEND_DARKEN: string;
  BLEND_LIGHTEN: string;
  BLEND_HARDLIGHT: string;
  BLEND_DIFFERENCE: string;
  BLEND_EXCLUSION: string;
  // Align modes for cover, contain, bit masks
  HORIZONTAL_ALIGN_LEFT: 1;
  HORIZONTAL_ALIGN_CENTER: 2;
  HORIZONTAL_ALIGN_RIGHT: 4;
  VERTICAL_ALIGN_TOP: 8;
  VERTICAL_ALIGN_MIDDLE: 16;
  VERTICAL_ALIGN_BOTTOM: 32;
  // Edge Handling
  EDGE_EXTEND: 1;
  EDGE_WRAP: 2;
  EDGE_CROP: 3;
  // Properties
  bitmap: Bitmap;
  _quality: number;
  _deflateLevel: number;
  _deflateStrategy: number;
  _filterType: number;
  _rgba: boolean;
  _background: number;
  _originalMime: string;
  // Constructors
  new(path: string, cb?: ImageCallback): this;
  new(urlOptions: URLOptions, cb?: ImageCallback): this;
  new(image: Jimp, cb?: ImageCallback): this;
  new(data: Buffer, cb?: ImageCallback): this;
  new(data: Bitmap, cb?: ImageCallback): this;
  new(w: number, h: number, cb?: ImageCallback): this;
  new(
    w: number,
    h: number,
    background?: number | string,
    cb?: ImageCallback
  ): Jimp;
  // For custom constructors when using Jimp.appendConstructorOption
  new(...args: any[]): Jimp;
  // Methods
  on<T extends ListenableName>(
    event: T,
    cb: (data: ListenerData<T>) => any
  ): any;
  parseBitmap(
    data: Buffer,
    path: string | null | undefined,
    cb?: ImageCallback
  ): void;
  hasAlpha(): boolean;
  getHeight(): number;
  getWidth(): number;
  inspect(): string;
  toString(): string;
  getMIME(): string;
  getExtension(): string;
  distanceFromHash(hash: string): number;
  write(path: string, cb?: ImageCallback): this;
  writeAsync(path: string): Promise<Jimp>;
  deflateLevel(l: number, cb?: ImageCallback): this;
  deflateStrategy(s: number, cb?: ImageCallback): this;
  colorType(s: number, cb?: ImageCallback): this;
  filterType(f: number, cb?: ImageCallback): this;
  rgba(bool: boolean, cb?: ImageCallback): this;
  quality(n: number, cb?: ImageCallback): this;
  getBase64(mime: string, cb: GenericCallback<string, any, this>): this;
  getBase64Async(mime: string): Promise<string>;
  hash(cb?: GenericCallback<string, any, this>): string;
  hash(
    base: number | null | undefined,
    cb?: GenericCallback<string, any, this>
  ): string;
  getBuffer(mime: string, cb: GenericCallback<Buffer>): this;
  getBufferAsync(mime: string): Promise<Buffer>;
  getPixelIndex(
    x: number,
    y: number,
    cb?: GenericCallback<number, any, this>
  ): number;
  getPixelIndex(
    x: number,
    y: number,
    edgeHandling: string,
    cb?: GenericCallback<number, any, this>
  ): number;
  getPixelColor(
    x: number,
    y: number,
    cb?: GenericCallback<number, any, this>
  ): number;
  getPixelColour(
    x: number,
    y: number,
    cb?: GenericCallback<number, any, this>
  ): number;
  setPixelColor(hex: number, x: number, y: number, cb?: ImageCallback): this;
  setPixelColour(hex: number, x: number, y: number, cb?: ImageCallback): this;
  clone(cb?: ImageCallback): this;
  cloneQuiet(cb?: ImageCallback): this;
  background(hex: number, cb?: ImageCallback): this;
  backgroundQuiet(hex: number, cb?: ImageCallback): this;
  scan(
    x: number,
    y: number,
    w: number,
    h: number,
    f: (this: this, x: number, y: number, idx: number) => any,
    cb?: ImageCallback
  ): this;
  scanQuiet(
    x: number,
    y: number,
    w: number,
    h: number,
    f: (this: this, x: number, y: number, idx: number) => any,
    cb?: ImageCallback
  ): this;
  scanIterator(
    x: number,
    y: number,
    w: number,
    h: number
  ): IterableIterator<{x: number, y: number, idx: number, image: Jimp}>;

  // Effect methods
  composite(
    src: Jimp,
    x: number,
    y: number,
    options?: BlendMode,
    cb?: ImageCallback
  ): this;

  // Functions
  appendConstructorOption<T extends any[]>(
    name: string,
    test: (...args: T[]) => boolean,
    run: (
      this: Jimp,
      resolve: (jimp: Jimp) => any,
      reject: (reason: Error) => any,
      ...args: T[]
    ) => any
  ): void;
  read(path: string): Promise<this>;
  read(image: Jimp): Promise<this>;
  read(data: Buffer): Promise<this>;
  read(w: number, h: number, background?: number | string): Promise<this>;
  create(path: string): Promise<this>;
  create(image: Jimp): Promise<this>;
  create(data: Buffer): Promise<this>;
  create(w: number, h: number, background?: number | string): Promise<this>;
  rgbaToInt(
    r: number,
    g: number,
    b: number,
    a: number,
    cb: GenericCallback<number, any, this>
  ): number;
  intToRGBA(i: number, cb?: GenericCallback<RGBA>): RGBA;
  cssColorToHex(cssColor: string): number;
  limit255(n: number): number;
  diff(
    img1: Jimp,
    img2: Jimp,
    threshold?: number
  ): {
    percent: number;
    image: Jimp;
  };
  distance(img1: Jimp, img2: Jimp): number;
  compareHashes(hash1: string, hash2: string): number;
  colorDiff(rgba1: RGB, rgba2: RGB): number;
  colorDiff(rgba1: RGBA, rgba2: RGBA): number;
}

export interface Image {
  bitmap: Bitmap;
}

export interface IllformedPlugin {
  class?: never;
  constants?: never;
  // Because non-existant keys ARE undefined, this is technically valid
  [key: string]: Function | undefined;
}

export type DecoderFn = (data: Buffer) => Bitmap
export type EncoderFn<ImageType extends Image = Image> = (image: ImageType) => Buffer

export interface WellFormedPlugin<ImageType extends Image = Image> {
  mime?: {
    [MIME_TYPE: string]: string[];
  };
  hasAlpha?: {
    [MIME_SPECIAL: string]: boolean;
  };
  constants?: {
    // Contants to assign to the Jimp instance
    [MIME_SPECIAL: string]: any;
  };
  decoders?: {
    [MIME_TYPE: string]: DecoderFn;
  };
  encoders?: {
    // Jimp Image
    [MIME_TYPE: string]: EncoderFn<ImageType>;
  };
  // Extend the Jimp class with the following constants, etc
  class?: any;
}

type ClassOrConstantPlugin<T extends Image> = WellFormedPlugin<T> & (
  Required<Pick<WellFormedPlugin<T>, 'class'>> | Required<Pick<WellFormedPlugin<T>, 'constants'>>
  );

// A Jimp type requires mime, but not class
export type JimpType<T extends Image = Image> = WellFormedPlugin<T> & Required<Pick<WellFormedPlugin<T>, 'mime'>>;

// Jimp plugin either MUST have class OR constant or be illformed
export type JimpPlugin<T extends Image = Image> = ClassOrConstantPlugin<T> | IllformedPlugin;

export type GenericCallback<T, U = any, TThis = any> = (
  this: TThis,
  err: Error | null,
  value: T
) => U;

export type ImageCallback<U = any> = (
  this: Jimp,
  err: Error | null,
  value: Jimp,
  coords: {
    x: number;
    y: number;
  }
) => U;

type BlendMode = {
  mode: string;
  opacitySource: number;
  opacityDest: number;
};

type ChangeName = 'background' | 'scan' | 'crop';

type ListenableName =
  | 'any'
  | 'initialized'
  | 'before-change'
  | 'changed'
  | 'before-clone'
  | 'cloned'
  | ChangeName;

type ListenerData<T extends ListenableName> = T extends 'any'
  ? any
  : T extends ChangeName
    ? {
      eventName: 'before-change' | 'changed';
      methodName: T;
      [key: string]: any;
    }
    : {
      eventName: T;
      methodName: T extends 'initialized'
        ? 'constructor'
        : T extends 'before-change' | 'changed'
          ? ChangeName
          : T extends 'before-clone' | 'cloned' ? 'clone' : any;
    };

type URLOptions = {
  url: string;
  compression?: boolean;
  headers: {
    [key: string]: any;
  };
};

export interface Bitmap {
  data: Buffer;
  width: number;
  height: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * While this was added to TS 3.5, in order to support down to TS 2.8, we need
 * to export this and use it in sub-packges that utilize it
 */
export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;



export default Jimp;


// This is required as providing type arrays gives a union of all the generic
// types in the array rather than an intersection
export type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

// The values to be extracted from a WellFormedPlugin to put onto the Jimp instance
export type WellFormedValues<T extends WellFormedPlugin> = T['class'] & T['constants'];


// Util type for the functions that deal with `@jimp/custom`
export type FunctionRet<T> = Array<() => T>;

/**
 * This conditional cannot be flipped. TS assumes that Q is `WellFormed` even
 * it does not have the `class` or `constant` props. As a result, it will end
 * up `undefined`. Because we're always extending `IllformedPlugin` on the
 * plugins, this should work fine
 */
export type GetPluginVal<Q> = Q extends IllformedPlugin ? Q : WellFormedValues<Q>

type GetTypeFuncArrValues<TypeFuncArr> =
  // Given an array of types infer `Q` (Q should be the type value)
  TypeFuncArr extends Array<() => infer Q> ?
    // Get the well formed value to add to the union
    WellFormedValues<Q>
    // This should never be reached
    : undefined;

type GetPluginFuncArrValues<PluginFuncArr> =
  PluginFuncArr extends Array<() => infer Q> ?
    // Get the plugin value, may be ill-formed or well-formed
    GetPluginVal<Q>
    // This should never be reached
    : undefined;

export type GetIntersectionAddons<
  TypesFuncArr extends FunctionRet<JimpType>,
  PluginFuncArr extends FunctionRet<JimpPlugin>
> =
  UnionToIntersection<
    GetTypeFuncArrValues<TypesFuncArr> &
    GetPluginFuncArrValues<PluginFuncArr>
  >;
