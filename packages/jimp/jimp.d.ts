declare namespace Jimp {
  type GenericCallback<T, U = any, TThis = any> = (
    this: TThis,
    err: Error | null,
    value: T
  ) => U;
  type ImageCallback<U = any> = (
    this: Jimp,
    err: Error | null,
    value: Jimp,
    coords: {
      x: number;
      y: number;
    }
  ) => U;
  type ColorActionName =
    | 'mix'
    | 'tint'
    | 'shade'
    | 'xor'
    | 'red'
    | 'green'
    | 'blue'
    | 'hue';
  type ColorAction = { apply: ColorActionName; params: any };
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

  type PrintableText =
    | any
    | {
        text: string;
        alignmentX: number;
        alignmentY: number;
      };

  interface Bitmap {
    data: Buffer;
    width: number;
    height: number;
  }
  interface RGB {
    r: number;
    g: number;
    b: number;
  }
  interface RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
  }

  interface FontChar {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    xoffset: number;
    yoffset: number;
    xadvance: number;
    page: number;
    chnl: number;
  }

  interface FontInfo {
    face: string;
    size: number;
    bold: number;
    italic: number;
    charset: string;
    unicode: number;
    stretchH: number;
    smooth: number;
    aa: number;
    padding: [number, number, number, number];
    spacing: [number, number];
  }

  interface FontCommon {
    lineHeight: number;
    base: number;
    scaleW: number;
    scaleH: number;
    pages: number;
    packed: number;
    alphaChnl: number;
    redChnl: number;
    greenChnl: number;
    blueChnl: number;
  }

  interface Font {
    chars: {
      [char: string]: FontChar;
    };
    kernings: {
      [firstString: string]: {
        [secondString: string]: number;
      };
    };
    pages: string[];
    common: FontCommon;
    info: FontInfo;
  }

  class Jimp {
    // Constants
    static AUTO: -1;

    // supported mime types
    static MIME_PNG: 'image/png';
    static MIME_TIFF: 'image/tiff';
    static MIME_JPEG: 'image/jpeg';
    static MIME_JGD: 'image/jgd';
    static MIME_BMP: 'image/bmp';
    static MIME_X_MS_BMP: 'image/x-ms-bmp';
    static MIME_GIF: 'image/gif';
    // PNG filter types
    static PNG_FILTER_AUTO: -1;
    static PNG_FILTER_NONE: 0;
    static PNG_FILTER_SUB: 1;
    static PNG_FILTER_UP: 2;
    static PNG_FILTER_AVERAGE: 3;
    static PNG_FILTER_PATH: 4;

    // resize methods
    static RESIZE_NEAREST_NEIGHBOR: 'nearestNeighbor';
    static RESIZE_BILINEAR: 'bilinearInterpolation';
    static RESIZE_BICUBIC: 'bicubicInterpolation';
    static RESIZE_HERMITE: 'hermiteInterpolation';
    static RESIZE_BEZIER: 'bezierInterpolation';

    // blend modes
    static BLEND_SOURCE_OVER: string;
    static BLEND_DESTINATION_OVER: string;
    static BLEND_MULTIPLY: string;
    static BLEND_SCREEN: string;
    static BLEND_OVERLAY: string;
    static BLEND_DARKEN: string;
    static BLEND_LIGHTEN: string;
    static BLEND_HARDLIGHT: string;
    static BLEND_DIFFERENCE: string;
    static BLEND_EXCLUSION: string;

    // Align modes for cover, contain, bit masks
    static HORIZONTAL_ALIGN_LEFT: 1;
    static HORIZONTAL_ALIGN_CENTER: 2;
    static HORIZONTAL_ALIGN_RIGHT: 4;

    static VERTICAL_ALIGN_TOP: 8;
    static VERTICAL_ALIGN_MIDDLE: 16;
    static VERTICAL_ALIGN_BOTTOM: 32;

    // Font locations
    static FONT_SANS_8_BLACK: string;
    static FONT_SANS_10_BLACK: string;
    static FONT_SANS_12_BLACK: string;
    static FONT_SANS_14_BLACK: string;
    static FONT_SANS_16_BLACK: string;
    static FONT_SANS_32_BLACK: string;
    static FONT_SANS_64_BLACK: string;
    static FONT_SANS_128_BLACK: string;

    static FONT_SANS_8_WHITE: string;
    static FONT_SANS_16_WHITE: string;
    static FONT_SANS_32_WHITE: string;
    static FONT_SANS_64_WHITE: string;
    static FONT_SANS_128_WHITE: string;

    // Edge Handling
    static EDGE_EXTEND: 1;
    static EDGE_WRAP: 2;
    static EDGE_CROP: 3;

    // Properties
    bitmap: Bitmap;

    private _quality: number;
    private _deflateLevel: number;
    private _deflateStrategy: number;
    private _filterType: number;
    private _rgba: boolean;
    private _background: number;
    private _originalMime: string;

    // Constructors
    constructor(path: string, cb?: Jimp.ImageCallback);
    constructor(image: Jimp, cb?: Jimp.ImageCallback);
    constructor(data: Buffer, cb?: Jimp.ImageCallback);
    constructor(data: Bitmap, cb?: Jimp.ImageCallback);
    constructor(w: number, h: number, cb?: Jimp.ImageCallback);
    constructor(
      w: number,
      h: number,
      background?: number,
      cb?: Jimp.ImageCallback
    );
    constructor(
      w: number,
      h: number,
      background?: string,
      cb?: Jimp.ImageCallback
    );
    // For custom constructors when using Jimp.appendConstructorOption
    constructor(...args: any[]);

    // Methods
    on<T extends ListenableName>(
      event: T,
      cb: (data: ListenerData<T>) => any
    ): any;
    hasAlpha(): boolean;
    getHeight(): number;
    getWidth(): number;
    inspect(): string;
    toString(): string;
    getMIME(): string;
    getExtension(): string;
    distanceFromHash(hash: string): number;
    write(path: string, cb?: Jimp.ImageCallback): this;
    writeAsync(path: string): Promise<Jimp>;
    deflateLevel(l: number, cb?: Jimp.ImageCallback): this;
    deflateStrategy(s: number, cb?: Jimp.ImageCallback): this;
    filterType(f: number, cb?: Jimp.ImageCallback): this;
    rgba(bool: boolean, cb?: Jimp.ImageCallback): this;
    quality(n: number, cb?: Jimp.ImageCallback): this;
    getBase64(mime: string, cb: GenericCallback<string, any, this>): this;
    getBase64Async(mime: string): Promise<Jimp>;
    hash(cb?: GenericCallback<string, any, this>): this;
    hash(
      base: number | null | undefined,
      cb?: GenericCallback<string, any, this>
    ): this;
    getBuffer(mime: string, cb: GenericCallback<Buffer>): this;
    getBufferAsync(mime: string): Promise<Buffer>;
    getPixelIndex(
      x: number,
      y: number,
      cb?: GenericCallback<number, any, this>
    ): this;
    getPixelIndex(
      x: number,
      y: number,
      edgeHandling: string,
      cb?: GenericCallback<number, any, this>
    ): this;
    getPixelColor(
      x: number,
      y: number,
      cb?: GenericCallback<number, any, this>
    ): this;
    getPixelColour(
      x: number,
      y: number,
      cb?: GenericCallback<number, any, this>
    ): this;
    setPixelColor(
      hex: number,
      x: number,
      y: number,
      cb?: Jimp.ImageCallback
    ): this;
    setPixelColour(
      hex: number,
      x: number,
      y: number,
      cb?: Jimp.ImageCallback
    ): this;
    clone(cb?: Jimp.ImageCallback): this;
    cloneQuiet(cb?: Jimp.ImageCallback): this;
    background(hex: number, cb?: Jimp.ImageCallback): this;
    backgroundQuiet(hex: number, cb?: Jimp.ImageCallback): this;
    scan(
      x: number,
      y: number,
      w: number,
      h: number,
      f: (this: this, x: number, y: number, idx: number) => any,
      cb?: Jimp.ImageCallback
    ): this;
    scanQuiet(
      x: number,
      y: number,
      w: number,
      h: number,
      f: (this: this, x: number, y: number, idx: number) => any,
      cb?: Jimp.ImageCallback
    ): this;
    crop(
      x: number,
      y: number,
      w: number,
      h: number,
      cb?: Jimp.ImageCallback
    ): this;
    cropQuiet(
      x: number,
      y: number,
      w: number,
      h: number,
      cb?: Jimp.ImageCallback
    ): this;

    // Color methods
    brightness(val: number, cb?: Jimp.ImageCallback): this;
    contrast(val: number, cb?: Jimp.ImageCallback): this;
    posterize(n: number, cb?: Jimp.ImageCallback): this;
    greyscale(cb?: Jimp.ImageCallback): this;
    grayscale(cb?: Jimp.ImageCallback): this;
    opacity(f: number, cb?: Jimp.ImageCallback): this;
    sepia(cb?: Jimp.ImageCallback): this;
    fade(f: number, cb?: Jimp.ImageCallback): this;
    convolution(kernel: number[][], cb?: Jimp.ImageCallback): this;
    convolution<T>(
      kernel: number[][],
      edgeHandling: string,
      cb?: Jimp.ImageCallback
    ): this;
    opaque(cb?: Jimp.ImageCallback): this;
    pixelate(size: number, cb?: Jimp.ImageCallback): this;
    pixelate(
      size: number,
      x: number,
      y: number,
      w: number,
      h: number,
      cb?: Jimp.ImageCallback
    ): this;
    convolute(kernel: number[][], cb?: Jimp.ImageCallback): this;
    convolute(
      kernel: number[][],
      x: number,
      y: number,
      w: number,
      h: number,
      cb?: Jimp.ImageCallback
    ): this;
    color(actions: ColorAction[], cb?: Jimp.ImageCallback): this;
    colour(actions: ColorAction[], cb?: Jimp.ImageCallback): this;

    // Shape methods
    rotate(deg: number, cb?: Jimp.ImageCallback): this;
    rotate(deg: number, mode: string | boolean, cb?: Jimp.ImageCallback): this;
    flip(horizontal: boolean, vertical: boolean, cb?: Jimp.ImageCallback): this;
    mirror(
      horizontal: boolean,
      vertical: boolean,
      cb?: Jimp.ImageCallback
    ): this;
    resize(w: number, h: number, cb?: Jimp.ImageCallback): this;
    resize(w: number, h: number, mode?: string, cb?: Jimp.ImageCallback): this;
    cover(w: number, h: number, cb?: Jimp.ImageCallback): this;
    cover(
      w: number,
      h: number,
      alignBits?: number,
      cb?: Jimp.ImageCallback
    ): this;
    cover(
      w: number,
      h: number,
      alignBits?: number,
      mode?: string,
      cb?: Jimp.ImageCallback
    ): this;
    contain(w: number, h: number, cb?: Jimp.ImageCallback): this;
    contain(w: number, h: number, mode?: string, cb?: Jimp.ImageCallback): this;
    contain(
      w: number,
      h: number,
      alignBits?: number,
      cb?: Jimp.ImageCallback
    ): this;
    contain(
      w: number,
      h: number,
      alignBits?: number,
      mode?: string,
      cb?: Jimp.ImageCallback
    ): this;
    scale(f: number, cb?: Jimp.ImageCallback): this;
    scale(f: number, mode?: string, cb?: Jimp.ImageCallback): this;
    scaleToFit(w: number, h: number, cb?: Jimp.ImageCallback): this;
    scaleToFit(
      w: number,
      h: number,
      mode?: string,
      cb?: Jimp.ImageCallback
    ): this;
    displace(map: Jimp, offset: number, cb?: Jimp.ImageCallback): this;
    autocrop(tolerance?: number, cb?: Jimp.ImageCallback): this;
    autocrop(cropOnlyFrames?: boolean, cb?: Jimp.ImageCallback): this;
    autocrop(
      tolerance?: number,
      cropOnlyFrames?: boolean,
      cb?: Jimp.ImageCallback
    ): this;

    // Text methods
    print(
      font: Font,
      x: number,
      y: number,
      text: PrintableText,
      cb?: Jimp.ImageCallback
    ): this;
    print(
      font: Font,
      x: number,
      y: number,
      text: PrintableText,
      maxWidth?: number,
      cb?: Jimp.ImageCallback
    ): this;
    print(
      font: Font,
      x: number,
      y: number,
      text: PrintableText,
      maxWidth?: number,
      maxHeight?: number,
      cb?: Jimp.ImageCallback
    ): this;

    // Effect methods
    blur(r: number, cb?: Jimp.ImageCallback): this;
    dither565(cb?: Jimp.ImageCallback): this;
    dither16(cb?: Jimp.ImageCallback): this;
    histogram(): { r: number[]; g: number[]; b: number[] };
    normalize(cb?: Jimp.ImageCallback): this;
    invert(cb?: Jimp.ImageCallback): this;
    gaussian(r: number, cb?: Jimp.ImageCallback): this;
    composite(
      src: Jimp,
      x: number,
      y: number,
      options?: Jimp.BlendMode,
      cb?: Jimp.ImageCallback
    ): this;
    blit(src: Jimp, x: number, y: number, cb?: Jimp.ImageCallback): this;
    blit(
      src: Jimp,
      x: number,
      y: number,
      srcx: number,
      srcy: number,
      srcw: number,
      srch: number,
      cb?: Jimp.ImageCallback
    ): this;
    mask(src: Jimp, x: number, y: number, cb?: Jimp.ImageCallback): this;

    // Functions
    static appendConstructorOption<T extends any[]>(
      name: string,
      test: (...args: T[]) => boolean,
      run: (
        this: Jimp,
        resolve: (jimp: Jimp) => any,
        reject: (reason: Error) => any,
        ...args: T[]
      ) => any
    );
    static read(path: string): Promise<Jimp>;
    static read(image: Jimp): Promise<Jimp>;
    static read(data: Buffer): Promise<Jimp>;
    static read(w: number, h: number, background?: number): Promise<Jimp>;
    static create(path: string): Promise<Jimp>;
    static create(image: Jimp): Promise<Jimp>;
    static create(data: Buffer): Promise<Jimp>;
    static create(w: number, h: number, background?: number): Promise<Jimp>;
    static rgbaToInt(
      r: number,
      g: number,
      b: number,
      a: number,
      cb: GenericCallback<number, any, Jimp>
    ): number;
    static intToRGBA(i: number, cb?: GenericCallback<Jimp.RGBA>): Jimp.RGBA;
    static cssColorToHex(cssColor: string): number;
    static limit255(n: number): number;
    static diff(
      img1: Jimp,
      img2: Jimp,
      threshold?: number
    ): { percent: number; image: Jimp };
    static distance(img1: Jimp, img2: Jimp): number;
    static compareHashes(hash1: string, hash2: string): number;
    static colorDiff(rgba1: Jimp.RGB, rgba2: Jimp.RGB): number;
    static colorDiff(rgba1: Jimp.RGBA, rgba2: Jimp.RGBA): number;
    static loadFont(file: string): Promise<Font>;
    static loadFont(
      file: string,
      cb: Jimp.GenericCallback<Font, any, any>
    ): Promise<never>;
    static measureText(font: Font, text: PrintableText);
    static measureTextHeight(font: Font, text: PrintableText, maxWidth: number);
  }
}

declare module 'jimp' {
  export = Jimp.Jimp;
}
