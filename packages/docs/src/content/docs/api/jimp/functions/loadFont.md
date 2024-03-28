---
editUrl: false
next: false
prev: false
title: "loadFont"
---

> **loadFont**(`file`): `Promise`\<`Object`\>

Loads a Bitmap Font from a file.

## Parameters

• **file**: `string`

A path or URL to a font file

## Returns

`Promise`\<`Object`\>

A collection of Jimp images that can be used to print text

> ### chars
>
> > **chars**: `Record`\<`string`, `BmCharacter`\>
>
> ### common
>
> > **common**: `BmCommonProps`
>
> ### info
>
> > **info**: `Object`
>
> ### kernings
>
> > **kernings**: `Record`\<`string`, `BmKerning`\>
>
> ### pages
>
> > **pages**: `Object` & `JimpInstanceMethods`[]
>

## Example

```ts
import { Jimp, loadFont } from "jimp";
import { SANS_10_BLACK } from "jimp/fonts";

const font = await loadFont(SANS_10_BLACK);
const image = new Jimp({ width: 200, height: 100, color: 0xffffffff });

image.print(font, 10, 10, "Hello world!");
```

## Source

plugins/plugin-print/dist/esm/load-font.d.ts:17
