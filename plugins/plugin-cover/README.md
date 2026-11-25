<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/plugin-cover</h1>
  <p>Cover an image within a height and width.</p>
</div>

- [cover](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#cover)
- [coverRect](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#coverrect)

`align` places the image along each axis. It takes `HorizontalAlign` and `VerticalAlign` flags, or `{ x, y }` fractions from 0 (left/top) to 1 (right/bottom), like CSS `object-position` percentages. An axis without a flag or fraction is centered, and fractions outside 0-1 are clamped:

```ts
import { Jimp, HorizontalAlign, VerticalAlign } from "jimp";

image.cover({
  w: 150,
  h: 100,
  align: HorizontalAlign.LEFT | VerticalAlign.TOP,
});

// object-fit: cover; object-position: center 20%;
image.cover({ w: 150, h: 100, align: { x: 0.5, y: 0.2 } });
```

`align` can also be `"entropy"` or `"attention"`, to look at the image and keep its subject, like sharp's `position` strategies. `"entropy"` keeps the most detailed part, and `"attention"` the part with the most edges, saturated colour and skin tones. Both analyse a downscaled copy, so they're fast and deterministic. `coverRect` returns the part of the image `cover` would keep, without changing it:

```ts
image.cover({ w: 150, h: 300, align: "attention" });

// crop the original to the same framing, without scaling
image.crop(image.coverRect({ w: 1200, h: 630, align: "entropy" }));
```

Takes the same `mode` and `premultiplyAlpha` options as [resize](https://github.com/jimp-dev/jimp/tree/main/plugins/plugin-resize#keeping-the-colour-of-transparent-pixels).

See [Getting Started](https://jimp-dev.github.io/jimp/guides/getting-started/) to read an image, change it and save the result with `write` or `getBuffer`.
