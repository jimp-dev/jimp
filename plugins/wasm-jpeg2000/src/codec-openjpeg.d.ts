/** The parts of @cornerstonejs/codec-openjpeg's embind API the plugin uses */
declare module "@cornerstonejs/codec-openjpeg/wasmjs" {
  interface FrameInfo {
    width: number;
    height: number;
    bitsPerSample: number;
    componentCount: number;
    isSigned: boolean;
  }

  interface Size {
    width: number;
    height: number;
  }

  export interface J2KDecoder {
    /** Memory to copy the encoded image into */
    getEncodedBuffer(length: number): Uint8Array;
    /** Interleaved samples, 1 byte each up to 8 bits and 2 above */
    getDecodedBuffer(): Uint8Array;
    decodeSubResolution(decompositionLevel: number, layers: number): void;
    getFrameInfo(): FrameInfo;
    calculateSizeAtDecompositionLevel(decompositionLevel: number): Size;
    delete(): void;
  }

  export interface J2KEncoder {
    /** Memory to copy the interleaved samples into */
    getDecodedBuffer(frameInfo: FrameInfo): Uint8Array;
    /** The raw codestream */
    getEncodedBuffer(): Uint8Array;
    setDecompositions(decompositions: number): void;
    setQuality(lossless: boolean, layers: number): void;
    setCompressionRatio(layer: number, ratio: number): void;
    encode(): void;
    delete(): void;
  }

  export interface OpenJpegModule {
    J2KDecoder: new () => J2KDecoder;
    J2KEncoder: new () => J2KEncoder;
  }

  export default function OpenJPEGWASM(options?: {
    print?: (message: string) => void;
    printErr?: (message: string) => void;
    locateFile?: (path: string, prefix: string) => string;
    instantiateWasm?: (
      imports: WebAssembly.Imports,
      receiveInstance: (
        instance: WebAssembly.Instance,
        module: WebAssembly.Module,
      ) => void,
    ) => object;
  }): Promise<OpenJpegModule>;
}
