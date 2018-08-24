# @jimp/custom

## Available Methods

### configure

Takes a Jimp configuration and applies it to `@jimp/core`.

Sample Jimp configuration:

```json
{
    "types": ["@jimp/jpeg", "@jimp/png", "@jimp/bmp", "@jimp/tiff", "@jimp/gif"]
}
```

## Type Definition

To define a new Jimp image type write a function the takes the current Jimp configuration. In this function you can extend Jimp's internal data structures.

This function must return and array whose first element is the mime type and second element is an array of valid file extensions.

```js
const special = require('special-js');

module.exports = config => {
    const MIME_TYPE = 'image/special';

    config.constants.MIME_SPECIAL = MIME_TYPE;

    config.decoders[MIME_TYPE] = data => special.decode(data);
    config.encoders[MIME_TYPE] = image => special.encode(image.bitmap);

    return [MIME_TYPE, ['spec', 'special']];
};
```

### Constants

A jimp image type can expose as many constants as it wants. Each jimp type is required to expose a mime type.

```js
config.constants.MIME_SPECIAL = 'image/special';
```

### hasAlpha

A image type can define whether it supports an alpha channel.

```js
config.hasAlpha[MIME_TYPE] = true;
```

### Decoder

A function that when supplied with a buffer should return a bitmap with height and width.

```js
config.decoders[MIME_TYPE] = data => special.decode(data);
```

### Encoder

A function that when supplied with a Jimp image should return an encoded buffer.

```js
config.encoders[MIME_TYPE] = image => special.encode(image.bitmap);
```

### Class

Add class properties and function to the Jimp constructor.

```js
config.class._quality = 100;

config.class.quality = function(n, cb) {
    if (typeof n !== 'number') {
        return throwError.call(this, 'n must be a number', cb);
    }

    if (n < 0 || n > 100) {
        return throwError.call(this, 'n must be a number 0 - 100', cb);
    }

    this._quality = Math.round(n);

    if (isNodePattern(cb)) {
        cb.call(this, null, this);
    }

    return this;
};
```
