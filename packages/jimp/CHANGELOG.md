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
