importScripts("lib/jimp.min.js");

if (!self.Jimp && !window.Jimp) {
    throw new Error("Could not load jimp.min.js in jimp-worker.js");
}

// Do some image processing in Jimp. Syntax exactly the same as
// https://github.com/oliver-moran/jimp
// Reading and writing functions are replaced for browser context.
// See readme at https://github.com/strandedcity/jimp
self.addEventListener('message', function(e) {
    // Some browsers allow passing of file objects directly from inputs, which would
    // enable doing the file I/O on the worker thread. Browser support is patchy however,
    // so the most compatible strategy is to read the file on the main thread asynchronously,
    // then pass the data here. File I/O is asynchronous on the main thread, and represents
    // a generally small part of the total image-processing task.
    //
    // See https://developer.mozilla.org/en-US/docs/Web/API/Transferable for support of transferables
    // Note that passing an array of Transferables makes the worker incompatible with IE10.

    // Helpers to Return to the main thread
    var RETURN = {
        IMAGE: "IMAGE",
        DATA_URI: "DATA_URI"
    };

    Jimp.read(e.data).then(function(image){
        // EXAMPLE 1:
        // Resize the image and return the pixel data back to the main thread
        // <canvas> is required to paint it
        image.contain(200, 200);

        // Return resized image data to the main thread:
        self.postMessage({
            type: RETURN.IMAGE,
            data: image.bitmap,
            width: image.bitmap.width,
            height: image.bitmap.height
        });

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
                self.postMessage({
                    type: RETURN.DATA_URI,
                    data: dataUri,
                    width: image.bitmap.width,
                    height: image.bitmap.height
                });

                // Good idea to close the worker when you're done
                self.close();
            });
    }).catch(function(err){
        // Prevent the error from getting swallowed in the promise
        setTimeout(function() { throw err; },0);
    });

}, false);
