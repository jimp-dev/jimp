# v0.22.8 (Thu May 11 2023)

#### 🚀 Enhancement

- Composite: don't write to null pixels [#1226](https://github.com/jimp-dev/jimp/pull/1226) ([@sjoerd108](https://github.com/sjoerd108))

#### Authors: 1

- Sjoerd ([@sjoerd108](https://github.com/sjoerd108))

---

# v0.22.4 (Tue Feb 07 2023)

#### 🚀 Enhancement

- update tinycolor2 [#1187](https://github.com/jimp-dev/jimp/pull/1187) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.22.2 (Mon Feb 06 2023)

:tada: This release contains work from a new contributor! :tada:

Thank you, Ollie Chick ([@olliechick](https://github.com/olliechick)), for all your work!

#### 🚀 Enhancement

- Change type of mime from string to string|number to fix #990 [#1182](https://github.com/jimp-dev/jimp/pull/1182) ([@olliechick](https://github.com/olliechick))

#### Authors: 1

- Ollie Chick ([@olliechick](https://github.com/olliechick))

---

# v0.22.1 (Mon Feb 06 2023)

#### 🚀 Enhancement

- upgrade mkdrip [#1173](https://github.com/jimp-dev/jimp/pull/1173) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🏠 Internal

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

- Switch to fetch for url requests [#1165](https://github.com/jimp-dev/jimp/pull/1165) ([@danielholmes](https://github.com/danielholmes))

#### 🏠 Internal

- switch from should to expect [#1163](https://github.com/jimp-dev/jimp/pull/1163) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- delete CLI package [#1162](https://github.com/jimp-dev/jimp/pull/1162) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Change test matching strategy to include all test files [#1161](https://github.com/jimp-dev/jimp/pull/1161) ([@danielholmes](https://github.com/danielholmes))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Daniel Holmes ([@danielholmes](https://github.com/danielholmes))

---

# v0.21.2 (Sun Feb 05 2023)

#### 🐛 Bug Fix

- Change some exports to move towards more ESM compatibility [#1154](https://github.com/jimp-dev/jimp/pull/1154) ([@danielholmes](https://github.com/danielholmes))

#### Authors: 1

- Daniel Holmes ([@danielholmes](https://github.com/danielholmes))

---

# v0.21.1 (Sun Feb 05 2023)

#### 🚀 Enhancement

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

- Babel Refactor [#1149](https://github.com/jimp-dev/jimp/pull/1149) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.20.2 (Sun Feb 05 2023)

#### 🚀 Enhancement

- add phash to types [#1144](https://github.com/jimp-dev/jimp/pull/1144) ([@hipstersmoothie](https://github.com/hipstersmoothie))

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

- switch from browserify to webpack [#1140](https://github.com/jimp-dev/jimp/pull/1140) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🚀 Enhancement

- Throw error instead of resolving to string [#1138](https://github.com/jimp-dev/jimp/pull/1138) ([@nopeless](https://github.com/nopeless))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- nopeless ([@nopeless](https://github.com/nopeless))

---

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

#### ⚠️ Pushed to `main`

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
