# v2.0.0 (Mon Nov 23 2026)

:tada: This release contains work from new contributors! :tada:

Thanks for all your work!

:heart: Matt Van Horn ([@mvanhorn](https://github.com/mvanhorn))

:heart: Sandhan Aniket Ramdas ([@Aniketiitk21](https://github.com/Aniketiitk21))

:heart: null[@Shrusti-pk](https://github.com/Shrusti-pk)

:heart: Defiant Catgirl ([@DefiantCatgirl](https://github.com/DefiantCatgirl))

:heart: Spoko Dev ([@spokodev](https://github.com/spokodev))

:heart: Roger Bambinetti ([@RogerBambinetti](https://github.com/RogerBambinetti))

#### 💥 Breaking Change

- refactor!: remove options that have no effect, interpolate rotate's resize modes, add BMP bitPP [#1508](https://github.com/jimp-dev/jimp/pull/1508) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(plugin-color)!: round greyscale and use the same luminance in color() [#1507](https://github.com/jimp-dev/jimp/pull/1507) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(core)!: don't paint edge pixels when setPixelColor is outside the image [#1506](https://github.com/jimp-dev/jimp/pull/1506) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(core)!: composite across Jimp classes, clone mime/background, read Uint8Array/Blob, type write() options per extension [#1503](https://github.com/jimp-dev/jimp/pull/1503) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- chore!: require Node.js 22 or later [#1504](https://github.com/jimp-dev/jimp/pull/1504) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(utils)!: clamp out-of-bounds regions to the image [#1501](https://github.com/jimp-dev/jimp/pull/1501) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix!: blur radius, cover/contain align, resize alpha, autocrop, displace, circle, shadow and compareHashes [#1499](https://github.com/jimp-dev/jimp/pull/1499) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(plugin-print)!: align text without maxWidth, measure newlines, clear loadFont HTTP errors [#1498](https://github.com/jimp-dev/jimp/pull/1498) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(utils)!: throw for invalid CSS colors [#1497](https://github.com/jimp-dev/jimp/pull/1497) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🚀 Enhancement

- feat: print TrueType, OpenType and WOFF fonts [#1539](https://github.com/jimp-dev/jimp/pull/1539) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat: add @jimp/plugin-draw for lines, shapes, paths, gradients and flood fill [#1530](https://github.com/jimp-dev/jimp/pull/1530) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat: read and write animated GIFs and multi-page TIFFs [#1529](https://github.com/jimp-dev/jimp/pull/1529) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat: add erode(), dilate(), open() and close() [#1523](https://github.com/jimp-dev/jimp/pull/1523) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(wasm-jxl): add JPEG XL format plugin [#1521](https://github.com/jimp-dev/jimp/pull/1521) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(js-bmp): write 1-, 4- and 8-bit BMPs [#1518](https://github.com/jimp-dev/jimp/pull/1518) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(wasm-svg): read SVG images [#1522](https://github.com/jimp-dev/jimp/pull/1522) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(wasm-jpeg2000): add JPEG 2000 format plugin [#1520](https://github.com/jimp-dev/jimp/pull/1520) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat: add skew() and affine() transforms [#1515](https://github.com/jimp-dev/jimp/pull/1515) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(js-ico): read and write ICO files [#1519](https://github.com/jimp-dev/jimp/pull/1519) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(core): add exifRotate option to skip EXIF auto-rotation [#1512](https://github.com/jimp-dev/jimp/pull/1512) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(diff): accept pixelmatch options and transparent diff output [#1510](https://github.com/jimp-dev/jimp/pull/1510) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(plugin-crop): add autocropRect helper [#1404](https://github.com/jimp-dev/jimp/pull/1404) ([@Aniketiitk21](https://github.com/Aniketiitk21))

#### 🐛 Bug Fix

- chore(deps): upgrade all dependencies [#1541](https://github.com/jimp-dev/jimp/pull/1541) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix: correct the TypeScript types of WASM format options [#1526](https://github.com/jimp-dev/jimp/pull/1526) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- chore: make the repo build and test on Windows [#1524](https://github.com/jimp-dev/jimp/pull/1524) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat: Display P3 and ICC colour profile support [#1492](https://github.com/jimp-dev/jimp/pull/1492) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(plugin-dither): add Floyd–Steinberg, Atkinson and Bayer dithering [#1493](https://github.com/jimp-dev/jimp/pull/1493) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(plugin-threshold): pick max automatically with Otsu's method [#1485](https://github.com/jimp-dev/jimp/pull/1485) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat: add sharpen() and a divisor/bias for convolution and convolute [#1482](https://github.com/jimp-dev/jimp/pull/1482) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(core): accept ImageData, Uint8ClampedArray and Uint8Array as bitmap data [#1480](https://github.com/jimp-dev/jimp/pull/1480) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- docs: show how to create, read and save images in v1 [#1484](https://github.com/jimp-dev/jimp/pull/1484) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(jimp): export Edge and ColorActionName as runtime values [#1486](https://github.com/jimp-dev/jimp/pull/1486) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(core): preserve EXIF when writing JPEGs (opt-in) and document EXIF handling [#1478](https://github.com/jimp-dev/jimp/pull/1478) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(plugin-hash): add size and smallerSize options to pHash [#1472](https://github.com/jimp-dev/jimp/pull/1472) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix: keep jimp's browser bundle after pnpm test [#1474](https://github.com/jimp-dev/jimp/pull/1474) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(plugin-blur): make gaussian a true separable Gaussian blur [#1471](https://github.com/jimp-dev/jimp/pull/1471) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat: add @jimp/plugin-border with roundCorners, border and boxShadow [#1470](https://github.com/jimp-dev/jimp/pull/1470) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(plugin-print): print by code point, not UTF-16 code unit [#1465](https://github.com/jimp-dev/jimp/pull/1465) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Make Jimp instance types interchangeable and type fromBitmap [#1446](https://github.com/jimp-dev/jimp/pull/1446) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(plugin-blur): weight colors by alpha when blurring [#1458](https://github.com/jimp-dev/jimp/pull/1458) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(blit): use source-over alpha compositing [#1460](https://github.com/jimp-dev/jimp/pull/1460) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(core): round composite results instead of truncating them [#1454](https://github.com/jimp-dev/jimp/pull/1454) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix: explain browser filesystem write failures [#1453](https://github.com/jimp-dev/jimp/pull/1453) ([@mvanhorn](https://github.com/mvanhorn))
- Fix Buffer in Deno, Workers, and browsers without a polyfill [#1444](https://github.com/jimp-dev/jimp/pull/1444) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- docs: remove v0 leftovers from the jimp and plugin READMEs [#1447](https://github.com/jimp-dev/jimp/pull/1447) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(js-png): use pngjs's browser build in browser bundles [#1445](https://github.com/jimp-dev/jimp/pull/1445) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix: inline sources in published source maps [#1437](https://github.com/jimp-dev/jimp/pull/1437) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- docs: fix stale v0 examples and params in the API docs [#1438](https://github.com/jimp-dev/jimp/pull/1438) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Accept plain string paths in Jimp#write [#1434](https://github.com/jimp-dev/jimp/pull/1434) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Respect Buffer view bounds in fromBitmap and quantize [#1419](https://github.com/jimp-dev/jimp/pull/1419) ([@Shrusti-pk](https://github.com/Shrusti-pk) [@hipstersmoothie](https://github.com/hipstersmoothie))
- Pass decoder options to the underlying decoder when reading from files and buffers, not just URLs [#1357](https://github.com/jimp-dev/jimp/pull/1357) ([@DefiantCatgirl](https://github.com/DefiantCatgirl) [@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(plugin-color): compute sepia output channels from the original pixel [#1412](https://github.com/jimp-dev/jimp/pull/1412) ([@spokodev](https://github.com/spokodev) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### 📝 Documentation

- docs: add share image and favicon for the docs site [#1426](https://github.com/jimp-dev/jimp/pull/1426) ([@crutchcorn](https://github.com/crutchcorn) [@hipstersmoothie](https://github.com/hipstersmoothie))
- docs: fix resize examples to follow ResizeOptionsSchema [#1370](https://github.com/jimp-dev/jimp/pull/1370) ([@RogerBambinetti](https://github.com/RogerBambinetti))

#### 🔩 Dependency Updates

- chore(deps): upgrade dev tooling to fix Dependabot alerts [#1525](https://github.com/jimp-dev/jimp/pull/1525) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 8

- [@Shrusti-pk](https://github.com/Shrusti-pk)
- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))
- Defiant Catgirl ([@DefiantCatgirl](https://github.com/DefiantCatgirl))
- Matt Van Horn ([@mvanhorn](https://github.com/mvanhorn))
- Roger Bambinetti ([@RogerBambinetti](https://github.com/RogerBambinetti))
- Sandhan Aniket Ramdas ([@Aniketiitk21](https://github.com/Aniketiitk21))
- Spoko Dev ([@spokodev](https://github.com/spokodev))

---

# v1.6.0 (Mon Sep 09 2024)

#### 🐛 Bug Fix

- Bump version to: v1.5.0 \[skip ci\] ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- add readme to jimp ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.4.0 (Sat Sep 07 2024)

#### 🚀 Enhancement

- Export measure text functions from jimp package [#1333](https://github.com/jimp-dev/jimp/pull/1333) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Add JimpMime constant [#1331](https://github.com/jimp-dev/jimp/pull/1331) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add JimpInstance type [#1330](https://github.com/jimp-dev/jimp/pull/1330) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.2.0 (Tue Sep 03 2024)

#### 🚀 Enhancement

- Add webp, avid, png, jpeg WASM format plugin [#1324](https://github.com/jimp-dev/jimp/pull/1324) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.1.5 (Mon Sep 02 2024)

#### ⚠️ Pushed to `main`

- Fix height/width being undefined when creating a Jimp from a canvas ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.1.4 (Mon Sep 02 2024)

### Release Notes

#### improve bundler integration ([#1321](https://github.com/jimp-dev/jimp/pull/1321))

Instead of having to import `jimp/browser` you can now just import `jimp` and the bundler should pick up the `browser` export.

---

#### 🐛 Bug Fix

- improve bundler integration [#1321](https://github.com/jimp-dev/jimp/pull/1321) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.1.3 (Mon Sep 02 2024)

#### 🐛 Bug Fix

- Include browser files [#1320](https://github.com/jimp-dev/jimp/pull/1320) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Update deps [#1319](https://github.com/jimp-dev/jimp/pull/1319) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.1.2 (Mon Sep 02 2024)

### Release Notes

#### Make brightness function behave like other implementations ([#1312](https://github.com/jimp-dev/jimp/pull/1312))

This PR changes the `brightness` function to behave like the css brightness function and other implementations. Previously it was doing something odd. Instead of multiplying the color channel by the multiplier value, it multiplied against the inversion of the current color.

In the current version a value of `1` won't change the colors at all. Values above 1 will brighten the colors, values below 1 will darken the colors.

---

#### 🐛 Bug Fix

- Fix blur on transparent images [#1315](https://github.com/jimp-dev/jimp/pull/1315) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Make brightness function behave like other implementations [#1312](https://github.com/jimp-dev/jimp/pull/1312) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.1.0 (Sun Sep 01 2024)

#### 🚀 Enhancement

- Add quantize plugin [#1307](https://github.com/jimp-dev/jimp/pull/1307) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- upgrade tshy ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.0.5 (Sun Sep 01 2024)

#### ⚠️ Pushed to `main`

- fix browser build ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.0.3 (Sat Aug 31 2024)

:tada: This release contains work from a new contributor! :tada:

Thank you, Ben McCann ([@benmccann](https://github.com/benmccann)), for all your work!

#### 🐛 Bug Fix

- remove hundreds of unused dependencies [#1302](https://github.com/jimp-dev/jimp/pull/1302) ([@benmccann](https://github.com/benmccann) [@hipstersmoothie](https://github.com/hipstersmoothie))
- Fix build [#1303](https://github.com/jimp-dev/jimp/pull/1303) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- add clean script ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Ben McCann ([@benmccann](https://github.com/benmccann))

---

# v1.0.2 (Sat Aug 31 2024)

#### ⚠️ Pushed to `main`

- set side effects ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix versions ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add publish config ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
