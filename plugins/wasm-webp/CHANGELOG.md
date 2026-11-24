# v2.0.0 (Mon Nov 23 2026)

:tada: This release contains work from a new contributor! :tada:

Thank you, Sandhan Aniket Ramdas ([@Aniketiitk21](https://github.com/Aniketiitk21)), for all your work!

#### 💥 Breaking Change

- refactor!: remove options that have no effect, interpolate rotate's resize modes, add BMP bitPP [#1508](https://github.com/jimp-dev/jimp/pull/1508) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- chore!: require Node.js 22 or later [#1504](https://github.com/jimp-dev/jimp/pull/1504) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🐛 Bug Fix

- chore(deps): upgrade all dependencies [#1541](https://github.com/jimp-dev/jimp/pull/1541) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix: correct the TypeScript types of WASM format options [#1526](https://github.com/jimp-dev/jimp/pull/1526) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- chore: make the repo build and test on Windows [#1524](https://github.com/jimp-dev/jimp/pull/1524) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat: Display P3 and ICC colour profile support [#1492](https://github.com/jimp-dev/jimp/pull/1492) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Only publish dist from each package [#1468](https://github.com/jimp-dev/jimp/pull/1468) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- feat(wasm-*): accept precompiled wasm modules for Cloudflare Workers [#1450](https://github.com/jimp-dev/jimp/pull/1450) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Fix Buffer in Deno, Workers, and browsers without a polyfill [#1444](https://github.com/jimp-dev/jimp/pull/1444) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- test(wasm-*): cover getBuffer with no options and empty options [#1443](https://github.com/jimp-dev/jimp/pull/1443) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- docs: document the Vite config the wasm plugins need [#1436](https://github.com/jimp-dev/jimp/pull/1436) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(wasm-*): load codec wasm from disk in Node for all wasm plugins [#1431](https://github.com/jimp-dev/jimp/pull/1431) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix(@jimp/wasm-webp): initialize WebP WASM from disk in Node [#1403](https://github.com/jimp-dev/jimp/pull/1403) ([@Aniketiitk21](https://github.com/Aniketiitk21) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### 📝 Documentation

- docs: add share image and favicon for the docs site [#1426](https://github.com/jimp-dev/jimp/pull/1426) ([@crutchcorn](https://github.com/crutchcorn) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🔩 Dependency Updates

- chore(deps): upgrade dev tooling to fix Dependabot alerts [#1525](https://github.com/jimp-dev/jimp/pull/1525) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 3

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))
- Sandhan Aniket Ramdas ([@Aniketiitk21](https://github.com/Aniketiitk21))

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

#### ⚠️ Pushed to `main`

- fix docs build ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v1.1.0 (Tue Sep 03 2024)

#### 🚀 Enhancement

- Add webp, avid, png, jpeg WASM format plugin [#1324](https://github.com/jimp-dev/jimp/pull/1324) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
