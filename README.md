# Jimp #

The "JavaScript Image Manipulation Program" :-)

An image processing library for Node written entirely in JavaScript, with zero external or native dependencies.

Example usage:

```js
var Jimp = require("jimp");

// open a file called "lenna.png"
Jimp.read("lenna.png", function (err, lenna) {
    if (err) throw err;
    lenna.resize(256, 256)            // resize
         .quality(60)                 // set JPEG quality
         .greyscale()                 // set greyscale
         .write("lena-small-bw.jpg"); // save
});
```

Using promises:

```js
Jimp.read("lenna.png").then(function (lenna) {
    lenna.resize(256, 256)           // resize
         .quality(60)                // set JPEG quality
         .greyscale()                // set greyscale
         .write("lena-small-bw.jpg") // save
}).catch(function (err) {
    console.error(err);
});
```


## Basic usage ##

The static `Jimp.read` method takes the path to a PNG, JPEG or BMP file and (optionally) a Node-style callback and returns a Promise:

```js
Jimp.read("./path/to/image.jpg", function (err, image) {
    // do stuff with the image (if no exception)
});

Jimp.read("./path/to/image.jpg").then(function (image) {
    // do stuff with the image
}).catch(function (err) {
    // handle an exception
});
```

The method can also read a PNG, JPEG or BMP buffer or from a URL:


```js
Jimp.read(lenna.buffer, function (err, image) {
    // do stuff with the image (if no exception)
});

Jimp.read("http://www.example.com/path/to/lenna.jpg", function (err, image) {
    // do stuff with the image (if no exception)
});
```

JPEG images with EXIF orientation data will be automatically re-orientated as appropriate.

Once the callback is filed or the promise fulfilled, the following methods can be called on the image:

```js
image.crop( x, y, w, h );      // crop to the given region
image.invert();                // invert the image colours
image.flip( horz, vert );      // flip the image horizontally or vertically
image.gaussian( r );           // Gaussian blur the image by r pixels (VERY slow)
image.blur( r );               // fast blur the image by r pixels
image.greyscale();             // remove colour from the image
image.sepia();                 // apply a sepia wash to the image
image.opacity( f );            // multiply the alpha channel by each pixel by the factor f, 0 - 1
image.resize( w, h );          // resize the image. Jimp.AUTO can be passed as one of the values.
image.scale( f );              // scale the image by the factor f
image.rotate( deg[, resize] ); // rotate the image clockwise by a number of degrees. Unless `false` is passed as the second parameter, the image width and height will be resized appropriately.
image.blit( src, x, y );       // blit the image with another Jimp image at x, y
image.composite( src, x, y );  // composites another Jimp image over this iamge at x, y
image.brightness( val );       // adjust the brighness by a value -1 to +1
image.contrast( val );         // adjust the contrast by a value -1 to +1
image.posterize( n );          // apply a posterization effect with n level
image.mask( src, x, y );       // masks the image with another Jimp image at x, y using average pixel value
image.dither565();             // ordered dithering of the image and reduce color space to 16-bits (RGB565)
image.cover( w, h );           // scale the image so that it fills the given width and height
image.contain( w, h );         // scale the image to the largest size so that fits inside the given width and height
image.background( hex );       // set the default new pixel colour (e.g. 0xFFFFFFFF or 0x00000000) for by some operations (e.g. image.contain and image.rotate) and when writing formats that don't support alpha channels
image.mirror( horz, vert );    // an alias for flip
image.fade( f );               // an alternative to opacity, fades the image by a factor 0 - 1. 0 will haven no effect. 1 will turn the image
image.opaque();                // set the alpha channel on every pixel to fully opaque
image.clone();                 // returns a clone of the image
```

(Contributions of more methods are welcome!)

## Writing to files and buffers ##

### Writing to files ###

The image can be written to disk in PNG, JPEG or BMP format (determined by the file extension) using:

```js
image.write( path, cb ); // Node-style callback will be fired when write is successful
```

### Writing to Buffers ###

A PNG, JPEG or BMP binary Buffer of an image (e.g. for storage in a database) can to got using:

```js
image.getBuffer( mime, cb ); // Node-style callback wil be fired with result
```

For convenience, supported MIME types are available as static properties:

```js
Jimp.MIME_PNG;  // "image/png"
Jimp.MIME_JPEG; // "image/jpeg"
Jimp.BMP;       // "image/bmp"
```

### PNG and JPEG quality ###

The quality of JPEGs can be set with:

```js
image.quality( n ); // set the quality of saved JPEG, 0 - 100
```

The format of PNGs can be set with:

```js
image.rgba( bool );           // set whether PNGs are saved as RGBA (true, default) or RGB (false)
image.filterType( number );   // set the filter type for the saved PNG
image.deflateLevel( number ); // set the deflate level for the saved PNG
```

For convenience, supported filter types are available as static properties:

```js
Jimp.PNG_FILTER_AUTO;    // -1
Jimp.PNG_FILTER_NONE;    //  0
Jimp.PNG_FILTER_SUB;     //  1
Jimp.PNG_FILTER_UP;      //  2
Jimp.PNG_FILTER_AVERAGE; //  3
Jimp.PNG_FILTER_PAETH;   //  4
```

## Advanced usage ##

### Colour manipulation ##

Jimp supports advanced colour manipulation using a single method as follows:

```js
image.color([
    { apply: 'hue', params: [ -90 ] },
    { apply: 'lighten', params: [ 50 ] },
    { apply: 'xor', params: [ '#06D' ] }
]);
```

The method supports the following modifiers:

Modifier                | Description
----------------------- | -----------------------
**lighten** {amount}    | Lighten the color a given amount, from 0 to 100. Providing 100 will always return white (works through [TinyColor](https://github.com/bgrins/TinyColor))
**brighten** {amount}   | Brighten the color a given amount, from 0 to 100 (works through [TinyColor](https://github.com/bgrins/TinyColor))
**darken** {amount}     | Darken the color a given amount, from 0 to 100. Providing 100 will always return black (works through [TinyColor](https://github.com/bgrins/TinyColor))
**desaturate** {amount} | Desaturate the color a given amount, from 0 to 100. Providing 100 will is the same as calling greyscale (works through [TinyColor](https://github.com/bgrins/TinyColor))
**saturate** {amount}   | Saturate the color a given amount, from 0 to 100 (works through [TinyColor](https://github.com/bgrins/TinyColor))
**greyscale** {amount}  | Completely desaturates a color into greyscale (works through [TinyColor](https://github.com/bgrins/TinyColor))
**spin** {degree}       | Spin the hue a given amount, from -360 to 360. Calling with 0, 360, or -360 will do nothing - since it sets the hue back to what it was before. (works through [TinyColor](https://github.com/bgrins/TinyColor))
**hue** {degree}        | Alias for **spin**
**mix** {color, amount} | Mixes colors by their RGB component values. Amount is opacity of overlaying color
**tint** {amount}       | Same as applying **mix** with white color
**shade** {amount}      | Same as applying **mix** with black color
**xor** {color}         | Treats the two colors as bitfields and applies an XOR operation to the red, green, and blue components
**red** {amount}        | Modify Red component by a given amount
**green** {amount}      | Modify Green component by a given amount
**blue** {amount}       | Modify Blue component by a given amount

### Low-level manipulation ###

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

Alternatively, you can manipulate individual pixels using the following these functions:

```js
image.getPixelColor(x, y); // returns the colour of that pixel e.g. 0xFFFFFFFF
image.setPixelColor(hex, x, y); // sets the colour of that pixel
```

Two static helper functions exist to convert RGBA values into single integer (hex) values:

```js
Jimp.rgbaToInt(r, g, b, a); // e.g. converts 255, 255, 255, 255 to 0xFFFFFFFF
Jimp.intToRGBA(hex); // e.g. converts 0xFFFFFFFF to {r: 255, g: 255, b: 255, a:255}
```

### Creating new images ###

If you want to begin with an empty Jimp image, you can call the Jimp constructor passing the width and height of the image to create and (optionally) a Node-style callback:

```js
var image = new Jimp(256, 256, function (err, image) {
    // this image is 256 x 256, every pixel is set to 0x00000000
});
```

You can optionally set the pixel colour as follows:

```js
var image = new Jimp(256, 256, 0xFF0000FF, function (err, image) {
    // this image is 256 x 256, every pixel is set to 0xFF0000FF
});
```

## Comparing images ##

To generate a [perceptual hash](https://en.wikipedia.org/wiki/Perceptual_hashing) of a Jimp image, based on the [pHash](http://phash.org/) algorithm, use:

```js
image.hash(); // aHgG4GgoFjA
```

By default the hash is returned as base 64. The hash can be returned at another base by passing a number from 2 to 64 to the method:

```js
image.hash(2); // 1010101011010000101010000100101010010000011001001001010011100100
```

There are 18,446,744,073,709,551,615 unique hashes. The hammering distance between the binary representation of these hashes can be used to find similar-looking images.

To calculate the hammering distance between two Jimp images based on their perceptual hash use:

```js
Jimp.distance(image1, image2); // returns a number 0-1, where 0 means the two images are percieved to be identical
```

Jimp also allows the diffing of two Jimp images using [PixelMatch](https://github.com/mapbox/pixelmatch) as follows:

```js
var diff = Jimp.diff(image1, image2, threshold); // threshold ranges 0-1 (default: 0.1)
diff.image;   // a Jimp image showing differences
diff.percent; // the proportion of different pixels (0-1), where 0 means the images are pixel identical
```

Using a mix of hammering distance and pixel diffing to comare images, the following code has a 99% success rate of detecting the same image from a random sample (with 1% false positives). The test this figure is drawn from attempts to match each image from sample of 120 PNGs against 120 corresponing JPEGs saved at a quality setting of 60.

```js
var distance = Jimp.distance(png, jpeg); // percieved distance

var jpeg_r = jpeg.clone().resize(png.bitmap.width, png.bitmap.height);
var diff = Jimp.diff(png, jpeg_r);       // pixel difference

if (distance < 0.15 || diff.percent < 0.15) {
    // images match
} else {
    // not a match
}
```

## Chaining or callbacks ##

Most instance methods can be chained together, for example as follows:

```js
Jimp.read("lenna.png", function (err, image) {
    this.greyscale().scale(0.5).write("lena-half-bw.png");
});
```

Alternatively, methods can be passed Node-style callbacks:

```js
Jimp.read("lenna.png", function (err, image) {
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
