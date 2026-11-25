<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/plugin-lut</h1>
  <p>Color grade images with 3D LUTs.</p>
</div>

- [colorGrade](https://jimp-dev.github.io/jimp/methods/color-grade/)
- [parseCubeLut](https://jimp-dev.github.io/jimp/methods/parse-cube-lut/)

## Usage

`colorGrade` maps every pixel's color through a 3D LUT (lookup table) with
tetrahedral interpolation, the way photo and video editors apply a "look".
The LUT can come from a `.cube` file, read with `parseCubeLut`, or be a Hald
CLUT image, the format of many film emulation packs. Alpha is unchanged.

```ts
import { readFile } from "node:fs/promises";
import { Jimp, parseCubeLut } from "jimp";

const image = await Jimp.read("photo.jpg");
const lut = parseCubeLut(await readFile("teal-orange.cube", "utf8"));

image.colorGrade(lut);

// A Hald CLUT image, blended half way with the original
const hald = await Jimp.read("kodachrome.png");

image.colorGrade(hald, { strength: 0.5 });
```

`parseCubeLut` reads `LUT_3D_SIZE`, `TITLE`, `DOMAIN_MIN` and `DOMAIN_MAX`
(or Resolve's `LUT_3D_INPUT_RANGE`), and throws an error naming the line for
1D LUTs and files that aren't valid.

`jimp` includes this plugin. To use it in a custom Jimp, add its methods:

```ts
import { createJimp } from "@jimp/core";
import jpeg from "@jimp/js-jpeg";
import * as lut from "@jimp/plugin-lut";

const Jimp = createJimp({ formats: [jpeg], plugins: [lut.methods] });
```

See [the colorGrade() docs](https://jimp-dev.github.io/jimp/methods/color-grade/) for Hald
images, `apply`, workers and serving looks from `@jimp/server`.
