---
editUrl: false
next: false
prev: false
title: "intToRGBA"
---

> **intToRGBA**(`i`): `RGBAColor`

A helper method that converts RGBA values to a single integer value

## Parameters

• **i**: `number`

A single integer value representing an RGBA colour (e.g. 0xFF0000FF for red)

## Returns

`RGBAColor`

An object with the properties r, g, b and a representing RGBA values

## Example

```ts
import { intToRGBA } from "@jimp/utils";

intToRGBA(0xFF0000FF); // { r: 255, g: 0, b: 0, a:255 }
```

## Source

packages/utils/dist/esm/index.d.ts:24
