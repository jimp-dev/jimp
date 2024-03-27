---
editUrl: false
next: false
prev: false
title: "rgbaToInt"
---

> **rgbaToInt**(`r`, `g`, `b`, `a`): `number`

A static helper method that converts RGBA values to a single integer value

## Parameters

• **r**: `number`

the red value (0-255)

• **g**: `number`

the green value (0-255)

• **b**: `number`

the blue value (0-255)

• **a**: `number`

the alpha value (0-255)

## Returns

`number`

## Example

```ts
import { rgbaToInt } from "@jimp/utils";

rgbaToInt(255, 0, 0, 255); // 0xFF0000FF
```

## Source

packages/utils/dist/esm/index.d.ts:38
