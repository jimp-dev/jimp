import { ImageCallback } from '@jimp/core';

type ColorActionName =
  | 'mix'
  | 'tint'
  | 'shade'
  | 'xor'
  | 'red'
  | 'green'
  | 'blue'
  | 'hue';

type ColorAction = {
  apply: ColorActionName;
  params: any;
};

interface Color {
  brightness(val: number, cb?: ImageCallback): this;
  contrast(val: number, cb?: ImageCallback): this;
  posterize(n: number, cb?: ImageCallback): this;
  greyscale(cb?: ImageCallback): this;
  grayscale(cb?: ImageCallback): this;
  opacity(f: number, cb?: ImageCallback): this;
  sepia(cb?: ImageCallback): this;
  fade(f: number, cb?: ImageCallback): this;
  convolution(kernel: number[][], cb?: ImageCallback): this;
  convolution<T>(
    kernel: number[][],
    edgeHandling: string,
    cb?: ImageCallback
  ): this;
  opaque(cb?: ImageCallback): this;
  pixelate(size: number, cb?: ImageCallback): this;
  pixelate(
    size: number,
    x: number,
    y: number,
    w: number,
    h: number,
    cb?: ImageCallback
  ): this;
  convolute(kernel: number[][], cb?: ImageCallback): this;
  convolute(
    kernel: number[][],
    x: number,
    y: number,
    w: number,
    h: number,
    cb?: ImageCallback
  ): this;
  color(actions: ColorAction[], cb?: ImageCallback): this;
  colour(actions: ColorAction[], cb?: ImageCallback): this;
}

export default function(): Color;
