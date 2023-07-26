<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>Jimp</h1>
  <p>JavaScript Image Manipulation Program</p>
  <p>An image processing library for Node written entirely in JavaScript, with zero native dependencies.</p>
</div>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Supported Image Types](#supported-image-types)
- [Image Manipulation Methods (Default Plugins)](#image-manipulation-methods-default-plugins)
- [Extra Plugins](#extra-plugins)
- [Custom Jimp](#custom-jimp)
- [Contributing](#contributing)
- [License](#license)
- [Project Using Jimp](#project-using-jimp)
- [Contributors ✨](#contributors-)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

> ## Notice of potentially breaking change
>
> As of v0.10.4, core-js is no longer included with jimp or its extensions. If you rely on core-js, install it with either `yarn add core-js` or `npm i core-js`

> ## Read before installing
>
> Please be aware that Jimp is built on JavaScript implementations of image formats so in some cases that might [allocate a lot of memory](https://github.com/jimp-dev/jimp/issues/153) before using.

## Installation

Installation: `npm install --save jimp`

API documentation can be found in the main [jimp package](./packages/jimp)

## Supported Image Types

- [bmp](./packages/type-bmp)
- [gif](./packages/type-gif)
- [jpeg](./packages/type-jpeg)
- [png](./packages/type-png)
- [tiff](./packages/type-tiff)

## Image Manipulation Methods (Default Plugins)

- [blit](./packages/plugin-blit) - Blit an image onto another.
- [blur](./packages/plugin-blur) - Quickly blur an image.
- [color](./packages/plugin-color) - Various color manipulation methods.
- [contain](./packages/plugin-contain) - Contain an image within a height and width.
- [cover](./packages/plugin-cover) - Scale the image to the given width and height keeping the aspect ratio.
- [displace](./packages/plugin-displace) - Displaces the image based on a displacement map
- [dither](./packages/plugin-dither) - Apply a dither effect to an image.
- [flip](./packages/plugin-flip) - Flip an image along its x or y axis.
- [gaussian](./packages/plugin-gaussian) - Hardcore blur.
- [invert](./packages/plugin-invert) - Invert an images colors
- [mask](./packages/plugin-mask) - Mask one image with another.
- [normalize](./packages/plugin-normalize) - Normalize the colors in an image
- [print](./packages/plugin-print) - Print text onto an image
- [resize](./packages/plugin-resize) - Resize an image.
- [rotate](./packages/plugin-rotate) - Rotate an image.
- [scale](./packages/plugin-scale) - Uniformly scales the image by a factor.

## Extra Plugins

- [circle](./packages/plugin-circle) - Creates a circle out of an image.
- [shadow](./packages/plugin-shadow) - Creates a shadow on an image.
- [fisheye](./packages/plugin-fisheye) - Apply a fisheye effect to an image.
- [threshold](./packages/plugin-threshold) - Lighten an image. Good for scanned drawing and signatures.

:rocket: If you want to add your plugins to this list make a PR! :rocket:

## Custom Jimp

If you want to extend jimp or omit types or functions visit [@jimp/custom](./packages/custom).

- Add file-types or switch encoder/decoders
- Add add/remove plugins (image manipulation methods)

## Contributing

Basically clone, change, test, push and pull request.

Please read the [CONTRIBUTING documentation](CONTRIBUTING.md).

## License

Jimp is licensed under the MIT license. Open Sans is licensed under the Apache license

## Project Using Jimp

:star: [nimp](https://nimp.app/) - Node based image manipulator. Procedurally create and edit images.

:star: [node-vibrant](https://www.npmjs.com/package/node-vibrant) - Extract prominent colors from an image.

:star: [lqip](https://www.npmjs.com/package/lqip) - Low Quality Image Placeholders (LQIP) Module for Node

:star: [webpack-pwa-manifest](https://www.npmjs.com/package/webpack-pwa-manifest) - A webpack plugin that generates a 'manifest.json' for your Progressive Web Application, with auto icon resizing and fingerprinting support.

:star: [wdio-screenshot](https://www.npmjs.com/package/wdio-screenshot) - A WebdriverIO plugin. Additional commands for taking screenshots with WebdriverIO.

:star: [asciify-image](https://www.npmjs.com/package/asciify-image) - Convert images to ASCII art

:star: [node-sprite-generator](https://www.npmjs.com/package/node-sprite-generator) - Generates image sprites and their spritesheets (css, stylus, sass, scss or less) from sets of images. Supports retina sprites.

:star: [merge-img](https://www.npmjs.com/package/merge-img) - Merge multiple images into a single image

:star: [postcss-resemble-image](https://www.npmjs.com/package/postcss-resemble-image) - Provide a gradient fallback for an image that loosely resembles the original.

:star: [differencify](https://www.npmjs.com/package/differencify) - Perceptual diffing tool

:star: [gifwrap](https://www.npmjs.com/package/gifwrap) - A Jimp-compatible library for working with GIFs

:star: [replace-color](https://www.npmjs.com/package/replace-color) - Replace color with another one pixel by pixel

:star: [handwritten.js](https://www.npmjs.com/package/handwritten.js) - Convert typed text to realistic handwriting!

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://hipstersmoothie.com/"><img src="https://avatars.githubusercontent.com/u/1192452?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andrew Lisowski</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=hipstersmoothie" title="Code">💻</a> <a href="#infra-hipstersmoothie" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/jimp-dev/jimp/commits?author=hipstersmoothie" title="Documentation">📖</a> <a href="https://github.com/jimp-dev/jimp/commits?author=hipstersmoothie" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/oliver-moran"><img src="https://avatars.githubusercontent.com/u/414918?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Oliver Moran</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=oliver-moran" title="Code">💻</a></td>
    <td align="center"><a href="http://www.phil-seaton.com/"><img src="https://avatars.githubusercontent.com/u/1693906?v=4?s=100" width="100px;" alt=""/><br /><sub><b>strandedcity</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=strandedcity" title="Code">💻</a></td>
    <td align="center"><a href="https://codingpuffin.com/"><img src="https://avatars.githubusercontent.com/u/2071336?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Edgar Hipp</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=edi9999" title="Code">💻</a></td>
    <td align="center"><a href="https://crutchcorn.dev/"><img src="https://avatars.githubusercontent.com/u/9100169?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Corbin Crutchley</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=crutchcorn" title="Code">💻</a></td>
    <td align="center"><a href="https://maxpanas.com/"><img src="https://avatars.githubusercontent.com/u/2260302?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Max G J Panas</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=Maximilianos" title="Code">💻</a></td>
    <td align="center"><a href="https://www.fxhash.xyz/u/neophob"><img src="https://avatars.githubusercontent.com/u/837347?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Michael Vogt</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=neophob" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://www.sistemisolari.com/"><img src="https://avatars.githubusercontent.com/u/849127?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Marcolino</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=marcolino" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/iwsfg"><img src="https://avatars.githubusercontent.com/u/5304842?v=4?s=100" width="100px;" alt=""/><br /><sub><b>iwsfg</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=iwsfg" title="Code">💻</a></td>
    <td align="center"><a href="https://www.net4visions.at/"><img src="https://avatars.githubusercontent.com/u/5228369?v=4?s=100" width="100px;" alt=""/><br /><sub><b>arlecchino</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=kolbma" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/super-ienien"><img src="https://avatars.githubusercontent.com/u/1185858?v=4?s=100" width="100px;" alt=""/><br /><sub><b>super-ienien</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=super-ienien" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/bdsomer"><img src="https://avatars.githubusercontent.com/u/13303021?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Bennett Somerville</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=bdsomer" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/f-barth"><img src="https://avatars.githubusercontent.com/u/2833600?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Florian Barth</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=f-barth" title="Code">💻</a></td>
    <td align="center"><a href="https://adamrackis.dev/"><img src="https://avatars.githubusercontent.com/u/11261266?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Adam Rackis</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=arackaf" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://aurium.one/"><img src="https://avatars.githubusercontent.com/u/30254?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Aurélio A. Heckert</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=aurium" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/dftian"><img src="https://avatars.githubusercontent.com/u/1504178?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daniel Tian</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=dftian" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/jeffbseeking"><img src="https://avatars.githubusercontent.com/u/25069896?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jeff Bonnes</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=jeffbseeking" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/russleyshaw"><img src="https://avatars.githubusercontent.com/u/2314816?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Russley Shaw</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=russleyshaw" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/CodeLenny"><img src="https://avatars.githubusercontent.com/u/9272847?v=4?s=100" width="100px;" alt=""/><br /><sub><b>CodeLenny</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=CodeLenny" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/skalee"><img src="https://avatars.githubusercontent.com/u/154287?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sebastian Skałacki</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=skalee" title="Code">💻</a></td>
    <td align="center"><a href="https://naivebias.com/"><img src="https://avatars.githubusercontent.com/u/169864?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Turan Rustamli</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=rustamli" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://www.linkedin.com/in/vlad-turak/"><img src="https://avatars.githubusercontent.com/u/7996184?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Vlad Turak</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=turakvlad" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/ozelot379"><img src="https://avatars.githubusercontent.com/u/81532633?v=4?s=100" width="100px;" alt=""/><br /><sub><b>ozelot379</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=ozelot379" title="Code">💻</a></td>
    <td align="center"><a href="https://adamjones.me/"><img src="https://avatars.githubusercontent.com/u/4953590?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Adam Jones</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=domdomegg" title="Code">💻</a></td>
    <td align="center"><a href="https://ahmadawais.com/"><img src="https://avatars.githubusercontent.com/u/960133?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ahmad Awais ⚡️</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=ahmadawais" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/NiGhTTraX"><img src="https://avatars.githubusercontent.com/u/485061?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andrei Picus</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=NiGhTTraX" title="Code">💻</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/acchou"><img src="https://avatars.githubusercontent.com/u/1381213?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andy Chou</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=acchou" title="Code">💻</a></td>
    <td align="center"><a href="http://www.cbio.uct.ac.za/~arjun/"><img src="https://avatars.githubusercontent.com/u/1463145?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Arjun Khoosal</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=super-cache-money" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/Armanio"><img src="https://avatars.githubusercontent.com/u/3195714?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Arman</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=Armanio" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Autom3"><img src="https://avatars.githubusercontent.com/u/4996080?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Autom3</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=Autom3" title="Code">💻</a></td>
    <td align="center"><a href="https://www.bernardo.me/"><img src="https://avatars.githubusercontent.com/u/1395723?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Bernardo Farah</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=berfarah" title="Code">💻</a></td>
    <td align="center"><a href="https://big-endian.nl/"><img src="https://avatars.githubusercontent.com/u/5346609?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Boon</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=apboon" title="Code">💻</a></td>
    <td align="center"><a href="https://brianrosamilia.github.io/"><img src="https://avatars.githubusercontent.com/u/4909591?v=4?s=100" width="100px;" alt=""/><br /><sub><b>BrianRosamilia</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=BrianRosamilia" title="Code">💻</a></td>
    <td align="center"><a href="https://carterbancroft.com/"><img src="https://avatars.githubusercontent.com/u/126476?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Carter Bancroft</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=carterbancroft" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/cbanfiel"><img src="https://avatars.githubusercontent.com/u/46502618?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Chad Banfield</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=cbanfiel" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://charafsalmi.org/"><img src="https://avatars.githubusercontent.com/u/278809?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Charaf Salmi</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=charafsalmi" title="Code">💻</a></td>
    <td align="center"><a href="https://ciffelia.com/"><img src="https://avatars.githubusercontent.com/u/15273128?v=4?s=100" width="100px;" alt=""/><br /><sub><b>ciffelia</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=ciffelia" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/CodySchrank"><img src="https://avatars.githubusercontent.com/u/10748482?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Cody Schrank</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=CodySchrank" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/CruScanlan"><img src="https://avatars.githubusercontent.com/u/24949142?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Cru Scanlan</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=CruScanlan" title="Code">💻</a></td>
    <td align="center"><a href="https://autery.net/"><img src="https://avatars.githubusercontent.com/u/2135631?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Curtis Autery</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=ceautery" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/dan335"><img src="https://avatars.githubusercontent.com/u/499401?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dan</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=dan335" title="Code">💻</a></td>
    <td align="center"><a href="http://danielholmes.org/"><img src="https://avatars.githubusercontent.com/u/349833?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daniel Holmes</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=danielholmes" title="Code">💻</a> <a href="https://github.com/jimp-dev/jimp/commits?author=danielholmes" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://danieltschinder.com/"><img src="https://avatars.githubusercontent.com/u/231804?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daniel Tschinder</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=danez" title="Code">💻</a></td>
    <td align="center"><a href="https://madavi.co.ke/"><img src="https://avatars.githubusercontent.com/u/17042186?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daniel Kimani</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=dannysofftie" title="Code">💻</a></td>
    <td align="center"><a href="http://www.linkedin.com/in/darakong"><img src="https://avatars.githubusercontent.com/u/32360?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dara Kong</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=dkong" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Den-dp"><img src="https://avatars.githubusercontent.com/u/1770529?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Denis Bendrikov</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=Den-dp" title="Code">💻</a></td>
    <td align="center"><a href="http://dcbartlett.info/"><img src="https://avatars.githubusercontent.com/u/1077050?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dennis Bartlett</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=dcbartlett" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/DomiR"><img src="https://avatars.githubusercontent.com/u/1834664?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dominique Rau</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=DomiR" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/EirikBirkeland"><img src="https://avatars.githubusercontent.com/u/12223584?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Eirik Birkeland</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=EirikBirkeland" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://forivall.com/"><img src="https://avatars.githubusercontent.com/u/760204?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Emily Marigold Klassen</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=forivall" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/FrenchHipster"><img src="https://avatars.githubusercontent.com/u/397332?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Emmanuel Bourgerie</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=FrenchHipster" title="Code">💻</a></td>
    <td align="center"><a href="https://end.re/"><img src="https://avatars.githubusercontent.com/u/354409?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Endre Szabo</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=endreszabo" title="Code">💻</a></td>
    <td align="center"><a href="https://ericrabil.com/"><img src="https://avatars.githubusercontent.com/u/8052613?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Eric Rabil</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=EricRabil" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/GalHorowitz"><img src="https://avatars.githubusercontent.com/u/7957292?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Gal Horowitz</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=GalHorowitz" title="Code">💻</a></td>
    <td align="center"><a href="http://glitchypsi.xyz/"><img src="https://avatars.githubusercontent.com/u/11571952?v=4?s=100" width="100px;" alt=""/><br /><sub><b>GlitchyPSI</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=GlitchyPSIX" title="Code">💻</a></td>
    <td align="center"><a href="https://ko-fi.com/wallabra"><img src="https://avatars.githubusercontent.com/u/4016417?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Gustavo Ramos Rehermann</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=wallabra" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/HanKruiger"><img src="https://avatars.githubusercontent.com/u/2293252?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Han Kruiger</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=HanKruiger" title="Code">💻</a></td>
    <td align="center"><a href="https://borges.dev/"><img src="https://avatars.githubusercontent.com/u/735858?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Igor Borges</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=comigor" title="Code">💻</a></td>
    <td align="center"><a href="https://www.ganevdev.com/"><img src="https://avatars.githubusercontent.com/u/8168280?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ivan Ganev</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=ganevdev" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/koprda"><img src="https://avatars.githubusercontent.com/u/2494102?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ivan Koprda</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=koprda" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/iwasawafag"><img src="https://avatars.githubusercontent.com/u/90386907?v=4?s=100" width="100px;" alt=""/><br /><sub><b>iwasawafag</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=iwasawafag" title="Code">💻</a></td>
    <td align="center"><a href="https://jakechampion.name/"><img src="https://avatars.githubusercontent.com/u/1569131?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jake Champion</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=JakeChampion" title="Code">💻</a></td>
    <td align="center"><a href="https://wopian.me/"><img src="https://avatars.githubusercontent.com/u/3440094?v=4?s=100" width="100px;" alt=""/><br /><sub><b>James Harris</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=wopian" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://jross.me/"><img src="https://avatars.githubusercontent.com/u/856748?v=4?s=100" width="100px;" alt=""/><br /><sub><b>James Ross</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=Cherry" title="Code">💻</a></td>
    <td align="center"><a href="https://velohacker.com/"><img src="https://avatars.githubusercontent.com/u/141657?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jeremy Katz</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=katzj" title="Code">💻</a></td>
    <td align="center"><a href="https://favware.tech/"><img src="https://avatars.githubusercontent.com/u/4019718?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jeroen Claassens</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=favna" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/ksjogo"><img src="https://avatars.githubusercontent.com/u/699858?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Johannes Goslar</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=ksjogo" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/j-d-carmichael"><img src="https://avatars.githubusercontent.com/u/49351986?v=4?s=100" width="100px;" alt=""/><br /><sub><b>J D Carmichael</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=j-d-carmichael" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/JR-Y"><img src="https://avatars.githubusercontent.com/u/24767278?v=4?s=100" width="100px;" alt=""/><br /><sub><b>John-Robert Yrjölä</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=JR-Y" title="Code">💻</a></td>
    <td align="center"><a href="https://jdanford.github.io/"><img src="https://avatars.githubusercontent.com/u/5767112?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jordan Danford</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=jdanford" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/joseph4tw"><img src="https://avatars.githubusercontent.com/u/3308780?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Joseph</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=joseph4tw" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/keith301"><img src="https://avatars.githubusercontent.com/u/266811?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Keith</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=keith301" title="Code">💻</a></td>
    <td align="center"><a href="http://keithcod.es/"><img src="https://avatars.githubusercontent.com/u/28452108?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Keith Mitchell</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=xkisu" title="Code">💻</a></td>
    <td align="center"><a href="https://hachyderm.io/@kwyn"><img src="https://avatars.githubusercontent.com/u/5528612?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kwyn Alice Meagher</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=kwyn" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/lucyyyyyyy"><img src="https://avatars.githubusercontent.com/u/54782568?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Lucy</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=lucyyyyyyy" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/yet-another-nagayev"><img src="https://avatars.githubusercontent.com/u/41082059?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Marat Nagayev</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=yet-another-nagayev" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Haringat"><img src="https://avatars.githubusercontent.com/u/3000678?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Marcel Mundl</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=Haringat" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://ma-source.de/"><img src="https://avatars.githubusercontent.com/u/546111?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mario Adrian</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=many20" title="Code">💻</a></td>
    <td align="center"><a href="https://www.europacup.se/"><img src="https://avatars.githubusercontent.com/u/7765599?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Martin Trobäck</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=lekoaf" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/tooolbox"><img src="https://avatars.githubusercontent.com/u/4984708?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Matt Mc</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=tooolbox" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/mynameismax"><img src="https://avatars.githubusercontent.com/u/59715207?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Max</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=mynameismax" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/arcanis"><img src="https://avatars.githubusercontent.com/u/1037931?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Maël Nison</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=arcanis" title="Code">💻</a></td>
    <td align="center"><a href="http://www.cs.bgu.ac.il/~elhadad"><img src="https://avatars.githubusercontent.com/u/8447964?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Michael Elhadad</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=melhadad" title="Code">💻</a></td>
    <td align="center"><a href="https://mbejda.com/"><img src="https://avatars.githubusercontent.com/u/5429780?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Milos Bejda</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=mbejda" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/Mithgol"><img src="https://avatars.githubusercontent.com/u/1088720?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mithgol</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=Mithgol" title="Code">💻</a></td>
    <td align="center"><a href="https://js.wiki/"><img src="https://avatars.githubusercontent.com/u/15522395?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nicolas Giard</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=NGPixel" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/nambok"><img src="https://avatars.githubusercontent.com/u/515006?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nam Bok Rodriguez</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=nambok" title="Code">💻</a></td>
    <td align="center"><a href="http://alterform.com/"><img src="https://avatars.githubusercontent.com/u/116871?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nate Cavanaugh</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=natecavanaugh" title="Code">💻</a></td>
    <td align="center"><a href="http://nrkn.com/"><img src="https://avatars.githubusercontent.com/u/607925?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nik </b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=nrkn" title="Code">💻</a></td>
    <td align="center"><a href="http://ollybanham.com/"><img src="https://avatars.githubusercontent.com/u/3280058?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Olly Banham</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=Olyvar" title="Code">💻</a></td>
    <td align="center"><a href="http://www.pasieronen.com/"><img src="https://avatars.githubusercontent.com/u/991932?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pasi Eronen</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=pasieronen" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://copist.ru/"><img src="https://avatars.githubusercontent.com/u/1147388?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pavel Volyntsev</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=pvolyntsev" title="Code">💻</a></td>
    <td align="center"><a href="https://theill.com/"><img src="https://avatars.githubusercontent.com/u/6797?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Peter Theill</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=theill" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/PhilHannent"><img src="https://avatars.githubusercontent.com/u/813874?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Philip Hannent</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=PhilHannent" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/ebual"><img src="https://avatars.githubusercontent.com/u/12325379?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Philipp Laube</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=ebual" title="Code">💻</a></td>
    <td align="center"><a href="https://alias-rahil.github.io/"><img src="https://avatars.githubusercontent.com/u/59060219?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rahil Kabani</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=alias-rahil" title="Code">💻</a></td>
    <td align="center"><a href="https://robmoo.re/"><img src="https://avatars.githubusercontent.com/u/4934366?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rob Moore</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=robert-moore" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/BridgeAR"><img src="https://avatars.githubusercontent.com/u/8822573?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ruben Bridgewater</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=BridgeAR" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/SamBroner"><img src="https://avatars.githubusercontent.com/u/6915288?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sam Broner</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=SamBroner" title="Code">💻</a></td>
    <td align="center"><a href="https://www.bellwoodstudios.com/"><img src="https://avatars.githubusercontent.com/u/588921?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sam MacPherson</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=hexonaut" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/SaWey"><img src="https://avatars.githubusercontent.com/u/1469848?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sander Weyens</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=SaWey" title="Code">💻</a></td>
    <td align="center"><a href="https://symis.me/"><img src="https://avatars.githubusercontent.com/u/1550237?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Shen Yiming</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=soimy" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/selaux"><img src="https://avatars.githubusercontent.com/u/848854?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Stefan Lau</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=selaux" title="Code">💻</a></td>
    <td align="center"><a href="https://plus.google.com/u/0/103354693083460731603/posts"><img src="https://avatars.githubusercontent.com/u/346343?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Steve Bazyl</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=sqrrrl" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/MaoStevemao"><img src="https://avatars.githubusercontent.com/u/6316590?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Steve Mao</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=stevemao" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://stuarth.github.io/"><img src="https://avatars.githubusercontent.com/u/7055?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Stuart Hinson</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=stuarth" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/tombull"><img src="https://avatars.githubusercontent.com/u/3214864?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Tom Bull</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=tombull" title="Code">💻</a></td>
    <td align="center"><a href="https://tonystr.net/"><img src="https://avatars.githubusercontent.com/u/30723101?v=4?s=100" width="100px;" alt=""/><br /><sub><b>TonyStr</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=tonystr" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/laurentva"><img src="https://avatars.githubusercontent.com/u/20355144?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Laurent</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=laurentva" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Chupsy"><img src="https://avatars.githubusercontent.com/u/3929330?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Vincent Dufrasnes</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=Chupsy" title="Code">💻</a></td>
    <td align="center"><a href="https://iamstarkov.com/"><img src="https://avatars.githubusercontent.com/u/559321?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Vladimir Starkov</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=iamstarkov" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/VojtechStep"><img src="https://avatars.githubusercontent.com/u/15523887?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Vojtěch Štěpančík</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=VojtechStep" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/wfriesen"><img src="https://avatars.githubusercontent.com/u/186727?v=4?s=100" width="100px;" alt=""/><br /><sub><b>William Friesen</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=wfriesen" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/xlc"><img src="https://avatars.githubusercontent.com/u/1201310?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Xiliang Chen</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=xlc" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/lygstate"><img src="https://avatars.githubusercontent.com/u/121040?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Yonggang Luo</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=lygstate" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/austinfrey"><img src="https://avatars.githubusercontent.com/u/11063598?v=4?s=100" width="100px;" alt=""/><br /><sub><b>austinfrey</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=austinfrey" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/brownrw8"><img src="https://avatars.githubusercontent.com/u/6895070?v=4?s=100" width="100px;" alt=""/><br /><sub><b>brownrw8</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=brownrw8" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/coyotte508"><img src="https://avatars.githubusercontent.com/u/342922?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Eliott C.</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=coyotte508" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/d07RiV"><img src="https://avatars.githubusercontent.com/u/3448203?v=4?s=100" width="100px;" alt=""/><br /><sub><b>d07RiV</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=d07RiV" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/fabb"><img src="https://avatars.githubusercontent.com/u/153960?v=4?s=100" width="100px;" alt=""/><br /><sub><b>fabb</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=fabb" title="Code">💻</a></td>
    <td align="center"><a href="https://www.artesa.de/"><img src="https://avatars.githubusercontent.com/u/22286818?v=4?s=100" width="100px;" alt=""/><br /><sub><b>fratzinger</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=fratzinger" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/gcq"><img src="https://avatars.githubusercontent.com/u/1396111?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Guillem Cruz</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=gcq" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/krudos"><img src="https://avatars.githubusercontent.com/u/4700628?v=4?s=100" width="100px;" alt=""/><br /><sub><b>krudos</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=krudos" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/mLuby"><img src="https://avatars.githubusercontent.com/u/2483420?v=4?s=100" width="100px;" alt=""/><br /><sub><b>mLuby</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=mLuby" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/mfuatnuroglu"><img src="https://avatars.githubusercontent.com/u/86949272?v=4?s=100" width="100px;" alt=""/><br /><sub><b>mfuatnuroglu</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=mfuatnuroglu" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/misbach"><img src="https://avatars.githubusercontent.com/u/796795?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Matt Misbach</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=misbach" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/netdown"><img src="https://avatars.githubusercontent.com/u/4265403?v=4?s=100" width="100px;" alt=""/><br /><sub><b>netdown</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=netdown" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/nopeless"><img src="https://avatars.githubusercontent.com/u/38830903?v=4?s=100" width="100px;" alt=""/><br /><sub><b>nopeless</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=nopeless" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/thewizarodofoz"><img src="https://avatars.githubusercontent.com/u/19185792?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Oz Weiss</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=thewizarodofoz" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/popinguy"><img src="https://avatars.githubusercontent.com/u/2042350?v=4?s=100" width="100px;" alt=""/><br /><sub><b>popinguy</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=popinguy" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/qw3n"><img src="https://avatars.githubusercontent.com/u/8758277?v=4?s=100" width="100px;" alt=""/><br /><sub><b>qw3n</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=qw3n" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/rifflock"><img src="https://avatars.githubusercontent.com/u/4885312?v=4?s=100" width="100px;" alt=""/><br /><sub><b>rifflock</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=rifflock" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/s4tori"><img src="https://avatars.githubusercontent.com/u/3935146?v=4?s=100" width="100px;" alt=""/><br /><sub><b>s4tori</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=s4tori" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/sertal70"><img src="https://avatars.githubusercontent.com/u/25665841?v=4?s=100" width="100px;" alt=""/><br /><sub><b>sertal70</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=sertal70" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/xinbenlv"><img src="https://avatars.githubusercontent.com/u/640325?v=4?s=100" width="100px;" alt=""/><br /><sub><b>xinbenlv</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=xinbenlv" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/xinnix"><img src="https://avatars.githubusercontent.com/u/487185?v=4?s=100" width="100px;" alt=""/><br /><sub><b>xinnix</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=xinnix" title="Code">💻</a></td>
    <td align="center"><a href="https://pkjy.github.io/"><img src="https://avatars.githubusercontent.com/u/14119424?v=4?s=100" width="100px;" alt=""/><br /><sub><b>彭君怡</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=pkjy" title="Code">💻</a></td>
    <td align="center"><a href="http://andy128k.blogspot.com/"><img src="https://avatars.githubusercontent.com/u/16103?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andrey Kutejko</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=andy128k" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/ihorbond"><img src="https://avatars.githubusercontent.com/u/15573624?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ihor Bodnarchuk</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=ihorbond" title="Documentation">📖</a></td>
    <td align="center"><a href="https://daniell.dev/"><img src="https://avatars.githubusercontent.com/u/44723767?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daniell</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=daniellwdb" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/black-turtle"><img src="https://avatars.githubusercontent.com/u/61377556?v=4?s=100" width="100px;" alt=""/><br /><sub><b>MD KHAIRUL ISLAM</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=black-turtle" title="Tests">⚠️</a> <a href="https://github.com/jimp-dev/jimp/commits?author=black-turtle" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/JunkMeal"><img src="https://avatars.githubusercontent.com/u/65283415?v=4?s=100" width="100px;" alt=""/><br /><sub><b>JunkMeal</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=JunkMeal" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/Marsup"><img src="https://avatars.githubusercontent.com/u/796194?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nicolas Morel</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=Marsup" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/stevezac-osu"><img src="https://avatars.githubusercontent.com/u/71655313?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Zach Stevenson</b></sub></a><br /><a href="https://github.com/jimp-dev/jimp/commits?author=stevezac-osu" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
