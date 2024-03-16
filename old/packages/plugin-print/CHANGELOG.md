# v0.22.11 (Fri Feb 23 2024)

:tada: This release contains work from a new contributor! :tada:

Thank you, Rob Juurlink ([@kozmoz](https://github.com/kozmoz)), for all your work!

#### 🚀 Enhancement

- Add \n support for image.print #865 [#1265](https://github.com/jimp-dev/jimp/pull/1265) (juurr00@juurlink.org [@kozmoz](https://github.com/kozmoz) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 3

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- juurr00 (juurr00@juurlink.org)
- Rob Juurlink ([@kozmoz](https://github.com/kozmoz))

---

# v0.22.9 (Wed Jul 26 2023)

:tada: This release contains work from a new contributor! :tada:

Thank you, Tim O. (macer) ([@gitmacer](https://github.com/gitmacer)), for all your work!

#### 🚀 Enhancement

- Add € to extended Fonts [#1249](https://github.com/jimp-dev/jimp/pull/1249) ([@gitmacer](https://github.com/gitmacer))

#### Authors: 1

- Tim O. (macer) ([@gitmacer](https://github.com/gitmacer))

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

# v0.17.6 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- Update ordering of overrides so ReturnType pulls correct typing. [#1077](https://github.com/jimp-dev/jimp/pull/1077) ([@dcbartlett](https://github.com/dcbartlett) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Dennis Bartlett ([@dcbartlett](https://github.com/dcbartlett))

---

# v0.17.2 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- remove extra bm-font dep [#1134](https://github.com/jimp-dev/jimp/pull/1134) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.17.1 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- use a consistent text layouting algorithm [#1133](https://github.com/jimp-dev/jimp/pull/1133) ([@iliazeus](https://github.com/iliazeus) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Ilia Pozdnyakov ([@iliazeus](https://github.com/iliazeus))

---

# v0.16.3 (Sat Feb 04 2023)

#### 🐛 Bug Fix

- Update README.md [#1120](https://github.com/jimp-dev/jimp/pull/1120) ([@mfuatnuroglu](https://github.com/mfuatnuroglu))

#### ⚠️ Pushed to `main`

- try this ([@hipstersmoothie](https://github.com/hipstersmoothie))
- upgrade prettier ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- [@mfuatnuroglu](https://github.com/mfuatnuroglu)
- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.11.0 (Fri May 15 2020)

#### 🚀 Enhancement

- Removed Core-JS as a dependency. [#882](https://github.com/oliver-moran/jimp/pull/882) ([@EricRabil](https://github.com/EricRabil))

#### Authors: 1

- Eric Rabil ([@EricRabil](https://github.com/EricRabil))

---

# v0.10.1 (Sun Apr 05 2020)

#### 📝 Documentation

- Fix a `loadFont` and case inconsistency of `jimp` [#868](https://github.com/oliver-moran/jimp/pull/868) ([@xinbenlv](https://github.com/xinbenlv))

#### Authors: 1

- xinbenlv ([@xinbenlv](https://github.com/xinbenlv))

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

# v0.9.3 (Tue Nov 26 2019)

#### 🐛 Bug Fix

- `@jimp/cli`, `@jimp/core`, `@jimp/custom`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-gaussian`, `@jimp/plugin-invert`, `@jimp/plugin-mask`, `@jimp/plugin-normalize`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-scale`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/plugins`, `@jimp/test-utils`, `@jimp/bmp`, `@jimp/gif`, `@jimp/jpeg`, `@jimp/png`, `@jimp/tiff`, `@jimp/types`, `@jimp/utils`
  - Fix regeneratorRuntime errors [#815](https://github.com/oliver-moran/jimp/pull/815) ([@crutchcorn](https://github.com/crutchcorn) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))
