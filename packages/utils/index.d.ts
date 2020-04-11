import { Image, Omit } from '@jimp/core';
import { ThrowStatement } from 'typescript';

export function isNodePattern(cb: Function): true;
export function isNodePattern(cb: Omit<any, Function>): false;

export function throwError(error: string | Error, cb?: (err: Error) => void): ThrowStatement;

export function scan<I extends Image>(image: I, x: number, y: number, w: number, h: number, f: (image: I, _x: number, _y: number, idx: number) => void): I;
export function* scanIterator<I extends I>(image: I, x: number, y: number, w: number, h: number): IterableIterator<{
  image: I;
  x: number;
  y: number;
  idx: number;
}>;
