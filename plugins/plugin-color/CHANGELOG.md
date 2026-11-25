# v2.2.0 (Wed Nov 25 2026)

#### 🚀 Enhancement

- feat: grain() and gradient dithering to fix banding [#1568](https://github.com/jimp-dev/jimp/pull/1568) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat: gradientMap() for duotones and gradient maps [#1564](https://github.com/jimp-dev/jimp/pull/1564) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v2.1.0 (Tue Nov 24 2026)

#### 🚀 Enhancement

- feat: @jimp/jpeg-js, a maintained fork of jpeg-js, used by @jimp/js-jpeg [#1554](https://github.com/jimp-dev/jimp/pull/1554) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 📝 Documentation

- docs: brand the READMEs with Jimpy and the JIMP wordmark [#1547](https://github.com/jimp-dev/jimp/pull/1547) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v2.0.0 (Mon Nov 23 2026)

:tada: This release contains work from a new contributor! :tada:

Thank you, Spoko Dev ([@spokodev](https://github.com/spokodev)), for all your work!

#### 💥 Breaking Change

- fix(plugin-color)!: round greyscale and use the same luminance in color() [#1507](https://github.com/jimp-dev/jimp/pull/1507) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- chore!: require Node.js 22 or later [#1504](https://github.com/jimp-dev/jimp/pull/1504) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix!: correct pixel maths in the color, threshold and quantize plugins [#1500](https://github.com/jimp-dev/jimp/pull/1500) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(utils)!: clamp out-of-bounds regions to the image [#1501](https://github.com/jimp-dev/jimp/pull/1501) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(utils)!: throw for invalid CSS colors [#1497](https://github.com/jimp-dev/jimp/pull/1497) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🚀 Enhancement

- feat(plugin-color): add a multiply color action and sepia(amount) [#1517](https://github.com/jimp-dev/jimp/pull/1517) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(plugin-color): add exposure() and vibrance() [#1516](https://github.com/jimp-dev/jimp/pull/1516) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🐛 Bug Fix

- chore(deps): upgrade all dependencies [#1541](https://github.com/jimp-dev/jimp/pull/1541) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- chore: make the repo build and test on Windows [#1524](https://github.com/jimp-dev/jimp/pull/1524) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(plugin-color): stop convolute transposing its kernel; support even-sized and non-square kernels [#1487](https://github.com/jimp-dev/jimp/pull/1487) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- perf(plugin-color): run color() without tinycolor2 per pixel [#1488](https://github.com/jimp-dev/jimp/pull/1488) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat: add sharpen() and a divisor/bias for convolution and convolute [#1482](https://github.com/jimp-dev/jimp/pull/1482) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- docs: show how to create, read and save images in v1 [#1484](https://github.com/jimp-dev/jimp/pull/1484) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Only publish dist from each package [#1468](https://github.com/jimp-dev/jimp/pull/1468) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- docs: document brightness semantics, CDN usage, and decode options [#1463](https://github.com/jimp-dev/jimp/pull/1463) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(plugin-color): scale saturation and blend lightness in color() instead of fixed offsets [#1455](https://github.com/jimp-dev/jimp/pull/1455) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Fix Buffer in Deno, Workers, and browsers without a polyfill [#1444](https://github.com/jimp-dev/jimp/pull/1444) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- docs: remove v0 leftovers from the jimp and plugin READMEs [#1447](https://github.com/jimp-dev/jimp/pull/1447) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- docs: fix stale v0 examples and params in the API docs [#1438](https://github.com/jimp-dev/jimp/pull/1438) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(plugin-color): compute sepia output channels from the original pixel [#1412](https://github.com/jimp-dev/jimp/pull/1412) ([@spokodev](https://github.com/spokodev) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### 📝 Documentation

- docs: add share image and favicon for the docs site [#1426](https://github.com/jimp-dev/jimp/pull/1426) ([@crutchcorn](https://github.com/crutchcorn) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🔩 Dependency Updates

- chore(deps): upgrade dev tooling to fix Dependabot alerts [#1525](https://github.com/jimp-dev/jimp/pull/1525) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 3

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))
- Spoko Dev ([@spokodev](https://github.com/spokodev))

---

# v1.7.0 (Sat Nov 21 2026)

:tada: This release contains work from a new contributor! :tada:

Thank you, Ilyas Landikov ([@ilandikov](https://github.com/ilandikov)), for all your work!

#### 🚀 Enhancement

- Migrate to Zod v4 [#1420](https://github.com/jimp-dev/jimp/pull/1420) ([@ilandikov](https://github.com/ilandikov))

#### Authors: 1

- Ilyas Landikov ([@ilandikov](https://github.com/ilandikov))

---

# v1.1.3 (Mon Sep 02 2024)

#### 🐛 Bug Fix

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

- Fix pixelate not working well with alpha channel [#1314](https://github.com/jimp-dev/jimp/pull/1314) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Make brightness function behave like other implementations [#1312](https://github.com/jimp-dev/jimp/pull/1312) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.1.0 (Sun Sep 01 2024)

#### ⚠️ Pushed to `main`

- update more docs ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.0.3 (Sat Aug 31 2024)

#### 🐛 Bug Fix

- Fix build [#1303](https://github.com/jimp-dev/jimp/pull/1303) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- add clean script ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.0.2 (Sat Aug 31 2024)

#### ⚠️ Pushed to `main`

- set side effects ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix versions ([@hipstersmoothie](https://github.com/hipstersmoothie))
- add publish config ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
