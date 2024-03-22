declare const operations: {
  nearestNeighbor(src: any, dst: any): void;
  bilinearInterpolation(src: any, dst: any): void;
  bicubicInterpolation(src: any, dst: any, options?: any): void;
  hermiteInterpolation(src: any, dst: any, options?: any): void;
  bezierInterpolation(src: any, dst: any, options?: any): void;
};

export default operations;
