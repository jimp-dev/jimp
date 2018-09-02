<div align="center">
  <a href="https://intuit.github.io/Ignite/">
    <img width="200" height="200"
      src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  </a>
  <h1>Jimp</h1>
  <p>JavaScript Image Manipulation Program</p>
</div>

An image processing library for Node written entirely in JavaScript, with zero native dependencies.

Installation: `npm install --save jimp`

API documentation can be found in the main [jimp package](./packages/jimp)

## Supported Image Types

- [bmp](./packages/type-bmp)
- [gif](./packages/type-gif)
- [jpeg](./packages/type-jpeg)
- [png](./packages/type-png)
- [tiff](./packages/type-tiff)

## Image Manipulation Methods

- [blit](./packages/plugin-blit)
- [blur](./packages/plugin-blur)
- [color](./packages/plugin-color)
- [contain](./packages/plugin-contain)
- [cover](./packages/plugin-cover)
- [displace](./packages/plugin-displace)
- [dither](./packages/plugin-dither)
- [flip](./packages/plugin-flip)
- [gaussian](./packages/plugin-gaussian)
- [invert](./packages/plugin-invert)
- [mask](./packages/plugin-mask)
- [normalize](./packages/plugin-normalize)
- [print](./packages/plugin-print)
- [resize](./packages/plugin-resize)
- [rotate](./packages/plugin-rotate)
- [scale](./packages/plugin-scale)

## Custom Jimp

If you want to extend jimp or omit types or functions visit [@jimp/custom](./packages).

- Add file-types or switch encoder/decoders
- Add add/remove plugins (image manipulation methods)

## Contributing

Basically clone, change, test, push and pull request.

Please read the [CONTRIBUTING documentation](CONTRIBUTING.md).

## License

Jimp is licensed under the MIT license. Open Sans is licensed under the Apache license

## Project Using Jimp

:star: [favicons](https://www.npmjs.com/package/favicons) - A Node.js module for generating favicons and their associated files.

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
