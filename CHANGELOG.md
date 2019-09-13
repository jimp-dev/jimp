# v0.8.2 (Fri Sep 13 2019)

#### 🐛  Bug Fix

- `jimp`
  - must ship types [#794](https://github.com/oliver-moran/jimp/pull/794) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.1 (Thu Sep 12 2019)

#### 🐛  Bug Fix

- `@jimp/cli`, `@jimp/core`, `@jimp/custom`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-flip`, `@jimp/plugin-gaussian`, `@jimp/plugin-invert`, `@jimp/plugin-mask`, `@jimp/plugin-normalize`, `@jimp/plugin-rotate`, `@jimp/plugin-scale`, `@jimp/plugin-threshold`, `@jimp/plugins`, `@jimp/utils`
  - Fix 0.8 typings, add type tests [#786](https://github.com/oliver-moran/jimp/pull/786) ([@crutchcorn](https://github.com/crutchcorn) [@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 2

- Corbin Crutchley ([@crutchcorn](https://github.com/crutchcorn))
- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.0 (Sat Sep 07 2019)

#### 🚀  Enhancement

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
