//    The MIT License (MIT)
//
//    Copyright (c) 2015 Phil Seaton
//
//    Permission is hereby granted, free of charge, to any person obtaining a copy
//    of this software and associated documentation files (the "Software"), to deal
//    in the Software without restriction, including without limitation the rights
//    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//    copies of the Software, and to permit persons to whom the Software is
//    furnished to do so, subject to the following conditions:
//
//    The above copyright notice and this permission notice shall be included in all
//    copies or substantial portions of the Software.
//
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//    SOFTWARE.

if (!self.Buffer && !window.Buffer){
    throw new Error("Node's Buffer() not available in jimp-worker.js");
}

function error(err){
    throw new Error(err.message);
}

function fetchImageDataFromUrl(url){
    // Fetch image data via xhr. Note that this will not work
    // without cross-domain allow-origin headers because of CORS restrictions
    var xhr = new XMLHttpRequest();
    xhr.open( "GET", url, true );
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
        createJimpObjectAndProcess(this.response);
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
        createJimpObjectAndProcess(e.data);
    } else if (e.data.constructor.name === "String") {
        // Load resource from URL
        fetchImageDataFromUrl(e.data);
    } else {
        throw new Error("jimp-worker.js expects to be passed a single ArrayBuffer or image URL");
    }

}, false);

function bufferFromArrayBuffer(arrayBuffer){
    // Prepare a Buffer object from the arrayBuffer. Necessary in the browser > node conversion,
    // But this function is not useful when running in node directly
    var buffer = new Buffer(arrayBuffer.byteLength);
    var view = new Uint8Array(arrayBuffer);
    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }

    return buffer;
}

function createJimpObjectAndProcess(arrayBuffer){
    var workerError;
    Jimp.read(bufferFromArrayBuffer(arrayBuffer), function (err, image) {
        if (err) {
            workerError = err;
            throw err;
        }

        // The meat of the image processing occurs here!
        processImageData(image);
    });

    if (workerError) throw workerError;
}