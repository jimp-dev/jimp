---
editUrl: false
next: false
prev: false
title: "Jimp"
---

## Param

`Jimp` class enables you to:

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

packages/core/dist/esm/index.d.ts:1012

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

packages/core/dist/esm/index.d.ts:1463

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

packages/core/dist/esm/index.d.ts:553

***

### autocrop()

> **autocrop**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`AutocropOptions?`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-crop/dist/esm/index.d.ts:28

***

### blit()

> **blit**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`BlitOptions`\<`JimpClass`\>]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-blit/dist/esm/index.d.ts:24

***

### blur()

> **blur**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-blur/dist/esm/index.d.ts:7

***

### brightness()

> **brightness**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:93

***

### circle()

> **circle**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`Object`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-circle/dist/esm/index.d.ts:6

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

packages/core/dist/esm/index.d.ts:391

***

### color()

> **color**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [[`ColorAction`](../type-aliases/ColorAction.md)[]]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:154

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

### contain()

> **contain**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`, `number`, `number`, [`ResizeStrategy`](../enumerations/ResizeStrategy.md)]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-contain/dist/esm/index.d.ts:11

***

### contrast()

> **contrast**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:98

***

### convolute()

> **convolute**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`[][], `number`, `number`, `number`, `number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:149

***

### convolution()

> **convolution**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`[][], `number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:127

***

### cover()

> **cover**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`, `number`, `number`, [`ResizeStrategy`](../enumerations/ResizeStrategy.md)]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-cover/dist/esm/index.d.ts:11

***

### crop()

> **crop**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`, `number`, `number`, `number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-crop/dist/esm/index.d.ts:24

***

### displace()

> **displace**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`JimpClass`, `number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-displace/dist/esm/index.d.ts:8

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

### dither()

> **dither**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: []

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-dither/dist/esm/index.d.ts:6

***

### fade()

> **fade**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:121

***

### fisheye()

> **fisheye**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`Object?`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-fisheye/dist/esm/index.d.ts:6

***

### flip()

> **flip**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`boolean`, `boolean`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-flip/dist/esm/index.d.ts:8

***

### gaussian()

> **gaussian**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-blur/dist/esm/index.d.ts:12

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

### greyscale()

> **greyscale**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: []

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:107

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

### invert()

> **invert**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: []

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:88

***

### mask()

> **mask**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`JimpClass`, `number`, `number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-mask/dist/esm/index.d.ts:9

***

### normalize()

> **normalize**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: []

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:84

***

### opacity()

> **opacity**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:112

***

### opaque()

> **opaque**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: []

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:131

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

### pixelate()

> **pixelate**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`, `number`, `number`, `number`, `number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:140

***

### posterize()

> **posterize**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:103

***

### print()

> **print**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`BmFont`\<`JimpClass`\>, `number`, `number`, `string` \| `number` \| `Object`, `number`, `number`, (`options`) => `void`]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-print/dist/esm/index.d.ts:17

***

### resize()

> **resize**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`, `number`, [`ResizeStrategy`](../enumerations/ResizeStrategy.md)]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-resize/dist/esm/index.d.ts:11

***

### rotate()

> **rotate**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`, `boolean` \| [`ResizeStrategy`](../enumerations/ResizeStrategy.md)]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-rotate/dist/esm/index.d.ts:8

***

### scale()

> **scale**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`, [`ResizeStrategy`](../enumerations/ResizeStrategy.md)]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-resize/dist/esm/index.d.ts:17

***

### scaleToFit()

> **scaleToFit**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [`number`, `number`, [`ResizeStrategy`](../enumerations/ResizeStrategy.md)]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-resize/dist/esm/index.d.ts:24

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

### sepia()

> **sepia**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: []

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-color/dist/esm/index.d.ts:116

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

### threshold()

> **threshold**(...`args`): `JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Parameters

• ...**args**: [[`ThresholdOptions`](../interfaces/ThresholdOptions.md)]

#### Returns

`JimpInstanceMethods`\<`Object`, `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object` & `Object`\> & `Object`

#### Source

plugins/plugin-threshold/dist/esm/index.d.ts:14

***

### toString()

> **toString**(): `string`

Nicely format Jimp object when converted to a string

#### Returns

`string`

pretty printed

#### Source

packages/core/dist/esm/index.d.ts:338

## Properties

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

### formats

> **formats**: `Format`\<`any`, `undefined`\>[]

Formats that can be used with Jimp

#### Source

packages/core/dist/esm/index.d.ts:328
