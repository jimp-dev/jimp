# v2.1.0 (Tue Nov 24 2026)

#### 🚀 Enhancement

- feat: @jimp/jpeg-js, a maintained fork of jpeg-js, used by @jimp/js-jpeg [#1554](https://github.com/jimp-dev/jimp/pull/1554) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v2.0.0 (Mon Nov 23 2026)

:tada: This release contains work from new contributors! :tada:

Thanks for all your work!

:heart: null[@Shrusti-pk](https://github.com/Shrusti-pk)

:heart: Defiant Catgirl ([@DefiantCatgirl](https://github.com/DefiantCatgirl))

#### 💥 Breaking Change

- fix(core)!: don't paint edge pixels when setPixelColor is outside the image [#1506](https://github.com/jimp-dev/jimp/pull/1506) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(core)!: composite across Jimp classes, clone mime/background, read Uint8Array/Blob, type write() options per extension [#1503](https://github.com/jimp-dev/jimp/pull/1503) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- chore!: require Node.js 22 or later [#1504](https://github.com/jimp-dev/jimp/pull/1504) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix!: correct pixel maths in the color, threshold and quantize plugins [#1500](https://github.com/jimp-dev/jimp/pull/1500) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(utils)!: clamp out-of-bounds regions to the image [#1501](https://github.com/jimp-dev/jimp/pull/1501) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🚀 Enhancement

- feat: read and write animated GIFs and multi-page TIFFs [#1529](https://github.com/jimp-dev/jimp/pull/1529) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(wasm-jxl): add JPEG XL format plugin [#1521](https://github.com/jimp-dev/jimp/pull/1521) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(wasm-svg): read SVG images [#1522](https://github.com/jimp-dev/jimp/pull/1522) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(wasm-jpeg2000): add JPEG 2000 format plugin [#1520](https://github.com/jimp-dev/jimp/pull/1520) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(js-ico): read and write ICO files [#1519](https://github.com/jimp-dev/jimp/pull/1519) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(core): add exifRotate option to skip EXIF auto-rotation [#1512](https://github.com/jimp-dev/jimp/pull/1512) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🐛 Bug Fix

- chore(deps): upgrade all dependencies [#1541](https://github.com/jimp-dev/jimp/pull/1541) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix: correct the TypeScript types of WASM format options [#1526](https://github.com/jimp-dev/jimp/pull/1526) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- chore: make the repo build and test on Windows [#1524](https://github.com/jimp-dev/jimp/pull/1524) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat: Display P3 and ICC colour profile support [#1492](https://github.com/jimp-dev/jimp/pull/1492) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(core): accept ImageData, Uint8ClampedArray and Uint8Array as bitmap data [#1480](https://github.com/jimp-dev/jimp/pull/1480) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- docs: show how to create, read and save images in v1 [#1484](https://github.com/jimp-dev/jimp/pull/1484) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(core): preserve EXIF when writing JPEGs (opt-in) and document EXIF handling [#1478](https://github.com/jimp-dev/jimp/pull/1478) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Only publish dist from each package [#1468](https://github.com/jimp-dev/jimp/pull/1468) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Make Jimp instance types interchangeable and type fromBitmap [#1446](https://github.com/jimp-dev/jimp/pull/1446) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(core): round composite results instead of truncating them [#1454](https://github.com/jimp-dev/jimp/pull/1454) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Fix Buffer in Deno, Workers, and browsers without a polyfill [#1444](https://github.com/jimp-dev/jimp/pull/1444) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Accept plain string paths in Jimp#write [#1434](https://github.com/jimp-dev/jimp/pull/1434) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Respect Buffer view bounds in fromBitmap and quantize [#1419](https://github.com/jimp-dev/jimp/pull/1419) ([@Shrusti-pk](https://github.com/Shrusti-pk) [@hipstersmoothie](https://github.com/hipstersmoothie))
- Pass decoder options to the underlying decoder when reading from files and buffers, not just URLs [#1357](https://github.com/jimp-dev/jimp/pull/1357) ([@DefiantCatgirl](https://github.com/DefiantCatgirl) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### 📝 Documentation

- docs: add share image and favicon for the docs site [#1426](https://github.com/jimp-dev/jimp/pull/1426) ([@crutchcorn](https://github.com/crutchcorn) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🔩 Dependency Updates

- chore(deps): upgrade dev tooling to fix Dependabot alerts [#1525](https://github.com/jimp-dev/jimp/pull/1525) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 4

- [@Shrusti-pk](https://github.com/Shrusti-pk)
- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))
- Defiant Catgirl ([@DefiantCatgirl](https://github.com/DefiantCatgirl))

---

# v1.5.0 (Sat Sep 07 2024)

### Release Notes

#### Add support for image decoder options ([#1336](https://github.com/jimp-dev/jimp/pull/1336))

Can now have options for the underlying image codecs

![CleanShot 2024-09-07 at 15 26 41](https://github.com/user-attachments/assets/26fa1a48-f463-455c-89f9-9c99f9fcb3d1)

---

#### 🚀 Enhancement

- Add support for image decoder options [#1336](https://github.com/jimp-dev/jimp/pull/1336) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.4.0 (Sat Sep 07 2024)

#### 🚀 Enhancement

- Let Jimp.read accept a Buffer [#1332](https://github.com/jimp-dev/jimp/pull/1332) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- fix docs build ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.3.0 (Wed Sep 04 2024)

#### 🚀 Enhancement

- Add width/height/mime getters [#1327](https://github.com/jimp-dev/jimp/pull/1327) ([@hipstersmoothie](https://github.com/hipstersmoothie))

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

# v1.1.3 (Mon Sep 02 2024)

#### 🐛 Bug Fix

- Update deps [#1319](https://github.com/jimp-dev/jimp/pull/1319) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.1.1 (Sun Sep 01 2024)

#### 🐛 Bug Fix

- fix file-type import for esm projects [#1309](https://github.com/jimp-dev/jimp/pull/1309) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.1.0 (Sun Sep 01 2024)

#### ⚠️ Pushed to `main`

- upgrade tshy ([@hipstersmoothie](https://github.com/hipstersmoothie))

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
