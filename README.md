# Jimp #

The "JavaScript Image Manipulation Program" :-)

An image processing library written entirely in JavaScript for Node, with zero external or native dependencies.

Example usage:

    var Jimp = require("jimp");

    // open a file called "lenna.png"
    var lenna = new Jimp("lenna.png", function () {
        this.resize(220, 220) // resize
            .write("lenna-small.png") // save
            .quality(60) // set JPEG quality
            .write("lenna-small.jpg") // save as JPEG
            .greyscale() // set greyscale
            .write("lena-small-bw.png") // save again
            .crop(80, 100, 80, 50) // crop
            .write("lena-small-bw-cropped.png"); // save again
    });

## Methods ##

The Jimp constructor takes two arugments, the path to a JPEG or PNG image and an optional call back for when the image is parsed:

    var image = new Jimp("./path/to/image.jpg", function () {
        // ready
    });

Once the callback has fired the following methods can be called on the image:

    image.crop( x, y, w, h ); // crop to the given region
    image.invert(); // invert the image colours
    image.greyscale(); // remove colour from the image
    image.sepia(); // apply a sepia wash to the image
    image.opacity( f ); // apply an opacity of 0-1 to the image
    image.resize( w, h ); // resize the image
    image.scale( f ); // scale the image by the factor f
    image.blur( r ); // fast blur the image by r pixels
    image.gaussian( r ); // Gaussian blur the image by r pixels (VERY slow)
    image.horizontalFlip(); // horizontally mirror the image
    image.verticalFlip(); // vertically mirror the image
    image.rotateCW(); // rotates image clock wise by 90 degree

(Contributions of more methods are welcome!)

The image can be written to disk in JPEG or PNG format using:

    image.write( path, cb ); // callback will be fired when write is successful

The quality of saved JPEGs can be set with:

    image.quality( n ); // set the quality of saved JPEG, 0 - 100

## Advanced ##

The library enables low-level manipulation of images in memory through the bitmap property of each Jimp object:

    image.bitmap.data; // a buffer of the raw bitmap data
    image.bitmap.width; // the width of the image
    image.bitmap.height // the height of the image

This can be manipulated directory, but remember: garbage in, garbage out.

A helper method is available to scan a region of the bitmap:

    image.scan(x, y, w, h, cb); // scan a given region of the bitmap and call cb on every pixel
    
Example usage:

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        // x, y is the position of this pixel on the image
        // idx is the position start position of this rgba tuple in the bitmap buffer
        
        var red = this.bitmap.data[idx];
        var green = this.bitmap.data[idx+1];
        var blue = this.bitmap.data[idx+2];
        var alpha = this.bitmap.data[idx+3];
        
        // rgba values run from 0 - 255
        // e.g. this.bitmap.data[idx] = 0; // removes red from this pixel
    });

## License ##

Jimp is licensed under the MIT license.
