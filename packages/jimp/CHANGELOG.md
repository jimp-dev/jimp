# v0.22.9 (Wed Jul 26 2023)

:tada: This release contains work from a new contributor! :tada:

Thank you, Tim O. (macer) ([@gitmacer](https://github.com/gitmacer)), for all your work!

#### 🚀 Enhancement

- Add € to extended Fonts [#1249](https://github.com/jimp-dev/jimp/pull/1249) ([@gitmacer](https://github.com/gitmacer))

#### Authors: 1

- Tim O. (macer) ([@gitmacer](https://github.com/gitmacer))

---

# v0.22.8 (Thu May 11 2023)

:tada: This release contains work from new contributors! :tada:

Thanks for all your work!

:heart: Sjoerd ([@sjoerd108](https://github.com/sjoerd108))

:heart: null[@JunkMeal](https://github.com/JunkMeal)

#### 🚀 Enhancement

- Composite: don't write to null pixels [#1226](https://github.com/jimp-dev/jimp/pull/1226) ([@sjoerd108](https://github.com/sjoerd108))

#### 📝 Documentation

- Changing the Hiero url [#1213](https://github.com/jimp-dev/jimp/pull/1213) ([@JunkMeal](https://github.com/JunkMeal))

#### Authors: 2

- [@JunkMeal](https://github.com/JunkMeal)
- Sjoerd ([@sjoerd108](https://github.com/sjoerd108))

---

# v0.22.6 (Fri Feb 24 2023)

:tada: This release contains work from a new contributor! :tada:

Thank you, Daniell ([@daniellwdb](https://github.com/daniellwdb)), for all your work!

#### 🐛 Bug Fix

- Export ColorActionName enum [#1205](https://github.com/jimp-dev/jimp/pull/1205) ([@daniellwdb](https://github.com/daniellwdb))

#### Authors: 1

- Daniell ([@daniellwdb](https://github.com/daniellwdb))

---

# v0.22.3 (Mon Feb 06 2023)

#### 🚀 Enhancement

- Fix browser build [#1184](https://github.com/jimp-dev/jimp/pull/1184) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.22.1 (Mon Feb 06 2023)

#### 🏠 Internal

- rename master to main [#1169](https://github.com/jimp-dev/jimp/pull/1169) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.22.0 (Mon Feb 06 2023)

#### 🏠 Internal

- switch from should to expect [#1163](https://github.com/jimp-dev/jimp/pull/1163) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Change test matching strategy to include all test files [#1161](https://github.com/jimp-dev/jimp/pull/1161) ([@danielholmes](https://github.com/danielholmes))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Daniel Holmes ([@danielholmes](https://github.com/danielholmes))

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

# v0.18.0 (Sun Feb 05 2023)

### Release Notes

#### switch from browserify to webpack ([#1140](https://github.com/jimp-dev/jimp/pull/1140))

This PR can be considered a breaking change as it remove the `jimp.min.js` file.

Instead there is now only the `jimp.js` file and we ship source maps for it.

We also configured the `browser` field so jimp will be automatically bundled better

---

#### 💥 Breaking Change

- switch from browserify to webpack [#1140](https://github.com/jimp-dev/jimp/pull/1140) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.17.6 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- fix documentation about rotation direction. [#1062](https://github.com/jimp-dev/jimp/pull/1062) ([@fabb](https://github.com/fabb))

#### Authors: 1

- [@fabb](https://github.com/fabb)

---

# v0.16.3 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- Fix edgeHandling types [#1080](https://github.com/jimp-dev/jimp/pull/1080) ([@domdomegg](https://github.com/domdomegg))
- Readme: Fix measureText sample code [#1102](https://github.com/jimp-dev/jimp/pull/1102) ([@dkong](https://github.com/dkong) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- try this ([@hipstersmoothie](https://github.com/hipstersmoothie))
- update linting ([@hipstersmoothie](https://github.com/hipstersmoothie))
- upgrade prettier ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 3

- Adam Jones ([@domdomegg](https://github.com/domdomegg))
- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Dara Kong ([@dkong](https://github.com/dkong))

---

# v0.15.0 (Fri Aug 07 2020)

#### 🚀 Enhancement

- Remove 'browser' field from main jimp package's package.json. [#918](https://github.com/oliver-moran/jimp/pull/918) ([@Gustavo6046](https://github.com/Gustavo6046))

#### Authors: 1

- Gustavo Ramos Rehermann ([@Gustavo6046](https://github.com/Gustavo6046))

---

# v0.14.0 (Mon Jun 29 2020)

#### 🚀 Enhancement

- include Addition (Add) blending mode + Officially drop support for Node 8 [#904](https://github.com/oliver-moran/jimp/pull/904) ([@GlitchyPSIX](https://github.com/GlitchyPSIX))

#### Authors: 1

- GlitchyPSI ([@GlitchyPSIX](https://github.com/GlitchyPSIX))

---

# v0.13.0 (Fri Jun 05 2020)

#### 🚀 Enhancement

- Add single frame encoder for type-gif [#899](https://github.com/oliver-moran/jimp/pull/899) ([@jeffbseeking](https://github.com/jeffbseeking) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Jeff Bonnes ([@jeffbseeking](https://github.com/jeffbseeking))

---

# v0.11.0 (Fri May 15 2020)

#### 🚀 Enhancement

- Removed Core-JS as a dependency. [#882](https://github.com/oliver-moran/jimp/pull/882) ([@EricRabil](https://github.com/EricRabil))

#### Authors: 1

- Eric Rabil ([@EricRabil](https://github.com/EricRabil))

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

# v0.9.7 (Fri Mar 27 2020)

#### 🐛 Bug Fix

- Added missing plugins to the types [#863](https://github.com/oliver-moran/jimp/pull/863) ([@crutchcorn](https://github.com/crutchcorn))

#### Authors: 1

- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))

---

# v0.9.6 (Wed Mar 18 2020)

#### 🐛 Bug Fix

- upgrade auto [#860](https://github.com/oliver-moran/jimp/pull/860) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🏠 Internal

- Fix TypeScript error on 'next' [#858](https://github.com/oliver-moran/jimp/pull/858) ([@crutchcorn](https://github.com/crutchcorn))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))

---

# v0.9.3 (Tue Nov 26 2019)

#### 🐛 Bug Fix

- `@jimp/cli`, `@jimp/core`, `@jimp/custom`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-gaussian`, `@jimp/plugin-invert`, `@jimp/plugin-mask`, `@jimp/plugin-normalize`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-scale`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/plugins`, `@jimp/test-utils`, `@jimp/bmp`, `@jimp/gif`, `@jimp/jpeg`, `@jimp/png`, `@jimp/tiff`, `@jimp/types`, `@jimp/utils`
  - Fix regeneratorRuntime errors [#815](https://github.com/oliver-moran/jimp/pull/815) ([@crutchcorn](https://github.com/crutchcorn) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))
