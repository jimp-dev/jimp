# v0.17.6 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- fix(jimp.d.ts): fix getBase64 and getBase64Async function arguments [#1094](https://github.com/jimp-dev/jimp/pull/1094) ([@pkjy](https://github.com/pkjy))

#### Authors: 1

- 彭君怡 ([@pkjy](https://github.com/pkjy))

---

# v0.17.5 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- Fix dos attack vulnerable [#1136](https://github.com/jimp-dev/jimp/pull/1136) ([@sjoerd108](https://github.com/sjoerd108) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Sjoerd ([@sjoerd108](https://github.com/sjoerd108))

---

# v0.17.4 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- fix commonjs require [#1020](https://github.com/jimp-dev/jimp/pull/1020) ([@fratzinger](https://github.com/fratzinger) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- [@fratzinger](https://github.com/fratzinger)
- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.17.3 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- Fix EDGE_WRAP overwriting X with Y when Y < 0 [#1135](https://github.com/jimp-dev/jimp/pull/1135) ([@sjoerd108](https://github.com/sjoerd108) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Sjoerd ([@sjoerd108](https://github.com/sjoerd108))

---

# v0.17.2 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- remove extra bm-font dep [#1134](https://github.com/jimp-dev/jimp/pull/1134) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.16.3 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- Fix edgeHandling types [#1080](https://github.com/jimp-dev/jimp/pull/1080) ([@domdomegg](https://github.com/domdomegg))
- upgrade file-type [#1108](https://github.com/jimp-dev/jimp/pull/1108) ([@krudos](https://github.com/krudos))

#### ⚠️ Pushed to `master`

- try this ([@hipstersmoothie](https://github.com/hipstersmoothie))
- update linting ([@hipstersmoothie](https://github.com/hipstersmoothie))
- upgrade prettier ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 3

- [@krudos](https://github.com/krudos)
- Adam Jones ([@domdomegg](https://github.com/domdomegg))
- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.14.0 (Mon Jun 29 2020)

#### 🚀 Enhancement

- include Addition (Add) blending mode + Officially drop support for Node 8 [#904](https://github.com/oliver-moran/jimp/pull/904) ([@GlitchyPSIX](https://github.com/GlitchyPSIX))

#### Authors: 1

- GlitchyPSI ([@GlitchyPSIX](https://github.com/GlitchyPSIX))

---

# v0.11.0 (Fri May 15 2020)

#### 🚀 Enhancement

- Removed Core-JS as a dependency. [#882](https://github.com/oliver-moran/jimp/pull/882) ([@EricRabil](https://github.com/EricRabil))

#### 🐛 Bug Fix

- Make callback optional for Jimp.rgbaToInt [#889](https://github.com/oliver-moran/jimp/pull/889) ([@HanKruiger](https://github.com/HanKruiger))

#### Authors: 2

- Eric Rabil ([@EricRabil](https://github.com/EricRabil))
- Han Kruiger ([@HanKruiger](https://github.com/HanKruiger))

---

# v0.10.2 (Tue Apr 14 2020)

#### 🐛 Bug Fix

- Rewrite handling EXIF orientation — add tests, make it plugin-independent [#875](https://github.com/oliver-moran/jimp/pull/875) ([@skalee](https://github.com/skalee))

#### Authors: 1

- Sebastian Skałacki ([@skalee](https://github.com/skalee))

---

# v0.10.0 (Mon Mar 30 2020)

#### 🚀 Enhancement

- Properly split constructor and instance types [#867](https://github.com/oliver-moran/jimp/pull/867) ([@forivall](https://github.com/forivall))

#### Authors: 1

- Emily Marigold Klassen ([@forivall](https://github.com/forivall))

---

# v0.9.6 (Wed Mar 18 2020)

#### 🐛 Bug Fix

- Relax mkdirp dependency to allow newer minimist [#857](https://github.com/oliver-moran/jimp/pull/857) ([@Den-dp](https://github.com/Den-dp))

#### 🏠 Internal

- Fix TypeScript error on 'next' [#858](https://github.com/oliver-moran/jimp/pull/858) ([@crutchcorn](https://github.com/crutchcorn))

#### Authors: 2

- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))
- Denis Bendrikov ([@Den-dp](https://github.com/Den-dp))

---

# v0.9.3 (Tue Nov 26 2019)

#### 🐛 Bug Fix

- `@jimp/cli`, `@jimp/core`, `@jimp/custom`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-gaussian`, `@jimp/plugin-invert`, `@jimp/plugin-mask`, `@jimp/plugin-normalize`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-scale`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/plugins`, `@jimp/test-utils`, `@jimp/bmp`, `@jimp/gif`, `@jimp/jpeg`, `@jimp/png`, `@jimp/tiff`, `@jimp/types`, `@jimp/utils`
  - Fix regeneratorRuntime errors [#815](https://github.com/oliver-moran/jimp/pull/815) ([@crutchcorn](https://github.com/crutchcorn) [@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`
  - Follow redirects [#789](https://github.com/oliver-moran/jimp/pull/789) ([@SaWey](https://github.com/SaWey) sander@solora.be)

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))
