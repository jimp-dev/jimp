// TypeScript Version: 2.8
import {
  Jimp,
  JimpPlugin,
  JimpType
} from '@jimp/core';

export type FunctionRet<T> = Array<() => T>;

export type InferedRet<T> = T extends Array<() => infer Q> ? Q : undefined;

export default function configure<
  Typee extends FunctionRet<JimpType>,
  Pluginn extends FunctionRet<JimpPlugin>,
  JimpInst extends Jimp = Jimp
>(
  configuration: {
    types?: Typee;
    plugins?: Pluginn;
  },
  jimpInstance?: JimpInst
): JimpInst &
  Jimp<
    InferedRet<Typee>,
    InferedRet<Pluginn>
  >;
