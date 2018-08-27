# @jimp/core

The main Jimp class. This class can be extended with types and bitmap manipulation functions. Out of the box it supports no image types.

## Available Methods

### Jimp

The Jimp class constructor.

### addConstants

Add constant or static methods to the Jimp constructor.

```js
addConstants({
  MIME_SPECIAL: 'image/special'
});
```

### addJimpMethods

Add a bitmap manipulation method to Jimp constructor. These method should return this so that the function can be chain-able.

```js
addJimpMethods({
  cropCrazy: function() {
    // Your custom image manipulation method

    return this;
  }
})

const image = await Jimp.read(...);

image.resize(10, Jimp.AUTO),
  .cropCrazy();

await image.writeAsync('test.png');
```

### addType

Add a image mime type to Jimp constructor. First argument is a mime type and the second is an array of file extension for that type.

```js
addType('image/special', ['spec', 'special']);
```
