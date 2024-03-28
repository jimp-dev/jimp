---
editUrl: false
next: false
prev: false
title: "Jimp"
---

A `Jimp` class enables you to:class

- Read an image into a "bit map" (a collection of pixels)
- Modify the bit map through methods that change the pixels
- Write the bit map back to an image buffer

## Example

#### Basic

You can use the Jimp class to make empty images.
This is useful for when you want to create an image that composed of other images on top of a background.

```ts
import { Jimp } from "jimp";

const image = new Jimp({ width: 256, height: 256, color: 0xffffffff });
const image2 = new Jimp({ width: 100, height: 100, color: 0xff0000ff });

image.composite(image2, 50, 50);
```

#### Node

You can use jimp in Node.js.
For example you can read an image from a file and resize it and
then write it back to a file.

```ts
import { Jimp, AutoSize } from "jimp";
import { promises as fs } from "fs";

const image = await Jimp.read("test/image.png");

image.resize(256, 100);
image.greyscale();

const output = await image.getBuffer("test/image.png");
await fs.writeFile("test/output.png", output);
```

#### Browser

You can use jimp in the browser by reading files from URLs

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("https://upload.wikimedia.org/wikipedia/commons/0/01/Bot-Test.jpg");

image.resize(256, 100);
image.greyscale();

const output = await image.getBuffer("test/image.png");

const canvas = document.createElement("canvas");

canvas.width = image.bitmap.width;
canvas.height = image.bitmap.height;

const ctx = canvas.getContext("2d");
ctx.putImageData(image.bitmap, 0, 0);

document.body.appendChild(canvas);
```

## Constructors

### new Jimp(JimpConstructorOptions)

> **new Jimp**(`JimpConstructorOptions`): [`Jimp`](Jimp.md)

#### Parameters

• **JimpConstructorOptions**: [`Bitmap`](../interfaces/Bitmap.md) \| [`JimpSimpleConstructorOptions`](../interfaces/JimpSimpleConstructorOptions.md)

#### Returns

[`Jimp`](Jimp.md)

#### Source

packages/core/dist/esm/index.d.ts:51

## Methods

### fromBitmap()

> **`static`** **fromBitmap**(`bitmap`): `Jimp`

Create a Jimp instance from a bitmap.
The difference between this and just using the constructor is that this will
convert raw image data into the bitmap format that Jimp uses.

#### Parameters

• **bitmap**: [`RawImageData`](../interfaces/RawImageData.md)

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = Jimp.fromBitmap({
  data: Buffer.from([
    0xffffffff, 0xffffffff, 0xffffffff,
    0xffffffff, 0xffffffff, 0xffffffff,
    0xffffffff, 0xffffffff, 0xffffffff,
  ]),
  width: 3,
  height: 3,
});
```

#### Source

packages/core/dist/esm/index.d.ts:767

***

### fromBuffer()

> **`static`** **fromBuffer**(`buffer`): `Promise`\<`Jimp`\>

Parse a bitmap with the loaded image types.

#### Parameters

• **buffer**: `Buffer`

Raw image data

#### Returns

`Promise`\<`Jimp`\>

#### Example

```ts
import { Jimp } from "jimp";

const buffer = await fs.readFile("test/image.png");
const image = await Jimp.fromBuffer(buffer);
```

#### Source

packages/core/dist/esm/index.d.ts:1234

***

### read()

> **`static`** **read**(`url`): `Promise`\<`Jimp`\>

Create a Jimp instance from a URL or a file path

#### Parameters

• **url**: `string`

#### Returns

`Promise`\<`Jimp`\>

#### Example

```ts
import { Jimp } from "jimp";

// Read from a file path
const image = await Jimp.read("test/image.png");

// Read from a URL
const image = await Jimp.read("https://upload.wikimedia.org/wikipedia/commons/0/01/Bot-Test.jpg");
```

#### Source

packages/core/dist/esm/index.d.ts:292

***

### autocrop()

> **autocrop**(`options`?): `Jimp`

Autocrop same color borders from this image.
This function will attempt to crop out transparent pixels from the image.

#### Parameters

• **options?**: [`AutocropOptions`](../interfaces/AutocropOptions.md)

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");
const cropped = image.autocrop();
```

#### Source

plugins/plugin-crop/dist/esm/index.d.ts:45

***

### blit()

> **blit**(`options`): `Jimp`

Short for "bit-block transfer".
It involves the transfer of a block of pixel data from one area of a computer's memory to another area, typically for the purpose of rendering images on the screen or manipulating them in various ways.
It's a fundamental operation in computer graphics utilized in various applications, from operating systems to video games.

#### Parameters

• **options**: `BlitOptions`\<`I`\>

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");
const parrot = await Jimp.read("test/party-parrot.png");

image.blit(parrot, x, y);
```

#### Source

plugins/plugin-blit/dist/esm/index.d.ts:34

***

### blur()

> **blur**(`r`): `Jimp`

A fast blur algorithm that produces similar effect to a Gaussian blur - but MUCH quicker

#### Parameters

• **r**: `number`

the pixel radius of the blur

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.blur(5);
```

#### Source

plugins/plugin-blur/dist/esm/index.d.ts:15

***

### brightness()

> **brightness**(`val`): `Jimp`

Adjusts the brightness of the image

#### Parameters

• **val**: `number`

the amount to adjust the brightness, a number between -1 and +1

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.brightness(0.5);
```

#### Source

plugins/plugin-color/dist/esm/index.d.ts:117

***

### circle()

> **circle**(`options`?): `Jimp`

Creates a circle out of an image.

#### Parameters

• **options?**: [`CircleOptions`](../interfaces/CircleOptions.md)

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.circle();
// or
image.circle({ radius: 50, x: 25, y: 25 });
```

#### Source

plugins/plugin-circle/dist/esm/index.d.ts:24

***

### clone()

> **clone**\<`S`\>(`this`): `S`

Clone the image into a new Jimp instance.

#### Type parameters

• **S** extends `unknown`

#### Parameters

• **this**: `S`

#### Returns

`S`

A new Jimp instance

#### Example

```ts
import { Jimp } from "jimp";

const image = new Jimp({ width: 3, height: 3, color: 0xffffffff });

const clone = image.clone();
```

#### Source

packages/core/dist/esm/index.d.ts:130

***

### color()

> **color**(`actions`): `Jimp`

Apply multiple color modification rules

#### Parameters

• **actions**: [`ColorAction`](../type-aliases/ColorAction.md)[]

list of color modification rules, in following format: \{ apply: '`<rule-name>`', params: [ `<rule-parameters>` ]  \}

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.color([
  { apply: "hue", params: [-90] },
  { apply: "lighten", params: [50] },
  { apply: "xor", params: ["#06D"] },
]);
```

#### Source

plugins/plugin-color/dist/esm/index.d.ts:290

***

### composite()

> **composite**\<`I`\>(`src`, `x`?, `y`?, `options`?): `any`

Composites a source image over to this image respecting alpha channels

#### Type parameters

• **I** extends `unknown`

#### Parameters

• **src**: `I`

the source Jimp instance

• **x?**: `number`

the x position to blit the image

• **y?**: `number`

the y position to blit the image

• **options?**

determine what mode to use

• **options\.mode?**: [`BlendMode`](../enumerations/BlendMode.md)

• **options\.opacityDest?**: `number`

• **options\.opacitySource?**: `number`

#### Returns

`any`

#### Example

```ts
import { Jimp } from "jimp";

const image = new Jimp({ width: 10, height: 10, color: 0xffffffff });
const image2 = new Jimp({ width: 3, height: 3, color: 0xff0000ff });

image.composite(image2, 3, 3);
```

#### Source

packages/core/dist/esm/index.d.ts:210

***

### contain()

> **contain**(`w`, `h`, `alignBits`?, `mode`?): `Jimp`

Scale the image to the given width and height keeping the aspect ratio. Some parts of the image may be letter boxed.

#### Parameters

• **w**: `number`

the width to resize the image to

• **h**: `number`

the height to resize the image to

• **alignBits?**: `number`

A bitmask for horizontal and vertical alignment

• **mode?**: [`ResizeStrategy`](../enumerations/ResizeStrategy.md)

a scaling method (e.g. Jimp.RESIZE_BEZIER)

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.contain(150, 100);
```

#### Source

plugins/plugin-contain/dist/esm/index.d.ts:19

***

### contrast()

> **contrast**(`val`): `Jimp`

Adjusts the contrast of the image

#### Parameters

• **val**: `number`

the amount to adjust the contrast, a number between -1 and +1

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.contrast(0.75);
```

#### Source

plugins/plugin-color/dist/esm/index.d.ts:130

***

### convolute()

> **convolute**(`kernel`, `x`?, `y`?, `w`?, `h`?): `Jimp`

Applies a convolution kernel to the image or a region

#### Parameters

• **kernel**: `number`[][]

the convolution kernel

• **x?**: `number`

(optional) the x position of the region to apply convolution to

• **y?**: `number`

(optional) the y position of the region to apply convolution to

• **w?**: `number`

(optional) the width of the region to apply convolution to

• **h?**: `number`

(optional) the height of the region to apply convolution to

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

// apply a convolution kernel to the whole image
image.convolution([
  [-1, -1, 0],
  [-1, 1, 1],
  [0, 1, 1],
]);

// apply a convolution kernel to a region
image.convolution([
  [-1, -1, 0],
  [-1, 1, 1],
  [0, 1, 1],
], 10, 10, 10, 20);
```

#### Source

plugins/plugin-color/dist/esm/index.d.ts:273

***

### convolution()

> **convolution**(`kernel`, `edgeHandling`?): `Jimp`

Adds each element of the image to its local neighbors, weighted by the kernel

#### Parameters

• **kernel**: `number`[][]

a matrix to weight the neighbors sum

• **edgeHandling?**: `number`

(optional) define how to sum pixels from outside the border

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.convolute([
  [-1, -1, 0],
  [-1, 1, 1],
  [0, 1, 1],
]);
```

#### Source

plugins/plugin-color/dist/esm/index.d.ts:211

***

### cover()

> **cover**(`w`, `h`, `alignBits`?, `mode`?): `Jimp`

Scale the image so the given width and height keeping the aspect ratio. Some parts of the image may be clipped.

#### Parameters

• **w**: `number`

the width to resize the image to

• **h**: `number`

the height to resize the image to

• **alignBits?**: `number`

A bitmask for horizontal and vertical alignment

• **mode?**: [`ResizeStrategy`](../enumerations/ResizeStrategy.md)

a scaling method (e.g. Jimp.RESIZE_BEZIER)

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.cover(150, 100);
```

#### Source

plugins/plugin-cover/dist/esm/index.d.ts:19

***

### crop()

> **crop**(`x`, `y`, `w`, `h`): `Jimp`

Crops the image at a given point to a give size.

#### Parameters

• **x**: `number`

• **y**: `number`

• **w**: `number`

• **h**: `number`

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");
const cropped = image.crop(150, 100);
```

#### Source

plugins/plugin-crop/dist/esm/index.d.ts:32

***

### displace()

> **displace**(`map`, `offset`): `Jimp`

Displaces the image based on the provided displacement map

#### Parameters

• **map**: `Jimp`

the source Jimp instance

• **offset**: `number`

the maximum displacement value

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");
const map = await Jimp.read("test/map.png");

image.displace(map, 10);
```

#### Source

plugins/plugin-displace/dist/esm/index.d.ts:17

***

### distanceFromHash()

> **distanceFromHash**(`compareHash`): `number`

Calculates the hamming distance of the current image and a hash based on their perceptual hash

#### Parameters

• **compareHash**: `string`

hash to compare to

#### Returns

`number`

a number ranging from 0 to 1, 0 means they are believed to be identical

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.distanceFromHash(image.pHash());
```

#### Source

plugins/plugin-hash/dist/esm/index.d.ts:43

***

### dither()

> **dither**(): `Jimp`

Apply a ordered dithering effect.

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.dither();
```

#### Source

plugins/plugin-dither/dist/esm/index.d.ts:14

***

### fade()

> **fade**(`f`): `Jimp`

Fades each pixel by a factor between 0 and 1

#### Parameters

• **f**: `number`

A number from 0 to 1. 0 will haven no effect. 1 will turn the image completely transparent.

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.fade(0.7);
```

#### Source

plugins/plugin-color/dist/esm/index.d.ts:193

***

### fisheye()

> **fisheye**(`options`?): `Jimp`

Adds a fisheye effect to the image.

#### Parameters

• **options?**: `FisheyeOptions`

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.fisheye();
```

#### Source

plugins/plugin-fisheye/dist/esm/index.d.ts:17

***

### flip()

> **flip**(`horizontal`, `vertical`): `Jimp`

Flip the image.

#### Parameters

• **horizontal**: `boolean`

a Boolean, if true the image will be flipped horizontally

• **vertical**: `boolean`

a Boolean, if true the image will be flipped vertically

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.flip(true, false);
```

#### Source

plugins/plugin-flip/dist/esm/index.d.ts:16

***

### gaussian()

> **gaussian**(`r`): `Jimp`

Applies a true Gaussian blur to the image (warning: this is VERY slow)

#### Parameters

• **r**: `number`

the pixel radius of the blur

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.gaussian(15);
```

#### Source

plugins/plugin-blur/dist/esm/index.d.ts:28

***

### getBase64()

> **getBase64**\<`ProvidedMimeType_1`, `Options_1`\>(`mime`, `options`?): `Promise`\<`string`\>

Converts the image to a base 64 string

#### Type parameters

• **ProvidedMimeType_1** extends `"image/bmp"` \| `"image/tiff"` \| `"image/x-ms-bmp"` \| `"image/gif"` \| `"image/jpeg"` \| `"image/png"`

• **Options_1** extends `undefined` \| `Pretty`\<`Partial`\<`Pick`\<`BmpImage`, `"palette"` \| `"colors"` \| `"importantColors"` \| `"hr"` \| `"vr"` \| `"reserved1"` \| `"reserved2"`\>\>\> \| [`JPEGOptions`](../interfaces/JPEGOptions.md) \| `Record`\<`string`, `any`\> \| `Omit`\<`PNGOptions`, `"filterType"` \| `"colorType"` \| `"inputColorType"`\> & `Object`

#### Parameters

• **mime**: `ProvidedMimeType_1`

The mime type to export to

• **options?**: `Options_1`

The options to use when exporting

#### Returns

`Promise`\<`string`\>

#### Example

```ts
import { Jimp } from "jimp";

const image = Jimp.fromBuffer(Buffer.from([
  0xff, 0x00, 0x00, 0x00, 0xff, 0x00, 0x00, 0x00,
  0xff, 0x00, 0x00, 0x00, 0xff, 0x00, 0x00, 0x00,
  0xff, 0x00, 0x00, 0x00, 0xff, 0x00, 0x00, 0x00,
]));

const base64 = image.getBase64("image/jpeg", {
  quality: 50,
});
```

#### Source

packages/core/dist/esm/index.d.ts:116

***

### getBuffer()

> **getBuffer**\<`ProvidedMimeType`, `Options`\>(`mime`, `options`?): `Promise`\<`Buffer`\>

Converts the Jimp instance to an image buffer

#### Type parameters

• **ProvidedMimeType** extends `"image/bmp"` \| `"image/tiff"` \| `"image/x-ms-bmp"` \| `"image/gif"` \| `"image/jpeg"` \| `"image/png"`

• **Options** extends `undefined` \| `Pretty`\<`Partial`\<`Pick`\<`BmpImage`, `"palette"` \| `"colors"` \| `"importantColors"` \| `"hr"` \| `"vr"` \| `"reserved1"` \| `"reserved2"`\>\>\> \| [`JPEGOptions`](../interfaces/JPEGOptions.md) \| `Record`\<`string`, `any`\> \| `Omit`\<`PNGOptions`, `"filterType"` \| `"colorType"` \| `"inputColorType"`\> & `Object`

#### Parameters

• **mime**: `ProvidedMimeType`

The mime type to export to

• **options?**: `Options`

The options to use when exporting

#### Returns

`Promise`\<`Buffer`\>

#### Example

```ts
import { Jimp } from "jimp";
import { promises as fs } from "fs";

const image = new Jimp({ width: 3, height: 3, color: 0xffffffff });

const buffer = await image.getBuffer("image/jpeg", {
  quality: 50,
});
await fs.writeFile("test/output.jpeg", buffer);
```

#### Source

packages/core/dist/esm/index.d.ts:95

***

### getPixelColor()

> **getPixelColor**(`x`, `y`): `number`

Returns the hex color value of a pixel

#### Parameters

• **x**: `number`

the x coordinate

• **y**: `number`

the y coordinate

#### Returns

`number`

the color of the pixel

#### Example

```ts
import { Jimp } from "jimp";

const image = new Jimp({ width: 3, height: 3, color: 0xffffffff });

image.getPixelColor(1, 1); // 0xffffffff
```

#### Source

packages/core/dist/esm/index.d.ts:161

***

### getPixelIndex()

> **getPixelIndex**(`x`, `y`, `edgeHandling`?): `number`

Returns the offset of a pixel in the bitmap buffer

#### Parameters

• **x**: `number`

the x coordinate

• **y**: `number`

the y coordinate

• **edgeHandling?**: [`Edge`](../enumerations/Edge.md)

(optional) define how to sum pixels from outside the border

#### Returns

`number`

the index of the pixel or -1 if not found

#### Example

```ts
import { Jimp } from "jimp";

const image = new Jimp({ width: 3, height: 3, color: 0xffffffff });

image.getPixelIndex(1, 1); // 2
```

#### Source

packages/core/dist/esm/index.d.ts:146

***

### greyscale()

> **greyscale**(): `Jimp`

Removes colour from the image using ITU Rec 709 luminance values

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.greyscale();
```

#### Source

plugins/plugin-color/dist/esm/index.d.ts:155

***

### hasAlpha()

> **hasAlpha**(): `boolean`

Determine if the image contains opaque pixels.

#### Returns

`boolean`

#### Example

```ts
import { Jimp } from "jimp";

const image = new Jimp({ width: 3, height: 3, color: 0xffffffaa });
const image2 = new Jimp({ width: 3, height: 3, color: 0xff0000ff });

image.hasAlpha(); // false
image2.hasAlpha(); // true
```

#### Source

packages/core/dist/esm/index.d.ts:193

***

### hash()

> **hash**(`base`?): `string`

Generates a perceptual hash of the image `<https://en.wikipedia.org/wiki/Perceptual_hashing>`. And pads the string. Can configure base.

#### Parameters

• **base?**: `number`

A number between 2 and 64 representing the base for the hash (e.g. 2 is binary, 10 is decimal, 16 is hex, 64 is base 64). Defaults to 64.

#### Returns

`string`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.hash(2); // binary
image.hash(64); // base 64
```

#### Source

plugins/plugin-hash/dist/esm/index.d.ts:29

***

### inspect()

> **inspect**(): `string`

Nicely format Jimp object when sent to the console e.g. console.log(image)

#### Returns

`string`

Pretty printed jimp object

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

console.log(image);
```

#### Source

packages/core/dist/esm/index.d.ts:72

***

### invert()

> **invert**(): `Jimp`

Inverts the colors in the image.

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.invert();
```

#### Source

plugins/plugin-color/dist/esm/index.d.ts:104

***

### mask()

> **mask**(`src`, `x`?, `y`?): `Jimp`

Masks a source image on to this image using average pixel colour. A completely black pixel on the mask will turn a pixel in the image completely transparent.

#### Parameters

• **src**: `Jimp`

the source Jimp instance

• **x?**: `number`

the horizontal position to blit the image

• **y?**: `number`

the vertical position to blit the image

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");
const mask = await Jimp.read("test/mask.png");

image.mask(mask);
```

#### Source

plugins/plugin-mask/dist/esm/index.d.ts:18

***

### normalize()

> **normalize**(): `Jimp`

Normalizes the image.

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.normalize();
```

#### Source

plugins/plugin-color/dist/esm/index.d.ts:92

***

### opacity()

> **opacity**(`f`): `Jimp`

Multiplies the opacity of each pixel by a factor between 0 and 1

#### Parameters

• **f**: `number`

A number, the factor by which to multiply the opacity of each pixel

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.opacity(0.5);
```

#### Source

plugins/plugin-color/dist/esm/index.d.ts:168

***

### opaque()

> **opaque**(): `Jimp`

Set the alpha channel on every pixel to fully opaque.

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.opaque();
```

#### Source

plugins/plugin-color/dist/esm/index.d.ts:223

***

### pHash()

> **pHash**(): `string`

Calculates the perceptual hash

#### Returns

`string`

the perceptual hash

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.hash();
```

#### Source

plugins/plugin-hash/dist/esm/index.d.ts:15

***

### pixelate()

> **pixelate**(`size`, `x`?, `y`?, `w`?, `h`?): `Jimp`

Pixelates the image or a region

#### Parameters

• **size**: `number`

the size of the pixels

• **x?**: `number`

(optional) the x position of the region to pixelate

• **y?**: `number`

(optional) the y position of the region to pixelate

• **w?**: `number`

(optional) the width of the region to pixelate

• **h?**: `number`

(optional) the height of the region to pixelate

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

// pixelate the whole image
image.pixelate(10);

// pixelate a region
image.pixelate(10, 10, 10, 20, 20);
```

#### Source

plugins/plugin-color/dist/esm/index.d.ts:244

***

### posterize()

> **posterize**(`n`): `Jimp`

Apply a posterize effect

#### Parameters

• **n**: `number`

the amount to adjust the contrast, minimum threshold is two

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.posterize(5);
```

#### Source

plugins/plugin-color/dist/esm/index.d.ts:143

***

### print()

> **print**(`font`, `x`, `y`, `text`, `maxWidth`?, `maxHeight`?, `cb`?): `Jimp`

Draws a text on a image on a given boundary

#### Parameters

• **font**: `BmFont`\<`I`\>

a bitmap font loaded from `Jimp.loadFont` command

• **x**: `number`

the x position to start drawing the text

• **y**: `number`

the y position to start drawing the text

• **text**: `string` \| `number` \| `Object`

the text to draw (string or object with `text`, `alignmentX`, and/or `alignmentY`)

• **maxWidth?**: `number`

the boundary width to draw in

• **maxHeight?**: `number`

the boundary height to draw in

• **cb?**

(optional) a callback for when complete that ahs the end co-ordinates of the text

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");
const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

image.print(font, 10, 10, "Hello world!");
```

#### Source

plugins/plugin-print/dist/esm/index.d.ts:26

***

### resize()

> **resize**(`w`, `h`, `mode`?): `Jimp`

Resizes the image to a set width and height using a 2-pass bilinear algorithm

#### Parameters

• **w**: `number`

the width to resize the image to (or AutoSize)

• **h**: `number`

the height to resize the image to (or AutoSize)

• **mode?**: [`ResizeStrategy`](../enumerations/ResizeStrategy.md)

a scaling method (e.g. Jimp.RESIZE_BEZIER)

#### Returns

`Jimp`

#### Example

```ts
import { Jimp, AutoSize } from "jimp";

const image = await Jimp.read("test/image.png");

image.resize(150, AutoSize);
```

#### Source

plugins/plugin-resize/dist/esm/index.d.ts:19

***

### rotate()

> **rotate**(`deg`, `mode`?): `Jimp`

Rotates the image counter-clockwise by a number of degrees. By default the width and height of the image will be resized appropriately.

#### Parameters

• **deg**: `number`

the number of degrees to rotate the image by

• **mode?**: `boolean` \| [`ResizeStrategy`](../enumerations/ResizeStrategy.md)

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.rotate(90);
```

#### Source

plugins/plugin-rotate/dist/esm/index.d.ts:16

***

### scale()

> **scale**(`f`, `mode`?): `Jimp`

Uniformly scales the image by a factor.

#### Parameters

• **f**: `number`

the factor to scale the image by

• **mode?**: [`ResizeStrategy`](../enumerations/ResizeStrategy.md)

(optional) a scaling method (e.g. Jimp.RESIZE_BEZIER)

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.scale(0.5);
```

#### Source

plugins/plugin-resize/dist/esm/index.d.ts:33

***

### scaleToFit()

> **scaleToFit**(`w`, `h`, `mode`?): `Jimp`

Scale the image to the largest size that fits inside the rectangle that has the given width and height.

#### Parameters

• **w**: `number`

the width to resize the image to

• **h**: `number`

the height to resize the image to

• **mode?**: [`ResizeStrategy`](../enumerations/ResizeStrategy.md)

a scaling method (e.g. ResizeStrategy.BEZIER)

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.scaleToFit(100, 100);
```

#### Source

plugins/plugin-resize/dist/esm/index.d.ts:48

***

### scan()

#### scan(f)

> **scan**(`f`): `this`

Scan through the image and call the callback for each pixel

##### Parameters

• **f**

##### Returns

`this`

##### Example

```ts
import { Jimp } from "jimp";

const image = new Jimp({ width: 3, height: 3, color: 0xffffffff });

image.scan((x, y, idx) => {
  // do something with the pixel
});

// Or scan through just a region
image.scan(0, 0, 2, 2, (x, y, idx) => {
  // do something with the pixel
});
```

##### Source

packages/core/dist/esm/index.d.ts:234

#### scan(x, y, w, h, cb)

> **scan**(`x`, `y`, `w`, `h`, `cb`): `this`

Scan through the image and call the callback for each pixel

##### Parameters

• **x**: `number`

• **y**: `number`

• **w**: `number`

• **h**: `number`

• **cb**

##### Returns

`this`

##### Example

```ts
import { Jimp } from "jimp";

const image = new Jimp({ width: 3, height: 3, color: 0xffffffff });

image.scan((x, y, idx) => {
  // do something with the pixel
});

// Or scan through just a region
image.scan(0, 0, 2, 2, (x, y, idx) => {
  // do something with the pixel
});
```

##### Source

packages/core/dist/esm/index.d.ts:254

***

### scanIterator()

> **scanIterator**(`x`?, `y`?, `w`?, `h`?): `Generator`\<`Object`, `void`, `unknown`\>

Iterate scan through a region of the bitmap

#### Parameters

• **x?**: `number`

the x coordinate to begin the scan at

• **y?**: `number`

the y coordinate to begin the scan at

• **w?**: `number`

the width of the scan region

• **h?**: `number`

the height of the scan region

#### Returns

`Generator`\<`Object`, `void`, `unknown`\>

> ##### idx
>
> > **idx**: `number`
>
> ##### image
>
> > **image**: `any`
>
> ##### x
>
> > **x**: `number`
>
> ##### y
>
> > **y**: `number`
>

#### Example

```ts
import { Jimp } from "jimp";

const image = new Jimp({ width: 3, height: 3, color: 0xffffffff });

for (const { x, y, idx, image } of j.scanIterator()) {
  // do something with the pixel
}
```

#### Source

packages/core/dist/esm/index.d.ts:272

***

### sepia()

> **sepia**(): `Jimp`

Applies a sepia tone to the image.

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.sepia();
```

#### Source

plugins/plugin-color/dist/esm/index.d.ts:180

***

### setPixelColor()

> **setPixelColor**(`hex`, `x`, `y`): `any`

Sets the hex colour value of a pixel

#### Parameters

• **hex**: `number`

color to set

• **x**: `number`

the x coordinate

• **y**: `number`

the y coordinate

#### Returns

`any`

#### Example

```ts
import { Jimp } from "jimp";

const image = new Jimp({ width: 3, height: 3, color: 0xffffffff });

image.setPixelColor(0xff0000ff, 0, 0);
```

#### Source

packages/core/dist/esm/index.d.ts:178

***

### threshold()

> **threshold**(`options`): `Jimp`

Applies a minimum color threshold to a grayscale image.
Converts image to grayscale by default.

#### Parameters

• **options**: [`ThresholdOptions`](../interfaces/ThresholdOptions.md)

#### Returns

`Jimp`

#### Example

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.threshold({ max: 150 });
```

#### Source

plugins/plugin-threshold/dist/esm/index.d.ts:23

***

### toString()

> **toString**(): `string`

Nicely format Jimp object when converted to a string

#### Returns

`string`

pretty printed

#### Source

packages/core/dist/esm/index.d.ts:77

## Properties

### background

> **background**: `number`

Default color to use for new pixels

#### Source

packages/core/dist/esm/index.d.ts:57

***

### bitmap

> **bitmap**: [`Bitmap`](../interfaces/Bitmap.md)

The bitmap data of the image

#### Source

packages/core/dist/esm/index.d.ts:55

***

### formats

> **formats**: `Format`\<`any`, `undefined`\>[]

Formats that can be used with Jimp

#### Source

packages/core/dist/esm/index.d.ts:59
