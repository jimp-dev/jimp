importScripts("./jimp.min.js");

if (!self.Jimp) {
    throw new Error("Could not load jimp.min.js in jimp-worker.js");
}

function processImageData(image){
    // Do some image processing in Jimp. This is why we want to use a Web Worker!
    image.containWithoutBackground(200, 200)            // resize thumbnail
        .quality(60)                                    // set JPEG quality
        .greyscale();                                   // set greyscale
}

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

function error(err){
    console.log('throwing an error now...',err.message);
    throw new Error(err.message);
}

function fetchImageDataFromUrl(url){
    // Fetch image data via xhr. Note that this will not work
    // without cross-domain allow-origin headers because of CORS restrictions
    var xhr = new XMLHttpRequest();
    xhr.open( "GET", url, true );
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
        processArrayBuffer(this.response);
    };
    xhr.onerror = function(e){
        error(e);
    };

    xhr.send();
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
    if (e.data.constructor.name === "ArrayBuffer") {
        // Process the image, then terminate the worker instance
        processArrayBuffer(e.data);
    } else if (e.data.constructor.name === "String") {
        // Load resource from URL
        fetchImageDataFromUrl(e.data);
    } else {
        throw new Error("jimp-worker.js expects to be passed a single ArrayBuffer or image URL");
    }

}, false);

function processArrayBuffer(arrayBuffer){
    doImageProcessing(arrayBuffer,function(){
        self.close();
    });
}

function doImageProcessing(arrayBuffer,cb){
    var workerError;
    Jimp.read(arrayBuffer, function (err, image) {
        if (err) {
            workerError = err;
            throw err;
        }

        var originalMime = image.mime;

        // The meat of the image processing occurs here!
        processImageData(image);

        // Return image data directly to the main thread.
        // <canvas> is required to paint it
        done(
            RETURN.IMAGE,
            image.bitmap,
            image.bitmap.width,
            image.bitmap.height
        );

        var targetMimeType = originalMime || Jimp.MIME_JPEG;
        image.getBuffer(targetMimeType,function(mime,data){
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

            // Call the callback
            if (typeof cb === "function") cb();
        });
    });

    if (workerError) throw workerError;
}