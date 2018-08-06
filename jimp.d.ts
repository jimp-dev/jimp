declare namespace Jimp {
    type GenericCallback<T> = (err: Error | null, value: T) => any;
    type ImageCallback = GenericCallback<Jimp>;

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

    class Jimp {

        // Constants
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
        static PNG_FILTER_PATH: number;

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

        // Properties
        bitmap: Bitmap;

        // Constructors
        constructor(path: string, cb?: Jimp.ImageCallback);
        constructor(image: Jimp, cb?: Jimp.ImageCallback);
        constructor(data: Buffer, cb?: Jimp.ImageCallback);
        constructor(w: number, h: number, cb?: Jimp.ImageCallback);
        constructor(
            w: number,
            h: number,
            background?: number,
            cb?: Jimp.ImageCallback
        );

        // Methods
        getHeight(): number;
        getWidth(): number;
        inspect(): string;
        toString(): string;
        getMIME(): string;
        getExtension(): string;
        write(path: string, cb?: Jimp.ImageCallback): this;
        writeAsync(path: string): Promise<Jimp>;
        deflateLevel(l: number, cb?: Jimp.ImageCallback): this;
        deflateStrategy(s: number, cb?: Jimp.ImageCallback): this;
        filterType(f: number, cb?: Jimp.ImageCallback): this;
        rgba(bool: boolean, cb?: Jimp.ImageCallback): this;
        quality(n: number, cb?: Jimp.ImageCallback): this;
        getBase64(mime: string, cb?: GenericCallback<string>): this;
        getBase64Async(mime: string): Promise<Jimp>;
        hash(base?: number, cb?: GenericCallback<string>): string;
        getBuffer(mime: string, cb: GenericCallback<Buffer>): this;
        getBufferAsync(mime: string): Promise<Jimp>;
        getPixelIndex(
            x: number,
            y: number,
            cb?: GenericCallback<number>
        ): number;
        getPixelColor(
            x: number,
            y: number,
            cb?: GenericCallback<number>
        ): number;
        setPixelColor(
            hex: number,
            x: number,
            y: number,
            cb?: Jimp.ImageCallback
        ): this;
        clone(cb?: Jimp.ImageCallback): Jimp;
        background(hex: number, cb?: Jimp.ImageCallback): this;
        scan(
            x: number,
            y: number,
            w: number,
            h: number,
            f: (x: number, y: number, idx: number) => any,
            cb?: Jimp.ImageCallback
        ): this;
        crop(
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
        opacity(f: any, cb?: any): this;
        sepia(cb?: Jimp.ImageCallback): this;
        fade(f: any, cb?: any): this;
        convolution(
            kernel: any,
            edgeHandling: number | Jimp.ImageCallback,
            cb?: Jimp.ImageCallback
        ): this;
        opaque(cb: any): this;
        pixelate(
            size: number,
            x: number,
            y: number,
            w: number,
            h: number,
            cb?: Jimp.ImageCallback
        ): this;
        convolute(
            kernel: any,
            x: number | Jimp.ImageCallback,
            y?: number,
            w?: number,
            h?: number,
            cb?: Jimp.ImageCallback
        ): this;
        color(actions: any, cb?: Jimp.ImageCallback): this;
        colour(actions: any, cb?: Jimp.ImageCallback): this;

        // Shape methods
        rotate(
            deg: number,
            mode?: number | boolean,
            cb?: Jimp.ImageCallback
        ): this;
        flip(
            horizontal: boolean,
            vertical: boolean,
            cb?: Jimp.ImageCallback
        ): this;
        mirror(
            horizontal: boolean,
            vertical: boolean,
            cb?: Jimp.ImageCallback
        ): this;
        resize(
            w: number,
            h: number,
            mode?: string | Jimp.ImageCallback,
            cb?: Jimp.ImageCallback
        ): this;
        cover(
            w: number,
            h: number,
            alignBits?: number,
            mode?: string | Jimp.ImageCallback,
            cb?: Jimp.ImageCallback
        ): this;
        contain(
            w: number,
            h: number,
            alignBits?: number,
            mode?: string | Jimp.ImageCallback,
            cb?: Jimp.ImageCallback
        ): this;
        scale(
            f: number,
            mode?: string | Jimp.ImageCallback,
            cb?: Jimp.ImageCallback
        ): this;
        scaleToFit(
            w: number,
            h: number,
            mode?: any,
            cb?: Jimp.ImageCallback
        ): this;
        displace(map: Jimp, offset: number, cb?: Jimp.ImageCallback): this;
        autocrop(
            tolerance?: number,
            cropOnlyFrames?: boolean,
            cb?: Jimp.ImageCallback
        ): this;

        // Text methods
        print(
            font: any,
            x: number,
            y: number,
            text: string,
            maxWidth?: number | Jimp.ImageCallback,
            maxHeight?: number | Jimp.ImageCallback,
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
            cb?: Jimp.ImageCallback
        ): this;
        blit(
            src: Jimp,
            x: number,
            y: number,
            srcx?: number,
            srcy?: number,
            srcw?: number,
            srch?: number,
            cb?: Jimp.ImageCallback
        ): this;
        mask(src: Jimp, x: number, y: number, cb?: Jimp.ImageCallback): this;

        // Functions
        static appendConstructorOption(
            name: string,
            test: Function,
            run: Function
        );
        static read(path: string): Promise<Jimp>;
        static read(image: Jimp): Promise<Jimp>;
        static read(data: Buffer): Promise<Jimp>;
        static read(w: number, h: number): Promise<Jimp>;
        static read(w: number, h: number, background?: number): Promise<Jimp>;
        static create(path: string): Promise<Jimp>;
        static create(image: Jimp): Promise<Jimp>;
        static create(data: Buffer): Promise<Jimp>;
        static create(w: number, h: number): Promise<Jimp>;
        static create(w: number, h: number, background?: number): Promise<Jimp>;
        static rgbaToInt(
            r: number,
            g: number,
            b: number,
            a: number,
            cb?: GenericCallback<number>
        ): number;
        static intToRGBA(
            i: number,
            cb?: GenericCallback<Jimp.RGBA>
        ): Jimp.RGBA;
        static limit255(n: number): number;
        static diff(
            img1: Jimp,
            img2: Jimp,
            threshold?: number
        ): { percent: number; image: Jimp };
        static distance(img1: Jimp, img2: Jimp): number;
        static colorDiff(
            rgba1: Jimp.RGB | Jimp.RGBA,
            rgba2: Jimp.RGB | Jimp.RGBA
        ): number;
        static loadFont(file: string, cb?: Jimp.ImageCallback): Promise<any>;
    }
}

declare module 'jimp' {
    export = Jimp.Jimp;
}
