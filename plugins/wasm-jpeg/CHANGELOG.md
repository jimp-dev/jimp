# v2.1.0 (Tue Nov 24 2026)

#### 📝 Documentation

- docs: brand the READMEs with Jimpy and the JIMP wordmark [#1547](https://github.com/jimp-dev/jimp/pull/1547) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v2.0.0 (Mon Nov 23 2026)

#### 💥 Breaking Change

- refactor!: remove options that have no effect, interpolate rotate's resize modes, add BMP bitPP [#1508](https://github.com/jimp-dev/jimp/pull/1508) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- chore!: require Node.js 22 or later [#1504](https://github.com/jimp-dev/jimp/pull/1504) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix!: correct pixel maths in the color, threshold and quantize plugins [#1500](https://github.com/jimp-dev/jimp/pull/1500) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🐛 Bug Fix

- chore(deps): upgrade all dependencies [#1541](https://github.com/jimp-dev/jimp/pull/1541) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix: correct the TypeScript types of WASM format options [#1526](https://github.com/jimp-dev/jimp/pull/1526) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- chore: make the repo build and test on Windows [#1524](https://github.com/jimp-dev/jimp/pull/1524) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat: Display P3 and ICC colour profile support [#1492](https://github.com/jimp-dev/jimp/pull/1492) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(core): preserve EXIF when writing JPEGs (opt-in) and document EXIF handling [#1478](https://github.com/jimp-dev/jimp/pull/1478) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Only publish dist from each package [#1468](https://github.com/jimp-dev/jimp/pull/1468) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(wasm-*): accept precompiled wasm modules for Cloudflare Workers [#1450](https://github.com/jimp-dev/jimp/pull/1450) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Fix Buffer in Deno, Workers, and browsers without a polyfill [#1444](https://github.com/jimp-dev/jimp/pull/1444) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- docs: remove v0 leftovers from the jimp and plugin READMEs [#1447](https://github.com/jimp-dev/jimp/pull/1447) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- test(wasm-*): cover getBuffer with no options and empty options [#1443](https://github.com/jimp-dev/jimp/pull/1443) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- docs: document the Vite config the wasm plugins need [#1436](https://github.com/jimp-dev/jimp/pull/1436) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(wasm-*): load codec wasm from disk in Node for all wasm plugins [#1431](https://github.com/jimp-dev/jimp/pull/1431) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 📝 Documentation

- docs: add share image and favicon for the docs site [#1426](https://github.com/jimp-dev/jimp/pull/1426) ([@crutchcorn](https://github.com/crutchcorn) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🔩 Dependency Updates

- chore(deps): upgrade dev tooling to fix Dependabot alerts [#1525](https://github.com/jimp-dev/jimp/pull/1525) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))

---

# v1.7.0 (Sat Nov 21 2026)

:tada: This release contains work from a new contributor! :tada:

Thank you, Ilyas Landikov ([@ilandikov](https://github.com/ilandikov)), for all your work!

#### 🚀 Enhancement

- Migrate to Zod v4 [#1420](https://github.com/jimp-dev/jimp/pull/1420) ([@ilandikov](https://github.com/ilandikov))

#### Authors: 1

- Ilyas Landikov ([@ilandikov](https://github.com/ilandikov))

---

# v1.1.0 (Tue Sep 03 2024)

#### 🚀 Enhancement

- Add webp, avid, png, jpeg WASM format plugin [#1324](https://github.com/jimp-dev/jimp/pull/1324) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
