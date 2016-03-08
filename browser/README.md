# Jimp ... for Web Workers #

The "JavaScript Image Manipulation Program" ... for Web Workers! :-)

A fork of the wonderful Jimp by oliver-moran (https://github.com/oliver-moran/jimp). Jimp runs in node, Jimp for the browser runs in a Web Worker.

This version of the library lets you do fully multi-threaded image manipulation in a browser context without using ```<canvas>```. Its API is essentially the same as Jimp's, so be sure to browse the documentation there. It's generally compatible with Firefox 11+, Chrome, Safari 6+, and IE 11+. It is compatible with BMP, JPG, and PNG files (as is Jimp). The full-featured version, which does everything Jimp does, is 90kb gzipped. Much smaller versions can be built easily by excluding features and dependencies from the library. See index.js.

## Demo ##

Head over to http://strandedcity.github.io/jimp/browser/

Select images, or just click to use images from the /test directory. Your images will be loaded by the browser, and each will be thumbailed and greyscaled, two of Jimp's simplest and most useful operations. Each image will be correctly oriented according to its exif data and displayed in two ways, with different implications for web applications:

```js
var canvas = document.createElement("canvas");
canvas.width = image.width;
canvas.height = image.height;
document.body.appendChild(canvas);

var ctx = canvas.getContext("2d");
var imgData = ctx.createImageData(image.width,image.height);

...

ctx.putImageData(imgData,0,0);
```

and

```html
<img src="[data URI]" width="xx" height="xx" />
```

## Basic Usage: Input ##

As much work as possible should be done on the worker thread, but since Web Workers cannot interact with the DOM there are some divisions of labor that must take place.

These files are meant to be customized for your your use:
- jimp-worker.js
- index.html

Generally, you should expect to create the worker in index.html:
```js
var worker = new Worker("jimp-worker.js");
```
and send it data in one of these ways:

##### Input Type 1: Send url to be read in worker via xhr: #####
```js
worker.postMessage("/some/local/path/to/image.jpg");
```

##### Input Type 2: Pass an ArrayBuffer to be read in directly: #####
```js
var element = document.getElementById("fileSelectionElement"),
file = element.files[0],
fr = new FileReader();

fr.addEventListener("load",function(){
    worker.postMessage(this.result);
});
fr.readAsArrayBuffer(readfile);
```

Demo code in jimp-worker.js will take care of reading the image data such that a Jimp object can be created.

## Basic Usage: Output ##

In a node.js context, Jimp writes to files. In a browser context, this is less useful. Follow the example to see how to retrieve your processed images from jimp-worker.js once they are available. In a nutshell, you'll receive post messages back from the worker with two types of data that are easy to display in the browser, upload, etc:

##### Output Type 1: As an Image Object for display on ```<canvas>```:#####
```js
worker.onmessage = function(e){
    var returnObject = e.data;

    if (returnObject.type === "IMAGE") {
        // display the processed image by drawing in a canvas:
        var image = returnObject.data;
        var canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        document.body.appendChild(canvas);

        var ctx = canvas.getContext("2d");
        var imgData = ctx.createImageData(image.width,image.height);

        var ubuf = image.data;
        for (var i=0;i < ubuf.length; i+=4) {
            imgData.data[i]   = ubuf[i];   //red
            imgData.data[i+1] = ubuf[i+1]; //green
            imgData.data[i+2] = ubuf[i+2]; //blue
            imgData.data[i+3] = ubuf[i+3]; //alpha
        }

        ctx.putImageData(imgData,0,0);
    }
};
```

##### Output Type 2: As a Data URI for display in ```<img>```:#####
```js
worker.onmessage = function(e){
    var returnObject = e.data;

    if (returnObject.type === "DATA_URI") {
        // display processed image by data URI:
        var dataUri = returnObject.data;
        var width = returnObject.width;
        var height = returnObject.height;

        var image = document.createElement("img");
        image.src = dataUri;
        image.width = w;
        image.height = h;
        document.body.appendChild(image);
    }
};
```

## Image Manipulation ##

In jimp-worker.js, syntax for Jimp works the same as it does in node (see https://github.com/oliver-moran/jimp). Inside self.onmessage:
```js
    Jimp.read(e.data).then(function(image){
        image.containCropped(200, 200)  // fit the image in a 200px square
            .greyscale()                // make it B&W
            .quality(60);               // set JPEG quality (only applies to jpegs)

        // Return resized image data to the main thread:
        self.postMessage({
            type: "IMAGE",
            data: image.bitmap,
            width: image.bitmap.width,
            height: image.bitmap.height
        });
    });
```

JPEG images with EXIF orientation data will be automatically re-orientated as appropriate.

The following methods can be called on the image:

```js
image.crop( x, y, w, h );      // crop to the given region
image.autocrop();              // automatically crop same-color borders from image (if any)
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
image.containCropped( w, h );  // same as .contain(), but returns an image without "blank" pixels filled with a background color
image.background( hex );       // set the default new pixel colour (e.g. 0xFFFFFFFF or 0x00000000) for by some operations (e.g. image.contain and image.rotate) and when writing formats that don't support alpha channels
image.mirror( horz, vert );    // an alias for flip
image.fade( f );               // an alternative to opacity, fades the image by a factor 0 - 1. 0 will haven no effect. 1 will turn the image
image.opaque();                // set the alpha channel on every pixel to fully opaque
image.clone();                 // returns a clone of the image
```

(Contributions of more methods are welcome!)

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

## Compiling jimp.js and jimp.min.js ##

Clone the repo and run ```$ npm install``

To rebuild the minified JavaScript files jimp.js and jimp.min.js, run ```$ npm run prepublish``` at any time.

```
$ npm install

> jimp@0.2.20 prepublish /home/<location>/jimp
> ./browser/browserify-build.sh

Browserifying browser/jimp.js...
Translating for ES5...
Removing Strict Mode.
Adding Web Worker wrapper functions...
Minifying browser/jimp.min.js...
Cleaning up....
```

## Advanced usage ##

See the origin fork at https://github.com/oliver-moran/jimp for full documentation of Jimp.

## License ##

Jimp is licensed under the MIT license.
