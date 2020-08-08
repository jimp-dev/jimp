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

#### ⚠️  Pushed to `master`

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

#### 🐛  Bug Fix

- `@jimp/plugin-print`
  - Export font type [#838](https://github.com/oliver-moran/jimp/pull/838) ([@DomiR](https://github.com/DomiR))

#### 📝  Documentation

- `@jimp/plugin-print`
  - Added ttf2fnt.com to the list [#845](https://github.com/oliver-moran/jimp/pull/845) ([@mbejda](https://github.com/mbejda))

#### Authors: 1

- Dominique Rau ([@DomiR](https://github.com/DomiR))

---

# v0.9.4 (Tue Mar 03 2020)

#### 🐛  Bug Fix

- `@jimp/plugin-shadow`
  - Update plugin-shadow type definition. [#841](https://github.com/oliver-moran/jimp/pull/841) ([@lekoaf](https://github.com/lekoaf))

#### Authors: 1

- Martin ([@lekoaf](https://github.com/lekoaf))

---

# v0.9.2 (Tue Nov 26 2019)

#### 🐛  Bug Fix

- fix automation [#825](https://github.com/oliver-moran/jimp/pull/825) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/cli`, `@jimp/core`, `@jimp/custom`, `jimp`, `@jimp/plugin-blit`, `@jimp/plugin-blur`, `@jimp/plugin-circle`, `@jimp/plugin-color`, `@jimp/plugin-contain`, `@jimp/plugin-cover`, `@jimp/plugin-crop`, `@jimp/plugin-displace`, `@jimp/plugin-dither`, `@jimp/plugin-fisheye`, `@jimp/plugin-flip`, `@jimp/plugin-gaussian`, `@jimp/plugin-invert`, `@jimp/plugin-mask`, `@jimp/plugin-normalize`, `@jimp/plugin-print`, `@jimp/plugin-resize`, `@jimp/plugin-rotate`, `@jimp/plugin-scale`, `@jimp/plugin-shadow`, `@jimp/plugin-threshold`, `@jimp/plugins`, `@jimp/test-utils`, `@jimp/bmp`, `@jimp/gif`, `@jimp/jpeg`, `@jimp/png`, `@jimp/tiff`, `@jimp/types`, `@jimp/utils`
  - Fix regeneratorRuntime errors [#815](https://github.com/oliver-moran/jimp/pull/815) ([@crutchcorn](https://github.com/crutchcorn) [@hipstersmoothie](https://github.com/hipstersmoothie))
- `@jimp/core`
  - Follow redirects [#789](https://github.com/oliver-moran/jimp/pull/789) ([@SaWey](https://github.com/SaWey) sander@solora.be)

#### 🏠  Internal

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
