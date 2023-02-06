# v0.22.1 (Mon Feb 06 2023)

#### 🏠 Internal

- rename master to main [#1169](https://github.com/jimp-dev/jimp/pull/1169) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.22.0 (Mon Feb 06 2023)

#### 🏠 Internal

- switch from should to expect [#1163](https://github.com/jimp-dev/jimp/pull/1163) ([@hipstersmoothie](https://github.com/hipstersmoothie))

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

# v0.16.3 (Sat Feb 04 2023)

#### ⚠️ Pushed to `main`

- upgrade prettier ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.11.0 (Fri May 15 2020)

#### 🚀 Enhancement

- Removed Core-JS as a dependency. [#882](https://github.com/oliver-moran/jimp/pull/882) ([@EricRabil](https://github.com/EricRabil))

#### Authors: 1

- Eric Rabil ([@EricRabil](https://github.com/EricRabil))

---

# v0.10.0 (Mon Mar 30 2020)

#### 🚀 Enhancement

- Properly split constructor and instance types [#867](https://github.com/oliver-moran/jimp/pull/867) ([@forivall](https://github.com/forivall))

#### Authors: 1

- Emily Marigold Klassen ([@forivall](https://github.com/forivall))

---

# v0.9.6 (Wed Mar 18 2020)

#### 🏠 Internal

- Fix TypeScript error on 'next' [#858](https://github.com/oliver-moran/jimp/pull/858) ([@crutchcorn](https://github.com/crutchcorn))

#### Authors: 1

- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))

---

# v0.9.3 (Tue Nov 26 2019)

#### 🐛 Bug Fix

- `@jimp/cli`, `@jimp/core`, `@jimp/custom`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-gaussian`, `@jimp/plugin-invert`, `@jimp/plugin-mask`, `@jimp/plugin-normalize`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-scale`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/plugins`, `@jimp/test-utils`, `@jimp/bmp`, `@jimp/gif`, `@jimp/jpeg`, `@jimp/png`, `@jimp/tiff`, `@jimp/types`, `@jimp/utils`
  - Fix regeneratorRuntime errors [#815](https://github.com/oliver-moran/jimp/pull/815) ([@crutchcorn](https://github.com/crutchcorn) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))
