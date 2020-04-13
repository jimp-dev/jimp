import * as fs from "fs";
import * as loader from "@assemblyscript/loader";
import { Jimp } from '@jimp/core';

interface AsmMethods {
  __internal__blit(
    src: Jimp,
    x: number,
    y: number,
    srcx: number,
    srcy: number,
    srcw: number,
    srch: number,
  ): void;
}

let asm: loader.ASUtil & typeof import('./assembly');

export default function pluginAsm() {
  if (!asm) {
    asm = loader.instantiateSync(fs.readFileSync(__dirname + "/../build/optimized.wasm"), { /* imports */ })
  }
  const methods: AsmMethods = {
    __internal__blit(this: Jimp, src, x, y, srcx, srcy, srcw, srch) {
      const baseBitmap = new asm.AsmBitmap();
      baseBitmap.data = asm.__retain(asm.__allocArray(asm.UINT8ARRAY_ID, this.bitmap.data));
      baseBitmap.height = this.bitmap.height;
      baseBitmap.width = this.bitmap.width;

      const srcBitmap = new asm.AsmBitmap();
      srcBitmap.data = asm.__retain(asm.__allocArray(asm.UINT8ARRAY_ID, src.bitmap.data));
      srcBitmap.height = src.bitmap.height;
      srcBitmap.width = src.bitmap.width;

      asm.blit(baseBitmap, srcBitmap, x, y, srcx, srcy, srcw, srch);

      // TODO: add improved memory management so that the bitmap can stay in the asm memory as long as possible
      this.bitmap.data = Buffer.from(asm.__getUint8Array(baseBitmap.data));
      this.bitmap.height = baseBitmap.height;
      this.bitmap.width = baseBitmap.width;

      asm.__release(baseBitmap.data);
      asm.__release(srcBitmap.data);
    }
  }

  return {
    class: methods
  };
}
