---
editUrl: false
next: false
prev: false
title: "limit255"
---

> **limit255**(`n`): `number`

Limits a number to between 0 or 255

## Parameters

• **n**: `number`

## Returns

`number`

## Example

```ts
import { limit255 } from "@jimp/utils";

limit255(256); // 255
limit255(-1); // 0
```

## Source

packages/utils/dist/esm/index.d.ts:73
