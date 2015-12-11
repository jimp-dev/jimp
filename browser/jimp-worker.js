importScripts("./jimp.min.js");

if (!self.Jimp) {
    throw new Error("Could not load jimp.min.js in jimp-worker.js");
}

//function toArrayBuffer(buffer) {
//    var ab = new ArrayBuffer(buffer.length);
//    var view = new Uint8Array(ab);
//    for (var i = 0; i < buffer.length; ++i) {
//        view[i] = buffer[i];
//    }
//    return ab;
//}

self.addEventListener('message', function(e) {
    //var files = e.data;
    var buffers = [];

    // Read each file synchronously as an ArrayBuffer and
    // stash it in a global array to return to the main app.
    //[].forEach.call(files, function(file) {
    //    var reader = new FileReaderSync();
    //    var arrayBuffer = reader.readAsArrayBuffer(file);

// testing mozilla!!
var arrayBuffer = e.data;
        Jimp.read(arrayBuffer, function (err, image) {
            console.log('read complete');
            if (err) throw err;
            image.containWithoutBackground(256, 256)            // resize
                .quality(60)                 // set JPEG quality
                .greyscale();                 // set greyscale
            buffers.push(image.bitmap); // includes width and height attributes
        });
    //});

    console.log("DONE HERE!!!");
    postMessage(buffers);
}, false);

