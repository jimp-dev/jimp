# v2.2.1 (Fri Nov 27 2026)

#### 🐛 Bug Fix

- fix(plugin-print): don't throw on fonts opentype.js can't shape [#1573](https://github.com/jimp-dev/jimp/pull/1573) ([@hipstersmoothie](https://github.com/hipstersmoothie))

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

:tada: This release contains work from new contributors! :tada:

Thanks for all your work!

:heart: Sandhan Aniket Ramdas ([@Aniketiitk21](https://github.com/Aniketiitk21))

:heart: null[@Shrusti-pk](https://github.com/Shrusti-pk)

:heart: Vilim Lendvaj ([@viliml](https://github.com/viliml))

#### 💥 Breaking Change

- fix(plugin-print)!: keep blank lines in printed text [#1505](https://github.com/jimp-dev/jimp/pull/1505) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- chore!: require Node.js 22 or later [#1504](https://github.com/jimp-dev/jimp/pull/1504) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(plugin-print)!: align text without maxWidth, measure newlines, clear loadFont HTTP errors [#1498](https://github.com/jimp-dev/jimp/pull/1498) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🚀 Enhancement

- feat: print TrueType, OpenType and WOFF fonts [#1539](https://github.com/jimp-dev/jimp/pull/1539) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(plugin-crop): add autocropRect helper [#1404](https://github.com/jimp-dev/jimp/pull/1404) ([@Aniketiitk21](https://github.com/Aniketiitk21))

#### 🐛 Bug Fix

- chore(deps): upgrade all dependencies [#1541](https://github.com/jimp-dev/jimp/pull/1541) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- chore: make the repo build and test on Windows [#1524](https://github.com/jimp-dev/jimp/pull/1524) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(plugin-print): clear error for BMFont pages that aren't PNG [#1509](https://github.com/jimp-dev/jimp/pull/1509) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- docs: show how to create, read and save images in v1 [#1484](https://github.com/jimp-dev/jimp/pull/1484) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(plugin-print): clear loadFont errors instead of fetch failures [#1475](https://github.com/jimp-dev/jimp/pull/1475) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(plugin-print): measure missing glyphs as the ? that print draws [#1469](https://github.com/jimp-dev/jimp/pull/1469) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(plugin-print): print by code point, not UTF-16 code unit [#1465](https://github.com/jimp-dev/jimp/pull/1465) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Only publish dist from each package [#1468](https://github.com/jimp-dev/jimp/pull/1468) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(blit): use source-over alpha compositing [#1460](https://github.com/jimp-dev/jimp/pull/1460) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Fix Buffer in Deno, Workers, and browsers without a polyfill [#1444](https://github.com/jimp-dev/jimp/pull/1444) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- docs: remove v0 leftovers from the jimp and plugin READMEs [#1447](https://github.com/jimp-dev/jimp/pull/1447) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- docs: fix stale v0 examples and params in the API docs [#1438](https://github.com/jimp-dev/jimp/pull/1438) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Avoid quadratic line wrapping in splitLines [#1424](https://github.com/jimp-dev/jimp/pull/1424) ([@Shrusti-pk](https://github.com/Shrusti-pk) [@hipstersmoothie](https://github.com/hipstersmoothie))
- Reject font pages outside the font directory in processBitmapFont [#1418](https://github.com/jimp-dev/jimp/pull/1418) ([@Shrusti-pk](https://github.com/Shrusti-pk) [@hipstersmoothie](https://github.com/hipstersmoothie))
- Keep the end of words wider than maxWidth when wrapping text [#1432](https://github.com/jimp-dev/jimp/pull/1432) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Allow loading non-XML fonts in web-worker [#1360](https://github.com/jimp-dev/jimp/pull/1360) ([@viliml](https://github.com/viliml))

#### 📝 Documentation

- docs: add share image and favicon for the docs site [#1426](https://github.com/jimp-dev/jimp/pull/1426) ([@crutchcorn](https://github.com/crutchcorn) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🔩 Dependency Updates

- chore(deps): upgrade dev tooling to fix Dependabot alerts [#1525](https://github.com/jimp-dev/jimp/pull/1525) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 5

- [@Shrusti-pk](https://github.com/Shrusti-pk)
- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))
- Sandhan Aniket Ramdas ([@Aniketiitk21](https://github.com/Aniketiitk21))
- Vilim Lendvaj ([@viliml](https://github.com/viliml))

---

# v1.7.0 (Sat Nov 21 2026)

:tada: This release contains work from a new contributor! :tada:

Thank you, Ilyas Landikov ([@ilandikov](https://github.com/ilandikov)), for all your work!

#### 🚀 Enhancement

- Migrate to Zod v4 [#1420](https://github.com/jimp-dev/jimp/pull/1420) ([@ilandikov](https://github.com/ilandikov))

#### Authors: 1

- Ilyas Landikov ([@ilandikov](https://github.com/ilandikov))

---

# v1.4.0 (Sat Sep 07 2024)

#### 🐛 Bug Fix

- Bind callback to image instance [#1335](https://github.com/jimp-dev/jimp/pull/1335) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- fix docs build ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 📝 Documentation

- Misc doc updates [#1334](https://github.com/jimp-dev/jimp/pull/1334) ([@hipstersmoothie](https://github.com/hipstersmoothie))

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

#### 🐛 Bug Fix

- Fix loading fonts in web-worker [#1322](https://github.com/jimp-dev/jimp/pull/1322) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.1.2 (Mon Sep 02 2024)

#### 🐛 Bug Fix

- Update deps [#1319](https://github.com/jimp-dev/jimp/pull/1319) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.1.2 (Mon Sep 02 2024)

#### 🐛 Bug Fix

- Fix printing string when words are longer than max-width [#1313](https://github.com/jimp-dev/jimp/pull/1313) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Fix using dirname in print plugin [#1310](https://github.com/jimp-dev/jimp/pull/1310) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.1.0 (Sun Sep 01 2024)

#### ⚠️ Pushed to `main`

- upgrade tshy ([@hipstersmoothie](https://github.com/hipstersmoothie))
- update more docs ([@hipstersmoothie](https://github.com/hipstersmoothie))

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
