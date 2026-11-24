# v2.1.0 (Tue Nov 24 2026)

#### 🚀 Enhancement

- `@jimp/core`, `@jimp/docs`, `jimp`, `@jimp/jpeg-js`, `@jimp/js-jpeg`, `@jimp/plugin-blur`, `@jimp/plugin-color`, `@jimp/plugin-dither`, `@jimp/plugin-print`, `@jimp/plugin-threshold`
  - feat: @jimp/jpeg-js, a maintained fork of jpeg-js, used by @jimp/js-jpeg [#1554](https://github.com/jimp-dev/jimp/pull/1554) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/docs`, `@jimp/test-utils`, `@jimp/js-gif`
  - Decode GIFs with Jimp's own reader and drop omggif [#1553](https://github.com/jimp-dev/jimp/pull/1553) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/config-vitest`, `@jimp/docs`, `jimp`, `@jimp/pngjs`, `@jimp/test-utils`, `@jimp/js-ico`, `@jimp/js-png`
  - Add @jimp/pngjs, a maintained fork of pngjs, and use it in @jimp/js-png [#1552](https://github.com/jimp-dev/jimp/pull/1552) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🏠 Internal

- ci: allow deploying the docs by hand after a release [#1546](https://github.com/jimp-dev/jimp/pull/1546) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/jpeg-js`
  - chore: move the jpeg-js test corpus into Git LFS [#1556](https://github.com/jimp-dev/jimp/pull/1556) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/pngjs`
  - test(pngjs): give the 6000x4000 round-trip test a 60s timeout [#1557](https://github.com/jimp-dev/jimp/pull/1557) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/pngjs`, `@jimp/js-gif`
  - chore: store the codec conformance test images in Git LFS [#1555](https://github.com/jimp-dev/jimp/pull/1555) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 📝 Documentation

- docs: close the letter outlines in the README logo [#1549](https://github.com/jimp-dev/jimp/pull/1549) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/docs`
  - docs: stop Safari cutting off the feature stamps [#1551](https://github.com/jimp-dev/jimp/pull/1551) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - docs: stop layout shift on load and cross-fade between pages [#1550](https://github.com/jimp-dev/jimp/pull/1550) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - docs: replace the pencil mascot with Jimpy in the favicon and share banner [#1548](https://github.com/jimp-dev/jimp/pull/1548) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - docs: keep the left sidebar in view while scrolling [#1545](https://github.com/jimp-dev/jimp/pull/1545) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - docs: stop the header shifting on page load [#1544](https://github.com/jimp-dev/jimp/pull/1544) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/js-bmp`, `@jimp/js-gif`, `@jimp/js-ico`, `@jimp/js-jpeg`, `@jimp/js-png`, `@jimp/js-tiff`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-border`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-draw`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-mask`, `@jimp/plugin-morphology`, `@jimp/plugin-print`, `@jimp/plugin-quantize`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/wasm-avif`, `@jimp/wasm-jpeg`, `@jimp/wasm-jpeg2000`, `@jimp/wasm-jxl`, `@jimp/wasm-png`, `@jimp/wasm-svg`, `@jimp/wasm-webp`
  - docs: brand the READMEs with Jimpy and the JIMP wordmark [#1547](https://github.com/jimp-dev/jimp/pull/1547) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v2.0.0 (Mon Nov 23 2026)

:tada: This release contains work from new contributors! :tada:

Thanks for all your work!

:heart: Hanbin Tan ([@hskl18](https://github.com/hskl18))

:heart: Matt Van Horn ([@mvanhorn](https://github.com/mvanhorn))

:heart: Sandhan Aniket Ramdas ([@Aniketiitk21](https://github.com/Aniketiitk21))

:heart: droid ([@joras-droid](https://github.com/joras-droid))

:heart: null[@Shrusti-pk](https://github.com/Shrusti-pk)

:heart: Vilim Lendvaj ([@viliml](https://github.com/viliml))

:heart: Defiant Catgirl ([@DefiantCatgirl](https://github.com/DefiantCatgirl))

:heart: Goran ([@goranai](https://github.com/goranai))

:heart: Spoko Dev ([@spokodev](https://github.com/spokodev))

:heart: null[@MentalGear](https://github.com/MentalGear)

:heart: rxliuli ([@rxliuli](https://github.com/rxliuli))

:heart: Panagiotis Papadopoulos ([@pano9000](https://github.com/pano9000))

:heart: Roger Bambinetti ([@RogerBambinetti](https://github.com/RogerBambinetti))

:heart: 周耕毅（Ryan Chou） ([@ryanchou1994](https://github.com/ryanchou1994))

:heart: Bishwajeet Parhi ([@2002Bishwajeet](https://github.com/2002Bishwajeet))

#### 💥 Breaking Change

- `jimp`, `@jimp/js-bmp`, `@jimp/js-gif`, `@jimp/js-jpeg`, `@jimp/js-png`, `@jimp/plugin-rotate`, `@jimp/wasm-avif`, `@jimp/wasm-jpeg`, `@jimp/wasm-png`, `@jimp/wasm-webp`
  - refactor!: remove options that have no effect, interpolate rotate's resize modes, add BMP bitPP [#1508](https://github.com/jimp-dev/jimp/pull/1508) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/plugin-color`, `@jimp/plugin-hash`, `@jimp/plugin-threshold`
  - fix(plugin-color)!: round greyscale and use the same luminance in color() [#1507](https://github.com/jimp-dev/jimp/pull/1507) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `jimp`, `@jimp/types`, `@jimp/plugin-fisheye`
  - fix(core)!: don't paint edge pixels when setPixelColor is outside the image [#1506](https://github.com/jimp-dev/jimp/pull/1506) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-print`
  - fix(plugin-print)!: keep blank lines in printed text [#1505](https://github.com/jimp-dev/jimp/pull/1505) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `@jimp/file-ops`, `jimp`
  - fix(core)!: composite across Jimp classes, clone mime/background, read Uint8Array/Blob, type write() options per extension [#1503](https://github.com/jimp-dev/jimp/pull/1503) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/config-vitest`, `@jimp/core`, `@jimp/diff`, `@jimp/file-ops`, `jimp`, `@jimp/test-utils`, `@jimp/types`, `@jimp/utils`, `@jimp/js-bmp`, `@jimp/js-gif`, `@jimp/js-jpeg`, `@jimp/js-png`, `@jimp/js-tiff`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-border`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-hash`, `@jimp/plugin-mask`, `@jimp/plugin-print`, `@jimp/plugin-quantize`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/wasm-avif`, `@jimp/wasm-jpeg`, `@jimp/wasm-png`, `@jimp/wasm-webp`
  - chore!: require Node.js 22 or later [#1504](https://github.com/jimp-dev/jimp/pull/1504) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `@jimp/utils`, `@jimp/plugin-color`, `@jimp/plugin-quantize`, `@jimp/plugin-threshold`, `@jimp/wasm-jpeg`
  - fix!: correct pixel maths in the color, threshold and quantize plugins [#1500](https://github.com/jimp-dev/jimp/pull/1500) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `jimp`, `@jimp/utils`, `@jimp/plugin-blit`, `@jimp/plugin-color`, `@jimp/plugin-crop`
  - fix(utils)!: clamp out-of-bounds regions to the image [#1501](https://github.com/jimp-dev/jimp/pull/1501) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-hash`, `@jimp/plugin-resize`, `@jimp/plugin-shadow`
  - fix!: blur radius, cover/contain align, resize alpha, autocrop, displace, circle, shadow and compareHashes [#1499](https://github.com/jimp-dev/jimp/pull/1499) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/plugin-print`
  - fix(plugin-print)!: align text without maxWidth, measure newlines, clear loadFont HTTP errors [#1498](https://github.com/jimp-dev/jimp/pull/1498) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/utils`, `@jimp/plugin-border`, `@jimp/plugin-color`
  - fix(utils)!: throw for invalid CSS colors [#1497](https://github.com/jimp-dev/jimp/pull/1497) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-hash`
  - fix(plugin-hash): exclude DC term from pHash average and composite alpha onto grey [#1466](https://github.com/jimp-dev/jimp/pull/1466) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🚀 Enhancement

- `jimp`, `@jimp/plugin-draw`, `@jimp/plugin-print`
  - feat: print TrueType, OpenType and WOFF fonts [#1539](https://github.com/jimp-dev/jimp/pull/1539) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/plugin-draw`
  - feat: add @jimp/plugin-draw for lines, shapes, paths, gradients and flood fill [#1530](https://github.com/jimp-dev/jimp/pull/1530) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `jimp`, `@jimp/test-utils`, `@jimp/types`, `@jimp/js-gif`, `@jimp/js-tiff`
  - feat: read and write animated GIFs and multi-page TIFFs [#1529](https://github.com/jimp-dev/jimp/pull/1529) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/plugin-morphology`
  - feat: add erode(), dilate(), open() and close() [#1523](https://github.com/jimp-dev/jimp/pull/1523) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `jimp`, `@jimp/wasm-jxl`
  - feat(wasm-jxl): add JPEG XL format plugin [#1521](https://github.com/jimp-dev/jimp/pull/1521) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/js-bmp`, `@jimp/js-ico`
  - feat(js-bmp): write 1-, 4- and 8-bit BMPs [#1518](https://github.com/jimp-dev/jimp/pull/1518) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `jimp`, `@jimp/types`, `@jimp/wasm-svg`
  - feat(wasm-svg): read SVG images [#1522](https://github.com/jimp-dev/jimp/pull/1522) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `jimp`, `@jimp/wasm-jpeg2000`
  - feat(wasm-jpeg2000): add JPEG 2000 format plugin [#1520](https://github.com/jimp-dev/jimp/pull/1520) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/plugin-rotate`
  - feat: add skew() and affine() transforms [#1515](https://github.com/jimp-dev/jimp/pull/1515) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-color`
  - feat(plugin-color): add a multiply color action and sepia(amount) [#1517](https://github.com/jimp-dev/jimp/pull/1517) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - feat(plugin-color): add exposure() and vibrance() [#1516](https://github.com/jimp-dev/jimp/pull/1516) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `@jimp/docs`, `jimp`, `@jimp/test-utils`, `@jimp/js-ico`
  - feat(js-ico): read and write ICO files [#1519](https://github.com/jimp-dev/jimp/pull/1519) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-displace`
  - feat(plugin-displace): displace along y with offset { x, y } [#1514](https://github.com/jimp-dev/jimp/pull/1514) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-contain`, `@jimp/plugin-cover`
  - feat(plugin-cover, plugin-contain): accept fractional { x, y } align [#1513](https://github.com/jimp-dev/jimp/pull/1513) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `jimp`, `@jimp/js-jpeg`
  - feat(core): add exifRotate option to skip EXIF auto-rotation [#1512](https://github.com/jimp-dev/jimp/pull/1512) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/diff`, `jimp`
  - feat(diff): accept pixelmatch options and transparent diff output [#1510](https://github.com/jimp-dev/jimp/pull/1510) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-resize`
  - feat(plugin-resize): add premultiplyAlpha option to keep the colour of transparent pixels [#1502](https://github.com/jimp-dev/jimp/pull/1502) ([@hskl18](https://github.com/hskl18) [@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/plugin-crop`, `@jimp/plugin-print`
  - feat(plugin-crop): add autocropRect helper [#1404](https://github.com/jimp-dev/jimp/pull/1404) ([@Aniketiitk21](https://github.com/Aniketiitk21))

#### 🐛 Bug Fix

- docs: add security policy [#1461](https://github.com/jimp-dev/jimp/pull/1461) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- ci: stop pnpm 12 from reinstalling node_modules mid-build [#1452](https://github.com/jimp-dev/jimp/pull/1452) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix: order jimp's browser build after tshy and cache its output [#1441](https://github.com/jimp-dev/jimp/pull/1441) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- ci: cache turbo tasks with actions/cache and run jobs in parallel [#1427](https://github.com/jimp-dev/jimp/pull/1427) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- ci: run on Node 22 [#1425](https://github.com/jimp-dev/jimp/pull/1425) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/config-eslint`, `@jimp/config-vitest`, `@jimp/core`, `@jimp/diff`, `@jimp/file-ops`, `jimp`, `@jimp/test-utils`, `@jimp/types`, `@jimp/utils`, `@jimp/js-bmp`, `@jimp/js-gif`, `@jimp/js-ico`, `@jimp/js-jpeg`, `@jimp/js-png`, `@jimp/js-tiff`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-border`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-draw`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-hash`, `@jimp/plugin-mask`, `@jimp/plugin-morphology`, `@jimp/plugin-print`, `@jimp/plugin-quantize`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/wasm-avif`, `@jimp/wasm-jpeg`, `@jimp/wasm-jpeg2000`, `@jimp/wasm-jxl`, `@jimp/wasm-png`, `@jimp/wasm-svg`, `@jimp/wasm-webp`
  - chore(deps): upgrade all dependencies [#1541](https://github.com/jimp-dev/jimp/pull/1541) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/config-eslint`, `@jimp/core`, `jimp`, `@jimp/plugin-quantize`, `@jimp/wasm-avif`, `@jimp/wasm-jpeg`, `@jimp/wasm-jpeg2000`, `@jimp/wasm-jxl`, `@jimp/wasm-png`, `@jimp/wasm-svg`, `@jimp/wasm-webp`
  - fix: correct the TypeScript types of WASM format options [#1526](https://github.com/jimp-dev/jimp/pull/1526) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-resize`
  - perf(plugin-resize): faster BILINEAR, BICUBIC, HERMITE and BEZIER [#1528](https://github.com/jimp-dev/jimp/pull/1528) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - fix(plugin-resize): premultiply alpha in BILINEAR, BICUBIC, HERMITE and BEZIER [#1459](https://github.com/jimp-dev/jimp/pull/1459) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - Fix BICUBIC, HERMITE and BEZIER resize shifting the image and losing the last row/column [#1433](https://github.com/jimp-dev/jimp/pull/1433) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/config-eslint`, `@jimp/config-typescript`, `@jimp/config-vitest`, `@jimp/core`, `@jimp/diff`, `@jimp/docs`, `@jimp/file-ops`, `jimp`, `@jimp/test-utils`, `@jimp/types`, `@jimp/utils`, `@jimp/js-bmp`, `@jimp/js-gif`, `@jimp/js-ico`, `@jimp/js-jpeg`, `@jimp/js-png`, `@jimp/js-tiff`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-border`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-hash`, `@jimp/plugin-mask`, `@jimp/plugin-morphology`, `@jimp/plugin-print`, `@jimp/plugin-quantize`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/wasm-avif`, `@jimp/wasm-jpeg`, `@jimp/wasm-jpeg2000`, `@jimp/wasm-jxl`, `@jimp/wasm-png`, `@jimp/wasm-svg`, `@jimp/wasm-webp`
  - chore: make the repo build and test on Windows [#1524](https://github.com/jimp-dev/jimp/pull/1524) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-crop`
  - perf(plugin-crop): copy whole rows when cropping [#1511](https://github.com/jimp-dev/jimp/pull/1511) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-print`
  - fix(plugin-print): clear error for BMFont pages that aren't PNG [#1509](https://github.com/jimp-dev/jimp/pull/1509) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - fix(plugin-print): clear loadFont errors instead of fetch failures [#1475](https://github.com/jimp-dev/jimp/pull/1475) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - fix(plugin-print): measure missing glyphs as the ? that print draws [#1469](https://github.com/jimp-dev/jimp/pull/1469) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - Avoid quadratic line wrapping in splitLines [#1424](https://github.com/jimp-dev/jimp/pull/1424) ([@Shrusti-pk](https://github.com/Shrusti-pk) [@hipstersmoothie](https://github.com/hipstersmoothie))
  - Reject font pages outside the font directory in processBitmapFont [#1418](https://github.com/jimp-dev/jimp/pull/1418) ([@Shrusti-pk](https://github.com/Shrusti-pk) [@hipstersmoothie](https://github.com/hipstersmoothie))
  - Keep the end of words wider than maxWidth when wrapping text [#1432](https://github.com/jimp-dev/jimp/pull/1432) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - Allow loading non-XML fonts in web-worker [#1360](https://github.com/jimp-dev/jimp/pull/1360) ([@viliml](https://github.com/viliml))
- `@jimp/core`, `@jimp/docs`, `jimp`, `@jimp/types`, `@jimp/utils`, `@jimp/js-jpeg`, `@jimp/js-png`, `@jimp/plugin-blit`, `@jimp/plugin-border`, `@jimp/plugin-shadow`, `@jimp/wasm-jpeg`, `@jimp/wasm-png`, `@jimp/wasm-webp`
  - feat: Display P3 and ICC colour profile support [#1492](https://github.com/jimp-dev/jimp/pull/1492) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/js-bmp`
  - fix(js-bmp): read BMP pixel data from the offset in the header [#1495](https://github.com/jimp-dev/jimp/pull/1495) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - Update bmp-ts to 1.1.0 to bound BMP decode dimensions [#1435](https://github.com/jimp-dev/jimp/pull/1435) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/plugin-dither`
  - feat(plugin-dither): add Floyd–Steinberg, Atkinson and Bayer dithering [#1493](https://github.com/jimp-dev/jimp/pull/1493) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-mask`
  - fix(plugin-mask): use GIMP's luminance for colour masks, honour mask alpha, round results [#1491](https://github.com/jimp-dev/jimp/pull/1491) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-rotate`
  - fix(plugin-rotate): centre nearest-neighbour rotation (off by one pixel) [#1490](https://github.com/jimp-dev/jimp/pull/1490) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - fix(plugin-rotate): snap float error before picking the source pixel [#1423](https://github.com/jimp-dev/jimp/pull/1423) ([@goranai](https://github.com/goranai))
- `jimp`, `@jimp/plugin-threshold`
  - feat(plugin-threshold): pick max automatically with Otsu's method [#1485](https://github.com/jimp-dev/jimp/pull/1485) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-color`
  - fix(plugin-color): stop convolute transposing its kernel; support even-sized and non-square kernels [#1487](https://github.com/jimp-dev/jimp/pull/1487) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - perf(plugin-color): run color() without tinycolor2 per pixel [#1488](https://github.com/jimp-dev/jimp/pull/1488) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - fix(plugin-color): scale saturation and blend lightness in color() instead of fixed offsets [#1455](https://github.com/jimp-dev/jimp/pull/1455) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/plugin-blur`, `@jimp/plugin-color`
  - feat: add sharpen() and a divisor/bias for convolution and convolute [#1482](https://github.com/jimp-dev/jimp/pull/1482) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `@jimp/docs`, `jimp`, `@jimp/js-png`
  - feat(core): accept ImageData, Uint8ClampedArray and Uint8Array as bitmap data [#1480](https://github.com/jimp-dev/jimp/pull/1480) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `@jimp/docs`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-border`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-mask`, `@jimp/plugin-print`, `@jimp/plugin-quantize`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`
  - docs: show how to create, read and save images in v1 [#1484](https://github.com/jimp-dev/jimp/pull/1484) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/docs`, `jimp`
  - fix(jimp): export Edge and ColorActionName as runtime values [#1486](https://github.com/jimp-dev/jimp/pull/1486) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-resize`, `@jimp/plugin-rotate`
  - feat(plugin-resize): add LANCZOS, LANCZOS2 and MITCHELL resize modes [#1481](https://github.com/jimp-dev/jimp/pull/1481) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/test-utils`, `@jimp/js-bmp`
  - fix(js-bmp): update bmp-ts to 1.1.2 for RLE and odd width BMPs [#1479](https://github.com/jimp-dev/jimp/pull/1479) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - fix(js-bmp): keep alpha from BMPs with an alpha mask [#1467](https://github.com/jimp-dev/jimp/pull/1467) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `@jimp/docs`, `jimp`, `@jimp/js-jpeg`, `@jimp/wasm-jpeg`
  - feat(core): preserve EXIF when writing JPEGs (opt-in) and document EXIF handling [#1478](https://github.com/jimp-dev/jimp/pull/1478) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/docs`, `@jimp/plugin-contain`, `@jimp/plugin-resize`
  - docs: cover remaining v0 leftovers and webpack v0/v1 resolution errors in the migration guide [#1477](https://github.com/jimp-dev/jimp/pull/1477) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/js-png`
  - feat(js-png): pick the smallest lossless PNG colour type by default [#1476](https://github.com/jimp-dev/jimp/pull/1476) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - fix(js-png): ignore data after the IEND chunk [#1456](https://github.com/jimp-dev/jimp/pull/1456) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/plugin-hash`
  - feat(plugin-hash): add size and smallerSize options to pHash [#1472](https://github.com/jimp-dev/jimp/pull/1472) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`
  - fix: keep jimp's browser bundle after pnpm test [#1474](https://github.com/jimp-dev/jimp/pull/1474) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/docs`, `@jimp/js-gif`
  - fix(js-gif): encode GIFs without running out of memory [#1473](https://github.com/jimp-dev/jimp/pull/1473) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/plugin-blur`
  - fix(plugin-blur): make gaussian a true separable Gaussian blur [#1471](https://github.com/jimp-dev/jimp/pull/1471) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - fix(plugin-blur): weight colors by alpha when blurring [#1458](https://github.com/jimp-dev/jimp/pull/1458) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/plugin-border`, `@jimp/plugin-shadow`
  - feat: add @jimp/plugin-border with roundCorners, border and boxShadow [#1470](https://github.com/jimp-dev/jimp/pull/1470) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/plugin-print`
  - fix(plugin-print): print by code point, not UTF-16 code unit [#1465](https://github.com/jimp-dev/jimp/pull/1465) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `@jimp/diff`, `@jimp/file-ops`, `@jimp/test-utils`, `@jimp/types`, `@jimp/utils`, `@jimp/js-bmp`, `@jimp/js-gif`, `@jimp/js-jpeg`, `@jimp/js-png`, `@jimp/js-tiff`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-hash`, `@jimp/plugin-mask`, `@jimp/plugin-print`, `@jimp/plugin-quantize`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/wasm-avif`, `@jimp/wasm-jpeg`, `@jimp/wasm-png`, `@jimp/wasm-webp`
  - Only publish dist from each package [#1468](https://github.com/jimp-dev/jimp/pull/1468) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/docs`, `@jimp/plugin-color`
  - docs: document brightness semantics, CDN usage, and decode options [#1463](https://github.com/jimp-dev/jimp/pull/1463) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/js-tiff`
  - fix(js-tiff): decode CMYK TIFFs in Node [#1464](https://github.com/jimp-dev/jimp/pull/1464) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/js-jpeg`
  - fix(js-jpeg): skip stray bytes between JPEG header segments [#1462](https://github.com/jimp-dev/jimp/pull/1462) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - fix(js-jpeg): decode JPEGs missing the trailing EOI marker [#1439](https://github.com/jimp-dev/jimp/pull/1439) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/docs`, `@jimp/js-png`
  - fix(js-png): stop inputHasAlpha: false from garbling PNGs [#1457](https://github.com/jimp-dev/jimp/pull/1457) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `jimp`, `@jimp/plugin-shadow`
  - Make Jimp instance types interchangeable and type fromBitmap [#1446](https://github.com/jimp-dev/jimp/pull/1446) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - fix(core): round composite results instead of truncating them [#1454](https://github.com/jimp-dev/jimp/pull/1454) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-print`
  - fix(blit): use source-over alpha compositing [#1460](https://github.com/jimp-dev/jimp/pull/1460) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/file-ops`, `jimp`
  - fix: explain browser filesystem write failures [#1453](https://github.com/jimp-dev/jimp/pull/1453) ([@mvanhorn](https://github.com/mvanhorn))
- `@jimp/js-gif`, `@jimp/js-tiff`
  - Validate GIF and TIFF headers before decoding [#1451](https://github.com/jimp-dev/jimp/pull/1451) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/docs`, `@jimp/wasm-avif`, `@jimp/wasm-jpeg`, `@jimp/wasm-png`, `@jimp/wasm-webp`
  - feat(wasm-*): accept precompiled wasm modules for Cloudflare Workers [#1450](https://github.com/jimp-dev/jimp/pull/1450) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - docs: document the Vite config the wasm plugins need [#1436](https://github.com/jimp-dev/jimp/pull/1436) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `@jimp/docs`, `jimp`, `@jimp/types`, `@jimp/utils`, `@jimp/js-gif`, `@jimp/js-tiff`, `@jimp/plugin-color`, `@jimp/plugin-crop`, `@jimp/plugin-flip`, `@jimp/plugin-print`, `@jimp/plugin-quantize`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/wasm-avif`, `@jimp/wasm-jpeg`, `@jimp/wasm-png`, `@jimp/wasm-webp`
  - Fix Buffer in Deno, Workers, and browsers without a polyfill [#1444](https://github.com/jimp-dev/jimp/pull/1444) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-shadow`
  - fix(plugin-shadow): draw the shadow under the image, not over it [#1449](https://github.com/jimp-dev/jimp/pull/1449) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/js-bmp`, `@jimp/js-gif`, `@jimp/js-jpeg`, `@jimp/js-png`, `@jimp/js-tiff`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-mask`, `@jimp/plugin-print`, `@jimp/plugin-quantize`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/wasm-avif`, `@jimp/wasm-jpeg`, `@jimp/wasm-png`
  - docs: remove v0 leftovers from the jimp and plugin READMEs [#1447](https://github.com/jimp-dev/jimp/pull/1447) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-hash`
  - Keep the browser bundle valid after Babel preset-env [#1442](https://github.com/jimp-dev/jimp/pull/1442) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/config-vitest`, `@jimp/docs`, `jimp`, `@jimp/js-png`
  - fix(js-png): use pngjs's browser build in browser bundles [#1445](https://github.com/jimp-dev/jimp/pull/1445) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/wasm-avif`, `@jimp/wasm-jpeg`, `@jimp/wasm-png`, `@jimp/wasm-webp`
  - test(wasm-*): cover getBuffer with no options and empty options [#1443](https://github.com/jimp-dev/jimp/pull/1443) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - fix(wasm-*): load codec wasm from disk in Node for all wasm plugins [#1431](https://github.com/jimp-dev/jimp/pull/1431) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/wasm-png`
  - fix(wasm-png): use the single-threaded oxipng codec so webpack 5 can bundle it [#1440](https://github.com/jimp-dev/jimp/pull/1440) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/config-typescript`, `jimp`
  - fix: inline sources in published source maps [#1437](https://github.com/jimp-dev/jimp/pull/1437) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/docs`, `jimp`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-flip`, `@jimp/plugin-mask`, `@jimp/plugin-print`, `@jimp/plugin-resize`
  - docs: fix stale v0 examples and params in the API docs [#1438](https://github.com/jimp-dev/jimp/pull/1438) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `jimp`
  - Accept plain string paths in Jimp#write [#1434](https://github.com/jimp-dev/jimp/pull/1434) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - Pass decoder options to the underlying decoder when reading from files and buffers, not just URLs [#1357](https://github.com/jimp-dev/jimp/pull/1357) ([@DefiantCatgirl](https://github.com/DefiantCatgirl) [@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/config-vitest`
  - fix: resolve dev build failures and docs import issues [#1384](https://github.com/jimp-dev/jimp/pull/1384) ([@joras-droid](https://github.com/joras-droid) [@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `jimp`, `@jimp/plugin-quantize`
  - Respect Buffer view bounds in fromBitmap and quantize [#1419](https://github.com/jimp-dev/jimp/pull/1419) ([@Shrusti-pk](https://github.com/Shrusti-pk) [@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/wasm-webp`
  - fix(@jimp/wasm-webp): initialize WebP WASM from disk in Node [#1403](https://github.com/jimp-dev/jimp/pull/1403) ([@Aniketiitk21](https://github.com/Aniketiitk21) [@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/plugin-color`
  - fix(plugin-color): compute sepia output channels from the original pixel [#1412](https://github.com/jimp-dev/jimp/pull/1412) ([@spokodev](https://github.com/spokodev) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🏠 Internal

- `@jimp/config-eslint`, `@jimp/docs`
  - Upgrade pnpm to 12 and fix the docs deploy [#1428](https://github.com/jimp-dev/jimp/pull/1428) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 📝 Documentation

- docs: fix dead links [#1377](https://github.com/jimp-dev/jimp/pull/1377) ([@rxliuli](https://github.com/rxliuli))
- `@jimp/docs`
  - docs: bring the docs up to date with main [#1543](https://github.com/jimp-dev/jimp/pull/1543) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - docs: document drawing with @jimp/plugin-draw [#1542](https://github.com/jimp-dev/jimp/pull/1542) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - chore(docs): upgrade the docs site to Astro 7 and Starlight 0.43 [#1540](https://github.com/jimp-dev/jimp/pull/1540) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - docs: document animated GIFs and multi-page TIFFs [#1531](https://github.com/jimp-dev/jimp/pull/1531) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - docs: redesign the docs site and document Jimp 2.0 [#1527](https://github.com/jimp-dev/jimp/pull/1527) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - docs: add share image and favicon for the docs site [#1426](https://github.com/jimp-dev/jimp/pull/1426) ([@crutchcorn](https://github.com/crutchcorn) [@hipstersmoothie](https://github.com/hipstersmoothie))
  - docs: correct example code [#1390](https://github.com/jimp-dev/jimp/pull/1390) ([@MentalGear](https://github.com/MentalGear))
  - docs: fix dead link in writing-plugins.mdx [#1368](https://github.com/jimp-dev/jimp/pull/1368) ([@pano9000](https://github.com/pano9000))
  - docs: fix dead link in getting-started.mdx [#1369](https://github.com/jimp-dev/jimp/pull/1369) ([@pano9000](https://github.com/pano9000))
  - docs: add blit example to v1 migration guide [#1416](https://github.com/jimp-dev/jimp/pull/1416) ([@ryanchou1994](https://github.com/ryanchou1994))
  - fix: small typo in doc [#1380](https://github.com/jimp-dev/jimp/pull/1380) ([@2002Bishwajeet](https://github.com/2002Bishwajeet))
- `@jimp/docs`, `jimp`
  - docs: fix resize examples to follow ResizeOptionsSchema [#1370](https://github.com/jimp-dev/jimp/pull/1370) ([@RogerBambinetti](https://github.com/RogerBambinetti))

#### 🔩 Dependency Updates

- `@jimp/config-vitest`, `@jimp/core`, `@jimp/diff`, `@jimp/file-ops`, `jimp`, `@jimp/test-utils`, `@jimp/types`, `@jimp/utils`, `@jimp/js-bmp`, `@jimp/js-gif`, `@jimp/js-ico`, `@jimp/js-jpeg`, `@jimp/js-png`, `@jimp/js-tiff`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-border`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-hash`, `@jimp/plugin-mask`, `@jimp/plugin-morphology`, `@jimp/plugin-print`, `@jimp/plugin-quantize`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/wasm-avif`, `@jimp/wasm-jpeg`, `@jimp/wasm-jpeg2000`, `@jimp/wasm-jxl`, `@jimp/wasm-png`, `@jimp/wasm-svg`, `@jimp/wasm-webp`
  - chore(deps): upgrade dev tooling to fix Dependabot alerts [#1525](https://github.com/jimp-dev/jimp/pull/1525) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 17

- [@MentalGear](https://github.com/MentalGear)
- [@Shrusti-pk](https://github.com/Shrusti-pk)
- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Bishwajeet Parhi ([@2002Bishwajeet](https://github.com/2002Bishwajeet))
- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))
- Defiant Catgirl ([@DefiantCatgirl](https://github.com/DefiantCatgirl))
- droid ([@joras-droid](https://github.com/joras-droid))
- Goran ([@goranai](https://github.com/goranai))
- Hanbin Tan ([@hskl18](https://github.com/hskl18))
- Matt Van Horn ([@mvanhorn](https://github.com/mvanhorn))
- Panagiotis Papadopoulos ([@pano9000](https://github.com/pano9000))
- Roger Bambinetti ([@RogerBambinetti](https://github.com/RogerBambinetti))
- rxliuli ([@rxliuli](https://github.com/rxliuli))
- Sandhan Aniket Ramdas ([@Aniketiitk21](https://github.com/Aniketiitk21))
- Spoko Dev ([@spokodev](https://github.com/spokodev))
- Vilim Lendvaj ([@viliml](https://github.com/viliml))
- 周耕毅（Ryan Chou） ([@ryanchou1994](https://github.com/ryanchou1994))

---

# v1.7.0 (Sat Nov 21 2026)

:tada: This release contains work from a new contributor! :tada:

Thank you, Ilyas Landikov ([@ilandikov](https://github.com/ilandikov)), for all your work!

#### 🚀 Enhancement

- `@jimp/types`, `@jimp/plugin-blit`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-mask`, `@jimp/plugin-print`, `@jimp/plugin-quantize`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/wasm-avif`, `@jimp/wasm-jpeg`, `@jimp/wasm-png`, `@jimp/wasm-webp`
  - Migrate to Zod v4 [#1420](https://github.com/jimp-dev/jimp/pull/1420) ([@ilandikov](https://github.com/ilandikov))

#### Authors: 1

- Ilyas Landikov ([@ilandikov](https://github.com/ilandikov))

---

# v1.5.0 (Mon Sep 09 2024)

### Release Notes

#### Add support for image decoder options ([#1336](https://github.com/jimp-dev/jimp/pull/1336))

Can now have options for the underlying image codecs

![CleanShot 2024-09-07 at 15 26 41](https://github.com/user-attachments/assets/26fa1a48-f463-455c-89f9-9c99f9fcb3d1)

---

#### 🚀 Enhancement

- `@jimp/core`, `@jimp/types`, `@jimp/js-bmp`, `@jimp/js-jpeg`, `@jimp/js-png`
  - Add support for image decoder options [#1336](https://github.com/jimp-dev/jimp/pull/1336) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- `jimp`
  - add readme to jimp ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.5.0 (Sat Sep 07 2024)

### Release Notes

#### Add support for image decoder options ([#1336](https://github.com/jimp-dev/jimp/pull/1336))

Can now have options for the underlying image codecs

![CleanShot 2024-09-07 at 15 26 41](https://github.com/user-attachments/assets/26fa1a48-f463-455c-89f9-9c99f9fcb3d1)

---

#### 🚀 Enhancement

- `@jimp/core`, `@jimp/types`, `@jimp/js-bmp`, `@jimp/js-jpeg`, `@jimp/js-png`
  - Add support for image decoder options [#1336](https://github.com/jimp-dev/jimp/pull/1336) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.4.0 (Sat Sep 07 2024)

#### 🚀 Enhancement

- `@jimp/core`
  - Let Jimp.read accept a Buffer [#1332](https://github.com/jimp-dev/jimp/pull/1332) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`
  - Export measure text functions from jimp package [#1333](https://github.com/jimp-dev/jimp/pull/1333) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - Add JimpMime constant [#1331](https://github.com/jimp-dev/jimp/pull/1331) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - add JimpInstance type [#1330](https://github.com/jimp-dev/jimp/pull/1330) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🐛 Bug Fix

- `@jimp/utils`, `@jimp/plugin-print`
  - Bind callback to image instance [#1335](https://github.com/jimp-dev/jimp/pull/1335) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- `@jimp/core`, `@jimp/types`, `@jimp/utils`, `@jimp/plugin-print`, `@jimp/plugin-quantize`, `@jimp/wasm-webp`
  - fix docs build ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 📝 Documentation

- `@jimp/plugin-blit`, `@jimp/plugin-print`
  - Misc doc updates [#1334](https://github.com/jimp-dev/jimp/pull/1334) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.3.0 (Wed Sep 04 2024)

#### 🚀 Enhancement

- `@jimp/core`
  - Add width/height/mime getters [#1327](https://github.com/jimp-dev/jimp/pull/1327) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.2.0 (Tue Sep 03 2024)

#### 🚀 Enhancement

- `@jimp/core`, `jimp`, `@jimp/plugin-print`, `@jimp/wasm-avif`, `@jimp/wasm-jpeg`, `@jimp/wasm-png`, `@jimp/wasm-webp`
  - Add webp, avid, png, jpeg WASM format plugin [#1324](https://github.com/jimp-dev/jimp/pull/1324) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.1.5 (Mon Sep 02 2024)

#### 🐛 Bug Fix

- `@jimp/types`, `@jimp/plugin-print`
  - Fix loading fonts in web-worker [#1322](https://github.com/jimp-dev/jimp/pull/1322) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- `@jimp/core`, `jimp`
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

- `jimp`
  - improve bundler integration [#1321](https://github.com/jimp-dev/jimp/pull/1321) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.1.3 (Mon Sep 02 2024)

#### 🐛 Bug Fix

- `jimp`
  - Include browser files [#1320](https://github.com/jimp-dev/jimp/pull/1320) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `@jimp/diff`, `@jimp/file-ops`, `jimp`, `@jimp/test-utils`, `@jimp/types`, `@jimp/utils`, `@jimp/js-bmp`, `@jimp/js-gif`, `@jimp/js-jpeg`, `@jimp/js-png`, `@jimp/js-tiff`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-hash`, `@jimp/plugin-mask`, `@jimp/plugin-print`, `@jimp/plugin-quantize`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`
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

- fix incorrect usage in docs [#1318](https://github.com/jimp-dev/jimp/pull/1318) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/plugin-blur`, `@jimp/plugin-shadow`
  - Fix blur on transparent images [#1315](https://github.com/jimp-dev/jimp/pull/1315) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-rotate`
  - Rotate short circuit [#1317](https://github.com/jimp-dev/jimp/pull/1317) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-color`
  - Fix pixelate not working well with alpha channel [#1314](https://github.com/jimp-dev/jimp/pull/1314) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`, `@jimp/plugin-color`
  - Make brightness function behave like other implementations [#1312](https://github.com/jimp-dev/jimp/pull/1312) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-print`
  - Fix printing string when words are longer than max-width [#1313](https://github.com/jimp-dev/jimp/pull/1313) ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - Fix using dirname in print plugin [#1310](https://github.com/jimp-dev/jimp/pull/1310) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/diff`
  - Jimp.diff() to make real resize before image compare [#1311](https://github.com/jimp-dev/jimp/pull/1311) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.1.1 (Sun Sep 01 2024)

#### 🐛 Bug Fix

- `@jimp/core`
  - fix file-type import for esm projects [#1309](https://github.com/jimp-dev/jimp/pull/1309) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.1.0 (Sun Sep 01 2024)

#### 🚀 Enhancement

- `jimp`, `@jimp/plugin-quantize`
  - Add quantize plugin [#1307](https://github.com/jimp-dev/jimp/pull/1307) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- Update browser docs ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Add migration guide ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix docs upload path ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `@jimp/diff`, `@jimp/file-ops`, `jimp`, `@jimp/test-utils`, `@jimp/types`, `@jimp/utils`, `@jimp/js-bmp`, `@jimp/js-jpeg`, `@jimp/js-png`, `@jimp/js-tiff`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-mask`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`
  - upgrade tshy ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/js-jpeg`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-mask`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`
  - update more docs ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.0.5 (Sun Sep 01 2024)

:tada: This release contains work from a new contributor! :tada:

Thank you, Ben McCann ([@benmccann](https://github.com/benmccann)), for all your work!

#### 🐛 Bug Fix

- `@jimp/plugin-hash`
  - add missing dependency [#1306](https://github.com/jimp-dev/jimp/pull/1306) ([@benmccann](https://github.com/benmccann) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- fix build command ([@hipstersmoothie](https://github.com/hipstersmoothie))
- build browser bundle when building ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fixing docs deploy ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `jimp`
  - fix browser build ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Ben McCann ([@benmccann](https://github.com/benmccann))

---

# v1.0.4 (Sat Aug 31 2024)

#### ⚠️ Pushed to `main`

- fix release script (lisowski54@gmail.com)

#### Authors: 1

- Andrew Lisowski (lisowski54@gmail.com)

---

# v1.0.3 (Sat Aug 31 2024)

:tada: This release contains work from a new contributor! :tada:

Thank you, Ben McCann ([@benmccann](https://github.com/benmccann)), for all your work!

#### 🐛 Bug Fix

- `@jimp/core`, `jimp`, `@jimp/plugin-cover`, `@jimp/plugin-dither`, `@jimp/plugin-print`
  - remove hundreds of unused dependencies [#1302](https://github.com/jimp-dev/jimp/pull/1302) ([@benmccann](https://github.com/benmccann) [@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `@jimp/diff`, `@jimp/file-ops`, `jimp`, `@jimp/test-utils`, `@jimp/types`, `@jimp/utils`, `@jimp/js-bmp`, `@jimp/js-gif`, `@jimp/js-jpeg`, `@jimp/js-png`, `@jimp/js-tiff`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-hash`, `@jimp/plugin-mask`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`
  - Fix build [#1303](https://github.com/jimp-dev/jimp/pull/1303) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- add build ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix name ([@hipstersmoothie](https://github.com/hipstersmoothie))
- deploy docs ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `@jimp/diff`, `@jimp/file-ops`, `jimp`, `@jimp/test-utils`, `@jimp/types`, `@jimp/utils`, `@jimp/js-bmp`, `@jimp/js-gif`, `@jimp/js-jpeg`, `@jimp/js-png`, `@jimp/js-tiff`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-hash`, `@jimp/plugin-mask`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`
  - add clean script ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/test-utils`
  - fix build ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Ben McCann ([@benmccann](https://github.com/benmccann))

---

# v1.0.0 (Sat Aug 31 2024)

:tada: This release contains work from a new contributor! :tada:

Thank you, Juan Pablo Garcia Ripa ([@Sarabadu](https://github.com/Sarabadu)), for all your work!

#### 💥 Breaking Change

- `@jimp/core`, `@jimp/diff`, `@jimp/file-ops`, `jimp`, `@jimp/test-utils`, `@jimp/types`, `@jimp/utils`, `@jimp/js-bmp`, `@jimp/js-gif`, `@jimp/js-jpeg`, `@jimp/js-png`, `@jimp/js-tiff`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-hash`, `@jimp/plugin-mask`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`
  - V1 [#1285](https://github.com/jimp-dev/jimp/pull/1285) ([@Sarabadu](https://github.com/Sarabadu) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- udpate auto ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add plugins ([@hipstersmoothie](https://github.com/hipstersmoothie))
- remove CI release ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `@jimp/diff`, `@jimp/file-ops`, `jimp`, `@jimp/test-utils`, `@jimp/types`, `@jimp/utils`, `@jimp/js-bmp`, `@jimp/js-gif`, `@jimp/js-jpeg`, `@jimp/js-png`, `@jimp/js-tiff`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-hash`, `@jimp/plugin-mask`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`
  - set side effects ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - fix versions ([@hipstersmoothie](https://github.com/hipstersmoothie))
  - add publish config ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 📝 Documentation

- `@jimp/plugin-cover`
  - remove outdated docs [#1301](https://github.com/jimp-dev/jimp/pull/1301) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Juan Pablo Garcia Ripa ([@Sarabadu](https://github.com/Sarabadu))

---

# v0.22.12 (Fri Feb 23 2024)

:tada: This release contains work from a new contributor! :tada:

Thank you, Dathan ([@DLiblik](https://github.com/DLiblik)), for all your work!

#### 🚀 Enhancement

- Automatic release [#1277](https://github.com/jimp-dev/jimp/pull/1277) ([@hipstersmoothie](https://github.com/hipstersmoothie) [@github-actions[bot]](https://github.com/github-actions[bot]))

#### 🐛 Bug Fix

- `@jimp/core`
  - Improve color operations performance [#1263](https://github.com/jimp-dev/jimp/pull/1263) ([@DLiblik](https://github.com/DLiblik) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 3

- [@github-actions[bot]](https://github.com/github-actions[bot])
- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Dathan ([@DLiblik](https://github.com/DLiblik))

---

# v0.22.11 (Fri Feb 23 2024)

:tada: This release contains work from new contributors! :tada:

Thanks for all your work!

:heart: Rob Juurlink ([@kozmoz](https://github.com/kozmoz))

:heart: null[@AnotherPillow](https://github.com/AnotherPillow)

#### 🚀 Enhancement

- `@jimp/plugin-print`
  - Add \n support for image.print #865 [#1265](https://github.com/jimp-dev/jimp/pull/1265) (juurr00@juurlink.org [@kozmoz](https://github.com/kozmoz) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### 📝 Documentation

- `jimp`
  - Fix it's/its, see description. [#1267](https://github.com/jimp-dev/jimp/pull/1267) ([@AnotherPillow](https://github.com/AnotherPillow))

#### Authors: 4

- [@AnotherPillow](https://github.com/AnotherPillow)
- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- juurr00 (juurr00@juurlink.org)
- Rob Juurlink ([@kozmoz](https://github.com/kozmoz))

---

# v0.22.10 (Wed Jul 26 2023)

:tada: This release contains work from a new contributor! :tada:

Thank you, Zach Stevenson ([@stevezac-osu](https://github.com/stevezac-osu)), for all your work!

#### 🚀 Enhancement

- `@jimp/core`
  - Encoder for GIF provides a Promise to getBuffer when a string, Buffer, or Uint8Array is expected [#1239](https://github.com/jimp-dev/jimp/pull/1239) ([@stevezac-osu](https://github.com/stevezac-osu) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Zach Stevenson ([@stevezac-osu](https://github.com/stevezac-osu))

---

# v0.22.9 (Wed Jul 26 2023)

:tada: This release contains work from new contributors! :tada:

Thanks for all your work!

:heart: Artur ([@Artur-](https://github.com/Artur-))

:heart: Tim O. (macer) ([@gitmacer](https://github.com/gitmacer))

:heart: aab ([@aabccd021](https://github.com/aabccd021))

:heart: Zsolt Medgyesi ([@zmedgyes](https://github.com/zmedgyes))

:heart: Nicolas Morel ([@Marsup](https://github.com/Marsup))

#### 🚀 Enhancement

- Support commonjs default export [#1225](https://github.com/jimp-dev/jimp/pull/1225) ([@zmedgyes](https://github.com/zmedgyes))
- `jimp`, `@jimp/plugin-print`
  - Add € to extended Fonts [#1249](https://github.com/jimp-dev/jimp/pull/1249) ([@gitmacer](https://github.com/gitmacer))
- `@jimp/gif`
  - chore: upgrade gifwrap [#1222](https://github.com/jimp-dev/jimp/pull/1222) ([@Marsup](https://github.com/Marsup))

#### 🐛 Bug Fix

- `@jimp/core`
  - fix: Remove dependency on mkdirp [#1248](https://github.com/jimp-dev/jimp/pull/1248) ([@Artur-](https://github.com/Artur-))

#### 📝 Documentation

- delete cli link from readme [#1250](https://github.com/jimp-dev/jimp/pull/1250) ([@aabccd021](https://github.com/aabccd021))

#### Authors: 5

- aab ([@aabccd021](https://github.com/aabccd021))
- Artur ([@Artur-](https://github.com/Artur-))
- Nicolas Morel ([@Marsup](https://github.com/Marsup))
- Tim O. (macer) ([@gitmacer](https://github.com/gitmacer))
- Zsolt Medgyesi ([@zmedgyes](https://github.com/zmedgyes))

---

# v0.22.8 (Thu May 11 2023)

:tada: This release contains work from new contributors! :tada:

Thanks for all your work!

:heart: Sjoerd ([@sjoerd108](https://github.com/sjoerd108))

:heart: null[@php4fan](https://github.com/php4fan)

:heart: null[@JunkMeal](https://github.com/JunkMeal)

#### 🚀 Enhancement

- `@jimp/core`, `jimp`
  - Composite: don't write to null pixels [#1226](https://github.com/jimp-dev/jimp/pull/1226) ([@sjoerd108](https://github.com/sjoerd108))
- `@jimp/plugin-color`
  - Fix: convolute not defaulting to 0, 0 as starting point [#1228](https://github.com/jimp-dev/jimp/pull/1228) ([@sjoerd108](https://github.com/sjoerd108))
- `@jimp/plugin-rotate`
  - Fix: rotate resize param on multiples of 90 [#1229](https://github.com/jimp-dev/jimp/pull/1229) ([@sjoerd108](https://github.com/sjoerd108))

#### 🐛 Bug Fix

- `@jimp/plugin-crop`, `@jimp/test-utils`
  - Fix autocrop mixing up east and west [#1227](https://github.com/jimp-dev/jimp/pull/1227) ([@sjoerd108](https://github.com/sjoerd108))

#### 📝 Documentation

- Fixed typo in README [#1215](https://github.com/jimp-dev/jimp/pull/1215) ([@php4fan](https://github.com/php4fan))
- `jimp`
  - Changing the Hiero url [#1213](https://github.com/jimp-dev/jimp/pull/1213) ([@JunkMeal](https://github.com/JunkMeal))

#### Authors: 3

- [@JunkMeal](https://github.com/JunkMeal)
- [@php4fan](https://github.com/php4fan)
- Sjoerd ([@sjoerd108](https://github.com/sjoerd108))

---

# v0.22.7 (Sat Feb 25 2023)

:tada: This release contains work from a new contributor! :tada:

Thank you, MD KHAIRUL ISLAM ([@black-turtle](https://github.com/black-turtle)), for all your work!

### Release Notes

#### use matrix rotate, if rotate angle is multiple of 90 degrees ([#1209](https://github.com/jimp-dev/jimp/pull/1209))

Fixes a bug where rotating by 90 degrees introduced extra pixels

---

#### 🐛 Bug Fix

- `@jimp/plugin-rotate`
  - use matrix rotate, if rotate angle is multiple of 90 degrees [#1209](https://github.com/jimp-dev/jimp/pull/1209) ([@black-turtle](https://github.com/black-turtle))

#### Authors: 1

- MD KHAIRUL ISLAM ([@black-turtle](https://github.com/black-turtle))

---

# v0.22.6 (Fri Feb 24 2023)

:tada: This release contains work from a new contributor! :tada:

Thank you, Daniell ([@daniellwdb](https://github.com/daniellwdb)), for all your work!

#### 🐛 Bug Fix

- `jimp`, `@jimp/plugin-color`
  - Export ColorActionName enum [#1205](https://github.com/jimp-dev/jimp/pull/1205) ([@daniellwdb](https://github.com/daniellwdb))

#### Authors: 1

- Daniell ([@daniellwdb](https://github.com/daniellwdb))

---

# v0.22.5 (Tue Feb 21 2023)

:tada: This release contains work from new contributors! :tada:

Thanks for all your work!

:heart: Charly Poirier ([@charlypoirier](https://github.com/charlypoirier))

:heart: Ihor Bodnarchuk ([@ihorbond](https://github.com/ihorbond))

#### 🐛 Bug Fix

- `@jimp/plugin-resize`
  - Fix resizing issue with Jimp.AUTO [#1202](https://github.com/jimp-dev/jimp/pull/1202) ([@charlypoirier](https://github.com/charlypoirier))

#### 📝 Documentation

- Update README.md [#1203](https://github.com/jimp-dev/jimp/pull/1203) ([@ihorbond](https://github.com/ihorbond) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 3

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Charly Poirier ([@charlypoirier](https://github.com/charlypoirier))
- Ihor Bodnarchuk ([@ihorbond](https://github.com/ihorbond))

---

# v0.22.4 (Tue Feb 07 2023)

#### 🚀 Enhancement

- `@jimp/core`, `@jimp/plugin-color`
  - update tinycolor2 [#1187](https://github.com/jimp-dev/jimp/pull/1187) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.22.3 (Mon Feb 06 2023)

#### 🚀 Enhancement

- `jimp`
  - Fix browser build [#1184](https://github.com/jimp-dev/jimp/pull/1184) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.22.2 (Mon Feb 06 2023)

:tada: This release contains work from new contributors! :tada:

Thanks for all your work!

:heart: Ollie Chick ([@olliechick](https://github.com/olliechick))

:heart: Andrey Kutejko ([@andy128k](https://github.com/andy128k))

#### 🚀 Enhancement

- `@jimp/core`
  - Change type of mime from string to string|number to fix #990 [#1182](https://github.com/jimp-dev/jimp/pull/1182) ([@olliechick](https://github.com/olliechick))

#### 📝 Documentation

- Remove mentioning of `favicons` [#1176](https://github.com/jimp-dev/jimp/pull/1176) ([@andy128k](https://github.com/andy128k))

#### Authors: 2

- Andrey Kutejko ([@andy128k](https://github.com/andy128k))
- Ollie Chick ([@olliechick](https://github.com/olliechick))

---

# v0.22.1 (Mon Feb 06 2023)

#### 🚀 Enhancement

- `@jimp/core`
  - upgrade mkdrip [#1173](https://github.com/jimp-dev/jimp/pull/1173) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🏠 Internal

- Windows scripts [#1172](https://github.com/jimp-dev/jimp/pull/1172) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `@jimp/custom`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-gaussian`, `@jimp/plugin-invert`, `@jimp/plugin-mask`, `@jimp/plugin-normalize`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-scale`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/plugins`, `@jimp/test-utils`, `@jimp/bmp`, `@jimp/gif`, `@jimp/jpeg`, `@jimp/png`, `@jimp/tiff`, `@jimp/types`, `@jimp/utils`
  - rename master to main [#1169](https://github.com/jimp-dev/jimp/pull/1169) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.22.0 (Mon Feb 06 2023)

### Release Notes

#### Switch to fetch for url requests ([#1165](https://github.com/jimp-dev/jimp/pull/1165))

The underlying library for fetching images has been changed.

`loadFromURL` can take a set of options. When in the node environment all those options are passed to phin. Any options used to pass to `phin` that are not supported by the `fetch` API will stop working.

---

#### 💥 Breaking Change

- `@jimp/core`
  - Switch to fetch for url requests [#1165](https://github.com/jimp-dev/jimp/pull/1165) ([@danielholmes](https://github.com/danielholmes))

#### 🏠 Internal

- `@jimp/core`, `@jimp/custom`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-mask`, `@jimp/plugin-normalize`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/test-utils`, `@jimp/bmp`, `@jimp/gif`, `@jimp/jpeg`, `@jimp/png`, `@jimp/tiff`
  - switch from should to expect [#1163](https://github.com/jimp-dev/jimp/pull/1163) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `@jimp/plugin-resize`
  - delete CLI package [#1162](https://github.com/jimp-dev/jimp/pull/1162) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-mask`, `@jimp/plugin-normalize`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/test-utils`, `@jimp/bmp`, `@jimp/gif`, `@jimp/jpeg`, `@jimp/png`, `@jimp/tiff`
  - Change test matching strategy to include all test files [#1161](https://github.com/jimp-dev/jimp/pull/1161) ([@danielholmes](https://github.com/danielholmes))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Daniel Holmes ([@danielholmes](https://github.com/danielholmes))

---

# v0.21.2 (Sun Feb 05 2023)

:tada: This release contains work from a new contributor! :tada:

Thank you, Daniel Holmes ([@danielholmes](https://github.com/danielholmes)), for all your work!

#### 🚀 Enhancement

- run workflow for PRs [#1156](https://github.com/jimp-dev/jimp/pull/1156) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🐛 Bug Fix

- `@jimp/core`, `@jimp/plugin-resize`
  - Change some exports to move towards more ESM compatibility [#1154](https://github.com/jimp-dev/jimp/pull/1154) ([@danielholmes](https://github.com/danielholmes))

#### 🏠 Internal

- Workflow fix [#1159](https://github.com/jimp-dev/jimp/pull/1159) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Daniel Holmes ([@danielholmes](https://github.com/danielholmes))

---

# v0.21.1 (Sun Feb 05 2023)

#### 🚀 Enhancement

- `@jimp/core`
  - remove export hack [#1153](https://github.com/jimp-dev/jimp/pull/1153) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.21.0 (Sun Feb 05 2023)

### Release Notes

#### Babel Refactor ([#1149](https://github.com/jimp-dev/jimp/pull/1149))

Marking this as a "breaking release" because it might change what deps need to be installed.

All modules should be exported as valid cjs and esm

![CleanShot 2023-02-04 at 18 19 27](https://user-images.githubusercontent.com/1192452/216798157-664cc430-7846-432d-84cf-26e8d8ba9e10.png)

---

#### 💥 Breaking Change

- `@jimp/core`, `@jimp/custom`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-gaussian`, `@jimp/plugin-invert`, `@jimp/plugin-mask`, `@jimp/plugin-normalize`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-scale`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/plugins`, `@jimp/test-utils`, `@jimp/bmp`, `@jimp/gif`, `@jimp/jpeg`, `@jimp/png`, `@jimp/tiff`, `@jimp/types`, `@jimp/utils`
  - Babel Refactor [#1149](https://github.com/jimp-dev/jimp/pull/1149) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.20.2 (Sun Feb 05 2023)

#### 🚀 Enhancement

- `@jimp/core`
  - add phash to types [#1144](https://github.com/jimp-dev/jimp/pull/1144) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.20.1 (Sun Feb 05 2023)

#### ⚠️ Pushed to `main`

- add ability to comment on issues ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.18.0 (Sun Feb 05 2023)

:tada: This release contains work from a new contributor! :tada:

Thank you, nopeless ([@nopeless](https://github.com/nopeless)), for all your work!

### Release Notes

#### switch from browserify to webpack ([#1140](https://github.com/jimp-dev/jimp/pull/1140))

This PR can be considered a breaking change as it remove the `jimp.min.js` file.

Instead there is now only the `jimp.js` file and we ship source maps for it.

We also configured the `browser` field so jimp will be automatically bundled better

---

#### 💥 Breaking Change

- `@jimp/core`, `@jimp/custom`, `jimp`, `@jimp/test-utils`, `@jimp/png`
  - switch from browserify to webpack [#1140](https://github.com/jimp-dev/jimp/pull/1140) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🚀 Enhancement

- add more auto plugins [#1141](https://github.com/jimp-dev/jimp/pull/1141) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/tiff`
  - Update utif [#1143](https://github.com/jimp-dev/jimp/pull/1143) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`
  - Throw error instead of resolving to string [#1138](https://github.com/jimp-dev/jimp/pull/1138) ([@nopeless](https://github.com/nopeless))

#### ⚠️ Pushed to `main`

- update tokens ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add permission ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add protected branch plugin ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- nopeless ([@nopeless](https://github.com/nopeless))

---

# v0.17.8 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- `@jimp/cli`, `@jimp/custom`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-gaussian`, `@jimp/plugin-invert`, `@jimp/plugin-mask`, `@jimp/plugin-normalize`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-scale`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/plugins`, `@jimp/test-utils`, `@jimp/bmp`, `@jimp/gif`, `@jimp/jpeg`, `@jimp/png`, `@jimp/tiff`, `@jimp/types`, `@jimp/utils`
  - Add repo to all packages [#1137](https://github.com/jimp-dev/jimp/pull/1137) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.17.6 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- `@jimp/plugin-color`
  - Fix types not assignable to 'ColorActionName'. [#1086](https://github.com/jimp-dev/jimp/pull/1086) ([@lucyyyyyyy](https://github.com/lucyyyyyyy) [@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-print`
  - Update ordering of overrides so ReturnType pulls correct typing. [#1077](https://github.com/jimp-dev/jimp/pull/1077) ([@dcbartlett](https://github.com/dcbartlett) [@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`
  - fix(jimp.d.ts): fix getBase64 and getBase64Async function arguments [#1094](https://github.com/jimp-dev/jimp/pull/1094) ([@pkjy](https://github.com/pkjy))
- `jimp`, `@jimp/plugin-rotate`
  - fix documentation about rotation direction. [#1062](https://github.com/jimp-dev/jimp/pull/1062) ([@fabb](https://github.com/fabb))

#### Authors: 5

- [@fabb](https://github.com/fabb)
- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Dennis Bartlett ([@dcbartlett](https://github.com/dcbartlett))
- Lucy ([@lucyyyyyyy](https://github.com/lucyyyyyyy))
- 彭君怡 ([@pkjy](https://github.com/pkjy))

---

# v0.17.5 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- `@jimp/core`
  - Fix dos attack vulnerable [#1136](https://github.com/jimp-dev/jimp/pull/1136) ([@sjoerd108](https://github.com/sjoerd108) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Sjoerd ([@sjoerd108](https://github.com/sjoerd108))

---

# v0.17.4 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- `@jimp/core`
  - fix commonjs require [#1020](https://github.com/jimp-dev/jimp/pull/1020) ([@fratzinger](https://github.com/fratzinger) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- [@fratzinger](https://github.com/fratzinger)
- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.17.3 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- `@jimp/core`, `@jimp/plugin-color`
  - Fix EDGE_WRAP overwriting X with Y when Y < 0 [#1135](https://github.com/jimp-dev/jimp/pull/1135) ([@sjoerd108](https://github.com/sjoerd108) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Sjoerd ([@sjoerd108](https://github.com/sjoerd108))

---

# v0.17.2 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- `@jimp/core`, `@jimp/plugin-print`
  - remove extra bm-font dep [#1134](https://github.com/jimp-dev/jimp/pull/1134) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.17.1 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- `@jimp/plugin-print`
  - use a consistent text layouting algorithm [#1133](https://github.com/jimp-dev/jimp/pull/1133) ([@iliazeus](https://github.com/iliazeus) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Ilia Pozdnyakov ([@iliazeus](https://github.com/iliazeus))

---

# v0.17.0 (Sat Feb 04 2023)

### Release Notes

#### update jpeg-js ([#1131](https://github.com/jimp-dev/jimp/pull/1131))

This release changes the minimum node version from 8 to 16

---

#### 🚀 Enhancement

- `@jimp/jpeg`
  - update jpeg-js [#1131](https://github.com/jimp-dev/jimp/pull/1131) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.16.3 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- Bump qs from 6.5.2 to 6.5.3 [#1130](https://github.com/jimp-dev/jimp/pull/1130) ([@dependabot[bot]](https://github.com/dependabot[bot]))
- Fixed typo in the bug report template [#1109](https://github.com/jimp-dev/jimp/pull/1109) ([@danielholmes](https://github.com/danielholmes))
- `@jimp/plugin-crop`
  - fixed plugin-crop full width slices math [#1073](https://github.com/jimp-dev/jimp/pull/1073) ([@endreszabo](https://github.com/endreszabo))
- `@jimp/core`, `jimp`, `@jimp/plugin-color`
  - Fix edgeHandling types [#1080](https://github.com/jimp-dev/jimp/pull/1080) ([@domdomegg](https://github.com/domdomegg))
- `jimp`
  - Readme: Fix measureText sample code [#1102](https://github.com/jimp-dev/jimp/pull/1102) ([@dkong](https://github.com/dkong) [@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/plugin-print`
  - Update README.md [#1120](https://github.com/jimp-dev/jimp/pull/1120) ([@mfuatnuroglu](https://github.com/mfuatnuroglu))
- `@jimp/core`
  - upgrade file-type [#1108](https://github.com/jimp-dev/jimp/pull/1108) ([@krudos](https://github.com/krudos))

#### ⚠️ Pushed to `main`

- set at org ([@hipstersmoothie](https://github.com/hipstersmoothie))
- set user directly ([@hipstersmoothie](https://github.com/hipstersmoothie))
- try this ([@hipstersmoothie](https://github.com/hipstersmoothie))
- update key ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix patch ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fixing release ([@hipstersmoothie](https://github.com/hipstersmoothie))
- test auto fix ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix repo ([@hipstersmoothie](https://github.com/hipstersmoothie))
- testing ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix token ([@hipstersmoothie](https://github.com/hipstersmoothie))
- actually fix release ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix checkout? ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`, `jimp`, `@jimp/plugin-print`
  - try this ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/cli`, `@jimp/core`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-color`, `@jimp/test-utils`, `@jimp/png`
  - update linting ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/cli`, `@jimp/core`, `@jimp/custom`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-gaussian`, `@jimp/plugin-invert`, `@jimp/plugin-mask`, `@jimp/plugin-normalize`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-scale`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/plugins`, `@jimp/test-utils`, `@jimp/bmp`, `@jimp/gif`, `@jimp/jpeg`, `@jimp/png`, `@jimp/tiff`, `@jimp/types`, `@jimp/utils`
  - upgrade prettier ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🏠 Internal

- only build node 16 [#1127](https://github.com/jimp-dev/jimp/pull/1127) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 📝 Documentation

- it's -> its ;) [#992](https://github.com/jimp-dev/jimp/pull/992) ([@stuarth](https://github.com/stuarth))

#### Authors: 9

- [@dependabot[bot]](https://github.com/dependabot[bot])
- [@krudos](https://github.com/krudos)
- [@mfuatnuroglu](https://github.com/mfuatnuroglu)
- Adam Jones ([@domdomegg](https://github.com/domdomegg))
- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Daniel Holmes ([@danielholmes](https://github.com/danielholmes))
- Dara Kong ([@dkong](https://github.com/dkong))
- Endre Szabo ([@endreszabo](https://github.com/endreszabo))
- Stuart Hinson ([@stuarth](https://github.com/stuarth))

---

# v0.16.2 (Thu Sep 15 2022)

#### 🐛 Bug Fix

- `@jimp/jpeg`
  - Bump jpeg-js over 0.4.4 to avoid cve-2022-25851 [#1093](https://github.com/oliver-moran/jimp/pull/1093) ([@melhadad](https://github.com/melhadad))

#### 📝 Documentation

- docs: toc added for easier reading [#984](https://github.com/oliver-moran/jimp/pull/984) ([@j-d-carmichael](https://github.com/j-d-carmichael))
- feat: add handwritten.js project [#946](https://github.com/oliver-moran/jimp/pull/946) ([@alias-rahil](https://github.com/alias-rahil))
- `@jimp/plugin-fisheye`
  - added the "e" back to @jimp/plugin-fisheye [#947](https://github.com/oliver-moran/jimp/pull/947) ([@mynameismax](https://github.com/mynameismax))

#### Authors: 4

- J D Carmichael ([@j-d-carmichael](https://github.com/j-d-carmichael))
- Max ([@mynameismax](https://github.com/mynameismax))
- Michael Elhadad ([@melhadad](https://github.com/melhadad))
- Rahil Kabani ([@alias-rahil](https://github.com/alias-rahil))

---

# v0.16.1 (Fri Aug 28 2020)

#### 🐛 Bug Fix

- `@jimp/jpeg`
  - upgrade jpeg-js dependency [#933](https://github.com/oliver-moran/jimp/pull/933) (vincentdufrasnes@vincent-dufrasnes [@Chupsy](https://github.com/Chupsy))

#### Authors: 2

- Vincent Dufrasnes ([@Chupsy](https://github.com/Chupsy))
- vincent dufrasnes (vincentdufrasnes@vincent-dufrasnes)

---

# v0.16.0 (Sat Aug 08 2020)

#### 🚀 Enhancement

- `@jimp/plugin-crop`
  - added ability to ignore sides on autocrop [#924](https://github.com/oliver-moran/jimp/pull/924) ([@cbanfiel](https://github.com/cbanfiel))

#### Authors: 1

- Chad Banfield ([@cbanfiel](https://github.com/cbanfiel))

---

# v0.15.0 (Fri Aug 07 2020)

#### 🚀 Enhancement

- `jimp`
  - Remove 'browser' field from main jimp package's package.json. [#918](https://github.com/oliver-moran/jimp/pull/918) ([@Gustavo6046](https://github.com/Gustavo6046))

#### Authors: 1

- Gustavo Ramos Rehermann ([@Gustavo6046](https://github.com/Gustavo6046))

---

# v0.14.0 (Mon Jun 29 2020)

#### 🚀 Enhancement

- `@jimp/core`, `jimp`
  - include Addition (Add) blending mode + Officially drop support for Node 8 [#904](https://github.com/oliver-moran/jimp/pull/904) ([@GlitchyPSIX](https://github.com/GlitchyPSIX))

#### Authors: 1

- GlitchyPSI ([@GlitchyPSIX](https://github.com/GlitchyPSIX))

---

# v0.13.0 (Fri Jun 05 2020)

#### 🚀 Enhancement

- `jimp`, `@jimp/gif`
  - Add single frame encoder for type-gif [#899](https://github.com/oliver-moran/jimp/pull/899) ([@jeffbseeking](https://github.com/jeffbseeking) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### 📝 Documentation

- Fix one file testing instructions [#898](https://github.com/oliver-moran/jimp/pull/898) ([@jeffbseeking](https://github.com/jeffbseeking))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Jeff Bonnes ([@jeffbseeking](https://github.com/jeffbseeking))

---

# v0.12.1 (Tue May 19 2020)

#### 🐛 Bug Fix

- `@jimp/jpeg`
  - update jpeg-js [#892](https://github.com/oliver-moran/jimp/pull/892) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.12.0 (Sun May 17 2020)

### Release Notes

_From #891_

This also drops support for node 6.14.

---

#### 🚀 Enhancement

- Remove compiling polyfills into published code [#891](https://github.com/oliver-moran/jimp/pull/891) ([@danez](https://github.com/danez) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- Fix package.json ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Add readme description ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Daniel Tschinder ([@danez](https://github.com/danez))

---

# v0.11.0 (Fri May 15 2020)

#### 🚀 Enhancement

- `@jimp/cli`, `@jimp/core`, `@jimp/custom`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-gaussian`, `@jimp/plugin-invert`, `@jimp/plugin-mask`, `@jimp/plugin-normalize`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-scale`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/plugins`, `@jimp/test-utils`, `@jimp/bmp`, `@jimp/gif`, `@jimp/jpeg`, `@jimp/png`, `@jimp/tiff`, `@jimp/types`, `@jimp/utils`
  - Removed Core-JS as a dependency. [#882](https://github.com/oliver-moran/jimp/pull/882) ([@EricRabil](https://github.com/EricRabil))

#### 🐛 Bug Fix

- `@jimp/core`
  - Make callback optional for Jimp.rgbaToInt [#889](https://github.com/oliver-moran/jimp/pull/889) ([@HanKruiger](https://github.com/HanKruiger))

#### Authors: 2

- Eric Rabil ([@EricRabil](https://github.com/EricRabil))
- Han Kruiger ([@HanKruiger](https://github.com/HanKruiger))

---

# v0.10.3 (Mon Apr 20 2020)

#### 🐛 Bug Fix

- `@jimp/plugin-flip`
  - Simplify and fix flip [#879](https://github.com/oliver-moran/jimp/pull/879) ([@skalee](https://github.com/skalee))

#### Authors: 1

- Sebastian Skałacki ([@skalee](https://github.com/skalee))

---

# v0.10.2 (Tue Apr 14 2020)

#### 🐛 Bug Fix

- `@jimp/core`, `jimp`
  - Rewrite handling EXIF orientation — add tests, make it plugin-independent [#875](https://github.com/oliver-moran/jimp/pull/875) ([@skalee](https://github.com/skalee))

#### Authors: 1

- Sebastian Skałacki ([@skalee](https://github.com/skalee))

---

# v0.10.1 (Sun Apr 05 2020)

#### 🐛 Bug Fix

- `@jimp/utils`
  - Update package.json [#870](https://github.com/oliver-moran/jimp/pull/870) ([@arcanis](https://github.com/arcanis))

#### 📝 Documentation

- `@jimp/plugin-print`
  - Fix a `loadFont` and case inconsistency of `jimp` [#868](https://github.com/oliver-moran/jimp/pull/868) ([@xinbenlv](https://github.com/xinbenlv))

#### Authors: 2

- Maël Nison ([@arcanis](https://github.com/arcanis))
- xinbenlv ([@xinbenlv](https://github.com/xinbenlv))

---

# v0.10.0 (Mon Mar 30 2020)

#### 🚀 Enhancement

- `@jimp/core`, `@jimp/custom`, `jimp`, `@jimp/jpeg`
  - Properly split constructor and instance types [#867](https://github.com/oliver-moran/jimp/pull/867) ([@forivall](https://github.com/forivall))

#### Authors: 1

- Emily Marigold Klassen ([@forivall](https://github.com/forivall))

---

# v0.9.8 (Sat Mar 28 2020)

#### 🐛 Bug Fix

- `@jimp/plugins`
  - Export the four missing plugins from plugin package [#866](https://github.com/oliver-moran/jimp/pull/866) ([@crutchcorn](https://github.com/crutchcorn))

#### Authors: 1

- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))

---

# v0.9.7 (Fri Mar 27 2020)

#### 🐛 Bug Fix

- Bump acorn from 6.3.0 to 6.4.1 [#854](https://github.com/oliver-moran/jimp/pull/854) ([@dependabot[bot]](https://github.com/dependabot[bot]))
- Bump handlebars from 4.2.1 to 4.7.3 [#861](https://github.com/oliver-moran/jimp/pull/861) ([@dependabot[bot]](https://github.com/dependabot[bot]))
- `jimp`, `@jimp/plugins`
  - Added missing plugins to the types [#863](https://github.com/oliver-moran/jimp/pull/863) ([@crutchcorn](https://github.com/crutchcorn))
- `@jimp/plugin-threshold`
  - Relax version range of plugin-threshold peerDependencies [#859](https://github.com/oliver-moran/jimp/pull/859) ([@pasieronen](https://github.com/pasieronen))

#### Authors: 3

- [@dependabot[bot]](https://github.com/dependabot[bot])
- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))
- Pasi Eronen ([@pasieronen](https://github.com/pasieronen))

---

# v0.9.6 (Wed Mar 18 2020)

#### 🐛 Bug Fix

- `jimp`
  - upgrade auto [#860](https://github.com/oliver-moran/jimp/pull/860) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`
  - Relax mkdirp dependency to allow newer minimist [#857](https://github.com/oliver-moran/jimp/pull/857) ([@Den-dp](https://github.com/Den-dp))

#### 🏠 Internal

- Fix TypeScript error on 'next' [#858](https://github.com/oliver-moran/jimp/pull/858) ([@crutchcorn](https://github.com/crutchcorn))

#### Authors: 3

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))
- Denis Bendrikov ([@Den-dp](https://github.com/Den-dp))

---

# v0.9.5 (Tue Mar 03 2020)

#### 🐛 Bug Fix

- `@jimp/plugin-print`
  - Export font type [#838](https://github.com/oliver-moran/jimp/pull/838) ([@DomiR](https://github.com/DomiR))

#### 📝 Documentation

- `@jimp/plugin-print`
  - Added ttf2fnt.com to the list [#845](https://github.com/oliver-moran/jimp/pull/845) ([@mbejda](https://github.com/mbejda))

#### Authors: 1

- Dominique Rau ([@DomiR](https://github.com/DomiR))

---

# v0.9.4 (Tue Mar 03 2020)

#### 🐛 Bug Fix

- `@jimp/plugin-shadow`
  - Update plugin-shadow type definition. [#841](https://github.com/oliver-moran/jimp/pull/841) ([@lekoaf](https://github.com/lekoaf))

#### Authors: 1

- Martin ([@lekoaf](https://github.com/lekoaf))

---

# v0.9.2 (Tue Nov 26 2019)

#### 🐛 Bug Fix

- fix automation [#825](https://github.com/oliver-moran/jimp/pull/825) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/cli`, `@jimp/core`, `@jimp/custom`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-gaussian`, `@jimp/plugin-invert`, `@jimp/plugin-mask`, `@jimp/plugin-normalize`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-scale`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/plugins`, `@jimp/test-utils`, `@jimp/bmp`, `@jimp/gif`, `@jimp/jpeg`, `@jimp/png`, `@jimp/tiff`, `@jimp/types`, `@jimp/utils`
  - Fix regeneratorRuntime errors [#815](https://github.com/oliver-moran/jimp/pull/815) ([@crutchcorn](https://github.com/crutchcorn) [@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`
  - Follow redirects [#789](https://github.com/oliver-moran/jimp/pull/789) ([@SaWey](https://github.com/SaWey) sander@solora.be)

#### 🏠 Internal

- update auto [#824](https://github.com/oliver-moran/jimp/pull/824) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 3

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))
- sander (sander@solora.be)

---

# v0.9.2 (Tue Nov 26 2019)

#### 🐛 Bug Fix

- `@jimp/cli`, `@jimp/core`, `@jimp/custom`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-gaussian`, `@jimp/plugin-invert`, `@jimp/plugin-mask`, `@jimp/plugin-normalize`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-scale`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/plugins`, `@jimp/test-utils`, `@jimp/bmp`, `@jimp/gif`, `@jimp/jpeg`, `@jimp/png`, `@jimp/tiff`, `@jimp/types`, `@jimp/utils`
  - Fix regeneratorRuntime errors [#815](https://github.com/oliver-moran/jimp/pull/815) ([@crutchcorn](https://github.com/crutchcorn) [@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`
  - Follow redirects [#789](https://github.com/oliver-moran/jimp/pull/789) ([@SaWey](https://github.com/SaWey) sander@solora.be)

#### Authors: 3

- Sander Weyens ([@SaWey](https://github.com/SaWey))
- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))
- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- sander (sander@solora.be)

---

# v0.9.1 (Tue Nov 26 2019)

#### 🐛 Bug Fix

- `@jimp/core`, `jimp`
  - Added callback to jimp constructor typings [#810](https://github.com/oliver-moran/jimp/pull/810) ([@crutchcorn](https://github.com/crutchcorn))

#### Authors: 1

- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))

---

# v0.9.0 (Tue Nov 26 2019)

#### 🚀 Enhancement

- `jimp`
  - Revert exports to match 0.6.4 TS definitions [#820](https://github.com/oliver-moran/jimp/pull/820) ([@crutchcorn](https://github.com/crutchcorn))

#### Authors: 1

- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))

---

# v0.8.5 (Fri Oct 18 2019)

#### 🐛 Bug Fix

- `@jimp/core`
  - Image dimensions during exif rotation have been corrected [#791](https://github.com/oliver-moran/jimp/pull/791) (alexander.shcherbakov@btsdigital.kz [@popinguy](https://github.com/popinguy))

#### 🏠 Internal

- `@jimp/cli`, `@jimp/core`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-color`, `@jimp/plugin-crop`, `@jimp/plugin-normalize`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/test-utils`, `@jimp/jpeg`, `@jimp/png`, `@jimp/tiff`, `@jimp/types`
  - Upgrade nearly-all dev deps [#799](https://github.com/oliver-moran/jimp/pull/799) ([@crutchcorn](https://github.com/crutchcorn))

#### 📝 Documentation

- Added back mention of required tsconfig options [#800](https://github.com/oliver-moran/jimp/pull/800) ([@popinguy](https://github.com/popinguy))

#### Authors: 3

- [@popinguy](https://github.com/popinguy)
- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Alexander Shcherbakov (alexander.shcherbakov@btsdigital.kz)
- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))

---

# v0.8.4 (Fri Sep 20 2019)

#### 🐛 Bug Fix

- `@jimp/cli`, `@jimp/core`, `@jimp/custom`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-gaussian`, `@jimp/plugin-invert`, `@jimp/plugin-mask`, `@jimp/plugin-normalize`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-scale`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/jpeg`, `@jimp/png`
  - TS 3.1 fixed [#798](https://github.com/oliver-moran/jimp/pull/798) ([@crutchcorn](https://github.com/crutchcorn))

#### Authors: 1

- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))

---

# v0.8.3 (Wed Sep 18 2019)

#### 🐛 Bug Fix

- `@jimp/core`, `@jimp/custom`, `jimp`
  - Fix issues with typings using classes, publish @core typings, and fix 3.1 typings [#792](https://github.com/oliver-moran/jimp/pull/792) ([@crutchcorn](https://github.com/crutchcorn))

#### Authors: 1

- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))

---

# v0.8.2 (Fri Sep 13 2019)

#### 🐛 Bug Fix

- `jimp`
  - must ship types [#794](https://github.com/oliver-moran/jimp/pull/794) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.1 (Thu Sep 12 2019)

#### 🐛 Bug Fix

- `@jimp/cli`, `@jimp/core`, `@jimp/custom`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-flip`, `@jimp/plugin-gaussian`, `@jimp/plugin-invert`, `@jimp/plugin-mask`, `@jimp/plugin-normalize`, `@jimp/plugin-rotate`, `@jimp/plugin-scale`, `@jimp/plugin-threshold`, `@jimp/plugins`, `@jimp/utils`
  - Fix 0.8 typings, add type tests [#786](https://github.com/oliver-moran/jimp/pull/786) ([@crutchcorn](https://github.com/crutchcorn) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))
- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.0 (Sat Sep 07 2019)

#### 🚀 Enhancement

- `@jimp/core`, `@jimp/custom`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-gaussian`, `@jimp/plugin-invert`, `@jimp/plugin-mask`, `@jimp/plugin-normalize`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-scale`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/plugins`, `@jimp/bmp`, `@jimp/gif`, `@jimp/jpeg`, `@jimp/png`, `@jimp/tiff`, `@jimp/types`, `@jimp/utils`
  - Made typings plugin friendly & add typings for every package [#770](https://github.com/oliver-moran/jimp/pull/770) ([@crutchcorn](https://github.com/crutchcorn))

#### Authors: 1

- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))

---

# v0.7.0 (Fri Sep 06 2019)

#### 🚀 Enhancement

- `@jimp/core`, `jimp`, `@jimp/utils`
  - Feature scanIterator [#781](https://github.com/oliver-moran/jimp/pull/781) ([@ozelot379](https://github.com/ozelot379))

#### Authors: 1

- [@ozelot379](https://github.com/ozelot379)

---

# v0.6.8 (Tue Sep 03 2019)

#### 🐛 Bug Fix

- `jimp`
  - Remove dependency '@babel/polyfill' and add 'regenerator-runtime' [#783](https://github.com/oliver-moran/jimp/pull/783) ([@ebual](https://github.com/ebual) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Philipp Laube ([@ebual](https://github.com/ebual))
- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.6.7 (Tue Sep 03 2019)

#### 🐛 Bug Fix

- `@jimp/plugin-crop`
  - Plugin crop/fix safety checks [#743](https://github.com/oliver-moran/jimp/pull/743) ([@jagaSto](https://github.com/jagaSto))

#### Authors: 1

- Janik Gassner ([@jagaSto](https://github.com/jagaSto))

---

# v0.6.6 (Tue Sep 03 2019)

#### 🐛 Bug Fix

- `@jimp/plugin-crop`
  - Fix cropping full width slices [#741](https://github.com/oliver-moran/jimp/pull/741) ([@NiGhTTraX](https://github.com/NiGhTTraX))

#### Authors: 1

- Andrei Picus ([@NiGhTTraX](https://github.com/NiGhTTraX))

---

# v0.6.5 (Tue Sep 03 2019)

#### 🐛 Bug Fix

- `@jimp/cli`, `jimp`
  - Fix types [#778](https://github.com/oliver-moran/jimp/pull/778) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`
  - Fix getType() for files with extra dots in filename [#773](https://github.com/oliver-moran/jimp/pull/773) ([@pvolyntsev](https://github.com/pvolyntsev))
- `jimp`
  - Fix: #745 Tyepscript definition wrong return type on hash() [#746](https://github.com/oliver-moran/jimp/pull/746) ([@soimy](https://github.com/soimy))
- `jimp`
  - export more interfaces [#732](https://github.com/oliver-moran/jimp/pull/732) ([@pvolyntsev](https://github.com/pvolyntsev))

#### 🏠 Internal

- Add Automated Releases [#784](https://github.com/oliver-moran/jimp/pull/784) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/cli`, `@jimp/core`, `jimp`, `@jimp/plugin-crop`, `@jimp/plugin-rotate`
  - [WIP] circle ci time! [#777](https://github.com/oliver-moran/jimp/pull/777) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 📝 Documentation

- Replace `npm` usage with `yarn` [#782](https://github.com/oliver-moran/jimp/pull/782) ([@pvolyntsev](https://github.com/pvolyntsev))
- Add Nimp to readme.md. [#766](https://github.com/oliver-moran/jimp/pull/766) ([@pvolyntsev](https://github.com/pvolyntsev))
- `@jimp/plugin-print`
  - Update README.md [#754](https://github.com/oliver-moran/jimp/pull/754) ([@robert-moore](https://github.com/robert-moore))
- `@jimp/plugin-resize`
  - 👌 IMPROVE: Syntax + Docs [#757](https://github.com/oliver-moran/jimp/pull/757) ([@ahmadawais](https://github.com/ahmadawais))
- `@jimp/plugin-gaussian`
  - fix gaussian example [#767](https://github.com/oliver-moran/jimp/pull/767) ([@Armanio](https://github.com/Armanio))

#### ⚠️ Pushed to master

- trust github.com ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 6

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Pavel Volyntsev ([@pvolyntsev](https://github.com/pvolyntsev))
- Shen Yiming ([@soimy](https://github.com/soimy))
- Rob Moore ([@robert-moore](https://github.com/robert-moore))
- Ahmad Awais ⚡️ ([@ahmadawais](https://github.com/ahmadawais))
- Arman ([@Armanio](https://github.com/Armanio))
