import { Jimp } from '@jimp/core';
interface AsmMethods {
    __internal__blit(src: Jimp, x: number, y: number, srcx: number, srcy: number, srcw: number, srch: number): void;
}
export default function pluginAsm(): {
    class: AsmMethods;
};
export {};
