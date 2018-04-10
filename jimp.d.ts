
declare namespace Jimp {
    type ImageCallback = (err: Error|null, image: Jimp) => any;

    interface Bitmap {
        data: Buffer, width: number, height: number
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

    class Jimp {
        bitmap: Bitmap;

        constructor(path: string, cb?: Jimp.ImageCallback);
        constructor(image: Jimp, cb?: Jimp.ImageCallback);
        constructor(data: Buffer, cb?: Jimp.ImageCallback);
        constructor(w: number, h: number, cb?: Jimp.ImageCallback);
        constructor(w: number, h: number, background?: number, cb?: Jimp.ImageCallback);

        clone(cb?: Jimp.ImageCallback): Jimp;
        quality(n: number, cb?: Jimp.ImageCallback): this;
        deflateLevel(l: number, cb?: Jimp.ImageCallback): this;
        deflateStrategy(s: number, cb?: Jimp.ImageCallback): this;
        filterType(f: number, cb?: Jimp.ImageCallback): this;

        rgba(bool: boolean, cb?: Jimp.ImageCallback): this;
        background(hex: number, cb?: Jimp.ImageCallback): this;
        scan(x: number, y: number, w: number, h: number, f: (x:number, y:number, idx:number)=>any, cb?: Jimp.ImageCallback): this;
        getMIME(): string;
        getExtension(): string;
        getPixelIndex(x: number, y: number, cb?: (err:Error, i:number)=>any): number;
        getPixelColor(x: number, y: number, cb?: (err:Error, hex:number)=>any): number;
        setPixelColor(hex: number, x: number, y: number, cb?: Jimp.ImageCallback): this;
        hash(base?: number, cb?: (err:Error, hash: string)=>any): string;
        crop(x: number, y: number, w: number, h: number, cb?: Jimp.ImageCallback): this;
        autocrop(tolerance?: number, cropOnlyFrames?: boolean, cb?: Jimp.ImageCallback): this
        blit(src: Jimp, x: number, y: number, srcx?: number, srcy?: number, srcw?: number, srch?: number, cb?: Jimp.ImageCallback): this
        mask(src: Jimp, x: number, y: number, cb?: Jimp.ImageCallback): this
        composite(src: Jimp, x: number, y: number, cb?: Jimp.ImageCallback): this;
        brightness(val: number, cb?: Jimp.ImageCallback): this;
        contrast(val: number, cb?: Jimp.ImageCallback): this;
        posterize(n: number, cb?: Jimp.ImageCallback): this;
        histogram(): {r: number[], g: number[], b: number[]};
        normalize(cb?: Jimp.ImageCallback): this;
        invert(cb?: Jimp.ImageCallback): this;
        mirror(horizontal: boolean, vertical: boolean, cb?: Jimp.ImageCallback): this;
        gaussian(r: number, cb?: Jimp.ImageCallback): this;
        blur(r: number, cb?: Jimp.ImageCallback): this;
        convolution(kernel: any, edgeHandling: number | Jimp.ImageCallback, cb?: Jimp.ImageCallback): this;

        greyscale(cb?: Jimp.ImageCallback): this;
        grayscale(cb?: Jimp.ImageCallback): this;
        sepia(cb?: Jimp.ImageCallback): this;
        opacity(f: any, cb?: any):this;
        fade(f: any, cb?: any): this;
        opaque(cb: any): this;
        resize(w: number, h: number, mode?: string | Jimp.ImageCallback, cb?: Jimp.ImageCallback): this;
        cover(w: number, h: number, alignBits?: number, mode?: string | Jimp.ImageCallback, cb?: Jimp.ImageCallback): this;
        contain(w: number, h: number, alignBits?: number, mode?: string | Jimp.ImageCallback, cb?: Jimp.ImageCallback): this;
        scale(f: number, mode?: string | Jimp.ImageCallback, cb?: Jimp.ImageCallback): this;
        scaleToFit(w: number, h: number, mode?: any, cb?: Jimp.ImageCallback): this;
        pixelate(size: number, x: number, y: number, w: number, h: number, cb?: Jimp.ImageCallback): this;
        convolute(kernel: any, x: number | Jimp.ImageCallback, y?: number, w?: number, h?: number, cb?: Jimp.ImageCallback): this;
        rotate(deg: number, mode?: number | boolean, cb?: Jimp.ImageCallback): this;
        displace(map: Jimp, offset: number, cb?: Jimp.ImageCallback): this;
        getBuffer(mime: string, cb:(err:Error, buffer:Buffer)=>any): this;
        getBase64(mime: string, cb?: (err: Error, src: string) => any): this;
        dither565(cb?: Jimp.ImageCallback): this;
        dither16(cb?: Jimp.ImageCallback): this;
        color(actions: any, cb?: Jimp.ImageCallback): this;
        colour(actions: any, cb?: Jimp.ImageCallback): this;
        write(path: string, cb?: Jimp.ImageCallback): this;
        print(font: any, x: number, y: number, text: string, maxWidth?: number | Jimp.ImageCallback, maxHeight?: number | Jimp.ImageCallback, cb?: Jimp.ImageCallback): this;
        inspect(): string;
        toString(): string;

        // used to auto resizing etc.
        static AUTO: number;

        // supported mime types
        static MIME_PNG: string;
        static MIME_JPEG: string;
        static MIME_JGD: string;
        static MIME_BMP: string;
        static MIME_X_MS_BMP: string;
        static MIME_GIF: string;
        // PNG filter types
        static PNG_FILTER_AUTO: number;
        static PNG_FILTER_NONE: number;
        static PNG_FILTER_SUB: number;
        static PNG_FILTER_UP: number;
        static PNG_FILTER_AVERAGE: number;
        static PNG_FILTER_PAETH: number;

        // resize methods
        static RESIZE_NEAREST_NEIGHBOR: string;
        static RESIZE_BILINEAR: string;
        static RESIZE_BICUBIC: string;
        static RESIZE_HERMITE: string;
        static RESIZE_BEZIER: string;

        // Align modes for cover, contain, bit masks
        static HORIZONTAL_ALIGN_LEFT: number;
        static HORIZONTAL_ALIGN_CENTER: number;
        static HORIZONTAL_ALIGN_RIGHT: number;

        static VERTICAL_ALIGN_TOP: number;
        static VERTICAL_ALIGN_MIDDLE: number;
        static VERTICAL_ALIGN_BOTTOM: number;

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
        static EDGE_EXTEND: number;
        static EDGE_WRAP: number;
        static EDGE_CROP: number;

        /* These are constructors, have already moved up, TODO: remove it in the future
        (path: string, cb?: Jimp.ImageCallback): void;
        (image: Jimp, cb?: Jimp.ImageCallback): void;
        (data: Buffer, cb?: Jimp.ImageCallback): void;
        (w: number, h: number, cb?: Jimp.ImageCallback): void;
        (w: number, h: number, background?: number, cb?: Jimp.ImageCallback): void;
        */

        static read(src: string | Buffer, cb?: Jimp.ImageCallback): Promise<Jimp>;
        static loadFont(file: string, cb?: Jimp.ImageCallback): Promise<any>;

        static rgbaToInt(r: number, g: number, b: number, a: number, cb?: (err: Error, i: number)=>any): number;
        static intToRGBA(i: number, cb?: (err:Error, rgba: Jimp.RGBA)=>any): Jimp.RGBA;
        static limit255(n: number): number;
        static diff(img1: Jimp, img2: Jimp, threshold?: number): {percent: number, diff: Jimp};
        static distance(img1: Jimp, img2: Jimp): number;

        static colorDiff(rgba1: Jimp.RGB | Jimp.RGBA, rgba2: Jimp.RGB | Jimp.RGBA): number;
    }

}

declare module "jimp" {
    export = Jimp.Jimp;
}
