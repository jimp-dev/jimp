
type ErrorCallback = (err: Error|null) => any;
type ImageCallback = (err: Error|null, image: Jimp) => any;

interface JimpRGB {
    r: number;
    g: number;
    b: number;
}
interface JimpRGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}


interface Jimp {
    bitmap: {data: Buffer, width: number, height: number};

    clone(cb?: ImageCallback): Jimp;
    quality(n: number, cb?: ImageCallback): this;
    deflatelevel(l: number, cb?: ImageCallback): this;
    deflateStrategy(s: number, cb?: ImageCallback): this;
    filterType(f: number, cb?: ImageCallback): this;
    
    rgba(bool: boolean, cb?: ImageCallback): this;
    background(hex: number, cb?: ImageCallback): this;
    scan(x: number, y: number, w: number, h: number, f: (x:number, y:number, idx:number)=>any, cb?: ImageCallback): this;
    getMIME(): string;
    getExtension(): string;
    getPixelIndex(x: number, y: number, cb?: (err:Error, i:number)=>any): number;
    getPixelColor(x: number, y: number, cb?: (err:Error, hex:number)=>any): number;
    setPixelColor(hex: number, x: number, y: number, cb?: ImageCallback): this;
    hash(base?: number, cb?: (err:Error, hash: string)=>any): string;
    crop(x: number, y: number, w: number, h: number, cb?: ImageCallback): this;
    autocrop(tolerance?: number, cropOnlyFrames?: boolean, cb?: ImageCallback): this
    blit(src: Jimp, x: number, y: number, srcx?: number, srcy?: number, srcw?: number, srch?: number, cb?: ImageCallback): this
    mask(src: Jimp, x: number, y: number, cb?: ImageCallback): this
    composite(src: Jimp, x: number, y: number, cb?: ImageCallback): this;
    brightness(val: number, cb?: ImageCallback): this;
    contrast(val: number, cb?: ImageCallback): this;
    posterize(n: number, cb?: ImageCallback): this;
    histogram(): {r: number[], g: number[], b: number[]};
    normalize(cb?: ImageCallback): this;
    invert(cb?: ImageCallback): this;
    mirror(horizontal: boolean, vertical: boolean, cb?: ImageCallback): this;
    gaussian(r: number, cb?: ImageCallback): this;
    blur(r: number, cb?: ImageCallback): this;
    
    greyscale(cb?: ImageCallback): this;
    grayscale(cb?: ImageCallback): this;
    sepia(cb?: ImageCallback): this;
    opacity(f: any, cb?: any):this;
    fade(f: any, cb?: any): this;
    opaque(cb: any): this;
    resize(w: number, h: number, mode?: string, cb?: ImageCallback): this;
    cover(w: number, h: number, alignBits?: number, mode?: string, cb?: ImageCallback): any;
    contain(w: number, h: number, alignBits?: number, mode?: string, cb?: ImageCallback): this;
    scale(f: number, mode?: string, cb?: ImageCallback): this;
    scaleToFit(w: number, h: number, mode?: any, cb?: ImageCallback): this;
    rotate(deg: number, mode?: number, cb?: ImageCallback): this;

    write(path: string, cb?: ImageCallback): this;
}

declare var Jimp: {

    // supported mime types
    MIME_PNG: string;
    MIME_JPEG: string;
    MIME_BMP: string;

    // used to auto resizing etc.
    AUTO: number;

    // resize methods
    RESIZE_NEAREST_NEIGHBOR: string;
    RESIZE_BILINEAR: string;
    RESIZE_BICUBIC: string;
    RESIZE_HERMITE: string;
    RESIZE_BEZIER: string;

    (path: string, cb?: ImageCallback): Jimp;
    (image: Jimp, cb?: ImageCallback): Jimp;
    (data: Buffer, cb?: ImageCallback): Jimp;
    (w: number, h: number, cb?: ImageCallback): Jimp;

    read(src: string|Buffer, cb?: ImageCallback): Promise<Jimp>;

    rgbaToInt(r: number, g: number, b: number, a: number, cb?: (err: Error, i: number)=>any): number;
    intToRgba(i: number, cb?: (err:Error, rgba: JimpRGBA)=>any): JimpRGBA;
    limit255(n: number): number;
    diff(img1: Jimp, img2: Jimp, threshold?: number): {percent: number, diff: Jimp};
    distance(img1: Jimp, img2: Jimp): number;

    prototype: Jimp;
};

declare module "jimp" {
    export = Jimp;
}