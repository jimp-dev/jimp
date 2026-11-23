<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>@jimp/plugin-displace</h1>
  <p>Displace an image.</p>
</div>

Displaces the image based on the provided displacement map. Each pixel moves right by up to `offset` pixels, depending on the red channel of the map, which is stretched to the size of the image.

Pass `offset: { x, y }` to move pixels along both axes, like SVG's `feDisplacementMap` with `xChannelSelector="R"` and `yChannelSelector="G"`: right by up to `x` pixels depending on the red channel, and down by up to `y` pixels depending on the green channel. A missing axis isn't displaced, and negative offsets move pixels left or up.

```ts
image.displace({ map, offset: 10 }); // along x only
image.displace({ map, offset: { x: 10, y: 10 } });
image.displace({ map, offset: { y: 10 } }); // along y only
```

- [displace](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#displace)

See [Getting Started](https://jimp-dev.github.io/jimp/guides/getting-started/) to read an image, change it and save the result with `write` or `getBuffer`.
