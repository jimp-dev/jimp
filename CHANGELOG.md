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
