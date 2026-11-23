/**
 * What resizing algorithm to use.
 */
export enum ResizeStrategy {
  /**
   * Nearest Neighbor resizing is a method used in image processing that assigns the value of the nearest pixel to the output pixel when resizing an image.
   * While fast, it can lead to lower quality outputs with noticeable pixelation, especially at larger scaling factors.
   */
  NEAREST_NEIGHBOR = "nearestNeighbor",
  /**
   * Bilinear resizing is an image scaling method that uses the weighted average of the four nearest pixel values, providing smoother gradients than nearest neighbor resizing.
   * It's computationally more intense than nearest neighbor but results in images of higher quality and fewer artifacts.
   */
  BILINEAR = "bilinearInterpolation",
  /**
   * Bicubic resizing is an image interpolation method that uses the values of the nearest 16 pixels in the input image to calculate the output pixel value, providing even more smoothness and sharpness than bilinear resizing.
   * Although it's computationally more expensive than bilinear and nearest neighbor, it produces higher quality images, making it ideal for photographic image scaling.
   */
  BICUBIC = "bicubicInterpolation",
  /**
   * Hermite resizing is an image resizing method that uses Hermite interpolation, a mathematical formula, to determine the values of output pixels based on a weighted average of the surrounding pixels.
   * Although slower than some simpler techniques like bilinear or nearest neighbor, Hermite resizing can produce higher quality visuals and detailed renderings with less blurring.
   */
  HERMITE = "hermiteInterpolation",
  BEZIER = "bezierInterpolation",
  /**
   * Lanczos3 resampling convolves the image with a sinc function windowed to 3 pixels on each side, the same filter as Pillow's `LANCZOS` and ImageMagick's `-filter Lanczos`.
   * It keeps the most detail of all the modes, both when upscaling and downscaling, at the cost of being the slowest and adding slight ringing next to hard edges.
   */
  LANCZOS = "lanczosInterpolation",
  /**
   * Lanczos2 resampling is Lanczos with a window of 2 pixels on each side.
   * It is a little softer than Lanczos3 with less ringing, and faster.
   */
  LANCZOS2 = "lanczos2Interpolation",
  /**
   * Mitchell resampling uses the Mitchell–Netravali cubic filter (B = C = 1/3), the same filter as ImageMagick's `-filter Mitchell`.
   * It is a good balance of sharpness and smoothness with almost no ringing, and is faster than Lanczos3.
   * It is slightly softer than Lanczos3.
   */
  MITCHELL = "mitchellInterpolation",
}
