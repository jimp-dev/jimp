# Jimp #

The "JavaScript Image Manipulation Program" :-)

An image processing library for Node written entirely in JavaScript, with zero external or native dependencies.

Example usage:

```js
var Jimp = require("jimp");

// open a file called "lenna.png"
var lenna = new Jimp("lenna.png", function (err, image) {
    this.resize(512, 512) // resize
        .write("lenna-small.png") // save
        .quality(60) // set JPEG quality
        .write("lenna-small.jpg") // save as JPEG
        .greyscale() // set greyscale
        .write("lena-small-bw.png") // save again
        .crop(128, 192, 256, 128) // crop
        .write("lena-small-bw-cropped.png"); // save again
});
```

## Basic usage ##

The Jimp constructor takes two arguments, the path to a PNG, JPEG or BMP image and a Node-style callback:

```js
var image = new Jimp("./path/to/image.jpg", function (err, image) {
    // this is the image
});
```

Once the callback has fired, the following methods can be called on the image:

```js
image.crop( x, y, w, h ); // crop to the given region
image.invert(); // invert the image colours
image.flip( horz, vert); // flip the image horizontally or vertically
image.gaussian( r ); // Gaussian blur the image by r pixels (VERY slow)
image.blur( r ); // fast blur the image by r pixels
image.greyscale(); // remove colour from the image
image.sepia(); // apply a sepia wash to the image
image.opacity( f ); // multiply the alpha channel by each pixel by the factor f, 0 - 1
image.resize( w, h ); // resize the image
image.scale( f ); // scale the image by the factor f
image.rotate( deg ); // rotate the image clockwise by a number of degrees (rounded to multiples of 90)
image.blit( src, x, y ); // blit the image with another Jimp image at x, y
image.composite( src, x, y ); // composites another Jimp image over this iamge at x, y
image.brightness( val ); // adjust the brighness by a value -1 to +1
image.contrast( val ); // adjust the contrast by a value -1 to +1
image.posterize( n ); // apply a posterization effect with n level
image.mask( src, x, y ); // masks the image with another Jimp image at x, y using average pixel value
image.dither565(); // ordered dithering of the image and reduce color space to 16-bits (RGB565)
```

(Contributions of more methods are welcome!)

The image can be written to disk in PNG, JPEG or BMP format (determined by the file extension) using:

```js
image.write( path, cb ); // Node-style callback will be fired when write is successful
```

The quality of saved JPEGs can be set with:

```js
image.quality( n ); // set the quality of saved JPEG, 0 - 100
```

## Cloning images ##

To clone a Jimp image, you can use:

```js
image.clone(); // returns the clone
```

The Jimp constructor can also be called using an existing image create a clone of that image:

```js
var clone = new Jimp(image, function (err, clone) {
    // this is the clone
});
```

## Working with Buffers ##

A PNG, JPEG or BMP binary Buffer of an image (e.g. for storage in a database) can to got using:

```js
image.getBuffer( mime, cb ); // Node-style callback wil be fired with result
```

For convenience, supported MIME types are available as static properties:

```js
Jimp.MIME_PNG; // "image/png"
Jimp.MIME_JPEG; // "image/jpeg"
Jimp.BMP; // "image/bmp"
```

The Jimp constructor can also be called passing a valid Buffer as the first argument to the Jimp constructor:

```js
var image = new Jimp(buffer, function (err, image) {
    // this is the image
});
```

## Direct manipulation ##

Jimp enables low-level manipulation of images in memory through the bitmap property of each Jimp object:

```js
image.bitmap.data; // a Buffer of the raw bitmap data
image.bitmap.width; // the width of the image
image.bitmap.height // the height of the image
```

This data can be manipulated directly but remember: garbage in, garbage out.

A helper method is available to scan a region of the bitmap:

```js
image.scan(x, y, w, h, cb); // scan a given region of the bitmap and call cb on every pixel
```
    
Example usage:

```js
image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    // x, y is the position of this pixel on the image
    // idx is the position start position of this rgba tuple in the bitmap Buffer
    // this is the image
    
    var red = this.bitmap.data[idx];
    var green = this.bitmap.data[idx+1];
    var blue = this.bitmap.data[idx+2];
    var alpha = this.bitmap.data[idx+3];
    
    // rgba values run from 0 - 255
    // e.g. this.bitmap.data[idx] = 0; // removes red from this pixel
});
```

If you want to begin with an empty Jimp image, you can call the Jimp constructor passing the width and height of the image to create:

```js
var image = new Jimp(256, 256, function (err, image) {
    // this image is 256 x 256, every pixel is set to 0x0
});
```

## Chaining or callbacks ##

All methods can be chained together, for example as follows:

```js
var lenna = new Jimp("lenna.png", function (err, image) {
    this.greyscale().scale(0.5).write("lena-half-bw.png");
});
```

Alternatively, methods can be passed Node-style callbacks:

```js
var lenna = new Jimp("lenna.png", function (err, image) {
    image.greyscale(function(err, image) {
        image.scale(0.5, function (err, image) {
            image.write("lena-half-bw.png");
        });
    });
});
```

The Node-style callback pattern allows Jimp to be used with frameworks that expect or build on the Node-style callback pattern.

## License ##

Jimp is licensed under the MIT license.
