declare namespace Jimp {
    type GenericCallback<T, U = any, TThis = any> = (
        this: TThis,
        err: Error | null,
        value: T
    ) => U;
    type ImageCallback<U = any> = GenericCallback<Jimp, U, Jimp>;
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
        | string
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
        // For custom constructors when using Jimp.appendConstructorOption
        constructor(...args: any[]);

        // Methods
        on<T extends ListenableName>(
            event: T,
            cb: (data: ListenerData<T>) => any
        ): any;
        getHeight(): number;
        getWidth(): number;
        inspect(): string;
        toString(): string;
        getMIME(): string;
        getExtension(): string;
        write(path: string, cb?: Jimp.ImageCallback): this;
        writeAsync(path: string): Promise<Jimp>;
        deflateLevel(l: number): this;
        deflateLevel<T>(l: number, cb: Jimp.ImageCallback<T>): T;
        deflateStrategy(s: number): this;
        deflateStrategy<T>(s: number, cb: Jimp.ImageCallback<T>): T;
        filterType(f: number): this;
        filterType<T>(f: number, cb: Jimp.ImageCallback<T>): T;
        rgba(bool: boolean): this;
        rgba<T>(bool: boolean, cb: Jimp.ImageCallback<T>): T;
        quality(n: number): this;
        quality<T>(n: number, cb: Jimp.ImageCallback<T>): T;
        getBase64(mime: string, cb?: GenericCallback<string, any, this>): this;
        getBase64Async(mime: string): Promise<Jimp>;
        hash(base?: number): string;
        hash<T>(cb: GenericCallback<string, T, this>): T;
        hash<T>(
            base: number | null | undefined,
            cb: GenericCallback<string, T, this>
        ): T;
        getBuffer(mime: string, cb: GenericCallback<Buffer>): this;
        getBufferAsync(mime: string): Promise<Buffer>;
        getPixelIndex<T>(
            x: number,
            y: number,
            cb: GenericCallback<number, T, this>
        ): T;
        getPixelIndex(x: number, y: number, edgeHandling?: string): number;
        getPixelIndex<T>(
            x: number,
            y: number,
            edgeHandling: string,
            cb: GenericCallback<number, T, this>
        ): T;
        getPixelColor(x: number, y: number): number;
        getPixelColor<T>(
            x: number,
            y: number,
            cb: GenericCallback<number, T, this>
        ): T;
        getPixelColour(x: number, y: number): number;
        getPixelColour<T>(
            x: number,
            y: number,
            cb: GenericCallback<number, T, this>
        ): T;
        setPixelColor(hex: number, x: number, y: number): this;
        setPixelColor<T>(
            hex: number,
            x: number,
            y: number,
            cb: Jimp.ImageCallback<T>
        ): T;
        setPixelColour(hex: number, x: number, y: number): this;
        setPixelColour<T>(
            hex: number,
            x: number,
            y: number,
            cb: Jimp.ImageCallback<T>
        ): T;
        clone(): Jimp;
        clone<T>(cb: Jimp.ImageCallback<T>): T;
        cloneQuiet(): Jimp;
        cloneQuiet<T>(cb: Jimp.ImageCallback<T>): T;
        background(hex: number): this;
        background<T>(hex: number, cb: Jimp.ImageCallback<T>): T;
        backgroundQuiet(hex: number): this;
        backgroundQuiet<T>(hex: number, cb: Jimp.ImageCallback<T>): T;
        scan(
            x: number,
            y: number,
            w: number,
            h: number,
            f: (this: this, x: number, y: number, idx: number) => any
        ): this;
        scan<T>(
            x: number,
            y: number,
            w: number,
            h: number,
            f: (this: this, x: number, y: number, idx: number) => any,
            cb: Jimp.ImageCallback<T>
        ): T;
        scanQuiet(
            x: number,
            y: number,
            w: number,
            h: number,
            f: (this: this, x: number, y: number, idx: number) => any
        ): this;
        scanQuiet<T>(
            x: number,
            y: number,
            w: number,
            h: number,
            f: (this: this, x: number, y: number, idx: number) => any,
            cb: Jimp.ImageCallback<T>
        ): T;
        crop(x: number, y: number, w: number, h: number): this;
        crop<T>(
            x: number,
            y: number,
            w: number,
            h: number,
            cb: Jimp.ImageCallback<T>
        ): T;
        cropQuiet(x: number, y: number, w: number, h: number): this;
        cropQuiet<T>(
            x: number,
            y: number,
            w: number,
            h: number,
            cb: Jimp.ImageCallback<T>
        ): T;

        // Color methods
        brightness(val: number): this;
        brightness<T>(val: number, cb: Jimp.ImageCallback<T>): T;
        contrast(val: number): this;
        contrast<T>(val: number, cb: Jimp.ImageCallback<T>): T;
        posterize(n: number): this;
        posterize<T>(n: number, cb: Jimp.ImageCallback<T>): T;
        greyscale(): this;
        greyscale<T>(cb: Jimp.ImageCallback<T>): T;
        grayscale(): this;
        grayscale<T>(cb: Jimp.ImageCallback<T>): T;
        opacity(f: number): this;
        opacity<T>(f: number, cb: Jimp.ImageCallback<T>): T;
        sepia(): this;
        sepia<T>(cb: Jimp.ImageCallback<T>): T;
        fade(f: number): this;
        fade<T>(f: number, cb: Jimp.ImageCallback<T>): T;
        convolution(kernel: number[][]): this;
        convolution<T>(kernel: number[][], cb: Jimp.ImageCallback<T>): T;
        convolution(kernel: number[][], edgeHandling: string): this;
        convolution<T>(
            kernel: number[][],
            edgeHandling: string,
            cb: Jimp.ImageCallback<T>
        ): T;
        opaque(): this;
        opaque<T>(cb: Jimp.ImageCallback<T>): T;
        pixelate<T>(size: number, cb: Jimp.ImageCallback<T>): T;
        pixelate(
            size: number,
            x: number,
            y: number,
            w: number,
            h: number
        ): this;
        pixelate<T>(
            size: number,
            x: number,
            y: number,
            w: number,
            h: number,
            cb: Jimp.ImageCallback<T>
        ): T;
        convolute<T>(kernel: number[][], cb: Jimp.ImageCallback<T>): T;
        convolute(
            kernel: number[][],
            x: number,
            y: number,
            w: number,
            h: number
        ): this;
        convolute<T>(
            kernel: number[][],
            x: number,
            y: number,
            w: number,
            h: number,
            cb: Jimp.ImageCallback<T>
        ): T;
        color(actions: ColorAction[]): this;
        color<T>(actions: ColorAction[], cb: Jimp.ImageCallback<T>): T;
        colour(actions: ColorAction[]): this;
        colour<T>(actions: ColorAction[], cb: Jimp.ImageCallback<T>): T;

        // Shape methods
        rotate<T>(deg: number, cb: Jimp.ImageCallback<T>): T;
        rotate(deg: number, mode?: number | boolean): this;
        rotate<T>(
            deg: number,
            mode: number | boolean | undefined | null,
            cb: Jimp.ImageCallback<T>
        ): T;
        flip(horizontal: boolean, vertical: boolean): this;
        flip<T>(
            horizontal: boolean,
            vertical: boolean,
            cb: Jimp.ImageCallback<T>
        ): T;
        mirror(horizontal: boolean, vertical: boolean): this;
        mirror<T>(
            horizontal: boolean,
            vertical: boolean,
            cb: Jimp.ImageCallback<T>
        ): T;
        resize<T>(w: number, h: number, cb: Jimp.ImageCallback<T>): T;
        resize(w: number, h: number, mode?: string): this;
        resize<T>(
            w: number,
            h: number,
            mode: string | undefined | null,
            cb: Jimp.ImageCallback<T>
        ): T;
        cover<T>(w: number, h: number, cb: Jimp.ImageCallback<T>): T;
        cover<T>(
            w: number,
            h: number,
            alignBits: number | undefined | null,
            cb: Jimp.ImageCallback<T>
        ): T;
        cover(w: number, h: number, alignBits?: number, mode?: string): this;
        cover<T>(
            w: number,
            h: number,
            alignBits: number | undefined | null,
            mode: string | undefined | null,
            cb: Jimp.ImageCallback<T>
        ): T;
        contain(w: number, h: number): this;
        contain<T>(w: number, h: number, cb: Jimp.ImageCallback<T>): T;
        contain(w: number, h: number, mode: string): this;
        contain<T>(
            w: number,
            h: number,
            mode: string,
            cb: Jimp.ImageCallback<T>
        ): T;
        contain(w: number, h: number, alignBits: number): this;
        contain<T>(
            w: number,
            h: number,
            alignBits: number,
            cb: Jimp.ImageCallback<T>
        ): T;
        contain(w: number, h: number, alignBits: number, mode: string): this;
        contain<T>(
            w: number,
            h: number,
            alignBits: number,
            mode: string,
            cb: Jimp.ImageCallback<T>
        ): T;
        scale<T>(f: number, cb: Jimp.ImageCallback<T>): T;
        scale(f: number, mode?: string): this;
        scale<T>(
            f: number,
            mode: string | undefined | null,
            cb: Jimp.ImageCallback<T>
        ): T;
        scaleToFit<T>(w: number, h: number, cb: Jimp.ImageCallback<T>): T;
        scaleToFit(w: number, h: number): this;
        scaleToFit<T>(
            w: number,
            h: number,
            mode: string | undefined | null,
            cb: Jimp.ImageCallback<T>
        ): T;
        displace(map: Jimp, offset: number): this;
        displace<T>(map: Jimp, offset: number, cb: Jimp.ImageCallback<T>): T;
        autocrop(tolerance?: number, cropOnlyFrames?: boolean): this;
        autocrop<T>(
            tolerance: number | undefined | null,
            cb: Jimp.ImageCallback<T>
        ): T;
        autocrop(cropOnlyFrames: boolean | undefined | null): this;
        autocrop<T>(
            cropOnlyFrames: boolean | undefined | null,
            cb: Jimp.ImageCallback<T>
        ): T;
        autocrop<T>(
            tolerance: number | undefined | null,
            cropOnlyFrames: boolean | undefined | null,
            cb: Jimp.ImageCallback<T>
        ): T;

        // Text methods
        print(
            font: Font,
            x: number,
            y: number,
            text: PrintableText,
            maxWidth?: number,
            maxHeight?: number
        ): this;
        print<T>(
            font: Font,
            x: number,
            y: number,
            text: PrintableText,
            cb: Jimp.ImageCallback<T>
        ): T;
        print<T>(
            font: Font,
            x: number,
            y: number,
            text: PrintableText,
            maxWidth: number | undefined | null,
            cb: Jimp.ImageCallback<T>
        ): T;
        print<T>(
            font: Font,
            x: number,
            y: number,
            text: PrintableText,
            maxWidth: number | undefined | null,
            maxHeight: number | undefined | null,
            cb: Jimp.ImageCallback<T>
        ): T;

        // Effect methods
        blur(r: number): this;
        blur<T>(r: number, cb: Jimp.ImageCallback<T>): T;
        dither565(): this;
        dither565<T>(cb: Jimp.ImageCallback<T>): T;
        dither16(): this;
        dither16<T>(cb: Jimp.ImageCallback<T>): T;
        histogram(): { r: number[]; g: number[]; b: number[] };
        normalize(): this;
        normalize<T>(cb: Jimp.ImageCallback<T>): T;
        invert(): this;
        invert<T>(cb: Jimp.ImageCallback<T>): T;
        gaussian(r: number): this;
        gaussian<T>(r: number, cb: Jimp.ImageCallback<T>): T;
        composite(src: Jimp, x: number, y: number): this;
        composite<T>(
            src: Jimp,
            x: number,
            y: number,
            cb: Jimp.ImageCallback<T>
        ): T;
        blit(src: Jimp, x: number, y: number): this;
        blit<T>(src: Jimp, x: number, y: number, cb: Jimp.ImageCallback<T>): T;
        blit(
            src: Jimp,
            x: number,
            y: number,
            srcx: number,
            srcy: number,
            srcw: number,
            srch: number
        ): this;
        blit<T>(
            src: Jimp,
            x: number,
            y: number,
            srcx: number,
            srcy: number,
            srcw: number,
            srch: number,
            cb: Jimp.ImageCallback<T>
        ): T;
        mask(src: Jimp, x: number, y: number): this;
        mask<T>(src: Jimp, x: number, y: number, cb: Jimp.ImageCallback<T>): T;

        // Functions
        static appendConstructorOption<T extends any[]>(
            name: string,
            test: (...args: T) => boolean,
            run: (
                this: Jimp,
                resolve: (jimp: Jimp) => any,
                reject: (reason: Error) => any,
                ...args: T
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
        static rgbaToInt(r: number, g: number, b: number, a: number): number;
        static rgbaToInt<T>(
            r: number,
            g: number,
            b: number,
            a: number,
            cb: GenericCallback<number, T, Jimp>
        ): T;
        static intToRGBA(i: number, cb?: GenericCallback<Jimp.RGBA>): Jimp.RGBA;
        static limit255(n: number): number;
        static diff(
            img1: Jimp,
            img2: Jimp,
            threshold?: number
        ): { percent: number; image: Jimp };
        static distance(img1: Jimp, img2: Jimp): number;
        static colorDiff(rgba1: Jimp.RGB, rgba2: Jimp.RGB): number;
        static colorDiff(rgba1: Jimp.RGBA, rgba2: Jimp.RGBA): number;
        static loadFont(file: string): Promise<Font>;
        static loadFont(
            file: string,
            cb: Jimp.GenericCallback<Font, any, any>
        ): Promise<never>;
    }
}

declare module 'jimp' {
    export = Jimp.Jimp;
}
