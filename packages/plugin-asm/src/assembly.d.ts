type i32 = number;
type u32 = number;
type Pointer<T> = number;
// Generate the below definition with `tsc -p assembly --declaration --emitDeclarationOnly`

export const UINT8ARRAY_ID: u32;

export declare class AsmBitmap {
    width: i32;
    height: i32;
    data: Pointer<Uint8Array>;
}
/**
 * Blits a source image on to this image
 * @param baseBitmap the this.bitmap from the baseImage Jimp instance
 * @param srcBitmap the source bitmap from a Jimp instance
 * @param x the x position to blit the image
 * @param y the y position to blit the image
 * @param srcx the x position from which to crop the source image
 * @param srcy the y position from which to crop the source image
 * @param srcw the width to which to crop the source image
 * @param srch the height to which to crop the source image
 */
export declare function blit(baseBitmap: AsmBitmap, srcBitmap: AsmBitmap, x: i32, y: i32, srcx: i32, srcy: i32, srcw: i32, srch: i32): void;
