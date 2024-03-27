---
editUrl: false
next: false
prev: false
title: "PNGFilterType"
---

Filter method is a single-byte integer that indicates the preprocessing method applied to the image data before compression.

## Enumeration Members

### AUTO

> **AUTO**: `-1`

#### Source

plugins/js-png/dist/esm/constants.d.ts:5

***

### AVERAGE

> **AVERAGE**: `3`

uses the average of the two neighboring pixels (left and above) to predict the value of a pixel

#### Source

plugins/js-png/dist/esm/constants.d.ts:13

***

### NONE

> **NONE**: `0`

scanline is transmitted unmodified

#### Source

plugins/js-png/dist/esm/constants.d.ts:7

***

### PATH

> **PATH**: `4`

computes a simple linear function of the three neighboring pixels (left, above, upper left), then chooses as predictor the neighboring pixel closest to the computed value.

#### Source

plugins/js-png/dist/esm/constants.d.ts:15

***

### SUB

> **SUB**: `1`

filter transmits the difference between each byte and the value of the corresponding byte of the prior pixel

#### Source

plugins/js-png/dist/esm/constants.d.ts:9

***

### UP

> **UP**: `2`

The Up() filter is just like the Sub() filter except that the pixel immediately above the current pixel, rather than just to its left, is used as the predictor.

#### Source

plugins/js-png/dist/esm/constants.d.ts:11
