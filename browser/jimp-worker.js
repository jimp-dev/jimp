var DEBUG = false,
    cachebuster = DEBUG ? "?r="+((new Date()).getTime()) : "";
importScripts("lib/jimp.min.js"+cachebuster);

if (!self.Jimp && !window.Jimp) {
    throw new Error("Could not load jimp.min.js in jimp-worker.js");
}

// Do some image processing in Jimp. Syntax exactly the same as
// https://github.com/oliver-moran/jimp
// Reading and writing functions are replaced for browser context.
// See readme at https://github.com/strandedcity/jimp
function processImageData(image){
    // EXAMPLE 1:
    // Resize the image and return the pixel data back to the main thread
    // <canvas> is required to paint it
    image.containCropped(200, 200);

    done(
        RETURN.IMAGE,
        image.bitmap,
        image.bitmap.width,
        image.bitmap.height
    );

    // EXAMPLE 2:
    // Continue processing the same image to make more versions!
    // Return a data URI back to the main thread
    var originalMime = image._originalMime,
        targetMimeType = originalMime || Jimp.MIME_JPEG;
    image.contrast(0.6)         // Increase contrast
        .brightness(0.1)        // Increase brightness a little
        .greyscale()            // make it B&W
        .quality(60)            // set JPEG quality (only applies to jpegs)
        .getBuffer(targetMimeType,function(mime,data){
            // With access to node's Buffer objects, it's easy to get a base64 string:
            var dataUri = "data:" + targetMimeType + ";base64,"  + data.toString('base64');

            // Return data uri to the main thread.
            // Data URIs can be displayed in <img> tags, without <canvas>
            done(
                RETURN.DATA_URI,
                dataUri,
                image.bitmap.width,
                image.bitmap.height
            );

            // Good idea to close the worker when you're done
            self.close();
        });
}

// Helpers to Return to the main thread
var RETURN = {
    IMAGE: "IMAGE",
    DATA_URI: "DATA_URI"
};

function done(type,data,w,h) {
    if (typeof RETURN[type] === "undefined") throw new Error("Illegal return type");

    // Return processed image to main thread
    // Several data formats included here for example only.
    // You should only process and return the ones you need!
    self.postMessage({
        type: type,
        data: data,
        width: w,
        height: h
    });
}