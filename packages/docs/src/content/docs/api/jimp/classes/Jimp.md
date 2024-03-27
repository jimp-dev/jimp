---
editUrl: false
next: false
prev: false
title: "Jimp"
---

A `Jimp` class enables you to:

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

### new Jimp(undefined)

> **new Jimp**(): [`Jimp`](Jimp.md)

#### Returns

[`Jimp`](Jimp.md)

#### Source

packages/core/dist/esm/index.d.ts:320

## Methods

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

packages/core/dist/esm/index.d.ts:391

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

packages/core/dist/esm/index.d.ts:471

***

### distanceFromHash()

> **distanceFromHash**(...`args`): `number`

#### Parameters

• ...**args**: [`string`]

#### Returns

`number`

#### Source

plugins/plugin-hash/dist/esm/index.d.ts:18

***

### getBase64()

> **getBase64**\<`ProvidedMimeType_1`, `Options_1`\>(`mime`, `options`?): `Promise`\<`string`\>

Converts the image to a base 64 string

#### Type parameters

• **ProvidedMimeType_1** extends `"image/bmp"` \| `"image/tiff"` \| `"image/x-ms-bmp"` \| `"image/gif"` \| `"image/jpeg"` \| `"image/png"`

• **Options_1** extends `undefined` \| `Partial`\<`Pick`\<`BmpImage`, `"palette"` \| `"colors"` \| `"importantColors"` \| `"hr"` \| `"vr"` \| `"reserved1"` \| `"reserved2"`\>\> \| `JPEGOptions` \| `Record`\<`string`, `any`\> \| `Omit`\<`PNGOptions`, `"filterType"` \| `"colorType"` \| `"inputColorType"`\> & `Object`

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

packages/core/dist/esm/index.d.ts:377

***

### getBuffer()

> **getBuffer**\<`ProvidedMimeType`, `Options`\>(`mime`, `options`?): `Promise`\<`Buffer`\>

Converts the Jimp instance to an image buffer

#### Type parameters

• **ProvidedMimeType** extends `"image/bmp"` \| `"image/tiff"` \| `"image/x-ms-bmp"` \| `"image/gif"` \| `"image/jpeg"` \| `"image/png"`

• **Options** extends `undefined` \| `Partial`\<`Pick`\<`BmpImage`, `"palette"` \| `"colors"` \| `"importantColors"` \| `"hr"` \| `"vr"` \| `"reserved1"` \| `"reserved2"`\>\> \| `JPEGOptions` \| `Record`\<`string`, `any`\> \| `Omit`\<`PNGOptions`, `"filterType"` \| `"colorType"` \| `"inputColorType"`\> & `Object`

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

packages/core/dist/esm/index.d.ts:356

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

packages/core/dist/esm/index.d.ts:422

***

### getPixelIndex()

> **getPixelIndex**(`x`, `y`, `edgeHandling`?): `number`

Returns the offset of a pixel in the bitmap buffer

#### Parameters

• **x**: `number`

the x coordinate

• **y**: `number`

the y coordinate

• **edgeHandling?**: `Edge`

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

packages/core/dist/esm/index.d.ts:407

***

### hasAlpha()

> **hasAlpha**(): `boolean`

Determine if the image contains opaque pixels.

#### Returns

`boolean`

#### Example

```
import { Jimp } from "jimp";

const image = new Jimp({ width: 3, height: 3, color: 0xffffffaa });
const image2 = new Jimp({ width: 3, height: 3, color: 0xff0000ff });

image.hasAlpha(); // false
image2.hasAlpha(); // true
```

#### Source

packages/core/dist/esm/index.d.ts:454

***

### hash()

> **hash**(...`args`): `string`

#### Parameters

• ...**args**: [`number`]

#### Returns

`string`

#### Source

plugins/plugin-hash/dist/esm/index.d.ts:12

***

### inspect()

> **inspect**(): `string`

Nicely format Jimp object when sent to the console e.g. console.log(image)

#### Returns

`string`

Pretty printed jimp object

#### Source

packages/core/dist/esm/index.d.ts:333

***

### pHash()

> **pHash**(...`args`): `string`

#### Parameters

• ...**args**: []

#### Returns

`string`

#### Source

plugins/plugin-hash/dist/esm/index.d.ts:7

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

packages/core/dist/esm/index.d.ts:495

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

packages/core/dist/esm/index.d.ts:515

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

packages/core/dist/esm/index.d.ts:533

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

packages/core/dist/esm/index.d.ts:439

***

### toString()

> **toString**(): `string`

Nicely format Jimp object when converted to a string

#### Returns

`string`

pretty printed

#### Source

packages/core/dist/esm/index.d.ts:338

***

### fromBitmap()

> **`static`** **fromBitmap**(`bitmap`): `Object` & `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\>

Create a Jimp instance from a bitmap.
The difference between this and just using the constructor is that this will
convert raw image data into the bitmap format that Jimp uses.

#### Parameters

• **bitmap**: [`RawImageData`](../interfaces/RawImageData.md)

#### Returns

`Object` & `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\>

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

packages/core/dist/esm/index.d.ts:1011

***

### fromBuffer()

> **`static`** **fromBuffer**(`buffer`): `Promise`\<`Object` & `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\>\>

Parse a bitmap with the loaded image types.

#### Parameters

• **buffer**: `Buffer`

Raw image data

#### Returns

`Promise`\<`Object` & `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\>\>

#### Example

```ts
import { Jimp } from "jimp";

const buffer = await fs.readFile("test/image.png");
const image = await Jimp.fromBuffer(buffer);
```

#### Source

packages/core/dist/esm/index.d.ts:552

***

### read()

> **`static`** **read**(`url`): `Promise`\<`Object` & `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\>\>

Create a Jimp instance from a URL or a file path

#### Parameters

• **url**: `string`

#### Returns

`Promise`\<`Object` & `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\>\>

#### Example

```ts
import { Jimp } from "jimp";

// Read from a file path
const image = await Jimp.read("test/image.png");

// Read from a URL
const image = await Jimp.read("https://upload.wikimedia.org/wikipedia/commons/0/01/Bot-Test.jpg");
```

#### Source

packages/core/dist/esm/index.d.ts:1463

## Properties

### autocrop()

> **autocrop**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Autocrop same color borders from this image

#### Parameters

• ...**args**: [`AutocropOptions?`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-crop/dist/esm/index.d.ts:30

***

### background

> **background**: `number`

Default color to use for new pixels

#### Source

packages/core/dist/esm/index.d.ts:326

***

### bitmap

> **bitmap**: [`Bitmap`](../interfaces/Bitmap.md)

The bitmap data of the image

#### Source

packages/core/dist/esm/index.d.ts:324

***

### blit()

> **blit**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Places a source image on to this image

#### Parameters

• ...**args**: [`BlitOptions`\<`JimpClass`\>]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-blit/dist/esm/index.d.ts:23

***

### blur()

> **blur**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

A fast blur algorithm that produces similar effect to a Gaussian blur - but MUCH quicker

#### Parameters

• ...**args**: [`number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-blur/dist/esm/index.d.ts:9

***

### brightness()

> **brightness**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Adjusts the brightness of the image

#### Parameters

• ...**args**: [`number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:107

***

### circle()

> **circle**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Creates a circle out of an image.

#### Parameters

• ...**args**: [`Object`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-circle/dist/esm/index.d.ts:11

***

### color()

> **color**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Apply multiple color modification rules

#### Parameters

• ...**args**: [[`ColorAction`](../type-aliases/ColorAction.md)[]]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:171

***

### colour()

> **colour**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [[`ColorAction`](../type-aliases/ColorAction.md)[]]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:172

***

### contain()

> **contain**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Scale the image to the given width and height keeping the aspect ratio. Some parts of the image may be letter boxed.

#### Parameters

• ...**args**: [`number`, `number`, `number`, [`ResizeStrategy`](../enumerations/ResizeStrategy.md)]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-contain/dist/esm/index.d.ts:12

***

### contrast()

> **contrast**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Adjusts the contrast of the image

#### Parameters

• ...**args**: [`number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:112

***

### convolute()

> **convolute**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Applies a convolution kernel to the image or a region

#### Parameters

• ...**args**: [`number`[][], `number`, `number`, `number`, `number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:166

***

### convolution()

> **convolution**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Adds each element of the image to its local neighbors, weighted by the kernel

#### Parameters

• ...**args**: [`number`[][], `number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:142

***

### cover()

> **cover**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Scale the image so the given width and height keeping the aspect ratio. Some parts of the image may be clipped.

#### Parameters

• ...**args**: [`number`, `number`, `number`, [`ResizeStrategy`](../enumerations/ResizeStrategy.md)]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-cover/dist/esm/index.d.ts:12

***

### crop()

> **crop**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Crops the image at a given point to a give size

#### Parameters

• ...**args**: [`number`, `number`, `number`, `number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-crop/dist/esm/index.d.ts:26

***

### displace()

> **displace**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Displaces the image based on the provided displacement map

#### Parameters

• ...**args**: [`JimpClass`, `number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-displace/dist/esm/index.d.ts:9

***

### dither()

> **dither**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: []

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-dither/dist/esm/index.d.ts:7

***

### fade()

> **fade**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Fades each pixel by a factor between 0 and 1

#### Parameters

• ...**args**: [`number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:136

***

### fisheye()

> **fisheye**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Adds a fisheye effect to the image

#### Parameters

• ...**args**: [`Object?`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-fisheye/dist/esm/index.d.ts:9

***

### flip()

> **flip**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`boolean`, `boolean`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-flip/dist/esm/index.d.ts:9

***

### formats

> **formats**: `Format`\<`any`, `undefined`\>[]

Formats that can be used with Jimp

#### Source

packages/core/dist/esm/index.d.ts:328

***

### gaussian()

> **gaussian**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Applies a true Gaussian blur to the image (warning: this is VERY slow)

#### Parameters

• ...**args**: [`number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-blur/dist/esm/index.d.ts:14

***

### grayscale()

> **grayscale**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: []

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:122

***

### greyscale()

> **greyscale**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Removes colour from the image using ITU Rec 709 luminance values

#### Parameters

• ...**args**: []

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:121

***

### invert()

> **invert**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Inverts the colors in the image

#### Parameters

• ...**args**: []

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:102

***

### mask()

> **mask**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Masks a source image on to this image using average pixel colour. A completely black pixel on the mask will turn a pixel in the image completely transparent.

#### Parameters

• ...**args**: [`JimpClass`, `number`, `number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-mask/dist/esm/index.d.ts:10

***

### mirror()

> **mirror**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`boolean`, `boolean`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-flip/dist/esm/index.d.ts:10

***

### normalize()

> **normalize**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Normalizes the image

#### Parameters

• ...**args**: []

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:98

***

### opacity()

> **opacity**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Multiplies the opacity of each pixel by a factor between 0 and 1

#### Parameters

• ...**args**: [`number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:127

***

### opaque()

> **opaque**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Set the alpha channel on every pixel to fully opaque

#### Parameters

• ...**args**: []

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:148

***

### pixelate()

> **pixelate**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Pixelates the image or a region

#### Parameters

• ...**args**: [`number`, `number`, `number`, `number`, `number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:157

***

### posterize()

> **posterize**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Apply a posterize effect

#### Parameters

• ...**args**: [`number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:117

***

### print()

> **print**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Draws a text on a image on a given boundary

#### Parameters

• ...**args**: [`BmFont`\<`JimpClass`\>, `number`, `number`, `string` \| `number` \| `Object`, `number`, `number`, (`options`) => `void`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-print/dist/esm/index.d.ts:24

***

### resize()

> **resize**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`, `number`, [`ResizeStrategy`](../enumerations/ResizeStrategy.md)]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-resize/dist/esm/index.d.ts:25

***

### rotate()

> **rotate**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Rotates the image counter-clockwise by a number of degrees. By default the width and height of the image will be resized appropriately.

#### Parameters

• ...**args**: [`number`, `boolean` \| [`ResizeStrategy`](../enumerations/ResizeStrategy.md)]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-rotate/dist/esm/index.d.ts:9

***

### scale()

> **scale**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`, [`ResizeStrategy`](../enumerations/ResizeStrategy.md)]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-resize/dist/esm/index.d.ts:26

***

### scaleToFit()

> **scaleToFit**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`, `number`, [`ResizeStrategy`](../enumerations/ResizeStrategy.md)]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-resize/dist/esm/index.d.ts:27

***

### sepia()

> **sepia**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Applies a sepia tone to the image

#### Parameters

• ...**args**: []

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:131

***

### threshold()

> **threshold**: (...`args`) => `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

Applies a minimum color threshold to a grayscale image.  Converts image to grayscale by default

#### Parameters

• ...**args**: [[`ThresholdOptions`](../interfaces/ThresholdOptions.md)]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-threshold/dist/esm/index.d.ts:15