importScripts("./jimp.min.js");

if (!self.Jimp) {
    throw new Error("Could not load jimp.min.js in jimp-worker.js");
}

self.addEventListener('message', function(e) {
    // Some browsers allow passing of file objects directly from inputs, which would
    // enable doing the file I/O on the worker thread. Browser support is patchy however,
    // so the most compatible strategy is to read the file on the main thread asynchronously,
    // then pass the data here. File I/O is asynchronous on the main thread, and represents
    // a generally small part of the total image-processing task. 
    //
    // See https://developer.mozilla.org/en-US/docs/Web/API/Transferable for support of transferables
    // Note that passing an array of Transferables makes the worker incompatible with IE10.
    var arrayBuffer = e.data;
    if (arrayBuffer.constructor.name !== "ArrayBuffer") {
        throw new Error("jimp-worker.js expects to be passed a single ArrayBuffer");
    }

    Jimp.read(arrayBuffer, function (err, image) {
        if (err) throw err;

        // Do some image processing in Jimp. This is why we want to use a Web Worker!
        image.containWithoutBackground(300, 300)            // resize thumbnail
            .quality(60)                                    // set JPEG quality
            .greyscale();                                   // set greyscale

        var dataUri = "";

        // Return processed image to main thread
        // Several data formats included here for example only.
        // You should only process and return the ones you need!
        self.postMessage({
            image: image.bitmap,
            dataUri: dataUri
        });
    });
}, false);

