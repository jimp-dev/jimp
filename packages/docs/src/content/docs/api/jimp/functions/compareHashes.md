---
editUrl: false
next: false
prev: false
title: "compareHashes"
---

> **compareHashes**(`hash1`, `hash2`): `number`

Calculates the hamming distance of two images based on their perceptual hash

## Parameters

• **hash1**: `string`

A pHash

• **hash2**: `string`

A pHash

## Returns

`number`

A number ranging from 0 to 1, 0 means they are believed to be identical

## Example

```ts
import { Jimp, compareHashes } from "jimp";

const image1 = await Jimp.read("test/image.png");
const image2 = await Jimp.read("test/image.png");

compareHashes(image1.pHash(), image2.pHash()); // 0.5
```

## Source

plugins/plugin-hash/dist/esm/index.d.ts:76
